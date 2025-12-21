/**
 * Payments API - Create Payment with Helcim
 * POST /api/payments - Pre-authorize payment for booking
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
import { PaymentError } from "@/modules/payment/payment.service";
import { createHelcimClient, HelcimError } from "@/lib/helcim";
import { prisma } from "@/lib/prisma";
import { UserRole, PaymentStatus, BookingStatus, EscrowTransactionType, EscrowStatus } from "@prisma/client";

/**
 * Handle POST request - Pre-authorize payment via Helcim
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

    // Validate booking exists and customer owns it
    const booking = await prisma.booking.findUnique({
      where: { id: validatedData.bookingId },
      select: {
        id: true,
        customerId: true,
        status: true,
        totalAmount: true,
        eventType: true,
      },
    });

    if (!booking) {
      return ApiResponses.notFound("Booking not found");
    }

    if (booking.customerId !== userId) {
      return ApiResponses.forbidden("You don't own this booking");
    }

    if (booking.status !== BookingStatus.ACCEPTED) {
      return ApiResponses.badRequest("Booking must be in ACCEPTED status to process payment");
    }

    // Use booking amount if not provided
    const amount = validatedData.amount || Number(booking.totalAmount);
    const currency = validatedData.currency || "USD";

    // Pre-authorize payment via Helcim
    const helcim = createHelcimClient();
    const preauthResult = await helcim.preauthorize({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      cardToken: validatedData.cardToken,
      comments: `Booking ${booking.id} - ${booking.eventType}`,
      invoiceNumber: booking.id,
    });

    if (preauthResult.status !== "APPROVED") {
      return ApiResponses.badRequest("Payment was declined");
    }

    // Create Payment record
    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount,
        status: PaymentStatus.AUTHORIZED,
        externalPaymentId: preauthResult.transactionId.toString(),
        authorizedAt: new Date(),
      },
    });

    // Create EscrowTransaction record for HOLD
    await prisma.escrowTransaction.create({
      data: {
        bookingId: booking.id,
        type: EscrowTransactionType.HOLD,
        amount,
        status: EscrowStatus.COMPLETED,
        helcimTransactionId: preauthResult.transactionId.toString(),
        notes: `Pre-authorization approved. Approval code: ${preauthResult.approvalCode}`,
        completedAt: new Date(),
      },
    });

    // Update booking status to PAID
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: BookingStatus.PAID },
    });

    return ApiResponses.created({
      id: payment.id,
      bookingId: payment.bookingId,
      amount: Number(payment.amount),
      status: payment.status,
      authorizedAt: payment.authorizedAt,
      helcimTransactionId: preauthResult.transactionId,
    });
  } catch (error) {
    console.error("[Payment Creation] Error:", error);

    if (error instanceof HelcimError) {
      return ApiResponses.badRequest(`Payment failed: ${error.message}`);
    }

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
      return ApiResponses.badRequest("Validation failed", { error: error.message });
    }

    return ApiResponses.internalError("Failed to process payment");
  }
}

// Export with authentication middleware
export const POST = requireAuth(handlePOST);
