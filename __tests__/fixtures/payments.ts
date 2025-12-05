/**
 * Payment Test Fixtures
 * Provides test data for payments in various states
 */

import { PaymentStatus } from "@prisma/client";
import type { Payment } from "@prisma/client";

export const testPaymentPending: Partial<Payment> = {
  id: "test-payment-001",
  bookingId: "test-booking-002",
  customerId: "test-customer-001",
  vendorId: "test-vendor-001",
  amount: 265000, // $2650.00
  status: PaymentStatus.PENDING,
  stripePaymentIntentId: null,
  createdAt: new Date("2025-01-16T00:00:00Z"),
  updatedAt: new Date("2025-01-16T00:00:00Z"),
};

export const testPaymentAuthorized: Partial<Payment> = {
  id: "test-payment-002",
  bookingId: "test-booking-003",
  customerId: "test-customer-001",
  vendorId: "test-vendor-001",
  amount: 202500, // $2025.00
  status: PaymentStatus.AUTHORIZED,
  stripePaymentIntentId: "pi_test_authorized_123",
  authorizedAt: new Date("2025-01-18T00:00:00Z"),
  createdAt: new Date("2025-01-17T00:00:00Z"),
  updatedAt: new Date("2025-01-18T00:00:00Z"),
};

export const testPaymentCaptured: Partial<Payment> = {
  id: "test-payment-003",
  bookingId: "test-booking-004",
  customerId: "test-customer-001",
  vendorId: "test-vendor-001",
  amount: 165000, // $1650.00
  status: PaymentStatus.CAPTURED,
  stripePaymentIntentId: "pi_test_captured_123",
  authorizedAt: new Date("2024-12-21T00:00:00Z"),
  capturedAt: new Date("2025-01-10T16:00:00Z"),
  createdAt: new Date("2024-12-21T00:00:00Z"),
  updatedAt: new Date("2025-01-10T16:00:00Z"),
};

export const testPaymentReleased: Partial<Payment> = {
  id: "test-payment-004",
  bookingId: "test-booking-004",
  customerId: "test-customer-001",
  vendorId: "test-vendor-001",
  amount: 165000, // $1650.00
  status: PaymentStatus.RELEASED,
  stripePaymentIntentId: "pi_test_released_123",
  stripeTransferId: "tr_test_released_123",
  authorizedAt: new Date("2024-12-21T00:00:00Z"),
  capturedAt: new Date("2025-01-10T16:00:00Z"),
  releasedAt: new Date("2025-01-17T16:00:00Z"), // 7 days after event
  createdAt: new Date("2024-12-21T00:00:00Z"),
  updatedAt: new Date("2025-01-17T16:00:00Z"),
};

export const testPaymentRefunded: Partial<Payment> = {
  id: "test-payment-005",
  bookingId: "test-booking-005",
  customerId: "test-customer-001",
  vendorId: "test-vendor-001",
  amount: 215000, // $2150.00
  status: PaymentStatus.REFUNDED,
  stripePaymentIntentId: "pi_test_refunded_123",
  stripeRefundId: "re_test_refunded_123",
  refundAmount: 215000, // Full refund
  authorizedAt: new Date("2025-01-19T00:00:00Z"),
  refundedAt: new Date("2025-01-20T00:00:00Z"),
  createdAt: new Date("2025-01-18T00:00:00Z"),
  updatedAt: new Date("2025-01-20T00:00:00Z"),
};

export const testPaymentFailed: Partial<Payment> = {
  id: "test-payment-006",
  bookingId: "test-booking-001",
  customerId: "test-customer-001",
  vendorId: "test-vendor-001",
  amount: 140000, // $1400.00
  status: PaymentStatus.FAILED,
  stripePaymentIntentId: "pi_test_failed_123",
  failureReason: "Insufficient funds",
  createdAt: new Date("2025-01-15T00:00:00Z"),
  updatedAt: new Date("2025-01-15T01:00:00Z"),
};

/**
 * Mock Stripe webhook events
 */
export const mockStripeWebhookEvent = {
  paymentIntentSucceeded: {
    type: "payment_intent.succeeded",
    data: {
      object: {
        id: "pi_test_webhook_123",
        amount: 202500,
        status: "succeeded",
        metadata: {
          bookingId: "test-booking-003",
        },
      },
    },
  },
  paymentIntentPaymentFailed: {
    type: "payment_intent.payment_failed",
    data: {
      object: {
        id: "pi_test_webhook_failed_123",
        amount: 140000,
        status: "failed",
        last_payment_error: {
          message: "Insufficient funds",
        },
        metadata: {
          bookingId: "test-booking-001",
        },
      },
    },
  },
  chargeRefunded: {
    type: "charge.refunded",
    data: {
      object: {
        id: "ch_test_webhook_refund_123",
        payment_intent: "pi_test_refunded_123",
        amount_refunded: 215000,
        refunded: true,
        metadata: {
          bookingId: "test-booking-005",
        },
      },
    },
  },
};

/**
 * Helper to create a test payment with custom properties
 */
export function createTestPayment(
  overrides: Partial<Payment> = {}
): Partial<Payment> {
  return {
    ...testPaymentPending,
    ...overrides,
    id: overrides.id || `test-payment-${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
