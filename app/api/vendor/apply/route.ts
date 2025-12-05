/**
 * Vendor Application Submission API
 * POST /api/vendor/apply
 *
 * Allows vendors to submit their application with business details
 * Requires VENDOR role
 */

import { NextResponse } from "next/server";
import { requireVendor, getUserId, type AuthenticatedRequest } from "@/lib/middleware/auth.middleware";
import { ApiResponses } from "@/lib/api-response";
import { vendorApplicationSchema } from "@/modules/vendor/vendor.validation";
import { submitVendorApplication, VendorError } from "@/modules/vendor/vendor.service";

/**
 * Handle POST request for vendor application submission
 */
async function handlePOST(req: AuthenticatedRequest) {
  try {
    // Get authenticated user ID
    const userId = getUserId(req);

    // Parse and validate request body
    const body = await req.json();
    const validationResult = vendorApplicationSchema.safeParse(body);

    if (!validationResult.success) {
      return ApiResponses.validationError(
        validationResult.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const data = validationResult.data;

    // Submit application
    const result = await submitVendorApplication(userId, data);

    return ApiResponses.created({
      vendorId: result.vendorId,
      status: result.status,
      message: "Application submitted successfully. An admin will review your application soon.",
    });
  } catch (error) {
    console.error("[Vendor Apply] Error:", error);

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
    return ApiResponses.internalError("Failed to submit vendor application");
  }
}

// Export with authentication middleware (requires VENDOR role)
export const POST = requireVendor(handlePOST);
