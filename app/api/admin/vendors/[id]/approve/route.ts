/**
 * Admin - Approve Vendor Application API
 * POST /api/admin/vendors/[id]/approve
 *
 * Approves a vendor application
 * Requires ADMIN role
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, getUserId, type AuthenticatedRequest } from "@/lib/middleware/auth.middleware";
import { ApiResponses } from "@/lib/api-response";
import { approveVendor, VendorError } from "@/modules/vendor/vendor.service";

/**
 * Handle POST request to approve vendor application
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

    // Approve vendor
    const result = await approveVendor(vendorId, {
      approvedBy: adminUserId,
    });

    return ApiResponses.ok({
      vendorId: result.vendorId,
      status: result.status,
      message: "Vendor application approved successfully",
    });
  } catch (error) {
    console.error("[Admin Approve Vendor] Error:", error);

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
    return ApiResponses.internalError("Failed to approve vendor application");
  }
}

// Export with authentication middleware (requires ADMIN role)
export const POST = requireAdmin(handlePOST);
