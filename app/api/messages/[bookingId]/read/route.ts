/**
 * Messages API - Mark as Read
 * PUT /api/messages/[bookingId]/read - Mark all messages in booking as read
 *
 * Requires authentication
 */

import { NextResponse } from "next/server";
import {
  requireAuth,
  getUserId,
  type AuthenticatedRequest,
} from "@/lib/middleware/auth.middleware";
import { ApiResponses } from "@/lib/api-response";
import {
  markBookingMessagesAsRead,
  MessagingError,
} from "@/modules/messaging/messaging.service";

/**
 * Handle PUT request - Mark messages as read
 */
async function handlePUT(
  req: AuthenticatedRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const userId = getUserId(req);
    const { bookingId } = params;

    // Mark all messages in booking as read
    const result = await markBookingMessagesAsRead(bookingId, userId);

    return ApiResponses.ok({
      markedAsRead: result.count,
      message: `${result.count} message(s) marked as read`,
    });
  } catch (error) {
    console.error("[Messages Mark Read] Error:", error);

    // Handle custom messaging errors
    if (error instanceof MessagingError) {
      return NextResponse.json(
        {
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: error.statusCode }
      );
    }

    // Handle unexpected errors
    return ApiResponses.internalError("Failed to mark messages as read");
  }
}

// Export with authentication middleware
export const PUT = requireAuth(handlePUT);
