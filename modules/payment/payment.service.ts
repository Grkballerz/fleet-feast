/**
 * Payment Service Layer
 * Handles business logic for payments, escrow, refunds, and vendor payouts
 */

import { prisma } from "@/lib/prisma";
import { PaymentStatus, BookingStatus } from "@prisma/client";
import {
  stripeConnect,
  stripePayments,
  stripeTransfers,
  stripeUtils
} from "./stripe.client";
import type {
  PaymentSplit,
  CreatePaymentIntentData,
  PaymentIntentResponse,
  PaymentDetails,
  RefundRequestData,
  RefundCalculation,
  PayoutDetails,
  PayoutListItem,
  ConnectedAccountData,
  OnboardingLinkResponse,
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

/**
 * Create Stripe Connected Account for vendor
 */
export async function createConnectedAccount(
  data: ConnectedAccountData
): Promise<OnboardingLinkResponse> {
  // Verify vendor exists
  const vendor = await prisma.vendor.findUnique({
    where: { id: data.vendorId },
    include: { user: true },
  });

  if (!vendor) {
    throw new PaymentError("Vendor not found", "VENDOR_NOT_FOUND", 404);
  }

  // Check if vendor already has a connected account
  if (vendor.stripeAccountId) {
    // Check if account is already fully onboarded
    const isOnboarded = await stripeConnect.isAccountOnboarded(
      vendor.stripeAccountId
    );

    if (isOnboarded) {
      throw new PaymentError(
        "Vendor already has a connected account",
        "ACCOUNT_EXISTS",
        400
      );
    }

    // If not onboarded, create a new onboarding link
    const accountLink = await stripeConnect.createAccountLink({
      accountId: vendor.stripeAccountId,
      refreshUrl: `${APP_URL}/vendor/stripe-onboarding/refresh`,
      returnUrl: `${APP_URL}/vendor/stripe-onboarding/complete`,
    });

    return {
      accountId: vendor.stripeAccountId,
      onboardingUrl: accountLink.url,
      expiresAt: accountLink.expires_at,
    };
  }

  // Create new connected account
  const account = await stripeConnect.createAccount({
    email: data.email,
    businessName: data.businessName,
    country: data.country || "US",
  });

  // Save account ID to vendor
  await prisma.vendor.update({
    where: { id: data.vendorId },
    data: {
      stripeAccountId: account.id,
      stripeConnected: false, // Will be true after onboarding
    },
  });

  // Generate onboarding link
  const accountLink = await stripeConnect.createAccountLink({
    accountId: account.id,
    refreshUrl: `${APP_URL}/vendor/stripe-onboarding/refresh`,
    returnUrl: `${APP_URL}/vendor/stripe-onboarding/complete`,
  });

  return {
    accountId: account.id,
    onboardingUrl: accountLink.url,
    expiresAt: accountLink.expires_at,
  };
}

/**
 * Update vendor Stripe connection status
 */
export async function updateVendorStripeStatus(
  stripeAccountId: string
): Promise<void> {
  const isOnboarded = await stripeConnect.isAccountOnboarded(stripeAccountId);

  await prisma.vendor.update({
    where: { stripeAccountId },
    data: { stripeConnected: isOnboarded },
  });
}

/**
 * Create payment intent for a booking
 */
export async function createPaymentIntent(
  data: CreatePaymentIntentData
): Promise<PaymentIntentResponse> {
  // Fetch booking with vendor details
  const booking = await prisma.booking.findUnique({
    where: { id: data.bookingId },
    include: {
      vendor: true,
      vendorProfile: true,
      payment: true,
    },
  });

  if (!booking) {
    throw new PaymentError("Booking not found", "BOOKING_NOT_FOUND", 404);
  }

  // Check booking status
  if (booking.status !== BookingStatus.ACCEPTED) {
    throw new PaymentError(
      "Payment can only be created for ACCEPTED bookings",
      "INVALID_BOOKING_STATUS",
      400
    );
  }

  // Check if payment already exists
  if (booking.payment) {
    throw new PaymentError(
      "Payment already exists for this booking",
      "PAYMENT_EXISTS",
      400
    );
  }

  // Verify vendor has connected account
  if (!booking.vendorProfile.stripeAccountId) {
    throw new PaymentError(
      "Vendor has not set up payment account",
      "VENDOR_NO_STRIPE_ACCOUNT",
      400
    );
  }

  if (!booking.vendorProfile.stripeConnected) {
    throw new PaymentError(
      "Vendor has not completed payment onboarding",
      "VENDOR_NOT_ONBOARDED",
      400
    );
  }

  // Calculate payment split
  const amount = data.amount || Number(booking.totalAmount);
  const split = calculatePaymentSplit(amount);

  // Calculate release date
  const releaseDate = calculateReleaseDate(booking.eventDate);

  // Create Stripe payment intent
  const paymentIntent = await stripePayments.createPaymentIntent({
    amount,
    currency: data.currency || "usd",
    description: data.description || `Booking ${booking.id}`,
    metadata: {
      bookingId: booking.id,
      vendorId: booking.vendorId,
      releaseDate: releaseDate.toISOString(),
    },
    connectedAccountId: booking.vendorProfile.stripeAccountId,
    applicationFeeAmount: split.platformFee,
  });

  // Create payment record
  await prisma.payment.create({
    data: {
      bookingId: booking.id,
      stripePaymentIntentId: paymentIntent.id,
      amount,
      status: PaymentStatus.PENDING,
    },
  });

  return {
    clientSecret: paymentIntent.client_secret!,
    paymentIntentId: paymentIntent.id,
    amount,
    currency: paymentIntent.currency,
    status: paymentIntent.status,
  };
}

/**
 * Handle successful payment authorization
 */
export async function handlePaymentAuthorized(
  paymentIntentId: string
): Promise<void> {
  const payment = await prisma.payment.findUnique({
    where: { stripePaymentIntentId: paymentIntentId },
    include: { booking: true },
  });

  if (!payment) {
    throw new PaymentError(
      "Payment not found for intent",
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
  paymentIntentId: string
): Promise<void> {
  const payment = await prisma.payment.findUnique({
    where: { stripePaymentIntentId: paymentIntentId },
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
 * Process refund for a payment
 */
export async function processRefund(
  paymentId: string,
  data: RefundRequestData
): Promise<PaymentDetails> {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { booking: true },
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

  if (!payment.stripePaymentIntentId) {
    throw new PaymentError(
      "Payment has no Stripe payment intent",
      "NO_PAYMENT_INTENT",
      400
    );
  }

  // Calculate refund amount
  let refundAmount = data.amount;

  if (!refundAmount) {
    // Use cancellation policy
    const refundCalc = calculateRefund(
      payment.booking.eventDate,
      Number(payment.amount),
      data.reason
    );
    refundAmount = refundCalc.refundAmount;
  }

  // Validate refund amount
  if (refundAmount > Number(payment.amount)) {
    throw new PaymentError(
      "Refund amount cannot exceed payment amount",
      "INVALID_REFUND_AMOUNT",
      400
    );
  }

  // Create refund in Stripe
  const refund = await stripePayments.createRefund({
    paymentIntentId: payment.stripePaymentIntentId,
    amount: refundAmount,
    reason: "requested_by_customer",
    metadata: {
      paymentId: payment.id,
      bookingId: payment.bookingId,
      reason: data.reason || "Cancellation",
    },
  });

  // Update payment status
  const updatedPayment = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: PaymentStatus.REFUNDED,
      refundedAt: new Date(),
    },
  });

  // Update booking status and refund amount
  await prisma.booking.update({
    where: { id: payment.bookingId },
    data: {
      status: BookingStatus.REFUNDED,
      refundAmount: refundAmount,
    },
  });

  return {
    id: updatedPayment.id,
    bookingId: updatedPayment.bookingId,
    stripePaymentIntentId: updatedPayment.stripePaymentIntentId,
    stripeTransferId: updatedPayment.stripeTransferId,
    amount: Number(updatedPayment.amount),
    status: updatedPayment.status,
    authorizedAt: updatedPayment.authorizedAt,
    capturedAt: updatedPayment.capturedAt,
    releasedAt: updatedPayment.releasedAt,
    refundedAt: updatedPayment.refundedAt,
    createdAt: updatedPayment.createdAt,
    updatedAt: updatedPayment.updatedAt,
  };
}

/**
 * Get payment details
 */
export async function getPaymentDetails(paymentId: string): Promise<PaymentDetails> {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  });

  if (!payment) {
    throw new PaymentError("Payment not found", "PAYMENT_NOT_FOUND", 404);
  }

  return {
    id: payment.id,
    bookingId: payment.bookingId,
    stripePaymentIntentId: payment.stripePaymentIntentId,
    stripeTransferId: payment.stripeTransferId,
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
    stripeTransferId: payment.stripeTransferId,
    eventDate: payment.booking.eventDate,
    bookingStatus: payment.booking.status,
    customerEmail: payment.booking.customer.email,
    eventType: payment.booking.eventType,
    createdAt: payment.createdAt,
  };
}

/**
 * Release escrow payments (scheduled job)
 * Run daily to release payments 7 days after event completion
 */
export async function releaseEscrowPayments(): Promise<EscrowReleaseResult> {
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
    include: {
      booking: {
        include: {
          vendorProfile: true,
        },
      },
    },
  });

  const result: EscrowReleaseResult = {
    processedCount: paymentsToRelease.length,
    successCount: 0,
    failedCount: 0,
    errors: [],
  };

  for (const payment of paymentsToRelease) {
    try {
      if (!payment.stripePaymentIntentId) {
        throw new Error("No Stripe payment intent ID");
      }

      // Capture the payment (release from escrow)
      await stripePayments.capturePaymentIntent(payment.stripePaymentIntentId);

      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.RELEASED,
          releasedAt: new Date(),
        },
      });

      result.successCount++;
    } catch (error) {
      result.failedCount++;
      result.errors.push({
        paymentId: payment.id,
        bookingId: payment.bookingId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return result;
}

/**
 * Capture payment after event (move to CAPTURED status)
 */
export async function capturePaymentAfterEvent(bookingId: string): Promise<void> {
  const payment = await prisma.payment.findUnique({
    where: { bookingId },
    include: { booking: true },
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
