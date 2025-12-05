/**
 * Payment Details API
 * GET /api/payments/[id] - Get payment details
 *
 * Requires authentication
 */

import { NextResponse } from "next/server";
import {
  requireAuth,
  getUserId,
  type AuthenticatedRequest,
} from "@/lib/middleware/auth.middleware";
import { ApiResponses } from "@/lib/api-response";
import { paymentIdSchema } from "@/modules/payment/payment.validation";
import {
  getPaymentDetails,
  PaymentError,
} from "@/modules/payment/payment.service";

/**
 * Handle GET request - Get payment details
 */
async function handleGET(
  req: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserId(req);
    const { id } = paymentIdSchema.parse(params);

    const payment = await getPaymentDetails(id);

    return ApiResponses.ok(payment);
  } catch (error) {
    console.error("[Payment Details] Error:", error);

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

    return ApiResponses.internalError("Failed to retrieve payment details");
  }
}

// Export with authentication middleware
export const GET = requireAuth(handleGET);
