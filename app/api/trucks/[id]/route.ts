/**
 * Single Food Truck Profile API
 * GET /api/trucks/:id - Get truck details with menu, reviews, availability
 *
 * Public endpoint (no authentication required)
 */

import { NextRequest } from "next/server";
import { ApiResponses } from "@/lib/api-response";
import { getTruckProfile, TruckError } from "@/modules/trucks/trucks.service";

/**
 * Handle GET request to fetch single truck profile
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return ApiResponses.badRequest("Invalid truck ID format");
    }

    // Get truck profile
    const truck = await getTruckProfile(id);

    return ApiResponses.ok({
      truck,
    });
  } catch (error) {
    console.error("[Truck Profile] Error:", error);

    // Handle custom truck errors
    if (error instanceof TruckError) {
      if (error.statusCode === 404) {
        return ApiResponses.notFound("Food truck");
      }
      return ApiResponses.badRequest(error.message);
    }

    // Handle unexpected errors
    return ApiResponses.internalError("Failed to fetch food truck profile");
  }
}
