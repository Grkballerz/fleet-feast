/**
 * Admin - Reject Vendor Application API
 * POST /api/admin/vendors/[id]/reject
 *
 * Rejects a vendor application with reason
 * Requires ADMIN role
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, getUserId, type AuthenticatedRequest } from "@/lib/middleware/auth.middleware";
import { ApiResponses } from "@/lib/api-response";
import { vendorRejectionSchema } from "@/modules/vendor/vendor.validation";
import { rejectVendor, VendorError } from "@/modules/vendor/vendor.service";

/**
 * Handle POST request to reject vendor application
 */
async function handlePOST(
  req: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: vendorId } = params;
    const adminUserId = getUserId(req);

    if (!vendorId) {
      return ApiResponses.badRequest("Vendor ID is required");
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = vendorRejectionSchema.safeParse(body);

    if (!validationResult.success) {
      return ApiResponses.validationError(
        validationResult.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const { rejectionReason } = validationResult.data;

    // Reject vendor
    const result = await rejectVendor(vendorId, {
      rejectedBy: adminUserId,
      rejectionReason,
    });

    return ApiResponses.ok({
      vendorId: result.vendorId,
      status: result.status,
      message: "Vendor application rejected",
    });
  } catch (error) {
    console.error("[Admin Reject Vendor] Error:", error);

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
    return ApiResponses.internalError("Failed to reject vendor application");
  }
}

// Export with authentication middleware (requires ADMIN role)
export const POST = requireAdmin(handlePOST);
