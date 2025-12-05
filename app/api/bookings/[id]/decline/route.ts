/**
 * Vendor Decline Booking API
 * PUT /api/bookings/:id/decline - Vendor declines booking
 *
 * Requires vendor authentication
 */

import { NextResponse } from "next/server";
import {
  requireVendor,
  getUserId,
  type AuthenticatedRequest,
} from "@/lib/middleware/auth.middleware";
import { ApiResponses } from "@/lib/api-response";
import { vendorDeclineSchema } from "@/modules/booking/booking.validation";
import {
  declineBooking,
  BookingError,
} from "@/modules/booking/booking.service";

/**
 * Handle PUT request - Vendor declines booking
 */
async function handlePUT(
  req: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vendorId = getUserId(req);
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
    const booking = await declineBooking(id, vendorId, { reason });

    return ApiResponses.ok({
      booking,
      message: "Booking declined. Customer will be notified.",
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

// Export with vendor authentication middleware
export const PUT = requireVendor(handlePUT);
