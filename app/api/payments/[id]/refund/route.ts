/**
 * Payment Refund API
 * POST /api/payments/[id]/refund - Process refund via Helcim
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
  PaymentError,
  calculateRefund,
} from "@/modules/payment/payment.service";
import { createHelcimClient, HelcimError } from "@/lib/helcim";
import { prisma } from "@/lib/prisma";
import { PaymentStatus, BookingStatus, EscrowTransactionType, EscrowStatus } from "@prisma/client";

/**
 * Handle POST request - Process refund via Helcim
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

    // Get payment with booking
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        booking: {
          select: {
            id: true,
            eventDate: true,
            status: true,
            customerId: true,
          },
        },
      },
    });

    if (!payment) {
      return ApiResponses.notFound("Payment not found");
    }

    // Check if payment can be refunded
    if (
      payment.status !== PaymentStatus.AUTHORIZED &&
      payment.status !== PaymentStatus.CAPTURED
    ) {
      return ApiResponses.badRequest("Payment cannot be refunded in current status");
    }

    // Get the original transaction (CAPTURE or HOLD)
    const originalTransaction = await prisma.escrowTransaction.findFirst({
      where: {
        bookingId: payment.bookingId,
        type: {
          in: [EscrowTransactionType.CAPTURE, EscrowTransactionType.HOLD],
        },
        status: EscrowStatus.COMPLETED,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!originalTransaction?.helcimTransactionId) {
      return ApiResponses.badRequest("No original transaction found for refund");
    }

    // Calculate refund amount based on cancellation policy
    let refundAmount: number;
    let refundReason: string;

    if (validatedData.amount) {
      // Manual refund amount provided
      refundAmount = validatedData.amount;
      refundReason = validatedData.reason || "Manual refund";
    } else {
      // Calculate based on cancellation policy
      const refundCalc = calculateRefund(
        payment.booking.eventDate,
        Number(payment.amount),
        validatedData.reason
      );
      refundAmount = refundCalc.refundAmount;
      refundReason = refundCalc.reason;
    }

    if (refundAmount <= 0) {
      return ApiResponses.badRequest(refundReason);
    }

    if (refundAmount > Number(payment.amount)) {
      return ApiResponses.badRequest("Refund amount cannot exceed payment amount");
    }

    // Process refund via Helcim
    const helcim = createHelcimClient();
    const refundResult = await helcim.refundPayment({
      originalTransactionId: parseInt(originalTransaction.helcimTransactionId),
      amount: Math.round(refundAmount * 100), // Convert to cents
    });

    if (refundResult.status !== "APPROVED") {
      return ApiResponses.badRequest("Refund was declined");
    }

    // Update payment status to REFUNDED
    await prisma.payment.update({
      where: { id },
      data: {
        status: PaymentStatus.REFUNDED,
        refundedAt: new Date(),
      },
    });

    // Create EscrowTransaction record for REFUND
    await prisma.escrowTransaction.create({
      data: {
        bookingId: payment.bookingId,
        type: EscrowTransactionType.REFUND,
        amount: refundAmount,
        status: EscrowStatus.COMPLETED,
        helcimTransactionId: refundResult.transactionId.toString(),
        notes: `Refund approved. ${refundReason}. Approval code: ${refundResult.approvalCode}`,
        completedAt: new Date(),
      },
    });

    // Update booking status to CANCELLED
    await prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: BookingStatus.CANCELLED },
    });

    return ApiResponses.ok({
      id: payment.id,
      bookingId: payment.bookingId,
      refundAmount,
      refundReason,
      status: PaymentStatus.REFUNDED,
      refundedAt: new Date(),
      helcimTransactionId: refundResult.transactionId,
    });
  } catch (error) {
    console.error("[Payment Refund] Error:", error);

    if (error instanceof HelcimError) {
      return ApiResponses.badRequest(`Refund failed: ${error.message}`);
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

    return ApiResponses.internalError("Failed to process refund");
  }
}

// Export with authentication middleware
export const POST = requireAuth(handlePOST);
