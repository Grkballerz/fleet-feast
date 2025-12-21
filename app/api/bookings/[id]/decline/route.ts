/**
 * Decline Booking API
 * POST /api/bookings/:id/decline - Vendor/Customer declines booking
 *
 * Scenarios:
 * - Vendor declines INQUIRY → DECLINED
 * - Customer declines PROPOSAL_SENT → DECLINED
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
import { vendorDeclineSchema } from "@/modules/booking/booking.validation";
import {
  declineBookingInquiryOrProposal,
  BookingError,
} from "@/modules/booking/booking.service";

/**
 * Handle POST request - Decline booking (inquiry or proposal)
 */
async function handlePOST(
  req: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserId(req);
    const { id } = params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return ApiResponses.badRequest("Invalid booking ID format");
    }

    // Parse and validate optional decline reason
    let reason: string | undefined;
    try {
      const body = await req.json();
      const validationResult = vendorDeclineSchema.safeParse(body);
      if (validationResult.success) {
        reason = validationResult.data.reason;
      }
    } catch {
      // Reason is optional
    }

    // Decline booking
    const result = await declineBookingInquiryOrProposal(id, userId, { reason });

    return ApiResponses.ok({
      success: true,
      data: result.booking,
      message: result.message,
    });
  } catch (error) {
    console.error("[Booking Decline] Error:", error);

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
    return ApiResponses.internalError("Failed to decline booking");
  }
}

// Export with authentication middleware (both vendor and customer can decline)
export const POST = requireAuth(handlePOST);
