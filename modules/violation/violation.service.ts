/**
 * Violation Service Layer
 * Business logic for tracking violations, applying penalties, and managing appeals
 */

import { prisma } from "@/lib/prisma";
import { ViolationType, MessageSeverity, UserStatus } from "@prisma/client";
import type {
  CreateViolationInput,
  ViolationDetails,
  UserViolationSummary,
  HandleAppealInput,
  ViolationListFilters,
  UpdateAccountStatusInput,
  CircumventionViolationContext,
  ViolationSource,
  AppealDecision,
  PenaltyType,
} from "./violation.types";
import {
  calculatePenalty,
  getStatusPriority,
  mapPenaltyToAccountStatus,
  calculateExpiryDate,
  severityToPoints,
  getViolationPoints,
} from "./penalty.rules";

/**
 * Custom error class for violation operations
 */
export class ViolationError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "ViolationError";
  }
}

/**
 * Create a violation and apply appropriate penalty
 */
export async function createViolation(
  data: CreateViolationInput
): Promise<ViolationDetails> {
  // Create violation record
  const violation = await prisma.violation.create({
    data: {
      userId: data.userId,
      type: data.type,
      description: data.description,
      severity: data.severityOverride || MessageSeverity.MEDIUM,
      automated: data.automated ?? false,
      source: data.source,
      sourceId: data.sourceId,
      relatedMessageId: data.source === "MESSAGING_SYSTEM" ? data.sourceId : null,
      relatedBookingId: data.source === "BOOKING_SYSTEM" ? data.sourceId : null,
    },
  });

  // Calculate total violation points over the last year
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const violations = await prisma.violation.findMany({
    where: {
      userId: data.userId,
      appealed: false, // Don't count appealed violations
      createdAt: {
        gte: oneYearAgo,
      },
    },
    select: {
      severity: true,
      type: true,
    },
  });

  // Sum up points
  const totalPoints = violations.reduce((sum, v) => {
    const points = severityToPoints(v.severity);
    return sum + points;
  }, 0);

  // Calculate new penalty based on total points
  const penalty = calculatePenalty(totalPoints);

  // Get current user status
  const user = await prisma.user.findUnique({
    where: { id: data.userId },
    select: { status: true, statusExpiresAt: true },
  });

  if (!user) {
    throw new ViolationError("User not found", "USER_NOT_FOUND", 404);
  }

  // Update user status if penalty is more severe
  const newStatus = mapPenaltyToAccountStatus(penalty.penalty);
  const currentPriority = getStatusPriority(user.status);
  const newPriority = getStatusPriority(newStatus);

  if (newPriority > currentPriority) {
    const expiryDate = calculateExpiryDate(penalty);

    await prisma.user.update({
      where: { id: data.userId },
      data: {
        status: newStatus as UserStatus,
        statusExpiresAt: expiryDate,
      },
    });

    // Update violation with action taken
    await prisma.violation.update({
      where: { id: violation.id },
      data: {
        actionTaken: penalty.penalty,
        actionDuration: penalty.duration,
      },
    });

    // TODO: Send notification email to user about status change
    console.log(
      `[Violation] User ${data.userId} status changed to ${newStatus} (${penalty.description})`
    );
  }

  return mapViolationToDetails(violation);
}

/**
 * Process circumvention violation from messaging system
 */
export async function processCircumventionViolation(
  context: CircumventionViolationContext
): Promise<ViolationDetails> {
  // Check for recent circumvention violations (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentViolations = await prisma.violation.findMany({
    where: {
      userId: context.userId,
      type: {
        in: [ViolationType.CONTACT_INFO_SHARING, ViolationType.CIRCUMVENTION_ATTEMPT],
      },
      createdAt: {
        gte: thirtyDaysAgo,
      },
    },
  });

  // Determine if this is a repeat offense
  const isRepeat = recentViolations.length > 0;

  // Higher severity for repeat offenses
  const violationType = isRepeat
    ? ViolationType.CONTACT_INFO_SHARING // More severe
    : ViolationType.CIRCUMVENTION_ATTEMPT;

  const description = isRepeat
    ? `Repeated attempt to share contact information. Detected: ${context.flagReason}`
    : `Attempted to share contact information outside platform. Detected: ${context.flagReason}`;

  return createViolation({
    userId: context.userId,
    type: violationType,
    source: "MESSAGING_SYSTEM" as ViolationSource,
    sourceId: context.messageId,
    description,
    automated: true,
    severityOverride: isRepeat ? MessageSeverity.HIGH : context.severity,
  });
}

/**
 * Get violation details by ID
 */
export async function getViolationById(
  violationId: string
): Promise<ViolationDetails | null> {
  const violation = await prisma.violation.findUnique({
    where: { id: violationId },
  });

  return violation ? mapViolationToDetails(violation) : null;
}

/**
 * Get user's violation summary
 */
export async function getUserViolationSummary(
  userId: string
): Promise<UserViolationSummary> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      status: true,
      statusExpiresAt: true,
    },
  });

  if (!user) {
    throw new ViolationError("User not found", "USER_NOT_FOUND", 404);
  }

  // Get violations from last year
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const violations = await prisma.violation.findMany({
    where: {
      userId,
      createdAt: {
        gte: oneYearAgo,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Calculate total points (excluding appealed violations)
  const activeViolations = violations.filter((v) => !v.appealed);
  const totalPoints = activeViolations.reduce((sum, v) => {
    return sum + severityToPoints(v.severity);
  }, 0);

  const penalty = calculatePenalty(totalPoints);

  return {
    userId,
    totalViolations: violations.length,
    totalPoints,
    currentPenalty: penalty.penalty,
    accountStatus: user.status as any,
    statusExpiresAt: user.statusExpiresAt,
    recentViolations: violations.slice(0, 10).map(mapViolationToDetails),
  };
}

/**
 * List violations with filters
 */
export async function listViolations(
  filters: ViolationListFilters
): Promise<{ violations: ViolationDetails[]; total: number }> {
  const where: any = {};

  if (filters.userId) {
    where.userId = filters.userId;
  }

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.severity) {
    where.severity = filters.severity;
  }

  if (filters.automated !== undefined) {
    where.automated = filters.automated;
  }

  if (filters.resolved !== undefined) {
    if (filters.resolved) {
      where.resolvedAt = { not: null };
    } else {
      where.resolvedAt = null;
    }
  }

  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    if (filters.startDate) {
      where.createdAt.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.createdAt.lte = filters.endDate;
    }
  }

  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  const [violations, total] = await Promise.all([
    prisma.violation.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.violation.count({ where }),
  ]);

  return {
    violations: violations.map(mapViolationToDetails),
    total,
  };
}

/**
 * Handle violation appeal decision
 */
export async function handleAppeal(
  input: HandleAppealInput
): Promise<ViolationDetails> {
  const violation = await prisma.violation.findUnique({
    where: { id: input.violationId },
  });

  if (!violation) {
    throw new ViolationError("Violation not found", "VIOLATION_NOT_FOUND", 404);
  }

  // Update violation with appeal decision
  const updatedViolation = await prisma.violation.update({
    where: { id: input.violationId },
    data: {
      appealed: input.decision === "APPROVED",
      appealDecision: input.decision,
      appealNotes: input.notes,
      appealReviewedBy: input.adminId,
      appealReviewedAt: new Date(),
    },
  });

  // If appeal approved, recalculate user's penalty status
  if (input.decision === "APPROVED") {
    await recalculateUserStatus(violation.userId);
  }

  return mapViolationToDetails(updatedViolation);
}

/**
 * Recalculate and update user's status based on active violations
 */
export async function recalculateUserStatus(userId: string): Promise<void> {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  // Get non-appealed violations from last year
  const violations = await prisma.violation.findMany({
    where: {
      userId,
      appealed: false,
      createdAt: {
        gte: oneYearAgo,
      },
    },
    select: {
      severity: true,
    },
  });

  // Calculate total points
  const totalPoints = violations.reduce((sum, v) => {
    return sum + severityToPoints(v.severity);
  }, 0);

  // Calculate appropriate penalty
  const penalty = calculatePenalty(totalPoints);
  const newStatus = mapPenaltyToAccountStatus(penalty.penalty);
  const expiryDate = calculateExpiryDate(penalty);

  // Update user status
  await prisma.user.update({
    where: { id: userId },
    data: {
      status: newStatus as UserStatus,
      statusExpiresAt: expiryDate,
    },
  });

  console.log(
    `[Violation] Recalculated status for user ${userId}: ${newStatus} (${totalPoints} points)`
  );
}

/**
 * Update user account status manually (admin action)
 */
export async function updateAccountStatus(
  input: UpdateAccountStatusInput
): Promise<void> {
  const expiryDate = input.duration
    ? new Date(Date.now() + input.duration * 24 * 60 * 60 * 1000)
    : null;

  await prisma.user.update({
    where: { id: input.userId },
    data: {
      status: input.status as UserStatus,
      statusExpiresAt: expiryDate,
    },
  });

  // Create a violation record for audit trail
  await prisma.violation.create({
    data: {
      userId: input.userId,
      type: ViolationType.OTHER,
      description: `Manual status change by admin. Reason: ${input.reason}`,
      severity: MessageSeverity.NONE,
      automated: false,
      source: "MANUAL_REPORT",
      actionTaken: input.status,
      actionDuration: input.duration,
      resolvedBy: input.adminId,
    },
  });

  console.log(
    `[Violation] Admin ${input.adminId} changed user ${input.userId} status to ${input.status}`
  );
}

/**
 * Expire temporary penalties (run as cron job)
 */
export async function expireTemporaryPenalties(): Promise<number> {
  const now = new Date();

  const expiredUsers = await prisma.user.findMany({
    where: {
      status: {
        in: [UserStatus.SUSPENDED],
      },
      statusExpiresAt: {
        lte: now,
      },
    },
  });

  // Update all expired users to ACTIVE
  await prisma.user.updateMany({
    where: {
      id: {
        in: expiredUsers.map((u) => u.id),
      },
    },
    data: {
      status: UserStatus.ACTIVE,
      statusExpiresAt: null,
    },
  });

  console.log(`[Violation] Expired ${expiredUsers.length} temporary penalties`);
  return expiredUsers.length;
}

/**
 * Map Prisma violation to ViolationDetails type
 */
function mapViolationToDetails(violation: any): ViolationDetails {
  return {
    id: violation.id,
    userId: violation.userId,
    type: violation.type,
    description: violation.description,
    severity: violation.severity,
    source: violation.source || "MANUAL_REPORT",
    sourceId: violation.sourceId,
    automated: violation.automated,
    actionTaken: violation.actionTaken,
    actionDuration: violation.actionDuration,
    relatedMessageId: violation.relatedMessageId,
    relatedBookingId: violation.relatedBookingId,
    resolvedAt: violation.resolvedAt,
    resolvedBy: violation.resolvedBy,
    notes: violation.notes,
    createdAt: violation.createdAt,
    updatedAt: violation.updatedAt,
    appealed: violation.appealed,
    appealDecision: violation.appealDecision,
    appealNotes: violation.appealNotes,
    appealReviewedBy: violation.appealReviewedBy,
    appealReviewedAt: violation.appealReviewedAt,
  };
}
