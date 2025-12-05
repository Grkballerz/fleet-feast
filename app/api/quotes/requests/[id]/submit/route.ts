/**
 * Quote Submission API
 * POST /api/quotes/requests/:id/submit - Vendor submits quote for a request
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
  submitQuoteSchema,
  requestIdParamSchema,
} from "@/modules/quote/quote.validation";
import {
  submitQuote,
  QuoteError,
} from "@/modules/quote/quote.service";
import { UserRole } from "@prisma/client";

/**
 * Handle POST request - Submit quote for RFQ
 */
async function handlePOST(
  req: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserId(req);
    const user = getUser(req);

    // Verify user is a vendor
    if (user.role !== UserRole.VENDOR) {
      return ApiResponses.forbidden("Only vendors can submit quotes");
    }

    // Validate id parameter (this is the request ID)
    const paramValidation = requestIdParamSchema.safeParse({ requestId: params.id });
    if (!paramValidation.success) {
      return ApiResponses.validationError(
        paramValidation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const { requestId } = paramValidation.data;

    // Parse and validate request body
    const body = await req.json();
    const validationResult = submitQuoteSchema.safeParse(body);

    if (!validationResult.success) {
      return ApiResponses.validationError(
        validationResult.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const data = validationResult.data;

    // Submit quote
    const quote = await submitQuote(requestId, userId, data);

    return ApiResponses.created({
      quote,
      message: "Quote submitted successfully. Customer has been notified.",
    });
  } catch (error) {
    console.error("[Quote Submit] Error:", error);

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
    return ApiResponses.internalError("Failed to submit quote");
  }
}

// Export with authentication middleware
export const POST = requireAuth(handlePOST);
