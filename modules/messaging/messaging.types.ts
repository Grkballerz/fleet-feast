/**
 * Messaging Module TypeScript Types
 * Types for booking-scoped messaging with anti-circumvention
 */

import { MessageSeverity } from "@prisma/client";

/**
 * Message send request data
 */
export interface MessageSendData {
  bookingId: string;
  content: string;
}

/**
 * Message details
 */
export interface MessageDetails {
  id: string;
  bookingId: string;
  senderId: string;
  content: string;
  flagged: boolean;
  flagReason: string | null;
  flagSeverity: MessageSeverity;
  createdAt: Date;
  updatedAt: Date;

  // Sender info (for conversation view)
  sender?: {
    id: string;
    email: string;
  };
}

/**
 * Conversation for a booking
 */
export interface Conversation {
  bookingId: string;
  messages: MessageDetails[];
  unreadCount: number;
  participants: {
    customer: {
      id: string;
      email: string;
    };
    vendor: {
      id: string;
      email: string;
    };
  };
  booking: {
    id: string;
    eventDate: string;
    eventTime: string;
    eventType: string;
    location: string;
    guestCount: number;
    specialRequests?: string;
    status: string;
    proposalAmount?: number;
    proposalDetails?: {
      lineItems: Array<{
        name: string;
        quantity: number;
        unitPrice: number;
        total: number;
      }>;
      inclusions: string[];
      terms?: string;
    };
    proposalSentAt?: string;
    proposalExpiresAt?: string;
    vendor: {
      id: string;
      businessName: string;
      avatarUrl?: string;
    };
    customer: {
      id: string;
      name: string;
    };
  };
}

/**
 * Inbox item (conversation summary)
 */
export interface InboxItem {
  bookingId: string;
  unreadCount: number;
  lastMessage: {
    id: string;
    content: string;
    senderId: string;
    createdAt: Date;
    flagged: boolean;
  } | null;
  lastMessageAt: Date | null;

  // Booking context
  booking: {
    id: string;
    eventDate: string;
    eventType: string;
    status: string;
    vendor: {
      businessName: string;
    };
    customer: {
      email: string;
    };
  };
}

/**
 * Circumvention detection result
 */
export interface CircumventionResult {
  type: CircumventionType;
  severity: MessageSeverity;
  matches: string[];
  positions: (number | undefined)[];
}

/**
 * Types of circumvention patterns
 */
export type CircumventionType =
  | "PHONE"
  | "EMAIL"
  | "SOCIAL_HANDLE"
  | "SOCIAL_PLATFORM"
  | "CODED"
  | "EXTERNAL_URL";

/**
 * Circumvention pattern definition
 */
export interface CircumventionPattern {
  pattern: RegExp;
  type: CircumventionType;
  severity: MessageSeverity;
  description: string;
}

/**
 * Read receipt data
 */
export interface ReadReceiptData {
  messageId: string;
  readBy: string;
  readAt: Date;
}
