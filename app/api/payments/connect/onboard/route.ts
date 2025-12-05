/**
 * Stripe Connect Onboarding API
 * POST /api/payments/connect/onboard - Create onboarding link for vendor
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
import { connectedAccountSchema } from "@/modules/payment/payment.validation";
import {
  createConnectedAccount,
  PaymentError,
} from "@/modules/payment/payment.service";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Handle POST request - Create Stripe Connected Account
 */
async function handlePOST(req: AuthenticatedRequest) {
  try {
    const userId = getUserId(req);
    const user = getUser(req);

    // Only vendors can onboard
    if (user.role !== UserRole.VENDOR) {
      return ApiResponses.forbidden("Only vendors can set up payment accounts");
    }

    // Get vendor details
    const vendor = await prisma.vendor.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!vendor) {
      return ApiResponses.notFound("Vendor profile not found");
    }

    const body = await req.json();
    const validatedData = connectedAccountSchema.parse({
      vendorId: vendor.id,
      email: vendor.user.email,
      businessName: vendor.businessName,
      ...body,
    });

    const onboardingLink = await createConnectedAccount(validatedData);

    return ApiResponses.ok(
      onboardingLink,
      "Onboarding link created successfully"
    );
  } catch (error) {
    console.error("[Stripe Onboarding] Error:", error);

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

    return ApiResponses.internalError("Failed to create onboarding link");
  }
}

// Export with authentication middleware
export const POST = requireAuth(handlePOST);
