/**
 * Payment Module TypeScript Types
 * Shared types for payment and escrow operations
 *
 * NOTE: Stripe-specific types removed. Payment processing will be handled by Helcim.
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
  externalTransferId: string | null;
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
