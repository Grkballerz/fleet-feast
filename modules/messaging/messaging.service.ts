/**
 * Messaging Service Layer
 * Handles business logic for booking-scoped messaging with anti-circumvention
 */

import { prisma } from "@/lib/prisma";
import { BookingStatus, MessageSeverity, ViolationType } from "@prisma/client";
import type {
  MessageSendData,
  MessageDetails,
  Conversation,
  InboxItem,
} from "./messaging.types";
import {
  scanForCircumvention,
  getHighestSeverity,
  generateFlagReason,
  getSanitizedMatches,
} from "./anti-circumvention";

/**
 * Custom error class for messaging operations
 */
export class MessagingError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "MessagingError";
  }
}

/**
 * Allowed booking statuses for messaging
 */
const MESSAGING_ALLOWED_STATUSES = [
  BookingStatus.PENDING,
  BookingStatus.ACCEPTED,
  BookingStatus.CONFIRMED,
  BookingStatus.COMPLETED,
];

/**
 * Send a message in a booking conversation
 *
 * @param senderId - ID of user sending the message
 * @param data - Message send data
 * @returns Created message with flagging details
 */
export async function sendMessage(
  senderId: string,
  data: MessageSendData
): Promise<MessageDetails> {
  // Fetch booking with related data
  const booking = await prisma.booking.findUnique({
    where: { id: data.bookingId },
    select: {
      id: true,
      customerId: true,
      vendorId: true,
      status: true,
      customer: {
        select: { id: true, email: true },
      },
      vendor: {
        select: { id: true, email: true },
      },
    },
  });

  if (!booking) {
    throw new MessagingError("Booking not found", "BOOKING_NOT_FOUND", 404);
  }

  // Verify sender is part of the booking
  if (booking.customerId !== senderId && booking.vendorId !== senderId) {
    throw new MessagingError(
      "You are not authorized to message in this booking",
      "UNAUTHORIZED",
      403
    );
  }

  // Check if messaging is allowed for this booking status
  if (!MESSAGING_ALLOWED_STATUSES.includes(booking.status)) {
    throw new MessagingError(
      `Messaging is not allowed for bookings with status ${booking.status}`,
      "MESSAGING_NOT_ALLOWED",
      400
    );
  }

  // Scan content for circumvention attempts
  const circumventionResults = scanForCircumvention(data.content);
  const isFlagged = circumventionResults.length > 0;
  const severity = getHighestSeverity(circumventionResults);
  const flagReason = isFlagged ? generateFlagReason(circumventionResults) : null;

  // Create message (still deliver even if flagged)
  const message = await prisma.message.create({
    data: {
      bookingId: data.bookingId,
      senderId,
      content: data.content,
      flagged: isFlagged,
      flagReason,
      flagSeverity: severity,
    },
    include: {
      sender: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });

  // If flagged, create violation records and log suspicious activity
  if (isFlagged) {
    await handleFlaggedMessage(senderId, message.id, circumventionResults);
  }

  return {
    id: message.id,
    bookingId: message.bookingId,
    senderId: message.senderId,
    content: message.content,
    flagged: message.flagged,
    flagReason: message.flagReason,
    flagSeverity: message.flagSeverity,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
    sender: {
      id: message.sender.id,
      email: message.sender.email,
    },
  };
}

/**
 * Handle flagged message - create violations and log activity
 */
async function handleFlaggedMessage(
  userId: string,
  messageId: string,
  circumventionResults: ReturnType<typeof scanForCircumvention>
): Promise<void> {
  // Get highest severity and flag reason
  const severity = getHighestSeverity(circumventionResults);
  const flagReason = generateFlagReason(circumventionResults);

  // Use the violation service to process circumvention violation
  // This will handle penalty progression and account status updates
  try {
    const { processCircumventionViolation } = await import("@/modules/violation/violation.service");

    await processCircumventionViolation({
      userId,
      messageId,
      severity,
      flagReason,
    });
  } catch (error) {
    console.error(
      `[Messaging] Failed to process circumvention violation for user ${userId}, message ${messageId}:`,
      error
    );

    // Fallback: Create basic violation record if violation service fails
    const hasPhone = circumventionResults.some((r) => r.type === "PHONE");
    const hasEmail = circumventionResults.some((r) => r.type === "EMAIL");

    let violationType: ViolationType;
    if (hasPhone || hasEmail) {
      violationType = ViolationType.CONTACT_INFO_SHARING;
    } else {
      violationType = ViolationType.CIRCUMVENTION_ATTEMPT;
    }

    const detectedItems = circumventionResults
      .map((r) => getSanitizedMatches(r.matches).join(", "))
      .join("; ");

    const description = `Message flagged for ${flagReason}. Detected content: ${detectedItems}`;

    await prisma.violation.create({
      data: {
        userId,
        type: violationType,
        description,
        severity,
        relatedMessageId: messageId,
        automated: true,
        source: "MESSAGING_SYSTEM",
        sourceId: messageId,
      },
    });
  }
}

/**
 * Get conversation for a booking
 *
 * @param bookingId - Booking ID
 * @param userId - ID of user requesting the conversation
 * @param page - Page number (for pagination)
 * @param limit - Messages per page
 * @returns Conversation with messages and metadata
 */
export async function getConversation(
  bookingId: string,
  userId: string,
  page: number = 1,
  limit: number = 50
): Promise<Conversation> {
  // Fetch booking to verify access
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      customerId: true,
      vendorId: true,
      customer: {
        select: { id: true, email: true },
      },
      vendor: {
        select: { id: true, email: true },
      },
    },
  });

  if (!booking) {
    throw new MessagingError("Booking not found", "BOOKING_NOT_FOUND", 404);
  }

  // Verify user is part of the booking
  if (booking.customerId !== userId && booking.vendorId !== userId) {
    throw new MessagingError(
      "You are not authorized to view this conversation",
      "UNAUTHORIZED",
      403
    );
  }

  // Fetch messages with pagination
  const skip = (page - 1) * limit;
  const messages = await prisma.message.findMany({
    where: {
      bookingId,
      deletedAt: null,
    },
    include: {
      sender: {
        select: {
          id: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    skip,
    take: limit,
  });

  // Count unread messages for this user
  const receiverId = userId;
  const unreadCount = await prisma.message.count({
    where: {
      bookingId,
      senderId: { not: userId }, // Messages not from this user
      deletedAt: null,
      // Note: We'll need to add a read tracking mechanism
      // For now, we'll return 0
    },
  });

  return {
    bookingId,
    messages: messages.map((m) => ({
      id: m.id,
      bookingId: m.bookingId,
      senderId: m.senderId,
      content: m.content,
      flagged: m.flagged,
      flagReason: m.flagReason,
      flagSeverity: m.flagSeverity,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
      sender: {
        id: m.sender.id,
        email: m.sender.email,
      },
    })),
    unreadCount: 0, // TODO: Implement read tracking
    participants: {
      customer: {
        id: booking.customer.id,
        email: booking.customer.email,
      },
      vendor: {
        id: booking.vendor.id,
        email: booking.vendor.email,
      },
    },
  };
}

/**
 * Get user's inbox (all conversations)
 *
 * @param userId - ID of user requesting inbox
 * @param page - Page number
 * @param limit - Items per page
 * @param unreadOnly - Show only conversations with unread messages
 * @returns Inbox items with conversation summaries
 */
export async function getInbox(
  userId: string,
  page: number = 1,
  limit: number = 20,
  unreadOnly: boolean = false
): Promise<{ items: InboxItem[]; total: number }> {
  // Find all bookings where user is customer or vendor
  const bookings = await prisma.booking.findMany({
    where: {
      OR: [{ customerId: userId }, { vendorId: userId }],
    },
    select: {
      id: true,
      customerId: true,
      vendorId: true,
      eventDate: true,
      eventType: true,
      status: true,
      messages: {
        where: {
          deletedAt: null,
        },
        select: {
          id: true,
          content: true,
          senderId: true,
          createdAt: true,
          flagged: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 1, // Only get the latest message
      },
      vendor: {
        select: {
          id: true,
          email: true,
        },
      },
      customer: {
        select: {
          id: true,
          email: true,
        },
      },
      vendorProfile: {
        select: {
          businessName: true,
        },
      },
    },
  });

  // Filter out bookings with no messages
  const bookingsWithMessages = bookings.filter((b) => b.messages.length > 0);

  // Build inbox items
  const inboxItems: InboxItem[] = await Promise.all(
    bookingsWithMessages.map(async (booking) => {
      const lastMessage = booking.messages[0];

      // Count unread messages (messages not from this user)
      const unreadCount = await prisma.message.count({
        where: {
          bookingId: booking.id,
          senderId: { not: userId },
          deletedAt: null,
          // TODO: Add read tracking
        },
      });

      return {
        bookingId: booking.id,
        unreadCount: 0, // TODO: Implement read tracking
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              content: lastMessage.content,
              senderId: lastMessage.senderId,
              createdAt: lastMessage.createdAt,
              flagged: lastMessage.flagged,
            }
          : null,
        lastMessageAt: lastMessage?.createdAt || null,
        booking: {
          id: booking.id,
          eventDate: booking.eventDate.toISOString().split("T")[0],
          eventType: booking.eventType,
          status: booking.status,
          vendor: {
            businessName: booking.vendorProfile.businessName,
          },
          customer: {
            email: booking.customer.email,
          },
        },
      };
    })
  );

  // Sort by last message date (most recent first)
  inboxItems.sort((a, b) => {
    const aTime = a.lastMessageAt?.getTime() || 0;
    const bTime = b.lastMessageAt?.getTime() || 0;
    return bTime - aTime;
  });

  // Apply pagination
  const skip = (page - 1) * limit;
  const paginatedItems = inboxItems.slice(skip, skip + limit);

  return {
    items: paginatedItems,
    total: inboxItems.length,
  };
}

/**
 * Mark message(s) as read
 * Note: Since the schema doesn't have a readAt field on Message,
 * we'll need to track this differently. For now, this is a placeholder.
 *
 * @param messageIds - Array of message IDs to mark as read
 * @param userId - User marking messages as read
 */
export async function markMessagesAsRead(
  messageIds: string[],
  userId: string
): Promise<{ count: number }> {
  // TODO: Implement read tracking
  // This could be done with:
  // 1. A separate MessageRead table (many-to-many)
  // 2. Adding a readBy JSON field to Message
  // 3. Adding readAt to Message (but this only works for 1-1 conversations)

  // For now, just return success
  return { count: messageIds.length };
}

/**
 * Mark all messages in a booking as read
 *
 * @param bookingId - Booking ID
 * @param userId - User marking messages as read
 */
export async function markBookingMessagesAsRead(
  bookingId: string,
  userId: string
): Promise<{ count: number }> {
  // Verify user has access to booking
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new MessagingError("Booking not found", "BOOKING_NOT_FOUND", 404);
  }

  if (booking.customerId !== userId && booking.vendorId !== userId) {
    throw new MessagingError(
      "You are not authorized to access this booking",
      "UNAUTHORIZED",
      403
    );
  }

  // Find all messages in this booking not sent by this user
  const messages = await prisma.message.findMany({
    where: {
      bookingId,
      senderId: { not: userId },
      deletedAt: null,
    },
    select: {
      id: true,
    },
  });

  // TODO: Implement read tracking
  return { count: messages.length };
}
