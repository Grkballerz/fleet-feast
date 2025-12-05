/**
 * Bookings API - List and Create
 * GET /api/bookings - List user's bookings
 * POST /api/bookings - Create new booking request
 *
 * Requires authentication
 */

import { NextResponse } from "next/server";
import {
  requireAuth,
  getUserId,
  getUser,
  type AuthenticatedRequest,
} from "@/lib/middleware/auth.middleware";
import { ApiResponses } from "@/lib/api-response";
import { bookingRequestSchema } from "@/modules/booking/booking.validation";
import {
  createBooking,
  listUserBookings,
  BookingError,
} from "@/modules/booking/booking.service";

/**
 * Handle GET request - List user's bookings
 */
async function handleGET(req: AuthenticatedRequest) {
  try {
    const userId = getUserId(req);
    const user = getUser(req);

    const bookings = await listUserBookings(userId, user.role);

    return ApiResponses.ok({
      bookings,
      total: bookings.length,
    });
  } catch (error) {
    console.error("[Bookings List] Error:", error);
    return ApiResponses.internalError("Failed to list bookings");
  }
}

/**
 * Handle POST request - Create new booking
 */
async function handlePOST(req: AuthenticatedRequest) {
  try {
    const userId = getUserId(req);

    // Parse and validate request body
    const body = await req.json();
    const validationResult = bookingRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return ApiResponses.validationError(
        validationResult.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const data = validationResult.data;

    // Create booking
    const booking = await createBooking(userId, data);

    return ApiResponses.created({
      booking,
      message: "Booking request submitted successfully. The vendor will respond within 48 hours.",
    });
  } catch (error) {
    console.error("[Bookings Create] Error:", error);

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
    return ApiResponses.internalError("Failed to create booking");
  }
}

// Export with authentication middleware
export const GET = requireAuth(handleGET);
export const POST = requireAuth(handlePOST);
