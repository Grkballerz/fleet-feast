/**
 * Payment Refund API
 * POST /api/payments/[id]/refund - Process refund
 *
 * Requires authentication (customer or admin)
 */

import { NextResponse } from "next/server";
import {
  requireAuth,
  getUserId,
  type AuthenticatedRequest,
} from "@/lib/middleware/auth.middleware";
import { ApiResponses } from "@/lib/api-response";
import {
  paymentIdSchema,
  refundRequestSchema,
} from "@/modules/payment/payment.validation";
import {
  processRefund,
  PaymentError,
} from "@/modules/payment/payment.service";

/**
 * Handle POST request - Process refund
 */
async function handlePOST(
  req: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserId(req);
    const { id } = paymentIdSchema.parse(params);

    const body = await req.json();
    const validatedData = refundRequestSchema.parse(body);

    const payment = await processRefund(id, validatedData);

    return ApiResponses.ok(payment, "Refund processed successfully");
  } catch (error) {
    console.error("[Payment Refund] Error:", error);

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

    return ApiResponses.internalError("Failed to process refund");
  }
}

// Export with authentication middleware
export const POST = requireAuth(handlePOST);
