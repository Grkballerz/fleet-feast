/**
 * Payout Validation Schemas
 * Zod schemas for validating payout-related requests
 */

import { z } from "zod";
import { PayoutStatus, PayoutMethod } from "@prisma/client";

/**
 * Hold payout request validation
 */
export const holdPayoutSchema = z.object({
  reason: z.string().min(10, "Reason must be at least 10 characters").max(500),
});

export type HoldPayoutRequest = z.infer<typeof holdPayoutSchema>;

/**
 * Release payout request validation
 */
export const releasePayoutSchema = z.object({
  notes: z.string().optional(),
});

export type ReleasePayoutRequest = z.infer<typeof releasePayoutSchema>;

/**
 * Process payout request validation
 */
export const processPayoutSchema = z.object({
  externalReference: z.string().optional(),
});

export type ProcessPayoutRequest = z.infer<typeof processPayoutSchema>;

/**
 * List payouts query parameters
 */
export const listPayoutsQuerySchema = z.object({
  status: z.nativeEnum(PayoutStatus).optional(),
  vendorId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListPayoutsQuery = z.infer<typeof listPayoutsQuerySchema>;

/**
 * Payout method validation
 */
export const payoutMethodSchema = z.nativeEnum(PayoutMethod);

/**
 * Validate payout eligibility parameters
 */
export const eligibilityParamsSchema = z.object({
  daysAfterEvent: z.number().int().min(0).default(7),
  excludeDisputes: z.boolean().default(true),
});

export type EligibilityParams = z.infer<typeof eligibilityParamsSchema>;
