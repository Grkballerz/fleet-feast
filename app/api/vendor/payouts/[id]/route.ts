/**
 * Vendor Payout Details API
 * GET /api/vendor/payouts/[id] - Get single payout details
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
import { paymentIdSchema } from "@/modules/payment/payment.validation";
import {
  getPayoutDetails,
  PaymentError,
} from "@/modules/payment/payment.service";
import { UserRole } from "@prisma/client";

/**
 * Handle GET request - Get payout details
 */
async function handleGET(
  req: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserId(req);
    const user = getUser(req);

    // Only vendors can view payout details
    if (user.role !== UserRole.VENDOR) {
      return ApiResponses.forbidden("Only vendors can view payout details");
    }

    const { id } = paymentIdSchema.parse(params);

    const payout = await getPayoutDetails(id, userId);

    return ApiResponses.ok(payout);
  } catch (error) {
    console.error("[Vendor Payout Details] Error:", error);

    if (error instanceof PaymentError) {
      if (error.statusCode === 404) {
        return ApiResponses.notFound(error.message);
      }
      if (error.statusCode === 403) {
        return ApiResponses.forbidden(error.message);
      }
      return ApiResponses.badRequest(error.message);
    }

    if (error instanceof Error && error.name === "ZodError") {
      return ApiResponses.validationError(error);
    }

    return ApiResponses.internalError("Failed to retrieve payout details");
  }
}

// Export with authentication middleware
export const GET = requireAuth(handleGET);
