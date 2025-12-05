/**
 * Messaging Module Validation Schemas
 * Zod schemas for message-related operations
 */

import { z } from "zod";

/**
 * Message send schema
 */
export const messageSendSchema = z.object({
  bookingId: z.string().uuid("Invalid booking ID format"),
  content: z
    .string()
    .min(1, "Message content is required")
    .max(5000, "Message content must be less than 5000 characters")
    .trim(),
});

/**
 * Read message schema (for marking as read)
 */
export const readMessageSchema = z.object({
  messageIds: z.array(z.string().uuid()).optional(),
});

/**
 * Inbox query schema
 */
export const inboxQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  unreadOnly: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
});

/**
 * Conversation query schema
 */
export const conversationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
