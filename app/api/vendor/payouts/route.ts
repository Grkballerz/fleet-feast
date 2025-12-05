/**
 * Vendor Payouts API
 * GET /api/vendor/payouts - List vendor payouts
 * POST /api/vendor/payouts - Request early payout (future enhancement)
 *
 * Requires authentication (vendor only)
 */

import { NextResponse } from "next/server";
import {
  requireAuth,
  getUserId,
  getUser,
  type AuthenticatedRequest,
} from "@/lib/middleware/auth.middleware";
import { ApiResponses } from "@/lib/api-response";
import {
  listVendorPayouts,
  PaymentError,
} from "@/modules/payment/payment.service";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Handle GET request - List vendor payouts
 */
async function handleGET(req: AuthenticatedRequest) {
  try {
    const userId = getUserId(req);
    const user = getUser(req);

    // Only vendors can view payouts
    if (user.role !== UserRole.VENDOR) {
      return ApiResponses.forbidden("Only vendors can view payouts");
    }

    const payouts = await listVendorPayouts(userId);

    return ApiResponses.ok({
      payouts,
      total: payouts.length,
    });
  } catch (error) {
    console.error("[Vendor Payouts List] Error:", error);

    if (error instanceof PaymentError) {
      if (error.statusCode === 404) {
        return ApiResponses.notFound(error.message);
      }
      if (error.statusCode === 403) {
        return ApiResponses.forbidden(error.message);
      }
      return ApiResponses.badRequest(error.message);
    }

    return ApiResponses.internalError("Failed to list payouts");
  }
}

/**
 * Handle POST request - Request early payout (placeholder)
 */
async function handlePOST(req: AuthenticatedRequest) {
  try {
    const userId = getUserId(req);
    const user = getUser(req);

    // Only vendors can request payouts
    if (user.role !== UserRole.VENDOR) {
      return ApiResponses.forbidden("Only vendors can request payouts");
    }

    // TODO: Implement early payout request logic
    // This would require admin approval and manual processing
    return ApiResponses.badRequest(
      "Early payout requests are not yet supported. Payouts are automatically released 7 days after event completion."
    );
  } catch (error) {
    console.error("[Vendor Payout Request] Error:", error);
    return ApiResponses.internalError("Failed to process payout request");
  }
}

// Export with authentication middleware
export const GET = requireAuth(handleGET);
export const POST = requireAuth(handlePOST);
