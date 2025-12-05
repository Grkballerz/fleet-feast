/**
 * Booking Details API - Get, Update, Cancel
 * GET /api/bookings/:id - Get booking details
 * PUT /api/bookings/:id - Update booking (limited fields, PENDING only)
 * DELETE /api/bookings/:id - Cancel booking
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
import {
  bookingUpdateSchema,
  cancellationSchema,
} from "@/modules/booking/booking.validation";
import {
  getBookingDetails,
  updateBooking,
  cancelBooking,
  BookingError,
} from "@/modules/booking/booking.service";

/**
 * Handle GET request - Get booking details
 */
async function handleGET(
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

    const booking = await getBookingDetails(id, userId);

    return ApiResponses.ok({ booking });
  } catch (error) {
    console.error("[Booking Details] Error:", error);

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
    return ApiResponses.internalError("Failed to get booking details");
  }
}

/**
 * Handle PUT request - Update booking
 */
async function handlePUT(
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

    // Parse and validate request body
    const body = await req.json();
    const validationResult = bookingUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return ApiResponses.validationError(
        validationResult.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const data = validationResult.data;

    // Update booking
    const booking = await updateBooking(id, userId, data);

    return ApiResponses.ok({
      booking,
      message: "Booking updated successfully",
    });
  } catch (error) {
    console.error("[Booking Update] Error:", error);

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
    return ApiResponses.internalError("Failed to update booking");
  }
}

/**
 * Handle DELETE request - Cancel booking
 */
async function handleDELETE(
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

    // Parse optional cancellation reason
    let reason: string | undefined;
    try {
      const body = await req.json();
      const validationResult = cancellationSchema.safeParse(body);
      if (validationResult.success) {
        reason = validationResult.data.reason;
      }
    } catch {
      // Body is optional for DELETE
    }

    // Cancel booking
    const booking = await cancelBooking(id, userId, { reason });

    return ApiResponses.ok({
      booking,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    console.error("[Booking Cancel] Error:", error);

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
    return ApiResponses.internalError("Failed to cancel booking");
  }
}

// Export with authentication middleware
export const GET = requireAuth(handleGET);
export const PUT = requireAuth(handlePUT);
export const DELETE = requireAuth(handleDELETE);
