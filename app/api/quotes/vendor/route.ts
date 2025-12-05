/**
 * Vendor Quote Requests API
 * GET /api/quotes/vendor - List vendor's received quote requests
 *
 * Requires authentication (VENDOR role)
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
  getVendorQuoteRequests,
  QuoteError,
} from "@/modules/quote/quote.service";
import { UserRole } from "@prisma/client";

/**
 * Handle GET request - List vendor's received RFQs
 */
async function handleGET(req: AuthenticatedRequest) {
  try {
    const userId = getUserId(req);
    const user = getUser(req);

    // Verify user is a vendor
    if (user.role !== UserRole.VENDOR) {
      return ApiResponses.forbidden("Only vendors can view quote requests");
    }

    // Get vendor's quote requests
    const quotes = await getVendorQuoteRequests(userId);

    return ApiResponses.ok({
      quotes,
      total: quotes.length,
    });
  } catch (error) {
    console.error("[Vendor Quote Requests] Error:", error);

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
    return ApiResponses.internalError("Failed to list vendor quote requests");
  }
}

// Export with authentication middleware
export const GET = requireAuth(handleGET);
