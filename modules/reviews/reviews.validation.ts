/**
 * Reviews Module - Validation Schemas
 * Zod schemas for request validation
 */

import { z } from "zod";

/**
 * Review creation schema
 */
export const reviewCreateSchema = z.object({
  bookingId: z.string().uuid("Invalid booking ID format"),
  rating: z
    .number()
    .int("Rating must be an integer")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  content: z
    .string()
    .max(2000, "Review content must be at most 2000 characters")
    .optional(),
});

/**
 * Review update schema
 */
export const reviewUpdateSchema = z.object({
  rating: z
    .number()
    .int("Rating must be an integer")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5")
    .optional(),
  content: z
    .string()
    .max(2000, "Review content must be at most 2000 characters")
    .optional(),
}).refine(
  (data) => data.rating !== undefined || data.content !== undefined,
  { message: "At least one field (rating or content) must be provided" }
);

/**
 * Review listing query schema
 */
export const reviewListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(["createdAt", "rating"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  minRating: z.coerce.number().int().min(1).max(5).optional(),
});

/**
 * UUID parameter schema
 */
export const uuidParamSchema = z.object({
  id: z.string().uuid("Invalid ID format"),
});

export const vendorIdParamSchema = z.object({
  vendorId: z.string().uuid("Invalid vendor ID format"),
});

export const userIdParamSchema = z.object({
  userId: z.string().uuid("Invalid user ID format"),
});

// Export type inferences
export type ReviewCreateInput = z.infer<typeof reviewCreateSchema>;
export type ReviewUpdateInput = z.infer<typeof reviewUpdateSchema>;
export type ReviewListQuery = z.infer<typeof reviewListQuerySchema>;
