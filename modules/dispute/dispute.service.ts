/**
 * Dispute Service Layer
 * Handles business logic for dispute creation, resolution, and management
 */

import { prisma } from "@/lib/prisma";
import { BookingStatus, PaymentStatus, DisputeStatus } from "@prisma/client";
import { processRefund } from "@/modules/payment/payment.service";
import {
  DisputeType,
  ResolutionOutcome,
  DisputeDetails,
  DisputeListItem,
  DisputeError,
  DisputeStatistics,
  CreateDisputeData,
  ResolveDisputeData,
  UpdateDisputeData,
} from "./dispute.types";
import { evaluateDisputeRules, canAutoResolve } from "./dispute.rules";

/**
 * Constants
 */
export const DISPUTE_WINDOW_DAYS = 7; // 7 days after event completion

/**
 * Check if booking is eligible for dispute
 */
export function canCreateDispute(
  bookingStatus: BookingStatus,
  eventDate: Date,
  completedAt: Date | null
): { eligible: boolean; reason?: string } {
  // Must be COMPLETED status
  if (bookingStatus !== BookingStatus.COMPLETED) {
    return {
      eligible: false,
      reason: "Only COMPLETED bookings can be disputed",
    };
  }

  // Check 7-day window from completion
  const referenceDate = completedAt || eventDate;
  const disputeDeadline = new Date(referenceDate);
  disputeDeadline.setDate(disputeDeadline.getDate() + DISPUTE_WINDOW_DAYS);

  if (new Date() > disputeDeadline) {
    return {
      eligible: false,
      reason: `Dispute window expired (${DISPUTE_WINDOW_DAYS} days after event)`,
    };
  }

  return { eligible: true };
}

/**
 * Create a new dispute
 */
export async function createDispute(
  data: CreateDisputeData
): Promise<DisputeDetails> {
  // Fetch booking with payment details
  const booking = await prisma.booking.findUnique({
    where: { id: data.bookingId },
    include: {
      payment: true,
      dispute: true,
      customer: { select: { email: true } },
      vendorProfile: { select: { businessName: true } },
    },
  });

  if (!booking) {
    throw new DisputeError("Booking not found", "BOOKING_NOT_FOUND", 404);
  }

  // Check if dispute already exists
  if (booking.dispute) {
    throw new DisputeError(
      "Dispute already exists for this booking",
      "DISPUTE_EXISTS",
      400
    );
  }

  // Verify user is customer or vendor
  if (booking.customerId !== data.userId && booking.vendorId !== data.userId) {
    throw new DisputeError(
      "You don't have permission to dispute this booking",
      "UNAUTHORIZED",
      403
    );
  }

  // Check if booking is eligible for dispute
  const eligibility = canCreateDispute(
    booking.status,
    booking.eventDate,
    booking.updatedAt // Use updatedAt as proxy for completedAt
  );

  if (!eligibility.eligible) {
    throw new DisputeError(
      eligibility.reason || "Booking is not eligible for dispute",
      "BOOKING_NOT_ELIGIBLE",
      400
    );
  }

  // Create dispute in a transaction
  const dispute = await prisma.$transaction(async (tx) => {
    // Update booking status to DISPUTED
    await tx.booking.update({
      where: { id: booking.id },
      data: { status: BookingStatus.DISPUTED },
    });

    // Hold payment if exists
    if (booking.payment) {
      await tx.payment.update({
        where: { id: booking.payment.id },
        data: {
          status: PaymentStatus.CAPTURED, // Keep as CAPTURED (in escrow)
        },
      });
    }

    // Create dispute record
    const newDispute = await tx.dispute.create({
      data: {
        bookingId: data.bookingId,
        initiatorId: data.userId,
        reason: data.description,
        evidence: data.evidence || null,
        status: DisputeStatus.OPEN,
      },
    });

    return newDispute;
  });

  // Fetch complete dispute details
  return getDisputeDetails(dispute.id);
}

/**
 * Get dispute details
 */
export async function getDisputeDetails(
  disputeId: string
): Promise<DisputeDetails> {
  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    include: {
      booking: {
        include: {
          customer: { select: { email: true } },
          vendorProfile: { select: { businessName: true } },
        },
      },
    },
  });

  if (!dispute) {
    throw new DisputeError("Dispute not found", "DISPUTE_NOT_FOUND", 404);
  }

  // Parse evidence and resolution data
  const evidence = Array.isArray(dispute.evidence)
    ? dispute.evidence as string[]
    : null;

  // Extract metadata from reason field (if JSON-formatted)
  let metadata: Record<string, any> | null = null;
  let description = dispute.reason;
  let type = DisputeType.OTHER;

  try {
    // Check if reason contains metadata
    if (dispute.reason.startsWith("{")) {
      const parsed = JSON.parse(dispute.reason);
      if (parsed.type) type = parsed.type;
      if (parsed.description) description = parsed.description;
      if (parsed.metadata) metadata = parsed.metadata;
    }
  } catch {
    // Not JSON, use as-is
  }

  // Parse resolution if exists
  let outcome: ResolutionOutcome | null = null;
  let refundPercent: number | null = null;
  let resolutionNotes: string | null = dispute.resolution;

  try {
    if (dispute.resolution && dispute.resolution.startsWith("{")) {
      const parsed = JSON.parse(dispute.resolution);
      if (parsed.outcome) outcome = parsed.outcome;
      if (parsed.refundPercent !== undefined) refundPercent = parsed.refundPercent;
      if (parsed.notes) resolutionNotes = parsed.notes;
    }
  } catch {
    // Not JSON, use as-is
  }

  return {
    id: dispute.id,
    bookingId: dispute.bookingId,
    initiatorId: dispute.initiatorId,
    type,
    description,
    evidence,
    metadata,
    status: dispute.status,
    outcome,
    refundPercent,
    resolutionNotes,
    resolvedAt: dispute.resolvedAt,
    resolvedBy: dispute.resolvedBy,
    createdAt: dispute.createdAt,
    updatedAt: dispute.updatedAt,
    booking: {
      id: dispute.booking.id,
      eventDate: dispute.booking.eventDate.toISOString().split("T")[0],
      eventType: dispute.booking.eventType,
      totalAmount: Number(dispute.booking.totalAmount),
      status: dispute.booking.status,
      customerEmail: dispute.booking.customer.email,
      vendorBusinessName: dispute.booking.vendorProfile.businessName,
    },
  };
}

/**
 * List disputes with filters
 */
export async function listDisputes(filters: {
  userId?: string;
  status?: DisputeStatus;
  type?: DisputeType;
  limit?: number;
  offset?: number;
}): Promise<DisputeListItem[]> {
  const where: any = {};

  if (filters.userId) {
    where.OR = [
      { initiatorId: filters.userId },
      { booking: { customerId: filters.userId } },
      { booking: { vendorId: filters.userId } },
    ];
  }

  if (filters.status) {
    where.status = filters.status;
  }

  const disputes = await prisma.dispute.findMany({
    where,
    include: {
      booking: {
        select: {
          eventDate: true,
          totalAmount: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: filters.limit || 20,
    skip: filters.offset || 0,
  });

  return disputes.map((dispute) => {
    // Parse type from reason
    let type = DisputeType.OTHER;
    try {
      if (dispute.reason.startsWith("{")) {
        const parsed = JSON.parse(dispute.reason);
        if (parsed.type) type = parsed.type;
      }
    } catch {
      // Use default
    }

    return {
      id: dispute.id,
      bookingId: dispute.bookingId,
      type,
      status: dispute.status,
      createdAt: dispute.createdAt,
      eventDate: dispute.booking.eventDate.toISOString().split("T")[0],
      totalAmount: Number(dispute.booking.totalAmount),
    };
  });
}

/**
 * Update dispute status (admin only)
 */
export async function updateDisputeStatus(
  disputeId: string,
  data: UpdateDisputeData
): Promise<DisputeDetails> {
  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
  });

  if (!dispute) {
    throw new DisputeError("Dispute not found", "DISPUTE_NOT_FOUND", 404);
  }

  // Update dispute
  await prisma.dispute.update({
    where: { id: disputeId },
    data: {
      status: data.status,
      ...(data.notes && {
        resolution: data.notes,
      }),
    },
  });

  return getDisputeDetails(disputeId);
}

/**
 * Resolve dispute with outcome (admin only)
 */
export async function resolveDispute(
  disputeId: string,
  data: ResolveDisputeData
): Promise<DisputeDetails> {
  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    include: {
      booking: {
        include: {
          payment: true,
        },
      },
    },
  });

  if (!dispute) {
    throw new DisputeError("Dispute not found", "DISPUTE_NOT_FOUND", 404);
  }

  // Check if already resolved
  if (dispute.status === DisputeStatus.RESOLVED_REFUND ||
      dispute.status === DisputeStatus.RESOLVED_RELEASE) {
    throw new DisputeError(
      "Dispute is already resolved",
      "DISPUTE_ALREADY_RESOLVED",
      400
    );
  }

  // Calculate refund amount
  const totalAmount = Number(dispute.booking.totalAmount);
  let refundAmount = 0;

  if (data.outcome === ResolutionOutcome.FULL_REFUND) {
    refundAmount = totalAmount;
  } else if (data.outcome === ResolutionOutcome.PARTIAL_REFUND) {
    if (!data.refundPercent) {
      throw new DisputeError(
        "Refund percentage required for partial refunds",
        "REFUND_PERCENT_REQUIRED",
        400
      );
    }
    refundAmount = (totalAmount * data.refundPercent) / 100;
  }

  // Process in transaction
  await prisma.$transaction(async (tx) => {
    // Process refund if applicable
    if (
      refundAmount > 0 &&
      dispute.booking.payment &&
      dispute.booking.payment.stripePaymentIntentId
    ) {
      await processRefund(dispute.booking.payment.id, {
        amount: refundAmount,
        reason: `Dispute resolution: ${data.outcome}`,
      });
    }

    // Release funds to vendor if NO_REFUND
    if (
      data.outcome === ResolutionOutcome.NO_REFUND &&
      dispute.booking.payment
    ) {
      await tx.payment.update({
        where: { id: dispute.booking.payment.id },
        data: {
          status: PaymentStatus.RELEASED,
          releasedAt: new Date(),
        },
      });
    }

    // Update dispute
    const resolutionData = JSON.stringify({
      outcome: data.outcome,
      refundPercent: data.refundPercent || null,
      notes: data.notes,
    });

    const newStatus =
      data.outcome === ResolutionOutcome.NO_REFUND
        ? DisputeStatus.RESOLVED_RELEASE
        : DisputeStatus.RESOLVED_REFUND;

    await tx.dispute.update({
      where: { id: disputeId },
      data: {
        status: newStatus,
        resolution: resolutionData,
        resolvedAt: new Date(),
        resolvedBy: data.adminId,
      },
    });

    // Update booking status
    const bookingStatus =
      data.outcome === ResolutionOutcome.FULL_REFUND ||
      data.outcome === ResolutionOutcome.PARTIAL_REFUND
        ? BookingStatus.REFUNDED
        : BookingStatus.COMPLETED;

    await tx.booking.update({
      where: { id: dispute.bookingId },
      data: {
        status: bookingStatus,
        refundAmount: refundAmount > 0 ? refundAmount : null,
      },
    });
  });

  return getDisputeDetails(disputeId);
}

/**
 * Auto-resolve dispute if eligible
 */
export async function autoResolveDispute(
  disputeId: string,
  adminId: string
): Promise<{ resolved: boolean; details: DisputeDetails }> {
  const dispute = await getDisputeDetails(disputeId);

  // Check if can auto-resolve
  if (!canAutoResolve(dispute)) {
    return {
      resolved: false,
      details: dispute,
    };
  }

  // Get suggested resolution
  const suggestion = evaluateDisputeRules(dispute);

  if (!suggestion.outcome || suggestion.refundPercent === null) {
    return {
      resolved: false,
      details: dispute,
    };
  }

  // Apply auto-resolution
  const resolved = await resolveDispute(disputeId, {
    outcome: suggestion.outcome,
    refundPercent: suggestion.refundPercent,
    notes: `Auto-resolved: ${suggestion.reason}`,
    adminId,
  });

  return {
    resolved: true,
    details: resolved,
  };
}

/**
 * Get dispute statistics (admin only)
 */
export async function getDisputeStatistics(): Promise<DisputeStatistics> {
  const [
    totalDisputes,
    openDisputes,
    resolvedDisputes,
    disputes
  ] = await Promise.all([
    prisma.dispute.count(),
    prisma.dispute.count({
      where: {
        status: {
          in: [DisputeStatus.OPEN, DisputeStatus.INVESTIGATING, DisputeStatus.ESCALATED],
        },
      },
    }),
    prisma.dispute.count({
      where: {
        status: {
          in: [DisputeStatus.RESOLVED_REFUND, DisputeStatus.RESOLVED_RELEASE, DisputeStatus.CLOSED],
        },
      },
    }),
    prisma.dispute.findMany({
      select: {
        reason: true,
        resolution: true,
        createdAt: true,
        resolvedAt: true,
      },
    }),
  ]);

  // Calculate by type and outcome
  const byType: Record<DisputeType, number> = {
    [DisputeType.NO_SHOW]: 0,
    [DisputeType.LATE_ARRIVAL]: 0,
    [DisputeType.SERVICE_QUALITY]: 0,
    [DisputeType.WRONG_ORDER]: 0,
    [DisputeType.FOOD_QUALITY]: 0,
    [DisputeType.OTHER]: 0,
  };

  const byOutcome: Record<ResolutionOutcome, number> = {
    [ResolutionOutcome.FULL_REFUND]: 0,
    [ResolutionOutcome.PARTIAL_REFUND]: 0,
    [ResolutionOutcome.NO_REFUND]: 0,
    [ResolutionOutcome.CANCELLED]: 0,
  };

  let totalResolutionTimeHours = 0;
  let resolvedCount = 0;

  disputes.forEach((dispute) => {
    // Parse type
    try {
      if (dispute.reason.startsWith("{")) {
        const parsed = JSON.parse(dispute.reason);
        if (parsed.type && byType[parsed.type as DisputeType] !== undefined) {
          byType[parsed.type as DisputeType]++;
        }
      }
    } catch {
      byType[DisputeType.OTHER]++;
    }

    // Parse outcome
    if (dispute.resolution) {
      try {
        if (dispute.resolution.startsWith("{")) {
          const parsed = JSON.parse(dispute.resolution);
          if (parsed.outcome && byOutcome[parsed.outcome as ResolutionOutcome] !== undefined) {
            byOutcome[parsed.outcome as ResolutionOutcome]++;
          }
        }
      } catch {
        // Ignore parse errors
      }
    }

    // Calculate resolution time
    if (dispute.resolvedAt) {
      const hours = (dispute.resolvedAt.getTime() - dispute.createdAt.getTime()) / (1000 * 60 * 60);
      totalResolutionTimeHours += hours;
      resolvedCount++;
    }
  });

  const avgResolutionTimeHours = resolvedCount > 0
    ? Math.round(totalResolutionTimeHours / resolvedCount)
    : 0;

  return {
    totalDisputes,
    openDisputes,
    resolvedDisputes,
    byType,
    byOutcome,
    avgResolutionTimeHours,
  };
}
