/**
 * Payment Module Validation Schemas
 * Zod schemas for input validation
 */

import { z } from "zod";

/**
 * Payment intent creation schema
 */
export const createPaymentIntentSchema = z.object({
  bookingId: z
    .string()
    .uuid("Invalid booking ID format"),

  amount: z
    .number()
    .positive("Amount must be positive")
    .max(1000000, "Amount cannot exceed $1,000,000")
    .optional(), // If not provided, use booking.totalAmount

  currency: z
    .string()
    .length(3, "Currency must be 3 characters (ISO 4217)")
    .toLowerCase()
    .default("usd")
    .optional(),

  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .trim()
    .optional(),
});

/**
 * Refund request schema
 */
export const refundRequestSchema = z.object({
  reason: z
    .string()
    .min(10, "Refund reason must be at least 10 characters")
    .max(1000, "Refund reason must be less than 1000 characters")
    .trim()
    .optional(),

  amount: z
    .number()
    .positive("Refund amount must be positive")
    .optional(), // If not provided, calculate based on cancellation policy
});

/**
 * Early payout request schema
 */
export const earlyPayoutRequestSchema = z.object({
  paymentId: z
    .string()
    .uuid("Invalid payment ID format"),

  reason: z
    .string()
    .min(20, "Reason must be at least 20 characters")
    .max(1000, "Reason must be less than 1000 characters")
    .trim()
    .optional(),
});

/**
 * Connected account creation schema
 */
export const connectedAccountSchema = z.object({
  vendorId: z
    .string()
    .uuid("Invalid vendor ID format"),

  email: z
    .string()
    .email("Invalid email address"),

  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters")
    .max(100, "Business name must be less than 100 characters")
    .trim(),

  country: z
    .string()
    .length(2, "Country must be 2-letter ISO code (e.g., US)")
    .toUpperCase()
    .default("US")
    .optional(),
});

/**
 * Payment ID parameter schema
 */
export const paymentIdSchema = z.object({
  id: z.string().uuid("Invalid payment ID format"),
});

/**
 * Webhook signature verification schema
 */
export const webhookSignatureSchema = z.object({
  signature: z.string().min(1, "Webhook signature is required"),
  payload: z.string().min(1, "Webhook payload is required"),
});
