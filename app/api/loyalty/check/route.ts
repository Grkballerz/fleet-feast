/**
 * Loyalty Status Check API
 * GET /api/loyalty/check?vendorId={vendorId}
 *
 * Returns loyalty discount eligibility for customer-vendor pair
 *
 * Requires authentication (customer only)
 */

import { NextRequest, NextResponse } from "next/server";
import {
  requireAuth,
  getUserId,
  getUser,
  type AuthenticatedRequest,
} from "@/lib/middleware/auth.middleware";
import { ApiResponses } from "@/lib/api-response";
import { UserRole } from "@prisma/client";
import { getLoyaltyDiscountSummary } from "@/modules/loyalty/loyalty.service";

/**
 * Handle GET request - Check loyalty eligibility
 */
async function handleGET(req: AuthenticatedRequest) {
  try {
    const userId = getUserId(req);
    const user = getUser(req);

    // Only customers can check loyalty status
    if (user.role !== UserRole.CUSTOMER) {
      return ApiResponses.forbidden("Only customers can check loyalty status");
    }

    // Get vendorId from query params
    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get("vendorId");

    if (!vendorId) {
      return ApiResponses.badRequest("vendorId query parameter is required");
    }

    // Get loyalty status
    const loyaltySummary = await getLoyaltyDiscountSummary(userId, vendorId);

    return ApiResponses.ok({
      eligible: loyaltySummary.eligible,
      message: loyaltySummary.message,
      previousBookings: loyaltySummary.previousBookings,
      discountPercent: loyaltySummary.eligible ? 5 : 0,
    });
  } catch (error) {
    console.error("[Loyalty Check] Error:", error);
    return ApiResponses.internalError("Failed to check loyalty status");
  }
}

// Export with authentication middleware
export const GET = requireAuth(handleGET);
