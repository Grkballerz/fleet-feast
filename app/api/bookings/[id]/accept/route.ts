/**
 * Vendor Accept Booking API
 * PUT /api/bookings/:id/accept - Vendor accepts booking
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
import {
  acceptBooking,
  BookingError,
} from "@/modules/booking/booking.service";

/**
 * Handle PUT request - Vendor accepts booking
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

    // Accept booking
    const booking = await acceptBooking(id, vendorId);

    return ApiResponses.ok({
      booking,
      message: "Booking accepted successfully. Customer will be notified to complete payment.",
    });
  } catch (error) {
    console.error("[Booking Accept] Error:", error);

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
    return ApiResponses.internalError("Failed to accept booking");
  }
}

// Export with vendor authentication middleware
export const PUT = requireVendor(handlePUT);
