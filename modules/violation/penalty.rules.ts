/**
 * Penalty Rules and Progression Logic
 * Defines violation severity points and penalty thresholds
 */

import { ViolationType, MessageSeverity } from "@prisma/client";
import type { PenaltyThreshold, PenaltyType } from "./violation.types";

/**
 * Violation severity point values
 * Points are cumulative over a rolling 365-day period
 */
export const VIOLATION_SEVERITY_POINTS: Record<ViolationType, number> = {
  // Contact sharing violations
  CONTACT_INFO_SHARING: 2,
  CIRCUMVENTION_ATTEMPT: 1,

  // No-show violations
  [ViolationType.OTHER]: 1, // Using OTHER as a fallback
};

/**
 * Extended violation severity points
 * Since schema has limited ViolationTypes, we use a more granular system
 */
export const EXTENDED_VIOLATION_POINTS: Record<string, number> = {
  // Circumvention (from messaging)
  CIRCUMVENTION_ATTEMPT: 1,
  REPEATED_CIRCUMVENTION: 3,
  CONTACT_INFO_SHARING: 2,

  // Booking violations
  NO_SHOW_VENDOR: 2,
  NO_SHOW_CUSTOMER: 1,
  LATE_CANCELLATION: 1,

  // Behavioral violations
  HARASSMENT: 3,
  ABUSE_REPORT: 2,
  SPAM: 1,

  // Severe violations
  FRAUD: 5,
  FRAUD_SUSPECTED: 4,

  // Policy violations
  POLICY_VIOLATION: 1,
};

/**
 * Get severity points for a violation
 */
export function getViolationPoints(
  type: ViolationType,
  customType?: string
): number {
  // Try custom type first
  if (customType && customType in EXTENDED_VIOLATION_POINTS) {
    return EXTENDED_VIOLATION_POINTS[customType];
  }

  // Fall back to schema type
  return VIOLATION_SEVERITY_POINTS[type] || 1;
}

/**
 * Penalty progression thresholds
 * Based on cumulative violation points over rolling 365 days
 */
export const PENALTY_THRESHOLDS: PenaltyThreshold[] = [
  {
    points: 0,
    penalty: "WARNING" as PenaltyType,
    duration: null,
    description: "No penalty - account in good standing",
  },
  {
    points: 1,
    penalty: "WARNING" as PenaltyType,
    duration: null,
    description: "First violation - warning issued, can continue using platform",
  },
  {
    points: 3,
    penalty: "RESTRICTED" as PenaltyType,
    duration: 7,
    description: "Restricted - cannot create new bookings for 7 days",
  },
  {
    points: 5,
    penalty: "SUSPENDED" as PenaltyType,
    duration: 30,
    description: "Suspended - account inaccessible for 30 days",
  },
  {
    points: 8,
    penalty: "BANNED" as PenaltyType,
    duration: null,
    description: "Banned - permanent account closure",
  },
];

/**
 * Calculate appropriate penalty based on total violation points
 * Returns the highest penalty threshold that applies
 */
export function calculatePenalty(totalPoints: number): PenaltyThreshold {
  // Find the highest threshold that the user has reached
  const applicableThresholds = PENALTY_THRESHOLDS.filter(
    (t) => totalPoints >= t.points
  );

  // Return the most severe applicable penalty
  return applicableThresholds[applicableThresholds.length - 1] || PENALTY_THRESHOLDS[0];
}

/**
 * Get status priority for comparison
 * Higher number = more severe status
 */
export function getStatusPriority(status: string): number {
  const priorities: Record<string, number> = {
    ACTIVE: 0,
    WARNING: 1,
    RESTRICTED: 2,
    SUSPENDED: 3,
    BANNED: 4,
    DELETED: 5,
  };

  return priorities[status] || 0;
}

/**
 * Check if a penalty is temporary
 */
export function isPenaltyTemporary(penalty: PenaltyType): boolean {
  return penalty === "RESTRICTED" || penalty === "SUSPENDED";
}

/**
 * Get account status from penalty type
 * Maps penalty types to UserStatus enum values
 */
export function mapPenaltyToAccountStatus(penalty: PenaltyType): string {
  const mapping: Record<PenaltyType, string> = {
    WARNING: "ACTIVE",
    RESTRICTED: "SUSPENDED", // Schema doesn't have RESTRICTED, use SUSPENDED
    SUSPENDED: "SUSPENDED",
    BANNED: "BANNED",
  };

  return mapping[penalty] || "ACTIVE";
}

/**
 * Calculate expiry date for temporary penalties
 */
export function calculateExpiryDate(
  penalty: PenaltyThreshold,
  fromDate: Date = new Date()
): Date | null {
  if (!penalty.duration) {
    return null; // Permanent penalty
  }

  const expiryDate = new Date(fromDate);
  expiryDate.setDate(expiryDate.getDate() + penalty.duration);
  return expiryDate;
}

/**
 * Get violation points within a time window
 * Used for rolling 365-day calculations
 */
export function filterViolationsByTimeWindow(
  violations: Array<{ severity: MessageSeverity; createdAt: Date }>,
  days: number = 365
): Array<{ severity: MessageSeverity; createdAt: Date }> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return violations.filter((v) => v.createdAt >= cutoffDate);
}

/**
 * Convert MessageSeverity to violation points
 */
export function severityToPoints(severity: MessageSeverity): number {
  const severityPoints: Record<MessageSeverity, number> = {
    NONE: 0,
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
  };

  return severityPoints[severity] || 0;
}

/**
 * Determine if a new violation should trigger immediate action
 */
export function shouldTriggerImmediateAction(
  totalPoints: number,
  newViolationPoints: number
): boolean {
  const newTotal = totalPoints + newViolationPoints;
  const currentPenalty = calculatePenalty(totalPoints);
  const newPenalty = calculatePenalty(newTotal);

  // Trigger if penalty level increases
  return getStatusPriority(newPenalty.penalty) > getStatusPriority(currentPenalty.penalty);
}
