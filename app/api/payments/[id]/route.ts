/**
 * Payment Details API
 * GET /api/payments/[id] - Get payment details with escrow history
 * POST /api/payments/[id] - Capture payment
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
import { paymentIdSchema, capturePaymentSchema } from "@/modules/payment/payment.validation";
import { PaymentError } from "@/modules/payment/payment.service";
import { createHelcimClient, HelcimError } from "@/lib/helcim";
import { prisma } from "@/lib/prisma";
import { PaymentStatus, BookingStatus, EscrowTransactionType, EscrowStatus } from "@prisma/client";

/**
 * Handle GET request - Get payment details with escrow transaction history
 */
async function handleGET(
  req: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserId(req);
    const { id } = paymentIdSchema.parse(params);

    // Get payment with escrow transactions
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        booking: {
          select: {
            id: true,
            customerId: true,
            vendorId: true,
            eventType: true,
            eventDate: true,
            status: true,
          },
        },
      },
    });

    if (!payment) {
      return ApiResponses.notFound("Payment not found");
    }

    // Get escrow transaction history
    const escrowTransactions = await prisma.escrowTransaction.findMany({
      where: { bookingId: payment.bookingId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        type: true,
        amount: true,
        status: true,
        helcimTransactionId: true,
        notes: true,
        createdAt: true,
        completedAt: true,
      },
    });

    return ApiResponses.ok({
      id: payment.id,
      bookingId: payment.bookingId,
      externalPaymentId: payment.externalPaymentId,
      amount: Number(payment.amount),
      status: payment.status,
      authorizedAt: payment.authorizedAt,
      capturedAt: payment.capturedAt,
      releasedAt: payment.releasedAt,
      refundedAt: payment.refundedAt,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      escrowTransactions: escrowTransactions.map(tx => ({
        id: tx.id,
        type: tx.type,
        amount: Number(tx.amount),
        status: tx.status,
        helcimTransactionId: tx.helcimTransactionId,
        notes: tx.notes,
        createdAt: tx.createdAt,
        completedAt: tx.completedAt,
      })),
    });
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
      return ApiResponses.badRequest("Validation failed", { error: error.message });
    }

    return ApiResponses.internalError("Failed to retrieve payment details");
  }
}

/**
 * Handle POST request - Capture payment
 */
async function handlePOST(
  req: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserId(req);
    const { id } = paymentIdSchema.parse(params);

    const body = await req.json();
    const validatedData = capturePaymentSchema.parse(body);

    // Get payment with booking
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        booking: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
          },
        },
      },
    });

    if (!payment) {
      return ApiResponses.notFound("Payment not found");
    }

    if (payment.status !== PaymentStatus.AUTHORIZED) {
      return ApiResponses.badRequest("Payment must be AUTHORIZED to capture");
    }

    // Get the HOLD escrow transaction to find helcimTransactionId
    const holdTransaction = await prisma.escrowTransaction.findFirst({
      where: {
        bookingId: payment.bookingId,
        type: EscrowTransactionType.HOLD,
        status: EscrowStatus.COMPLETED,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!holdTransaction?.helcimTransactionId) {
      return ApiResponses.badRequest("No pre-authorization found for this payment");
    }

    // Use provided amount or full payment amount
    const captureAmount = validatedData.amount || Number(payment.amount);

    // Capture payment via Helcim
    const helcim = createHelcimClient();
    const captureResult = await helcim.capturePayment({
      preAuthTransactionId: parseInt(holdTransaction.helcimTransactionId),
      amount: Math.round(captureAmount * 100), // Convert to cents
    });

    if (captureResult.status !== "APPROVED") {
      return ApiResponses.badRequest("Payment capture was declined");
    }

    // Update payment status to CAPTURED
    await prisma.payment.update({
      where: { id },
      data: {
        status: PaymentStatus.CAPTURED,
        capturedAt: new Date(),
      },
    });

    // Create EscrowTransaction record for CAPTURE
    await prisma.escrowTransaction.create({
      data: {
        bookingId: payment.bookingId,
        type: EscrowTransactionType.CAPTURE,
        amount: captureAmount,
        status: EscrowStatus.COMPLETED,
        helcimTransactionId: captureResult.transactionId.toString(),
        notes: `Capture approved. Approval code: ${captureResult.approvalCode}`,
        completedAt: new Date(),
      },
    });

    // Update booking status to CONFIRMED
    await prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: BookingStatus.CONFIRMED },
    });

    return ApiResponses.ok({
      id: payment.id,
      bookingId: payment.bookingId,
      amount: Number(payment.amount),
      capturedAmount: captureAmount,
      status: PaymentStatus.CAPTURED,
      capturedAt: new Date(),
      helcimTransactionId: captureResult.transactionId,
    });
  } catch (error) {
    console.error("[Payment Capture] Error:", error);

    if (error instanceof HelcimError) {
      return ApiResponses.badRequest(`Capture failed: ${error.message}`);
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

    return ApiResponses.internalError("Failed to capture payment");
  }
}

// Export with authentication middleware
export const GET = requireAuth(handleGET);
export const POST = requireAuth(handlePOST);
