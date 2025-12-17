/**
 * Vendor Profile Management API
 * GET /api/vendor/profile - Get own profile
 * PUT /api/vendor/profile - Update own profile
 *
 * Requires VENDOR role
 */

import { NextResponse } from "next/server";
import { requireVendor, getUserId, type AuthenticatedRequest } from "@/lib/middleware/auth.middleware";
import { ApiResponses } from "@/lib/api-response";
import { vendorProfileUpdateSchema } from "@/modules/vendor/vendor.validation";
import { getVendorProfile, updateVendorProfile, VendorError } from "@/modules/vendor/vendor.service";

/**
 * Handle GET request to fetch vendor's own profile
 */
async function handleGET(req: AuthenticatedRequest) {
  try {
    // Get authenticated user ID
    const userId = getUserId(req);

    // Get vendor profile
    const profile = await getVendorProfile(userId);

    return ApiResponses.ok({
      profile: {
        id: profile.id,
        userId: profile.userId,
        businessName: profile.businessName,
        cuisineType: profile.cuisineType,
        description: profile.description,
        priceRange: profile.priceRange,
        capacityMin: profile.capacityMin,
        capacityMax: profile.capacityMax,
        serviceArea: profile.serviceArea,
        location: profile.location,
        serviceRadius: profile.serviceRadius,
        latitude: profile.latitude,
        longitude: profile.longitude,
        status: profile.status,
        stripeAccountId: profile.stripeAccountId,
        stripeConnected: profile.stripeConnected,
        approvedAt: profile.approvedAt,
        rejectionReason: profile.rejectionReason,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      },
    });
  } catch (error) {
    console.error("[Vendor Profile] Get Error:", error);

    // Handle custom vendor errors
    if (error instanceof VendorError) {
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
    return ApiResponses.internalError("Failed to fetch vendor profile");
  }
}

/**
 * Handle PUT request to update vendor's own profile
 */
async function handlePUT(req: AuthenticatedRequest) {
  try {
    // Get authenticated user ID
    const userId = getUserId(req);

    // Parse and validate request body
    const body = await req.json();
    const validationResult = vendorProfileUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return ApiResponses.validationError(
        validationResult.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const data = validationResult.data;

    // Update vendor profile
    const updatedProfile = await updateVendorProfile(userId, data);

    return ApiResponses.ok({
      profile: {
        id: updatedProfile.id,
        userId: updatedProfile.userId,
        businessName: updatedProfile.businessName,
        cuisineType: updatedProfile.cuisineType,
        description: updatedProfile.description,
        priceRange: updatedProfile.priceRange,
        capacityMin: updatedProfile.capacityMin,
        capacityMax: updatedProfile.capacityMax,
        serviceArea: updatedProfile.serviceArea,
        location: updatedProfile.location,
        serviceRadius: updatedProfile.serviceRadius,
        latitude: updatedProfile.latitude,
        longitude: updatedProfile.longitude,
        status: updatedProfile.status,
        updatedAt: updatedProfile.updatedAt,
      },
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("[Vendor Profile] Update Error:", error);

    // Handle custom vendor errors
    if (error instanceof VendorError) {
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
    return ApiResponses.internalError("Failed to update vendor profile");
  }
}

// Export with authentication middleware (requires VENDOR role)
export const GET = requireVendor(handleGET);
export const PUT = requireVendor(handlePUT);
