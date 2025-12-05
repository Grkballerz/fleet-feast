/**
 * Quote Acceptance API
 * PUT /api/quotes/:id/accept - Accept quote and create booking
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
  acceptQuoteSchema,
  quoteIdSchema,
} from "@/modules/quote/quote.validation";
import {
  acceptQuote,
  QuoteError,
} from "@/modules/quote/quote.service";
import { UserRole } from "@prisma/client";

/**
 * Handle PUT request - Accept quote and create booking
 */
async function handlePUT(
  req: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserId(req);
    const user = getUser(req);

    // Verify user is a customer
    if (user.role !== UserRole.CUSTOMER) {
      return ApiResponses.forbidden("Only customers can accept quotes");
    }

    // Validate ID parameter
    const paramValidation = quoteIdSchema.safeParse({ id: params.id });
    if (!paramValidation.success) {
      return ApiResponses.validationError(
        paramValidation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const { id } = paramValidation.data;

    // Parse and validate request body
    const body = await req.json();
    const validationResult = acceptQuoteSchema.safeParse(body);

    if (!validationResult.success) {
      return ApiResponses.validationError(
        validationResult.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const data = validationResult.data;

    // Accept quote
    const result = await acceptQuote(id, userId, data);

    return ApiResponses.ok({
      booking: result.booking,
      quote: result.quote,
      message: "Quote accepted successfully. Booking created and vendor has been notified.",
    });
  } catch (error) {
    console.error("[Quote Accept] Error:", error);

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
    return ApiResponses.internalError("Failed to accept quote");
  }
}

// Export with authentication middleware
export const PUT = requireAuth(handlePUT);
