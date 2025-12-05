/**
 * Messages API - Get Conversation
 * GET /api/messages/[bookingId] - Get conversation for a specific booking
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
import { conversationQuerySchema } from "@/modules/messaging/messaging.validation";
import {
  getConversation,
  MessagingError,
} from "@/modules/messaging/messaging.service";

/**
 * Handle GET request - Get conversation for booking
 */
async function handleGET(
  req: AuthenticatedRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const userId = getUserId(req);
    const { bookingId } = params;

    // Parse and validate query parameters
    const { searchParams } = new URL(req.url);
    const queryParams = {
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "50",
    };

    const validationResult = conversationQuerySchema.safeParse(queryParams);

    if (!validationResult.success) {
      return ApiResponses.validationError(
        validationResult.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const { page, limit } = validationResult.data;

    // Get conversation
    const conversation = await getConversation(bookingId, userId, page, limit);

    return ApiResponses.ok(conversation);
  } catch (error) {
    console.error("[Messages Conversation] Error:", error);

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
    return ApiResponses.internalError("Failed to fetch conversation");
  }
}

// Export with authentication middleware
export const GET = requireAuth(handleGET);
