/**
 * Notification Service
 * Fleet Feast - Food Truck Booking Platform
 *
 * Manages in-app notifications and triggers email notifications based on user preferences.
 */

import { prisma } from '@/lib/prisma';
import { NotificationType } from '@prisma/client';
import {
  CreateNotificationParams,
  NotificationResponse,
  NotificationListResponse,
  NotificationPreferencesResponse,
  UpdateNotificationPreferencesParams,
  NotificationError,
  EMAIL_PREFERENCE_MAP,
} from './notification.types';
import { emailService } from './email.service';

// ============================================================================
// NOTIFICATION SERVICE
// ============================================================================

export class NotificationService {
  /**
   * Create a notification (in-app + optional email)
   */
  async createNotification(params: CreateNotificationParams): Promise<NotificationResponse> {
    const { userId, type, title, message, link, metadata } = params;

    try {
      // Create in-app notification
      const notification = await prisma.notification.create({
        data: {
          userId,
          type,
          title,
          message,
          link,
          metadata: metadata || null,
        },
      });

      // Check if user wants email for this notification type
      const shouldSendEmail = await this.shouldSendEmail(userId, type);

      if (shouldSendEmail) {
        // Get user email
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true },
        });

        if (user?.email) {
          // Send email asynchronously (don't await to avoid blocking)
          emailService
            .sendTemplatedEmail(user.email, type, {
              userName: user.email.split('@')[0], // Fallback to email prefix
              platformUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
              ...metadata,
            })
            .catch((error) => {
              console.error('[NOTIFICATION] Failed to send email:', error);
              // Don't throw - email failure shouldn't fail notification creation
            });
        }
      }

      return this.toNotificationResponse(notification);
    } catch (error) {
      console.error('[NOTIFICATION] Failed to create notification:', error);
      throw new NotificationError(
        'Failed to create notification',
        'CREATE_FAILED',
        500
      );
    }
  }

  /**
   * Get user's notifications with pagination
   */
  async getUserNotifications(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      unreadOnly?: boolean;
    } = {}
  ): Promise<NotificationListResponse> {
    const { limit = 20, offset = 0, unreadOnly = false } = options;

    try {
      const where = {
        userId,
        ...(unreadOnly && { read: false }),
      };

      const [notifications, total, unreadCount] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        prisma.notification.count({ where }),
        prisma.notification.count({
          where: { userId, read: false },
        }),
      ]);

      return {
        notifications: notifications.map(this.toNotificationResponse),
        unreadCount,
        total,
        hasMore: offset + notifications.length < total,
      };
    } catch (error) {
      console.error('[NOTIFICATION] Failed to get notifications:', error);
      throw new NotificationError(
        'Failed to get notifications',
        'FETCH_FAILED',
        500
      );
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<NotificationResponse> {
    try {
      // Verify ownership
      const existing = await prisma.notification.findUnique({
        where: { id: notificationId },
      });

      if (!existing) {
        throw new NotificationError(
          'Notification not found',
          'NOT_FOUND',
          404
        );
      }

      if (existing.userId !== userId) {
        throw new NotificationError(
          'Unauthorized to mark this notification as read',
          'UNAUTHORIZED',
          403
        );
      }

      const notification = await prisma.notification.update({
        where: { id: notificationId },
        data: {
          read: true,
          readAt: new Date(),
        },
      });

      return this.toNotificationResponse(notification);
    } catch (error) {
      if (error instanceof NotificationError) throw error;

      console.error('[NOTIFICATION] Failed to mark as read:', error);
      throw new NotificationError(
        'Failed to mark notification as read',
        'UPDATE_FAILED',
        500
      );
    }
  }

  /**
   * Mark all user notifications as read
   */
  async markAllAsRead(userId: string): Promise<{ count: number }> {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          userId,
          read: false,
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });

      return { count: result.count };
    } catch (error) {
      console.error('[NOTIFICATION] Failed to mark all as read:', error);
      throw new NotificationError(
        'Failed to mark all notifications as read',
        'UPDATE_FAILED',
        500
      );
    }
  }

  /**
   * Get user's notification preferences
   */
  async getPreferences(userId: string): Promise<NotificationPreferencesResponse> {
    try {
      let preferences = await prisma.notificationPreferences.findUnique({
        where: { userId },
      });

      // Create default preferences if they don't exist
      if (!preferences) {
        preferences = await prisma.notificationPreferences.create({
          data: { userId },
        });
      }

      return preferences;
    } catch (error) {
      console.error('[NOTIFICATION] Failed to get preferences:', error);
      throw new NotificationError(
        'Failed to get notification preferences',
        'FETCH_FAILED',
        500
      );
    }
  }

  /**
   * Update user's notification preferences
   */
  async updatePreferences(
    userId: string,
    updates: UpdateNotificationPreferencesParams
  ): Promise<NotificationPreferencesResponse> {
    try {
      // Ensure preferences exist
      await this.getPreferences(userId);

      const preferences = await prisma.notificationPreferences.update({
        where: { userId },
        data: updates,
      });

      return preferences;
    } catch (error) {
      if (error instanceof NotificationError) throw error;

      console.error('[NOTIFICATION] Failed to update preferences:', error);
      throw new NotificationError(
        'Failed to update notification preferences',
        'UPDATE_FAILED',
        500
      );
    }
  }

  /**
   * Delete old notifications (cleanup job)
   */
  async deleteOldNotifications(daysOld: number = 90): Promise<{ count: number }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await prisma.notification.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
          read: true, // Only delete read notifications
        },
      });

      console.log(`[NOTIFICATION] Deleted ${result.count} notifications older than ${daysOld} days`);
      return { count: result.count };
    } catch (error) {
      console.error('[NOTIFICATION] Failed to delete old notifications:', error);
      throw new NotificationError(
        'Failed to delete old notifications',
        'DELETE_FAILED',
        500
      );
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Check if user wants email for this notification type
   */
  private async shouldSendEmail(userId: string, type: NotificationType): Promise<boolean> {
    try {
      const preferences = await this.getPreferences(userId);
      const preferenceKey = EMAIL_PREFERENCE_MAP[type];

      // If digest mode is enabled, don't send immediate emails
      // (This would be handled by a daily digest cron job)
      if (preferences.emailDigest) {
        return false;
      }

      // @ts-ignore - TypeScript doesn't know preferenceKey is a valid key
      return preferences[preferenceKey] === true;
    } catch (error) {
      console.error('[NOTIFICATION] Failed to check email preference:', error);
      // Default to sending email if preferences check fails
      return true;
    }
  }

  /**
   * Convert database notification to response format
   */
  private toNotificationResponse(notification: any): NotificationResponse {
    return {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      link: notification.link,
      metadata: notification.metadata,
      read: notification.read,
      readAt: notification.readAt,
      createdAt: notification.createdAt,
    };
  }
}

// Singleton instance
export const notificationService = new NotificationService();

// ============================================================================
// CONVENIENCE FUNCTIONS FOR COMMON NOTIFICATIONS
// ============================================================================

/**
 * Send booking request notification to vendor
 */
export async function notifyBookingRequest(params: {
  vendorId: string;
  customerId: string;
  bookingId: string;
  customerName: string;
  eventDate: string;
  eventTime: string;
  eventType: string;
  location: string;
  guestCount: number;
  totalAmount: string;
}): Promise<void> {
  await notificationService.createNotification({
    userId: params.vendorId,
    type: 'BOOKING_REQUEST',
    title: 'New Booking Request',
    message: `${params.customerName} requested a booking for ${params.eventDate}`,
    link: `/vendor/bookings/${params.bookingId}`,
    metadata: params,
  });
}

/**
 * Send booking accepted notification to customer
 */
export async function notifyBookingAccepted(params: {
  customerId: string;
  bookingId: string;
  vendorName: string;
  eventDate: string;
  eventTime: string;
  guestCount: number;
  totalAmount: string;
}): Promise<void> {
  await notificationService.createNotification({
    userId: params.customerId,
    type: 'BOOKING_ACCEPTED',
    title: 'Booking Accepted',
    message: `${params.vendorName} accepted your booking for ${params.eventDate}`,
    link: `/bookings/${params.bookingId}`,
    metadata: params,
  });
}

/**
 * Send booking declined notification to customer
 */
export async function notifyBookingDeclined(params: {
  customerId: string;
  bookingId: string;
  vendorName: string;
  eventDate: string;
}): Promise<void> {
  await notificationService.createNotification({
    userId: params.customerId,
    type: 'BOOKING_DECLINED',
    title: 'Booking Request Declined',
    message: `${params.vendorName} declined your booking for ${params.eventDate}`,
    link: `/bookings/${params.bookingId}`,
    metadata: params,
  });
}

/**
 * Send payment confirmed notification
 */
export async function notifyPaymentConfirmed(params: {
  userId: string;
  bookingId: string;
  eventDate: string;
  eventTime: string;
  vendorName: string;
  totalAmount: string;
}): Promise<void> {
  await notificationService.createNotification({
    userId: params.userId,
    type: 'PAYMENT_CONFIRMED',
    title: 'Payment Confirmed',
    message: `Your payment of $${params.totalAmount} has been processed`,
    link: `/bookings/${params.bookingId}`,
    metadata: params,
  });
}

/**
 * Send new message notification
 */
export async function notifyNewMessage(params: {
  recipientId: string;
  bookingId: string;
  senderName: string;
  messagePreview: string;
  eventDate: string;
}): Promise<void> {
  await notificationService.createNotification({
    userId: params.recipientId,
    type: 'NEW_MESSAGE',
    title: 'New Message',
    message: `${params.senderName}: ${params.messagePreview.substring(0, 50)}${params.messagePreview.length > 50 ? '...' : ''}`,
    link: `/messages/${params.bookingId}`,
    metadata: params,
  });
}

/**
 * Send event reminder (24 hours before)
 */
export async function notifyEventReminder(params: {
  userId: string;
  bookingId: string;
  vendorName: string;
  eventDate: string;
  eventTime: string;
  location: string;
  guestCount: number;
}): Promise<void> {
  await notificationService.createNotification({
    userId: params.userId,
    type: 'EVENT_REMINDER',
    title: 'Event Tomorrow',
    message: `Your event with ${params.vendorName} is tomorrow at ${params.eventTime}`,
    link: `/bookings/${params.bookingId}`,
    metadata: params,
  });
}

/**
 * Send review prompt (7 days after event)
 */
export async function notifyReviewPrompt(params: {
  userId: string;
  bookingId: string;
  vendorName: string;
}): Promise<void> {
  await notificationService.createNotification({
    userId: params.userId,
    type: 'REVIEW_PROMPT',
    title: 'Leave a Review',
    message: `How was your experience with ${params.vendorName}?`,
    link: `/bookings/${params.bookingId}/review`,
    metadata: {
      ...params,
      reviewLink: `${process.env.NEXT_PUBLIC_APP_URL}/bookings/${params.bookingId}/review`,
    },
  });
}
