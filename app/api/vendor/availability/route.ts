/**
 * Vendor Availability Calendar API
 * GET /api/vendor/availability?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD - Get own availability
 * POST /api/vendor/availability - Set availability for dates
 *
 * Requires VENDOR role
 */

import { NextResponse } from "next/server";
import { requireVendor, getUserId, type AuthenticatedRequest } from "@/lib/middleware/auth.middleware";
import { ApiResponses } from "@/lib/api-response";
import { availabilityUpdateSchema } from "@/modules/trucks/trucks.validation";
import { getVendorAvailability, updateVendorAvailability, TruckError } from "@/modules/trucks/trucks.service";

/**
 * Handle GET request to fetch vendor's own availability
 */
async function handleGET(req: AuthenticatedRequest) {
  try {
    // Get authenticated user ID
    const userId = getUserId(req);

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    // Validate date format if provided
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (startDateParam) {
      if (!dateRegex.test(startDateParam)) {
        return ApiResponses.badRequest("Invalid startDate format. Use YYYY-MM-DD");
      }
      startDate = new Date(startDateParam);
      if (isNaN(startDate.getTime())) {
        return ApiResponses.badRequest("Invalid startDate");
      }
    }

    if (endDateParam) {
      if (!dateRegex.test(endDateParam)) {
        return ApiResponses.badRequest("Invalid endDate format. Use YYYY-MM-DD");
      }
      endDate = new Date(endDateParam);
      if (isNaN(endDate.getTime())) {
        return ApiResponses.badRequest("Invalid endDate");
      }
    }

    // Validate date range
    if (startDate && endDate && startDate > endDate) {
      return ApiResponses.badRequest("startDate must be before or equal to endDate");
    }

    // Get vendor availability
    const availability = await getVendorAvailability(userId, startDate, endDate);

    return ApiResponses.ok({
      availability,
      count: availability.length,
    });
  } catch (error) {
    console.error("[Vendor Availability] Get Error:", error);

    // Handle custom truck errors
    if (error instanceof TruckError) {
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
    return ApiResponses.internalError("Failed to fetch availability");
  }
}

/**
 * Handle POST request to update vendor's availability
 */
async function handlePOST(req: AuthenticatedRequest) {
  try {
    // Get authenticated user ID
    const userId = getUserId(req);

    // Parse and validate request body
    const body = await req.json();
    const validationResult = availabilityUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return ApiResponses.validationError(
        validationResult.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const data = validationResult.data;

    // Validate all dates
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    for (const entry of data.dates) {
      if (!dateRegex.test(entry.date)) {
        return ApiResponses.badRequest(`Invalid date format: ${entry.date}. Use YYYY-MM-DD`);
      }

      const dateObj = new Date(entry.date);
      if (isNaN(dateObj.getTime())) {
        return ApiResponses.badRequest(`Invalid date: ${entry.date}`);
      }
    }

    // Update availability
    const result = await updateVendorAvailability(userId, data);

    return ApiResponses.ok({
      ...result,
      message: `Successfully updated availability for ${result.updated} date(s)`,
    });
  } catch (error) {
    console.error("[Vendor Availability] Update Error:", error);

    // Handle custom truck errors
    if (error instanceof TruckError) {
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
    return ApiResponses.internalError("Failed to update availability");
  }
}

// Export with authentication middleware (requires VENDOR role)
export const GET = requireVendor(handleGET);
export const POST = requireVendor(handlePOST);
