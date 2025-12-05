/**
 * Quote Module Validation Schemas
 * Zod schemas for input validation
 */

import { z } from "zod";
import { EventType } from "@prisma/client";

/**
 * Quote pricing schema
 */
export const quotePricingSchema = z.object({
  basePrice: z
    .number()
    .positive("Base price must be positive")
    .max(1000000, "Base price cannot exceed 1,000,000"),

  perPersonPrice: z
    .number()
    .positive("Per person price must be positive")
    .max(10000, "Per person price cannot exceed 10,000")
    .optional(),

  additionalFees: z
    .array(
      z.object({
        name: z
          .string()
          .min(1, "Fee name is required")
          .max(100, "Fee name must be less than 100 characters")
          .trim(),
        amount: z
          .number()
          .positive("Fee amount must be positive")
          .max(100000, "Fee amount cannot exceed 100,000"),
      })
    )
    .max(20, "Cannot have more than 20 additional fees")
    .optional(),

  total: z
    .number()
    .positive("Total must be positive")
    .max(1000000, "Total cannot exceed 1,000,000"),
});

/**
 * Create quote request schema
 */
export const createQuoteRequestSchema = z.object({
  eventDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Event date must be in YYYY-MM-DD format")
    .refine((date) => {
      const eventDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return eventDate >= today;
    }, "Event date must be in the future"),

  eventType: z.nativeEnum(EventType, {
    errorMap: () => ({ message: "Invalid event type" }),
  }),

  guestCount: z
    .number()
    .int("Guest count must be a whole number")
    .min(1, "Guest count must be at least 1")
    .max(10000, "Guest count cannot exceed 10,000"),

  location: z
    .string()
    .min(5, "Location must be at least 5 characters")
    .max(500, "Location must be less than 500 characters")
    .trim(),

  requirements: z
    .string()
    .min(10, "Requirements must be at least 10 characters")
    .max(5000, "Requirements must be less than 5000 characters")
    .trim(),

  budget: z
    .number()
    .positive("Budget must be positive")
    .max(1000000, "Budget cannot exceed 1,000,000")
    .optional(),

  vendorIds: z
    .array(z.string().uuid("Invalid vendor ID format"))
    .min(1, "At least one vendor must be selected")
    .max(10, "Cannot request quotes from more than 10 vendors"),

  expiresAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Expiry date must be in YYYY-MM-DD format")
    .refine((date) => {
      const expiryDate = new Date(date);
      const tomorrow = new Date();
      tomorrow.setHours(24, 0, 0, 0);
      return expiryDate >= tomorrow;
    }, "Expiry date must be at least 1 day in the future")
    .optional(),
});

/**
 * Submit quote schema (vendor submits)
 */
export const submitQuoteSchema = z
  .object({
    pricing: quotePricingSchema,

    inclusions: z
      .array(
        z
          .string()
          .min(1, "Inclusion item cannot be empty")
          .max(200, "Inclusion item must be less than 200 characters")
          .trim()
      )
      .min(1, "At least one inclusion must be provided")
      .max(50, "Cannot have more than 50 inclusions"),

    terms: z
      .string()
      .max(2000, "Terms must be less than 2000 characters")
      .trim()
      .optional(),

    validUntil: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Valid until date must be in YYYY-MM-DD format")
      .refine((date) => {
        const validUntilDate = new Date(date);
        const tomorrow = new Date();
        tomorrow.setHours(24, 0, 0, 0);
        return validUntilDate >= tomorrow;
      }, "Valid until date must be at least 1 day in the future"),
  })
  .refine(
    (data) => {
      // Validate that total matches calculated amount
      const basePrice = data.pricing.basePrice;
      const additionalTotal =
        data.pricing.additionalFees?.reduce((sum, fee) => sum + fee.amount, 0) || 0;
      const expectedTotal = basePrice + additionalTotal;
      const actualTotal = data.pricing.total;

      // Allow for small floating point differences
      return Math.abs(expectedTotal - actualTotal) < 0.01;
    },
    {
      message: "Total price must equal base price plus additional fees",
      path: ["pricing", "total"],
    }
  );

/**
 * Accept quote schema
 */
export const acceptQuoteSchema = z.object({
  eventTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Event time must be in HH:MM format"),

  specialRequests: z
    .string()
    .max(2000, "Special requests must be less than 2000 characters")
    .trim()
    .optional(),
});

/**
 * Quote request ID parameter schema
 */
export const quoteRequestIdSchema = z.object({
  id: z.string().uuid("Invalid quote request ID format"),
});

/**
 * Quote ID parameter schema
 */
export const quoteIdSchema = z.object({
  id: z.string().uuid("Invalid quote ID format"),
});

/**
 * Request ID parameter schema (for submitting quotes)
 */
export const requestIdParamSchema = z.object({
  requestId: z.string().uuid("Invalid request ID format"),
});
