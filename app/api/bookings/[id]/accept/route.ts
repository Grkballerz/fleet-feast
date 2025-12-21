/**
 * Customer Accept Proposal API
 * POST /api/bookings/:id/accept - Customer accepts vendor proposal
 *
 * Requires customer authentication
 */

import { NextResponse } from "next/server";
import {
  requireCustomer,
  getUserId,
  type AuthenticatedRequest,
} from "@/lib/middleware/auth.middleware";
import { ApiResponses } from "@/lib/api-response";
import {
  acceptProposal,
  BookingError,
} from "@/modules/booking/booking.service";
import { proposalAcceptSchema } from "@/modules/booking/booking.validation";

/**
 * Handle POST request - Customer accepts proposal
 */
async function handlePOST(
  req: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = getUserId(req);
    const { id } = params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return ApiResponses.badRequest("Invalid booking ID format");
    }

    // Parse and validate request body (optional acceptTerms field)
    let body: any = {};
    try {
      const text = await req.text();
      if (text) {
        body = JSON.parse(text);
      }
    } catch (e) {
      // Empty body is acceptable
    }

    // Validate request body if provided
    if (Object.keys(body).length > 0) {
      const validation = proposalAcceptSchema.safeParse(body);
      if (!validation.success) {
        return ApiResponses.validationError(validation.error);
      }
    }

    // Accept proposal
    const result = await acceptProposal(id, customerId);

    return ApiResponses.ok({
      success: true,
      data: {
        id: result.booking.id,
        status: result.booking.status,
        totalAmount: result.booking.totalAmount,
        paymentUrl: result.paymentUrl,
      },
    });
  } catch (error) {
    console.error("[Proposal Accept] Error:", error);

    // Handle custom booking errors
    if (error instanceof BookingError) {
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
    return ApiResponses.internalError("Failed to accept proposal");
  }
}

// Export with customer authentication middleware
export const POST = requireCustomer(handlePOST);
