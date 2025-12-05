/**
 * Dispute Validation Schemas
 * Zod schemas for dispute request validation
 */

import { z } from "zod";
import { DisputeType, ResolutionOutcome } from "./dispute.types";
import { DisputeStatus } from "@prisma/client";

/**
 * Schema for creating a dispute
 */
export const createDisputeSchema = z.object({
  bookingId: z.string().uuid("Invalid booking ID"),
  type: z.nativeEnum(DisputeType, {
    errorMap: () => ({ message: "Invalid dispute type" }),
  }),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(2000, "Description must not exceed 2000 characters"),
  evidence: z
    .array(z.string().url("Invalid evidence URL"))
    .optional()
    .default([]),
  metadata: z.record(z.any()).optional(),
});

export type CreateDisputeInput = z.infer<typeof createDisputeSchema>;

/**
 * Schema for resolving a dispute (admin only)
 */
export const resolveDisputeSchema = z
  .object({
    outcome: z.nativeEnum(ResolutionOutcome, {
      errorMap: () => ({ message: "Invalid resolution outcome" }),
    }),
    refundPercent: z
      .number()
      .min(0, "Refund percent must be at least 0")
      .max(100, "Refund percent must not exceed 100")
      .optional(),
    notes: z
      .string()
      .min(10, "Resolution notes must be at least 10 characters")
      .max(2000, "Resolution notes must not exceed 2000 characters"),
  })
  .refine(
    (data) => {
      // If outcome is PARTIAL_REFUND, refundPercent is required
      if (data.outcome === ResolutionOutcome.PARTIAL_REFUND) {
        return data.refundPercent !== undefined;
      }
      return true;
    },
    {
      message: "Refund percent is required for partial refunds",
      path: ["refundPercent"],
    }
  );

export type ResolveDisputeInput = z.infer<typeof resolveDisputeSchema>;

/**
 * Schema for updating dispute status
 */
export const updateDisputeSchema = z.object({
  status: z
    .nativeEnum(DisputeStatus, {
      errorMap: () => ({ message: "Invalid dispute status" }),
    })
    .optional(),
  notes: z
    .string()
    .min(10, "Notes must be at least 10 characters")
    .max(2000, "Notes must not exceed 2000 characters")
    .optional(),
});

export type UpdateDisputeInput = z.infer<typeof updateDisputeSchema>;

/**
 * Schema for dispute query filters
 */
export const disputeQuerySchema = z.object({
  status: z.nativeEnum(DisputeStatus).optional(),
  type: z.nativeEnum(DisputeType).optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export type DisputeQueryInput = z.infer<typeof disputeQuerySchema>;
