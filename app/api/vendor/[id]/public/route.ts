/**
 * Public Vendor Profile API
 * GET /api/vendor/[id]/public
 *
 * Public endpoint - no authentication required
 * Returns vendor profile excluding sensitive data
 */

import { NextRequest } from "next/server";
import { ApiResponses } from "@/lib/api-response";
import { getPublicVendorProfile, VendorError } from "@/modules/vendor/vendor.service";

/**
 * Handle GET request to fetch public vendor profile
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: vendorId } = params;

    if (!vendorId) {
      return ApiResponses.badRequest("Vendor ID is required");
    }

    // Get public vendor profile
    const profile = await getPublicVendorProfile(vendorId);

    return ApiResponses.ok({
      profile: {
        id: profile.id,
        businessName: profile.businessName,
        cuisineType: profile.cuisineType,
        description: profile.description,
        priceRange: profile.priceRange,
        capacityMin: profile.capacityMin,
        capacityMax: profile.capacityMax,
        serviceArea: profile.serviceArea,
        status: profile.status,
        approvedAt: profile.approvedAt,
        createdAt: profile.createdAt,
      },
    });
  } catch (error) {
    console.error("[Public Vendor Profile] Error:", error);

    // Handle custom vendor errors
    if (error instanceof VendorError) {
      if (error.statusCode === 404) {
        return ApiResponses.notFound("Vendor");
      }

      return ApiResponses.badRequest(error.message);
    }

    // Handle unexpected errors
    return ApiResponses.internalError("Failed to fetch vendor profile");
  }
}
