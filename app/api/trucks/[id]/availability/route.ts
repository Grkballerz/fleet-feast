/**
 * Public Truck Availability Check API
 * GET /api/trucks/:id/availability?date=YYYY-MM-DD - Check if truck is available on a date
 *
 * Public endpoint (no authentication required)
 */

import { NextRequest } from "next/server";
import { ApiResponses } from "@/lib/api-response";
import { checkTruckAvailability, TruckError } from "@/modules/trucks/trucks.service";

/**
 * Handle GET request to check truck availability
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(req.url);

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return ApiResponses.badRequest("Invalid truck ID format");
    }

    // Get and validate date parameter
    const date = searchParams.get("date");
    if (!date) {
      return ApiResponses.badRequest("Date parameter is required (format: YYYY-MM-DD)");
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return ApiResponses.badRequest("Invalid date format. Use YYYY-MM-DD");
    }

    // Validate date is valid
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return ApiResponses.badRequest("Invalid date");
    }

    // Check availability
    const availability = await checkTruckAvailability(id, date);

    return ApiResponses.ok({
      date,
      ...availability,
    });
  } catch (error) {
    console.error("[Truck Availability] Error:", error);

    // Handle custom truck errors
    if (error instanceof TruckError) {
      if (error.statusCode === 404) {
        return ApiResponses.notFound("Food truck");
      }
      return ApiResponses.badRequest(error.message);
    }

    // Handle unexpected errors
    return ApiResponses.internalError("Failed to check truck availability");
  }
}
