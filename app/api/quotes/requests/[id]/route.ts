/**
 * Quote Request Details API
 * GET /api/quotes/requests/:id - Get quote request with all submitted quotes
 *
 * Requires authentication (CUSTOMER role)
 */

import { NextResponse } from "next/server";
import {
  requireAuth,
  getUserId,
  type AuthenticatedRequest,
} from "@/lib/middleware/auth.middleware";
import { ApiResponses } from "@/lib/api-response";
import { quoteRequestIdSchema } from "@/modules/quote/quote.validation";
import {
  getQuoteRequestDetails,
  QuoteError,
} from "@/modules/quote/quote.service";

/**
 * Handle GET request - Get quote request details
 */
async function handleGET(
  req: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserId(req);

    // Validate ID parameter
    const paramValidation = quoteRequestIdSchema.safeParse({ id: params.id });
    if (!paramValidation.success) {
      return ApiResponses.validationError(
        paramValidation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const { id } = paramValidation.data;

    // Get quote request details
    const quoteRequest = await getQuoteRequestDetails(id, userId);

    return ApiResponses.ok({
      quoteRequest,
    });
  } catch (error) {
    console.error("[Quote Request Details] Error:", error);

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
    return ApiResponses.internalError("Failed to get quote request details");
  }
}

// Export with authentication middleware
export const GET = requireAuth(handleGET);
