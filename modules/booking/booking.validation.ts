/**
 * Booking Module Validation Schemas
 * Zod schemas for input validation
 */

import { z } from "zod";
import { EventType } from "@prisma/client";

/**
 * Booking request schema (customer creates booking)
 */
export const bookingRequestSchema = z.object({
  vendorId: z
    .string()
    .uuid("Invalid vendor ID format"),

  eventDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Event date must be in YYYY-MM-DD format")
    .refine((date) => {
      const eventDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return eventDate >= today;
    }, "Event date must be in the future"),

  eventTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Event time must be in HH:MM format"),

  eventType: z.nativeEnum(EventType, {
    errorMap: () => ({ message: "Invalid event type" }),
  }),

  location: z
    .string()
    .min(5, "Location must be at least 5 characters")
    .max(500, "Location must be less than 500 characters")
    .trim(),

  guestCount: z
    .number()
    .int("Guest count must be a whole number")
    .min(1, "Guest count must be at least 1")
    .max(10000, "Guest count cannot exceed 10,000"),

  specialRequests: z
    .string()
    .max(2000, "Special requests must be less than 2000 characters")
    .trim()
    .optional(),

  totalAmount: z
    .number()
    .positive("Total amount must be positive")
    .max(1000000, "Total amount cannot exceed 1,000,000"),
});

/**
 * Inquiry request schema (customer requests proposal)
 */
export const inquiryRequestSchema = z.object({
  vendorId: z
    .string()
    .uuid("Invalid vendor ID format"),

  eventDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Event date must be in YYYY-MM-DD format")
    .refine((date) => {
      const eventDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return eventDate >= today;
    }, "Event date must be in the future"),

  eventTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Event time must be in HH:MM format"),

  eventType: z.nativeEnum(EventType, {
    errorMap: () => ({ message: "Invalid event type" }),
  }),

  location: z
    .string()
    .min(5, "Location must be at least 5 characters")
    .max(500, "Location must be less than 500 characters")
    .trim(),

  guestCount: z
    .number()
    .int("Guest count must be a whole number")
    .min(1, "Guest count must be at least 1")
    .max(10000, "Guest count cannot exceed 10,000"),

  specialRequests: z
    .string()
    .max(2000, "Special requests must be less than 2000 characters")
    .trim()
    .optional(),
});

/**
 * Line item schema (for proposal details)
 */
export const lineItemSchema = z.object({
  name: z
    .string()
    .min(1, "Line item name is required")
    .max(200, "Line item name must be less than 200 characters")
    .trim(),

  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1"),

  unitPrice: z
    .number()
    .nonnegative("Unit price must be non-negative"),

  total: z
    .number()
    .nonnegative("Total must be non-negative"),
});

/**
 * Proposal schema (vendor sends proposal)
 */
export const proposalSchema = z.object({
  proposalAmount: z
    .number()
    .positive("Proposal amount must be positive")
    .max(1000000, "Proposal amount cannot exceed 1,000,000"),

  proposalDetails: z.object({
    lineItems: z
      .array(lineItemSchema)
      .min(1, "At least one line item is required"),

    inclusions: z
      .array(z.string())
      .min(1, "At least one inclusion is required"),

    terms: z
      .string()
      .max(2000, "Terms must be less than 2000 characters")
      .trim()
      .optional(),
  }),

  expiresInDays: z
    .number()
    .int("Expiration days must be a whole number")
    .min(1, "Expiration must be at least 1 day")
    .max(30, "Expiration cannot exceed 30 days")
    .default(7)
    .optional(),
});

/**
 * Proposal acceptance schema (customer accepts proposal)
 */
export const proposalAcceptSchema = z.object({
  acceptTerms: z
    .boolean()
    .refine((val) => val === true, "You must accept the terms to proceed"),
});

/**
 * Booking update schema (limited fields can be updated)
 */
export const bookingUpdateSchema = z.object({
  eventDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Event date must be in YYYY-MM-DD format")
    .refine((date) => {
      const eventDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return eventDate >= today;
    }, "Event date must be in the future")
    .optional(),

  eventTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Event time must be in HH:MM format")
    .optional(),

  location: z
    .string()
    .min(5, "Location must be at least 5 characters")
    .max(500, "Location must be less than 500 characters")
    .trim()
    .optional(),

  guestCount: z
    .number()
    .int("Guest count must be a whole number")
    .min(1, "Guest count must be at least 1")
    .max(10000, "Guest count cannot exceed 10,000")
    .optional(),

  specialRequests: z
    .string()
    .max(2000, "Special requests must be less than 2000 characters")
    .trim()
    .optional(),
});

/**
 * Vendor decline reason schema
 */
export const vendorDeclineSchema = z.object({
  reason: z
    .string()
    .min(10, "Decline reason must be at least 10 characters")
    .max(1000, "Decline reason must be less than 1000 characters")
    .trim()
    .optional(),
});

/**
 * Cancellation reason schema
 */
export const cancellationSchema = z.object({
  reason: z
    .string()
    .min(5, "Cancellation reason must be at least 5 characters")
    .max(1000, "Cancellation reason must be less than 1000 characters")
    .trim()
    .optional(),
});

/**
 * Booking ID parameter schema
 */
export const bookingIdSchema = z.object({
  id: z.string().uuid("Invalid booking ID format"),
});
