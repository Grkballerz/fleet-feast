/**
 * Vendor Menu Management API
 * GET /api/vendor/menu - Get own menu
 * PUT /api/vendor/menu - Update own menu
 *
 * Requires VENDOR role
 */

import { NextResponse } from "next/server";
import { requireVendor, getUserId, type AuthenticatedRequest } from "@/lib/middleware/auth.middleware";
import { ApiResponses } from "@/lib/api-response";
import { menuUpdateSchema } from "@/modules/trucks/trucks.validation";
import { getVendorMenu, updateVendorMenu, TruckError } from "@/modules/trucks/trucks.service";

/**
 * Handle GET request to fetch vendor's own menu
 */
async function handleGET(req: AuthenticatedRequest) {
  try {
    // Get authenticated user ID
    const userId = getUserId(req);

    // Get vendor menu
    const menu = await getVendorMenu(userId);

    if (!menu) {
      return ApiResponses.ok({
        menu: null,
        message: "No menu configured yet",
      });
    }

    return ApiResponses.ok({
      menu,
    });
  } catch (error) {
    console.error("[Vendor Menu] Get Error:", error);

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
    return ApiResponses.internalError("Failed to fetch menu");
  }
}

/**
 * Handle PUT request to update vendor's own menu
 */
async function handlePUT(req: AuthenticatedRequest) {
  try {
    // Get authenticated user ID
    const userId = getUserId(req);

    // Parse and validate request body
    const body = await req.json();
    const validationResult = menuUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return ApiResponses.validationError(
        validationResult.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const data = validationResult.data;

    // Update menu
    const menu = await updateVendorMenu(userId, data);

    return ApiResponses.ok({
      menu,
      message: "Menu updated successfully",
    });
  } catch (error) {
    console.error("[Vendor Menu] Update Error:", error);

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
    return ApiResponses.internalError("Failed to update menu");
  }
}

// Export with authentication middleware (requires VENDOR role)
export const GET = requireVendor(handleGET);
export const PUT = requireVendor(handlePUT);
