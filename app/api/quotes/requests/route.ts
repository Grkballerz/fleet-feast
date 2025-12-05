/**
 * Quote Requests List API
 * GET /api/quotes/requests - List customer's quote requests
 *
 * Requires authentication (CUSTOMER role)
 */

import { NextResponse } from "next/server";
import {
  requireAuth,
  getUserId,
  getUser,
  type AuthenticatedRequest,
} from "@/lib/middleware/auth.middleware";
import { ApiResponses } from "@/lib/api-response";
import {
  getCustomerQuoteRequests,
  QuoteError,
} from "@/modules/quote/quote.service";
import { UserRole } from "@prisma/client";

/**
 * Handle GET request - List customer's quote requests
 */
async function handleGET(req: AuthenticatedRequest) {
  try {
    const userId = getUserId(req);
    const user = getUser(req);

    // Verify user is a customer
    if (user.role !== UserRole.CUSTOMER) {
      return ApiResponses.forbidden("Only customers can view quote requests");
    }

    // Get customer's quote requests
    const requests = await getCustomerQuoteRequests(userId);

    return ApiResponses.ok({
      requests,
      total: requests.length,
    });
  } catch (error) {
    console.error("[Quote Requests List] Error:", error);

    // Handle custom quote errors
    if (error instanceof QuoteError) {
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
    return ApiResponses.internalError("Failed to list quote requests");
  }
}

// Export with authentication middleware
export const GET = requireAuth(handleGET);
