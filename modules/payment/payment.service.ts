/**
 * Payment Service Layer
 * Handles business logic for payments, escrow, refunds, and vendor payouts
 *
 * NOTE: Stripe dependencies removed. Payment processing will be handled by Helcim.
 * This file contains core payment logic that is payment-processor agnostic.
 */

import { prisma } from "@/lib/prisma";
import { PaymentStatus, BookingStatus } from "@prisma/client";
import type {
  PaymentSplit,
  RefundCalculation,
  PayoutDetails,
  PayoutListItem,
  EscrowReleaseResult,
} from "./payment.types";

/**
 * Constants
 */
export const PLATFORM_COMMISSION = 0.15; // 15% platform fee
export const ESCROW_HOLD_DAYS = 7; // 7 days post-event
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/**
 * Cancellation policy thresholds (days before event)
 */
export const CANCELLATION_POLICY = {
  FULL_REFUND_DAYS: 7, // 7+ days: 100% refund
  PARTIAL_REFUND_DAYS: 3, // 3-6 days: 50% refund
  // Under 3 days: 0% refund
};

/**
 * Custom error class for payment operations
 */
export class PaymentError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "PaymentError";
  }
}

/**
 * Calculate platform fee and vendor payout
 */
export function calculatePaymentSplit(totalAmount: number): PaymentSplit {
  const platformFee = Math.round(totalAmount * PLATFORM_COMMISSION * 100) / 100;
  const vendorPayout = Math.round((totalAmount - platformFee) * 100) / 100;

  return {
    totalAmount,
    platformFee,
    vendorPayout,
  };
}

/**
 * Calculate refund amount based on cancellation policy
 */
export function calculateRefund(
  eventDate: Date,
  totalAmount: number,
  reason?: string
): RefundCalculation {
  const now = new Date();
  const daysBeforeEvent = Math.ceil(
    (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  let refundPercentage = 0;
  let refundReason = reason || "Cancellation";

  if (daysBeforeEvent >= CANCELLATION_POLICY.FULL_REFUND_DAYS) {
    refundPercentage = 1.0; // 100% refund
    refundReason = `Full refund (${daysBeforeEvent} days before event)`;
  } else if (daysBeforeEvent >= CANCELLATION_POLICY.PARTIAL_REFUND_DAYS) {
    refundPercentage = 0.5; // 50% refund
    refundReason = `Partial refund (${daysBeforeEvent} days before event)`;
  } else {
    refundPercentage = 0; // No refund
    refundReason = `No refund (less than ${CANCELLATION_POLICY.PARTIAL_REFUND_DAYS} days before event)`;
  }

  return {
    refundAmount: Math.round(totalAmount * refundPercentage * 100) / 100,
    refundPercentage,
    daysBeforeEvent,
    reason: refundReason,
  };
}

/**
 * Calculate escrow release date (7 days after event)
 */
export function calculateReleaseDate(eventDate: Date): Date {
  const releaseDate = new Date(eventDate);
  releaseDate.setDate(releaseDate.getDate() + ESCROW_HOLD_DAYS);
  return releaseDate;
}

// NOTE: createConnectedAccount, updateVendorStripeStatus, and createPaymentIntent
// have been removed. These will be replaced with Helcim-specific implementations.

/**
 * Handle successful payment authorization
 */
export async function handlePaymentAuthorized(
  externalPaymentId: string
): Promise<void> {
  const payment = await prisma.payment.findUnique({
    where: { externalPaymentId },
    select: {
      id: true,
      bookingId: true,
      booking: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!payment) {
    throw new PaymentError(
      "Payment not found for external payment ID",
      "PAYMENT_NOT_FOUND",
      404
    );
  }

  // Update payment status
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: PaymentStatus.AUTHORIZED,
      authorizedAt: new Date(),
    },
  });

  // Update booking status to CONFIRMED
  await prisma.booking.update({
    where: { id: payment.bookingId },
    data: { status: BookingStatus.CONFIRMED },
  });
}

/**
 * Handle payment failure
 */
export async function handlePaymentFailed(
  externalPaymentId: string
): Promise<void> {
  const payment = await prisma.payment.findUnique({
    where: { externalPaymentId },
  });

  if (!payment) {
    return; // Payment may not exist yet
  }

  // Update payment status
  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: PaymentStatus.FAILED },
  });

  // Update booking status
  await prisma.booking.update({
    where: { id: payment.bookingId },
    data: { status: BookingStatus.PAYMENT_FAILED },
  });
}

/**
 * Calculate refund for a payment (business logic only)
 * NOTE: Actual refund processing via payment gateway removed - will be handled by Helcim
 */
export async function calculateRefundForPayment(
  paymentId: string,
  reason?: string
): Promise<RefundCalculation> {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    select: {
      id: true,
      status: true,
      amount: true,
      bookingId: true,
      booking: {
        select: {
          eventDate: true,
        },
      },
    },
  });

  if (!payment) {
    throw new PaymentError("Payment not found", "PAYMENT_NOT_FOUND", 404);
  }

  // Check if payment can be refunded
  if (
    payment.status !== PaymentStatus.AUTHORIZED &&
    payment.status !== PaymentStatus.CAPTURED
  ) {
    throw new PaymentError(
      "Payment cannot be refunded in current status",
      "INVALID_PAYMENT_STATUS",
      400
    );
  }

  // Calculate refund amount using cancellation policy
  return calculateRefund(
    payment.booking.eventDate,
    Number(payment.amount),
    reason
  );
}

/**
 * Get payment details
 */
export async function getPaymentDetails(paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  });

  if (!payment) {
    throw new PaymentError("Payment not found", "PAYMENT_NOT_FOUND", 404);
  }

  return {
    id: payment.id,
    bookingId: payment.bookingId,
    externalPaymentId: payment.externalPaymentId,
    externalTransferId: payment.externalTransferId,
    amount: Number(payment.amount),
    status: payment.status,
    authorizedAt: payment.authorizedAt,
    capturedAt: payment.capturedAt,
    releasedAt: payment.releasedAt,
    refundedAt: payment.refundedAt,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
  };
}

/**
 * List vendor payouts
 */
export async function listVendorPayouts(vendorId: string): Promise<PayoutListItem[]> {
  const payments = await prisma.payment.findMany({
    where: {
      booking: {
        vendorId,
      },
      status: {
        in: [
          PaymentStatus.AUTHORIZED,
          PaymentStatus.CAPTURED,
          PaymentStatus.RELEASED,
        ],
      },
    },
    include: {
      booking: {
        include: {
          customer: {
            select: {
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return payments.map((payment) => {
    const split = calculatePaymentSplit(Number(payment.amount));

    return {
      id: payment.id,
      bookingId: payment.bookingId,
      amount: Number(payment.amount),
      platformFee: split.platformFee,
      netPayout: split.vendorPayout,
      status: payment.status,
      eventDate: payment.booking.eventDate.toISOString().split("T")[0],
      releasedAt: payment.releasedAt,
      customerEmail: payment.booking.customer.email,
      eventType: payment.booking.eventType,
    };
  });
}

/**
 * Get single payout details
 */
export async function getPayoutDetails(
  paymentId: string,
  vendorId: string
): Promise<PayoutDetails> {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    select: {
      id: true,
      bookingId: true,
      amount: true,
      status: true,
      releasedAt: true,
      externalTransferId: true,
      createdAt: true,
      booking: {
        select: {
          vendorId: true,
          eventDate: true,
          status: true,
          eventType: true,
          customer: {
            select: {
              email: true,
            },
          },
        },
      },
    },
  });

  if (!payment) {
    throw new PaymentError("Payment not found", "PAYMENT_NOT_FOUND", 404);
  }

  // Verify vendor owns this payment
  if (payment.booking.vendorId !== vendorId) {
    throw new PaymentError(
      "You don't have permission to view this payout",
      "UNAUTHORIZED",
      403
    );
  }

  const split = calculatePaymentSplit(Number(payment.amount));

  return {
    id: payment.id,
    bookingId: payment.bookingId,
    vendorId: payment.booking.vendorId,
    amount: Number(payment.amount),
    platformFee: split.platformFee,
    netPayout: split.vendorPayout,
    status: payment.status,
    releasedAt: payment.releasedAt,
    externalTransferId: payment.externalTransferId,
    eventDate: payment.booking.eventDate,
    bookingStatus: payment.booking.status,
    customerEmail: payment.booking.customer.email,
    eventType: payment.booking.eventType,
    createdAt: payment.createdAt,
  };
}

/**
 * Get payments eligible for escrow release
 * NOTE: Actual release will be handled by Helcim integration
 * Run daily to identify payments 7 days after event completion
 */
export async function getEligibleEscrowReleases(): Promise<{
  payments: Array<{
    id: string;
    bookingId: string;
    externalPaymentId: string | null;
    amount: number;
    vendorId: string;
  }>;
  count: number;
}> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find payments eligible for release
  const paymentsToRelease = await prisma.payment.findMany({
    where: {
      status: PaymentStatus.CAPTURED,
      booking: {
        status: BookingStatus.COMPLETED,
        eventDate: {
          lte: new Date(today.getTime() - ESCROW_HOLD_DAYS * 24 * 60 * 60 * 1000),
        },
      },
    },
    select: {
      id: true,
      bookingId: true,
      externalPaymentId: true,
      amount: true,
      booking: {
        select: {
          id: true,
          vendorId: true,
        },
      },
    },
  });

  return {
    payments: paymentsToRelease.map(p => ({
      id: p.id,
      bookingId: p.bookingId,
      externalPaymentId: p.externalPaymentId,
      amount: Number(p.amount),
      vendorId: p.booking.vendorId,
    })),
    count: paymentsToRelease.length,
  };
}

/**
 * Capture payment after event (move to CAPTURED status)
 */
export async function capturePaymentAfterEvent(bookingId: string): Promise<void> {
  const payment = await prisma.payment.findUnique({
    where: { bookingId },
    select: {
      id: true,
      status: true,
      booking: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!payment) {
    throw new PaymentError("Payment not found", "PAYMENT_NOT_FOUND", 404);
  }

  if (payment.status !== PaymentStatus.AUTHORIZED) {
    throw new PaymentError(
      "Payment must be AUTHORIZED to capture",
      "INVALID_PAYMENT_STATUS",
      400
    );
  }

  // Update payment status to CAPTURED (entering escrow hold)
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: PaymentStatus.CAPTURED,
      capturedAt: new Date(),
    },
  });

  // Update booking status to COMPLETED
  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: BookingStatus.COMPLETED },
  });
}
