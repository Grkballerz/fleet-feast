/**
 * Payout Service Layer
 * Handles business logic for automated vendor payout scheduling and processing
 */

import { prisma } from "@/lib/prisma";
import { BookingStatus, PayoutStatus, DisputeStatus, PayoutMethod } from "@prisma/client";
import type {
  EligibleBooking,
  PayoutDetails,
  PayoutListItem,
  SchedulePayoutResult,
  ProcessPayoutResult,
  PayoutStatistics,
  HoldPayoutData,
  ReleasePayoutData,
  PayoutBookingItem,
} from "./payout.types";
import { PayoutError } from "./payout.types";

/**
 * Constants
 */
export const PAYOUT_HOLD_DAYS = 7; // 7 days after event completion

/**
 * Find eligible bookings for payout
 * Criteria:
 * - Booking status = COMPLETED
 * - Event date >= 7 days ago
 * - No active dispute (OPEN or INVESTIGATING)
 * - Not already in a payout
 */
export async function findEligibleBookings(): Promise<EligibleBooking[]> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - PAYOUT_HOLD_DAYS);
  cutoffDate.setHours(0, 0, 0, 0);

  // Find completed bookings that are at least 7 days old
  const bookings = await prisma.booking.findMany({
    where: {
      status: BookingStatus.COMPLETED,
      eventDate: {
        lte: cutoffDate,
      },
      // No active dispute
      dispute: {
        is: null,
      },
      // Not already in a payout
      vendorPayoutBooking: {
        none: {},
      },
    },
    select: {
      id: true,
      vendorId: true,
      vendorPayout: true,
      platformFeeVendor: true,
      eventDate: true,
      customerId: true,
    },
  });

  return bookings.map((booking) => {
    const vendorPayout = Number(booking.vendorPayout);
    const platformFeeVendor = Number(booking.platformFeeVendor || 0);
    const netPayout = vendorPayout - platformFeeVendor;

    return {
      id: booking.id,
      vendorId: booking.vendorId,
      vendorPayout,
      platformFeeVendor,
      netPayout,
      eventDate: booking.eventDate,
      customerId: booking.customerId,
    };
  });
}

/**
 * Schedule payouts for eligible bookings
 * Groups bookings by vendor and creates a single payout per vendor
 */
export async function schedulePayouts(): Promise<SchedulePayoutResult> {
  const eligibleBookings = await findEligibleBookings();

  if (eligibleBookings.length === 0) {
    return {
      payoutsCreated: 0,
      totalAmount: 0,
      vendors: [],
      payouts: [],
    };
  }

  // Group bookings by vendor
  const bookingsByVendor = eligibleBookings.reduce((acc, booking) => {
    if (!acc[booking.vendorId]) {
      acc[booking.vendorId] = [];
    }
    acc[booking.vendorId].push(booking);
    return acc;
  }, {} as Record<string, EligibleBooking[]>);

  const payouts: PayoutDetails[] = [];
  let totalAmount = 0;

  // Create a payout for each vendor
  for (const [vendorId, vendorBookings] of Object.entries(bookingsByVendor)) {
    // Calculate total payout amount for this vendor
    const payoutAmount = vendorBookings.reduce((sum, b) => sum + b.netPayout, 0);

    // Get vendor's payout method
    const vendor = await prisma.vendor.findUnique({
      where: { userId: vendorId },
      select: {
        payoutMethod: true,
        bankVerified: true,
      },
    });

    if (!vendor) {
      console.warn(`Vendor ${vendorId} not found, skipping payout`);
      continue;
    }

    if (!vendor.bankVerified) {
      console.warn(`Vendor ${vendorId} bank account not verified, skipping payout`);
      continue;
    }

    // Create payout record
    const payout = await prisma.$transaction(async (tx) => {
      const newPayout = await tx.vendorPayout.create({
        data: {
          vendorId,
          amount: payoutAmount,
          status: PayoutStatus.PENDING,
          payoutMethod: vendor.payoutMethod || PayoutMethod.ACH,
          scheduledFor: new Date(), // Process immediately (or could be scheduled for later)
        },
      });

      // Create payout booking records
      await tx.vendorPayoutBooking.createMany({
        data: vendorBookings.map((booking) => ({
          payoutId: newPayout.id,
          bookingId: booking.id,
          amount: booking.netPayout,
        })),
      });

      return newPayout;
    });

    // Fetch complete payout details
    const payoutDetails = await getPayoutDetails(payout.id);
    payouts.push(payoutDetails);
    totalAmount += payoutAmount;
  }

  return {
    payoutsCreated: payouts.length,
    totalAmount,
    vendors: Object.keys(bookingsByVendor),
    payouts,
  };
}

/**
 * Process pending payouts
 * In production, this would integrate with payment gateway (Helcim, Stripe Connect, etc.)
 * For now, this is a stub that marks payouts as PROCESSING then COMPLETED
 */
export async function processPayouts(): Promise<ProcessPayoutResult> {
  // Find pending payouts scheduled for processing
  const pendingPayouts = await prisma.vendorPayout.findMany({
    where: {
      status: PayoutStatus.PENDING,
      scheduledFor: {
        lte: new Date(),
      },
    },
    include: {
      vendor: {
        select: {
          bankAccountHolder: true,
          bankAccountNumber: true,
          bankRoutingNumber: true,
          bankAccountType: true,
          bankVerified: true,
        },
      },
    },
  });

  const successfulPayouts: string[] = [];
  const failedPayouts: Array<{ id: string; reason: string }> = [];

  for (const payout of pendingPayouts) {
    try {
      // Validate bank account info
      if (!payout.vendor.bankVerified) {
        throw new Error("Bank account not verified");
      }

      if (!payout.vendor.bankAccountNumber || !payout.vendor.bankRoutingNumber) {
        throw new Error("Bank account information incomplete");
      }

      // TODO: Integrate with payment gateway
      // For now, we'll simulate successful processing
      // In production, this would call Helcim/Stripe API to initiate ACH transfer

      // Update payout status to PROCESSING
      await prisma.vendorPayout.update({
        where: { id: payout.id },
        data: {
          status: PayoutStatus.PROCESSING,
        },
      });

      // Simulate processing delay and mark as COMPLETED
      // In production, this would be updated via webhook from payment provider
      await prisma.vendorPayout.update({
        where: { id: payout.id },
        data: {
          status: PayoutStatus.COMPLETED,
          processedAt: new Date(),
          externalReference: `STUB_${Date.now()}_${payout.id.substring(0, 8)}`,
        },
      });

      successfulPayouts.push(payout.id);
    } catch (error) {
      // Mark payout as FAILED
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      await prisma.vendorPayout.update({
        where: { id: payout.id },
        data: {
          status: PayoutStatus.FAILED,
          failureReason: errorMessage,
        },
      });

      failedPayouts.push({
        id: payout.id,
        reason: errorMessage,
      });

      console.error(`Payout ${payout.id} failed:`, errorMessage);
    }
  }

  return {
    processed: successfulPayouts.length,
    failed: failedPayouts.length,
    successfulPayouts,
    failedPayouts,
  };
}

/**
 * Get payout details
 */
export async function getPayoutDetails(payoutId: string): Promise<PayoutDetails> {
  const payout = await prisma.vendorPayout.findUnique({
    where: { id: payoutId },
    include: {
      bookings: {
        include: {
          booking: {
            select: {
              eventDate: true,
              eventType: true,
              customer: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
      },
      vendor: {
        select: {
          businessName: true,
          bankAccountHolder: true,
          bankAccountNumber: true,
          bankRoutingNumber: true,
          bankAccountType: true,
          bankVerified: true,
        },
      },
    },
  });

  if (!payout) {
    throw new PayoutError("Payout not found", "PAYOUT_NOT_FOUND", 404);
  }

  return {
    id: payout.id,
    vendorId: payout.vendorId,
    amount: Number(payout.amount),
    status: payout.status,
    payoutMethod: payout.payoutMethod,
    scheduledFor: payout.scheduledFor,
    processedAt: payout.processedAt,
    externalReference: payout.externalReference,
    failureReason: payout.failureReason,
    createdAt: payout.createdAt,
    updatedAt: payout.updatedAt,
    bookings: payout.bookings.map((pb) => ({
      id: pb.id,
      bookingId: pb.bookingId,
      amount: Number(pb.amount),
      booking: {
        eventDate: pb.booking.eventDate.toISOString().split("T")[0],
        eventType: pb.booking.eventType,
        customerEmail: pb.booking.customer.email,
      },
    })),
    vendor: {
      businessName: payout.vendor.businessName,
      bankAccountHolder: payout.vendor.bankAccountHolder,
      bankAccountNumber: payout.vendor.bankAccountNumber,
      bankRoutingNumber: payout.vendor.bankRoutingNumber,
      bankAccountType: payout.vendor.bankAccountType,
      bankVerified: payout.vendor.bankVerified,
    },
  };
}

/**
 * List payouts with filters
 */
export async function listPayouts(filters: {
  vendorId?: string;
  status?: PayoutStatus;
  limit?: number;
  offset?: number;
}): Promise<PayoutListItem[]> {
  const where: any = {};

  if (filters.vendorId) {
    where.vendorId = filters.vendorId;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  const payouts = await prisma.vendorPayout.findMany({
    where,
    include: {
      _count: {
        select: {
          bookings: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: filters.limit || 20,
    skip: filters.offset || 0,
  });

  return payouts.map((payout) => ({
    id: payout.id,
    vendorId: payout.vendorId,
    amount: Number(payout.amount),
    status: payout.status,
    scheduledFor: payout.scheduledFor,
    processedAt: payout.processedAt,
    bookingCount: payout._count.bookings,
    createdAt: payout.createdAt,
  }));
}

/**
 * Get vendor payouts
 */
export async function getVendorPayouts(vendorId: string): Promise<PayoutListItem[]> {
  return listPayouts({ vendorId });
}

/**
 * Hold a payout (admin only)
 */
export async function holdPayout(data: HoldPayoutData): Promise<PayoutDetails> {
  const payout = await prisma.vendorPayout.findUnique({
    where: { id: data.payoutId },
  });

  if (!payout) {
    throw new PayoutError("Payout not found", "PAYOUT_NOT_FOUND", 404);
  }

  // Can only hold PENDING or PROCESSING payouts
  if (payout.status !== PayoutStatus.PENDING && payout.status !== PayoutStatus.PROCESSING) {
    throw new PayoutError(
      "Can only hold PENDING or PROCESSING payouts",
      "INVALID_PAYOUT_STATUS",
      400
    );
  }

  // Update payout to PENDING with failure reason noting the hold
  await prisma.vendorPayout.update({
    where: { id: data.payoutId },
    data: {
      status: PayoutStatus.PENDING,
      failureReason: `HELD by admin (${data.adminId}): ${data.reason}`,
    },
  });

  return getPayoutDetails(data.payoutId);
}

/**
 * Release a held payout (admin only)
 */
export async function releasePayout(data: ReleasePayoutData): Promise<PayoutDetails> {
  const payout = await prisma.vendorPayout.findUnique({
    where: { id: data.payoutId },
  });

  if (!payout) {
    throw new PayoutError("Payout not found", "PAYOUT_NOT_FOUND", 404);
  }

  // Check if payout is held
  if (!payout.failureReason?.startsWith("HELD by admin")) {
    throw new PayoutError(
      "Payout is not currently held",
      "PAYOUT_NOT_HELD",
      400
    );
  }

  // Release payout back to PENDING for processing
  await prisma.vendorPayout.update({
    where: { id: data.payoutId },
    data: {
      status: PayoutStatus.PENDING,
      failureReason: null,
    },
  });

  return getPayoutDetails(data.payoutId);
}

/**
 * Get payout statistics (admin only)
 */
export async function getPayoutStatistics(): Promise<PayoutStatistics> {
  const [
    totalPayouts,
    pendingPayouts,
    processingPayouts,
    completedPayouts,
    failedPayouts,
    totalPaidOutResult,
  ] = await Promise.all([
    prisma.vendorPayout.count(),
    prisma.vendorPayout.count({ where: { status: PayoutStatus.PENDING } }),
    prisma.vendorPayout.count({ where: { status: PayoutStatus.PROCESSING } }),
    prisma.vendorPayout.count({ where: { status: PayoutStatus.COMPLETED } }),
    prisma.vendorPayout.count({ where: { status: PayoutStatus.FAILED } }),
    prisma.vendorPayout.aggregate({
      where: { status: PayoutStatus.COMPLETED },
      _sum: { amount: true },
    }),
  ]);

  const totalPaidOut = Number(totalPaidOutResult._sum.amount || 0);
  const avgPayoutAmount = completedPayouts > 0 ? totalPaidOut / completedPayouts : 0;

  return {
    totalPayouts,
    pendingPayouts,
    processingPayouts,
    completedPayouts,
    failedPayouts,
    totalPaidOut,
    avgPayoutAmount: Math.round(avgPayoutAmount * 100) / 100,
  };
}
