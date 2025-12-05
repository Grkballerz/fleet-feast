/**
 * Messages API - Send and Inbox
 * POST /api/messages - Send a message
 * GET /api/messages - Get user's inbox
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
  messageSendSchema,
  inboxQuerySchema,
} from "@/modules/messaging/messaging.validation";
import {
  sendMessage,
  getInbox,
  MessagingError,
} from "@/modules/messaging/messaging.service";

/**
 * Handle POST request - Send a message
 */
async function handlePOST(req: AuthenticatedRequest) {
  try {
    const userId = getUserId(req);

    // Parse and validate request body
    const body = await req.json();
    const validationResult = messageSendSchema.safeParse(body);

    if (!validationResult.success) {
      return ApiResponses.validationError(
        validationResult.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const data = validationResult.data;

    // Send message
    const message = await sendMessage(userId, data);

    // Return different response based on flagging
    if (message.flagged) {
      return ApiResponses.created({
        message,
        warning:
          "Your message was delivered but flagged for review. Please keep all communication within the platform to maintain safety and trust.",
      });
    }

    return ApiResponses.created({
      message,
    });
  } catch (error) {
    console.error("[Messages Send] Error:", error);

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
    return ApiResponses.internalError("Failed to send message");
  }
}

/**
 * Handle GET request - Get user's inbox
 */
async function handleGET(req: AuthenticatedRequest) {
  try {
    const userId = getUserId(req);

    // Parse and validate query parameters
    const { searchParams } = new URL(req.url);
    const queryParams = {
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "20",
      unreadOnly: searchParams.get("unreadOnly") || undefined,
    };

    const validationResult = inboxQuerySchema.safeParse(queryParams);

    if (!validationResult.success) {
      return ApiResponses.validationError(
        validationResult.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const { page, limit, unreadOnly } = validationResult.data;

    // Get inbox
    const { items, total } = await getInbox(userId, page, limit, unreadOnly);

    return ApiResponses.paginated(items, page, limit, total);
  } catch (error) {
    console.error("[Messages Inbox] Error:", error);

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
    return ApiResponses.internalError("Failed to fetch inbox");
  }
}

// Export with authentication middleware
export const POST = requireAuth(handlePOST);
export const GET = requireAuth(handleGET);
