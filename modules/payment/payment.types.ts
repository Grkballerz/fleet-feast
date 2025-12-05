/**
 * Payment Module TypeScript Types
 * Shared types for payment and escrow operations
 */

import { PaymentStatus, BookingStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

/**
 * Payment split calculation result
 */
export interface PaymentSplit {
  totalAmount: number;
  platformFee: number;
  vendorPayout: number;
}

/**
 * Payment intent creation data
 */
export interface CreatePaymentIntentData {
  bookingId: string;
  amount: number;
  currency?: string; // Default: 'usd'
  description?: string;
}

/**
 * Stripe payment intent response
 */
export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  status: string;
}

/**
 * Payment details
 */
export interface PaymentDetails {
  id: string;
  bookingId: string;
  stripePaymentIntentId: string | null;
  stripeTransferId: string | null;
  amount: number;
  status: PaymentStatus;
  authorizedAt: Date | null;
  capturedAt: Date | null;
  releasedAt: Date | null;
  refundedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Refund request data
 */
export interface RefundRequestData {
  reason?: string;
  amount?: number; // Partial refund amount (optional)
}

/**
 * Refund calculation result
 */
export interface RefundCalculation {
  refundAmount: number;
  refundPercentage: number;
  daysBeforeEvent: number;
  reason: string;
}

/**
 * Payout details
 */
export interface PayoutDetails {
  id: string;
  bookingId: string;
  vendorId: string;
  amount: number;
  platformFee: number;
  netPayout: number;
  status: PaymentStatus;
  releasedAt: Date | null;
  stripeTransferId: string | null;
  eventDate: Date;
  bookingStatus: BookingStatus;
  customerEmail: string;
  eventType: string;
  createdAt: Date;
}

/**
 * Payout list item (summary)
 */
export interface PayoutListItem {
  id: string;
  bookingId: string;
  amount: number;
  platformFee: number;
  netPayout: number;
  status: PaymentStatus;
  eventDate: string;
  releasedAt: Date | null;
  customerEmail: string;
  eventType: string;
}

/**
 * Early payout request data
 */
export interface EarlyPayoutRequestData {
  paymentId: string;
  reason?: string;
}

/**
 * Connected account onboarding data
 */
export interface ConnectedAccountData {
  vendorId: string;
  email: string;
  businessName: string;
  country?: string; // Default: 'US'
}

/**
 * Connected account onboarding response
 */
export interface OnboardingLinkResponse {
  accountId: string;
  onboardingUrl: string;
  expiresAt: number; // Unix timestamp
}

/**
 * Stripe webhook event types we handle
 */
export enum StripeWebhookEvent {
  PAYMENT_INTENT_SUCCEEDED = 'payment_intent.succeeded',
  PAYMENT_INTENT_PAYMENT_FAILED = 'payment_intent.payment_failed',
  PAYMENT_INTENT_CANCELED = 'payment_intent.canceled',
  CHARGE_REFUNDED = 'charge.refunded',
  TRANSFER_CREATED = 'transfer.created',
  TRANSFER_FAILED = 'transfer.failed',
  ACCOUNT_UPDATED = 'account.updated',
  ACCOUNT_EXTERNAL_ACCOUNT_CREATED = 'account.external_account.created',
}

/**
 * Webhook handler metadata
 */
export interface WebhookMetadata {
  bookingId?: string;
  vendorId?: string;
  releaseDate?: string;
  paymentId?: string;
}

/**
 * Escrow release job result
 */
export interface EscrowReleaseResult {
  processedCount: number;
  successCount: number;
  failedCount: number;
  errors: Array<{
    paymentId: string;
    bookingId: string;
    error: string;
  }>;
}
