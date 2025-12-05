/**
 * Violation System Types
 * Defines types for tracking violations, penalties, and account status
 */

import { ViolationType, MessageSeverity, UserStatus } from "@prisma/client";

/**
 * Extended violation types (in addition to schema enums)
 */
export enum ViolationSource {
  MESSAGING_SYSTEM = "MESSAGING_SYSTEM",
  DISPUTE_SYSTEM = "DISPUTE_SYSTEM",
  MANUAL_REPORT = "MANUAL_REPORT",
  BOOKING_SYSTEM = "BOOKING_SYSTEM",
  AUTOMATED = "AUTOMATED",
}

/**
 * Account status types (extended from UserStatus)
 */
export enum AccountStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  BANNED = "BANNED",
  DELETED = "DELETED",
}

/**
 * Appeal decision types
 */
export enum AppealDecision {
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  PENDING = "PENDING",
}

/**
 * Penalty type based on violation points
 */
export enum PenaltyType {
  WARNING = "WARNING",
  RESTRICTED = "RESTRICTED",
  SUSPENDED = "SUSPENDED",
  BANNED = "BANNED",
}

/**
 * Input for creating a violation
 */
export interface CreateViolationInput {
  userId: string;
  type: ViolationType;
  source: ViolationSource;
  sourceId?: string; // e.g., messageId, bookingId
  description: string;
  automated?: boolean;
  severityOverride?: MessageSeverity; // Optional manual override
}

/**
 * Violation details returned from service
 */
export interface ViolationDetails {
  id: string;
  userId: string;
  type: ViolationType;
  description: string;
  severity: MessageSeverity;
  source: ViolationSource;
  sourceId: string | null;
  automated: boolean;
  actionTaken: string | null;
  actionDuration: number | null;
  relatedMessageId: string | null;
  relatedBookingId: string | null;
  resolvedAt: Date | null;
  resolvedBy: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  appealed: boolean;
  appealDecision: AppealDecision | null;
  appealNotes: string | null;
  appealReviewedBy: string | null;
  appealReviewedAt: Date | null;
}

/**
 * Penalty threshold configuration
 */
export interface PenaltyThreshold {
  points: number;
  penalty: PenaltyType;
  duration: number | null; // days, null for permanent
  description: string;
}

/**
 * User violation summary
 */
export interface UserViolationSummary {
  userId: string;
  totalViolations: number;
  totalPoints: number;
  currentPenalty: PenaltyType;
  accountStatus: AccountStatus;
  statusExpiresAt: Date | null;
  recentViolations: ViolationDetails[];
}

/**
 * Appeal submission data
 */
export interface SubmitAppealInput {
  violationId: string;
  userId: string;
  reason: string;
}

/**
 * Handle appeal decision data
 */
export interface HandleAppealInput {
  violationId: string;
  adminId: string;
  decision: AppealDecision;
  notes: string;
}

/**
 * Violation list filters
 */
export interface ViolationListFilters {
  userId?: string;
  type?: ViolationType;
  severity?: MessageSeverity;
  resolved?: boolean;
  automated?: boolean;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

/**
 * Update account status input
 */
export interface UpdateAccountStatusInput {
  userId: string;
  status: AccountStatus;
  reason: string;
  adminId: string;
  duration?: number; // days (for temporary suspensions)
}

/**
 * Circumvention violation context (from messaging)
 */
export interface CircumventionViolationContext {
  userId: string;
  messageId: string;
  severity: MessageSeverity;
  flagReason: string;
}
