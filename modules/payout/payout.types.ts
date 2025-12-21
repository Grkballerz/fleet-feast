/**
 * Vendor Payout System Type Definitions
 * Defines types for automated vendor payout scheduling and processing
 */

import { PayoutStatus, PayoutMethod } from "@prisma/client";

/**
 * Input data for scheduling a payout
 */
export interface SchedulePayoutData {
  vendorId: string;
  bookingIds: string[];
  totalAmount: number;
  scheduledFor: Date;
  payoutMethod?: PayoutMethod;
}

/**
 * Input data for processing a payout
 */
export interface ProcessPayoutData {
  payoutId: string;
  externalReference?: string;
}

/**
 * Input data for holding a payout
 */
export interface HoldPayoutData {
  payoutId: string;
  reason: string;
  adminId: string;
}

/**
 * Input data for releasing a payout
 */
export interface ReleasePayoutData {
  payoutId: string;
  adminId: string;
}

/**
 * Eligible booking for payout
 */
export interface EligibleBooking {
  id: string;
  vendorId: string;
  vendorPayout: number;
  platformFeeVendor: number;
  netPayout: number;
  eventDate: Date;
  customerId: string;
}

/**
 * Payout details response
 */
export interface PayoutDetails {
  id: string;
  vendorId: string;
  amount: number;
  status: PayoutStatus;
  payoutMethod: PayoutMethod | null;
  scheduledFor: Date;
  processedAt: Date | null;
  externalReference: string | null;
  failureReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  bookings: PayoutBookingItem[];
  vendor?: {
    businessName: string;
    bankAccountHolder: string | null;
    bankAccountNumber: string | null;
    bankRoutingNumber: string | null;
    bankAccountType: string | null;
    bankVerified: boolean;
  };
}

/**
 * Payout booking item
 */
export interface PayoutBookingItem {
  id: string;
  bookingId: string;
  amount: number;
  booking: {
    eventDate: string;
    eventType: string;
    customerEmail: string;
  };
}

/**
 * Payout list item
 */
export interface PayoutListItem {
  id: string;
  vendorId: string;
  amount: number;
  status: PayoutStatus;
  scheduledFor: Date;
  processedAt: Date | null;
  bookingCount: number;
  createdAt: Date;
}

/**
 * Payout schedule result
 */
export interface SchedulePayoutResult {
  payoutsCreated: number;
  totalAmount: number;
  vendors: string[];
  payouts: PayoutDetails[];
}

/**
 * Payout processing result
 */
export interface ProcessPayoutResult {
  processed: number;
  failed: number;
  successfulPayouts: string[];
  failedPayouts: Array<{
    id: string;
    reason: string;
  }>;
}

/**
 * Payout statistics
 */
export interface PayoutStatistics {
  totalPayouts: number;
  pendingPayouts: number;
  processingPayouts: number;
  completedPayouts: number;
  failedPayouts: number;
  totalPaidOut: number;
  avgPayoutAmount: number;
}

/**
 * Error class for payout operations
 */
export class PayoutError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "PayoutError";
  }
}
