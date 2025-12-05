/**
 * Violation Validation Schemas
 * Zod schemas for validating violation-related inputs
 */

import { z } from "zod";
import { ViolationType, MessageSeverity, UserStatus } from "@prisma/client";

/**
 * Create violation input validation
 */
export const createViolationSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  type: z.nativeEnum(ViolationType, {
    errorMap: () => ({ message: "Invalid violation type" }),
  }),
  source: z.enum([
    "MESSAGING_SYSTEM",
    "DISPUTE_SYSTEM",
    "MANUAL_REPORT",
    "BOOKING_SYSTEM",
    "AUTOMATED",
  ]),
  sourceId: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000),
  automated: z.boolean().optional().default(false),
  severityOverride: z.nativeEnum(MessageSeverity).optional(),
});

export type CreateViolationSchema = z.infer<typeof createViolationSchema>;

/**
 * Handle appeal input validation
 */
export const handleAppealSchema = z.object({
  violationId: z.string().uuid("Invalid violation ID"),
  adminId: z.string().uuid("Invalid admin ID"),
  decision: z.enum(["APPROVED", "REJECTED"], {
    errorMap: () => ({ message: "Decision must be APPROVED or REJECTED" }),
  }),
  notes: z.string().min(10, "Appeal notes must be at least 10 characters").max(1000),
});

export type HandleAppealSchema = z.infer<typeof handleAppealSchema>;

/**
 * Update account status input validation
 */
export const updateAccountStatusSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  status: z.nativeEnum(UserStatus, {
    errorMap: () => ({ message: "Invalid account status" }),
  }),
  reason: z.string().min(10, "Reason must be at least 10 characters").max(500),
  adminId: z.string().uuid("Invalid admin ID"),
  duration: z.number().int().min(1).max(365).optional(),
});

export type UpdateAccountStatusSchema = z.infer<typeof updateAccountStatusSchema>;

/**
 * Violation list filters validation
 */
export const violationListFiltersSchema = z.object({
  userId: z.string().uuid().optional(),
  type: z.nativeEnum(ViolationType).optional(),
  severity: z.nativeEnum(MessageSeverity).optional(),
  resolved: z.boolean().optional(),
  automated: z.boolean().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
});

export type ViolationListFiltersSchema = z.infer<typeof violationListFiltersSchema>;

/**
 * Get violation by ID validation
 */
export const getViolationByIdSchema = z.object({
  violationId: z.string().uuid("Invalid violation ID"),
});

export type GetViolationByIdSchema = z.infer<typeof getViolationByIdSchema>;

/**
 * Get user violations validation
 */
export const getUserViolationsSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
});

export type GetUserViolationsSchema = z.infer<typeof getUserViolationsSchema>;

/**
 * Circumvention violation context validation
 */
export const circumventionViolationSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  messageId: z.string().uuid("Invalid message ID"),
  severity: z.nativeEnum(MessageSeverity),
  flagReason: z.string().min(1).max(500),
});

export type CircumventionViolationSchema = z.infer<typeof circumventionViolationSchema>;
