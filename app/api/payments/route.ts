/**
 * Payments API - Create Payment Intent
 * POST /api/payments - Create payment intent for booking
 *
 * Requires authentication (customer only)
 */

import { NextResponse } from "next/server";
import {
  requireAuth,
  getUserId,
  getUser,
  type AuthenticatedRequest,
} from "@/lib/middleware/auth.middleware";
import { ApiResponses } from "@/lib/api-response";
import { createPaymentIntentSchema } from "@/modules/payment/payment.validation";
import {
  createPaymentIntent,
  PaymentError,
} from "@/modules/payment/payment.service";
import { UserRole } from "@prisma/client";

/**
 * Handle POST request - Create payment intent
 */
async function handlePOST(req: AuthenticatedRequest) {
  try {
    const userId = getUserId(req);
    const user = getUser(req);

    // Only customers can create payments
    if (user.role !== UserRole.CUSTOMER) {
      return ApiResponses.forbidden("Only customers can create payments");
    }

    const body = await req.json();
    const validatedData = createPaymentIntentSchema.parse(body);

    const paymentIntent = await createPaymentIntent(validatedData);

    return ApiResponses.created(paymentIntent, "Payment intent created successfully");
  } catch (error) {
    console.error("[Payment Intent] Error:", error);

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

    return ApiResponses.internalError("Failed to create payment intent");
  }
}

// Export with authentication middleware
export const POST = requireAuth(handlePOST);
