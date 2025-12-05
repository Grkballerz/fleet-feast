/**
 * Quote Request Creation API
 * POST /api/quotes/request - Create new RFQ
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
import { createQuoteRequestSchema } from "@/modules/quote/quote.validation";
import {
  createQuoteRequest,
  QuoteError,
} from "@/modules/quote/quote.service";
import { UserRole } from "@prisma/client";

/**
 * Handle POST request - Create quote request (RFQ)
 */
async function handlePOST(req: AuthenticatedRequest) {
  try {
    const userId = getUserId(req);
    const user = getUser(req);

    // Verify user is a customer
    if (user.role !== UserRole.CUSTOMER) {
      return ApiResponses.forbidden("Only customers can create quote requests");
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = createQuoteRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return ApiResponses.validationError(
        validationResult.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const data = validationResult.data;

    // Create quote request
    const quoteRequest = await createQuoteRequest(userId, data);

    return ApiResponses.created({
      quoteRequest,
      message: `Quote request created successfully. ${data.vendorIds.length} vendor(s) notified.`,
    });
  } catch (error) {
    console.error("[Quote Request Create] Error:", error);

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
    return ApiResponses.internalError("Failed to create quote request");
  }
}

// Export with authentication middleware
export const POST = requireAuth(handlePOST);
