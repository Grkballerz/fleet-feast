/**
 * Notification System Types
 * Fleet Feast - Food Truck Booking Platform
 *
 * Handles in-app notifications and email notifications for booking events,
 * messages, reminders, and system events.
 */

import { NotificationType } from '@prisma/client';

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, any>;
}

export interface NotificationResponse {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  metadata: Record<string, any> | null;
  read: boolean;
  readAt: Date | null;
  createdAt: Date;
}

export interface NotificationListResponse {
  notifications: NotificationResponse[];
  unreadCount: number;
  total: number;
  hasMore: boolean;
}

// ============================================================================
// EMAIL TYPES
// ============================================================================

export interface EmailTemplate {
  subject: string;
  html: string;
}

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export interface EmailTemplateData {
  // Common fields
  userName: string;
  platformUrl: string;

  // Booking-related
  bookingId?: string;
  eventDate?: string;
  eventTime?: string;
  eventType?: string;
  location?: string;
  guestCount?: number;
  totalAmount?: string;
  vendorName?: string;
  customerName?: string;

  // Message-related
  senderName?: string;
  messagePreview?: string;

  // Review-related
  reviewLink?: string;

  // Dispute-related
  disputeId?: string;
  resolution?: string;
  refundAmount?: string;

  // Violation-related
  violationType?: string;
  violationReason?: string;

  // Account status
  newStatus?: string;
  statusReason?: string;
}

// ============================================================================
// NOTIFICATION PREFERENCES
// ============================================================================

export interface NotificationPreferencesResponse {
  id: string;
  userId: string;
  emailBookingRequest: boolean;
  emailBookingAccepted: boolean;
  emailBookingDeclined: boolean;
  emailBookingCancelled: boolean;
  emailPaymentConfirmed: boolean;
  emailNewMessage: boolean;
  emailEventReminder: boolean;
  emailReviewPrompt: boolean;
  emailDisputeCreated: boolean;
  emailDisputeResolved: boolean;
  emailViolationWarning: boolean;
  emailAccountStatusChanged: boolean;
  emailDigest: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateNotificationPreferencesParams {
  emailBookingRequest?: boolean;
  emailBookingAccepted?: boolean;
  emailBookingDeclined?: boolean;
  emailBookingCancelled?: boolean;
  emailPaymentConfirmed?: boolean;
  emailNewMessage?: boolean;
  emailEventReminder?: boolean;
  emailReviewPrompt?: boolean;
  emailDisputeCreated?: boolean;
  emailDisputeResolved?: boolean;
  emailViolationWarning?: boolean;
  emailAccountStatusChanged?: boolean;
  emailDigest?: boolean;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export class NotificationError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'NotificationError';
  }
}

// ============================================================================
// EMAIL TEMPLATE MAPPING
// ============================================================================

export const EMAIL_PREFERENCE_MAP: Record<NotificationType, keyof NotificationPreferencesResponse> = {
  BOOKING_REQUEST: 'emailBookingRequest',
  BOOKING_ACCEPTED: 'emailBookingAccepted',
  BOOKING_DECLINED: 'emailBookingDeclined',
  BOOKING_CANCELLED: 'emailBookingCancelled',
  PAYMENT_CONFIRMED: 'emailPaymentConfirmed',
  NEW_MESSAGE: 'emailNewMessage',
  EVENT_REMINDER: 'emailEventReminder',
  REVIEW_PROMPT: 'emailReviewPrompt',
  DISPUTE_CREATED: 'emailDisputeCreated',
  DISPUTE_RESOLVED: 'emailDisputeResolved',
  VIOLATION_WARNING: 'emailViolationWarning',
  ACCOUNT_STATUS_CHANGED: 'emailAccountStatusChanged',
};
