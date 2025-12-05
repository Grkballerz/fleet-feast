/**
 * Unit Tests for Payment Service
 * Tests payment processing, refunds, escrow, and Stripe integration
 */

import {
  calculatePaymentSplit,
  calculateRefund,
  calculateReleaseDate,
  createPaymentIntent,
  processRefund,
  PaymentError,
  PLATFORM_COMMISSION,
  ESCROW_HOLD_DAYS,
  CANCELLATION_POLICY,
} from "@/modules/payment/payment.service";
import { BookingStatus, PaymentStatus } from "@prisma/client";

// Mock dependencies
jest.mock("@/lib/prisma", () => ({
  prisma: {
    booking: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    payment: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    vendor: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock("@/modules/payment/stripe.client", () => ({
  stripeConnect: {
    createAccount: jest.fn(),
    createAccountLink: jest.fn(),
    isAccountOnboarded: jest.fn(),
  },
  stripePayments: {
    createPaymentIntent: jest.fn(),
    capturePaymentIntent: jest.fn(),
    createRefund: jest.fn(),
  },
  stripeTransfers: {
    createTransfer: jest.fn(),
  },
  stripeUtils: {
    constructWebhookEvent: jest.fn(),
  },
}));

import { prisma } from "@/lib/prisma";
import { stripePayments } from "@/modules/payment/stripe.client";

describe("PaymentService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("calculatePaymentSplit", () => {
    it("should calculate correct platform fee and vendor payout", () => {
      const result = calculatePaymentSplit(1000);

      expect(result).toEqual({
        totalAmount: 1000,
        platformFee: 150, // 15%
        vendorPayout: 850, // 85%
      });
    });

    it("should round amounts correctly", () => {
      const result = calculatePaymentSplit(1001);

      expect(result.platformFee).toBe(150.15);
      expect(result.vendorPayout).toBe(850.85);
    });

    it("should use correct commission rate", () => {
      const result = calculatePaymentSplit(500);

      expect(result.platformFee).toBe(500 * PLATFORM_COMMISSION);
    });
  });

  describe("calculateRefund", () => {
    it("should calculate 100% refund for 7+ days before event", () => {
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() + 10);

      const result = calculateRefund(eventDate, 1000);

      expect(result.refundAmount).toBe(1000);
      expect(result.refundPercentage).toBe(1.0);
      expect(result.daysBeforeEvent).toBeGreaterThanOrEqual(7);
      expect(result.reason).toContain("Full refund");
    });

    it("should calculate 50% refund for 3-6 days before event", () => {
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() + 5);

      const result = calculateRefund(eventDate, 1000);

      expect(result.refundAmount).toBe(500);
      expect(result.refundPercentage).toBe(0.5);
      expect(result.reason).toContain("Partial refund");
    });

    it("should calculate 0% refund for less than 3 days before event", () => {
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() + 2);

      const result = calculateRefund(eventDate, 1000);

      expect(result.refundAmount).toBe(0);
      expect(result.refundPercentage).toBe(0);
      expect(result.reason).toContain("No refund");
    });

    it("should include custom reason if provided", () => {
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() + 10);

      const result = calculateRefund(eventDate, 1000, "Custom reason");

      expect(result.refundAmount).toBe(1000);
    });
  });

  describe("calculateReleaseDate", () => {
    it("should calculate release date 7 days after event", () => {
      const eventDate = new Date("2025-12-15");
      const releaseDate = calculateReleaseDate(eventDate);

      const expected = new Date("2025-12-22");
      expect(releaseDate.toDateString()).toBe(expected.toDateString());
    });

    it("should use correct escrow hold days", () => {
      const eventDate = new Date("2025-12-01");
      const releaseDate = calculateReleaseDate(eventDate);

      const daysDiff = Math.round(
        (releaseDate.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      expect(daysDiff).toBe(ESCROW_HOLD_DAYS);
    });
  });

  describe("createPaymentIntent", () => {
    const mockBooking = {
      id: "booking-123",
      customerId: "customer-123",
      vendorId: "vendor-user-123",
      status: BookingStatus.ACCEPTED,
      totalAmount: 2000,
      eventDate: new Date("2025-12-15"),
      payment: null,
      vendor: {
        id: "vendor-user-123",
        email: "vendor@example.com",
      },
      vendorProfile: {
        id: "vendor-123",
        stripeAccountId: "acct_test123",
        stripeConnected: true,
        businessName: "Test Truck",
      },
    };

    it("should create payment intent successfully", async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);
      (stripePayments.createPaymentIntent as jest.Mock).mockResolvedValue({
        id: "pi_test123",
        client_secret: "secret_test123",
        amount: 2000,
        currency: "usd",
        status: "requires_payment_method",
      });
      (prisma.payment.create as jest.Mock).mockResolvedValue({
        id: "payment-123",
        bookingId: "booking-123",
        stripePaymentIntentId: "pi_test123",
        amount: 2000,
        status: PaymentStatus.PENDING,
      });

      const result = await createPaymentIntent({
        bookingId: "booking-123",
      });

      expect(result).toEqual({
        clientSecret: "secret_test123",
        paymentIntentId: "pi_test123",
        amount: 2000,
        currency: "usd",
        status: "requires_payment_method",
      });

      expect(stripePayments.createPaymentIntent).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 2000,
          currency: "usd",
          connectedAccountId: "acct_test123",
          applicationFeeAmount: 300, // 15% of 2000
        })
      );
    });

    it("should throw error if booking not found", async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        createPaymentIntent({ bookingId: "nonexistent" })
      ).rejects.toThrow(PaymentError);
      await expect(
        createPaymentIntent({ bookingId: "nonexistent" })
      ).rejects.toThrow("Booking not found");
    });

    it("should throw error if booking not in ACCEPTED status", async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.PENDING,
      });

      await expect(
        createPaymentIntent({ bookingId: "booking-123" })
      ).rejects.toThrow(PaymentError);
      await expect(
        createPaymentIntent({ bookingId: "booking-123" })
      ).rejects.toThrow("Payment can only be created for ACCEPTED bookings");
    });

    it("should throw error if payment already exists", async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue({
        ...mockBooking,
        payment: { id: "existing-payment" },
      });

      await expect(
        createPaymentIntent({ bookingId: "booking-123" })
      ).rejects.toThrow(PaymentError);
      await expect(
        createPaymentIntent({ bookingId: "booking-123" })
      ).rejects.toThrow("Payment already exists for this booking");
    });

    it("should throw error if vendor has no Stripe account", async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue({
        ...mockBooking,
        vendorProfile: {
          ...mockBooking.vendorProfile,
          stripeAccountId: null,
        },
      });

      await expect(
        createPaymentIntent({ bookingId: "booking-123" })
      ).rejects.toThrow(PaymentError);
      await expect(
        createPaymentIntent({ bookingId: "booking-123" })
      ).rejects.toThrow("Vendor has not set up payment account");
    });

    it("should throw error if vendor not onboarded", async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue({
        ...mockBooking,
        vendorProfile: {
          ...mockBooking.vendorProfile,
          stripeConnected: false,
        },
      });

      await expect(
        createPaymentIntent({ bookingId: "booking-123" })
      ).rejects.toThrow(PaymentError);
      await expect(
        createPaymentIntent({ bookingId: "booking-123" })
      ).rejects.toThrow("Vendor has not completed payment onboarding");
    });

    it("should include release date in metadata", async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);
      (stripePayments.createPaymentIntent as jest.Mock).mockResolvedValue({
        id: "pi_test123",
        client_secret: "secret_test123",
        amount: 2000,
        currency: "usd",
        status: "requires_payment_method",
      });
      (prisma.payment.create as jest.Mock).mockResolvedValue({});

      await createPaymentIntent({ bookingId: "booking-123" });

      expect(stripePayments.createPaymentIntent).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            bookingId: "booking-123",
            releaseDate: expect.any(String),
          }),
        })
      );
    });
  });

  describe("processRefund", () => {
    const mockPayment = {
      id: "payment-123",
      bookingId: "booking-123",
      stripePaymentIntentId: "pi_test123",
      amount: 2000,
      status: PaymentStatus.AUTHORIZED,
      booking: {
        id: "booking-123",
        eventDate: new Date("2025-12-15"),
        totalAmount: 2000,
      },
    };

    it("should process full refund successfully", async () => {
      (prisma.payment.findUnique as jest.Mock).mockResolvedValue(mockPayment);
      (stripePayments.createRefund as jest.Mock).mockResolvedValue({
        id: "re_test123",
        amount: 2000,
        status: "succeeded",
      });
      (prisma.payment.update as jest.Mock).mockResolvedValue({
        ...mockPayment,
        status: PaymentStatus.REFUNDED,
        refundedAt: new Date(),
      });
      (prisma.booking.update as jest.Mock).mockResolvedValue({});

      const result = await processRefund("payment-123", {
        amount: 2000,
        reason: "Customer cancellation",
      });

      expect(result.status).toBe(PaymentStatus.REFUNDED);
      expect(stripePayments.createRefund).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentIntentId: "pi_test123",
          amount: 2000,
        })
      );
    });

    it("should calculate refund based on cancellation policy if amount not provided", async () => {
      const futureEventDate = new Date();
      futureEventDate.setDate(futureEventDate.getDate() + 10); // 10 days from now

      (prisma.payment.findUnique as jest.Mock).mockResolvedValue({
        ...mockPayment,
        booking: {
          ...mockPayment.booking,
          eventDate: futureEventDate,
        },
      });
      (stripePayments.createRefund as jest.Mock).mockResolvedValue({
        id: "re_test123",
        amount: 2000,
      });
      (prisma.payment.update as jest.Mock).mockResolvedValue({
        ...mockPayment,
        status: PaymentStatus.REFUNDED,
      });
      (prisma.booking.update as jest.Mock).mockResolvedValue({});

      await processRefund("payment-123", {
        reason: "Cancellation",
      });

      // Should refund 100% for 10 days before event
      expect(stripePayments.createRefund).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 2000,
        })
      );
    });

    it("should throw error if payment not found", async () => {
      (prisma.payment.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        processRefund("nonexistent", { amount: 1000 })
      ).rejects.toThrow(PaymentError);
      await expect(
        processRefund("nonexistent", { amount: 1000 })
      ).rejects.toThrow("Payment not found");
    });

    it("should throw error if payment cannot be refunded", async () => {
      (prisma.payment.findUnique as jest.Mock).mockResolvedValue({
        ...mockPayment,
        status: PaymentStatus.PENDING,
      });

      await expect(
        processRefund("payment-123", { amount: 1000 })
      ).rejects.toThrow(PaymentError);
      await expect(
        processRefund("payment-123", { amount: 1000 })
      ).rejects.toThrow("Payment cannot be refunded in current status");
    });

    it("should throw error if refund amount exceeds payment amount", async () => {
      (prisma.payment.findUnique as jest.Mock).mockResolvedValue(mockPayment);

      await expect(
        processRefund("payment-123", { amount: 3000 })
      ).rejects.toThrow(PaymentError);
      await expect(
        processRefund("payment-123", { amount: 3000 })
      ).rejects.toThrow("Refund amount cannot exceed payment amount");
    });

    it("should update booking status to REFUNDED", async () => {
      (prisma.payment.findUnique as jest.Mock).mockResolvedValue(mockPayment);
      (stripePayments.createRefund as jest.Mock).mockResolvedValue({
        id: "re_test123",
      });
      (prisma.payment.update as jest.Mock).mockResolvedValue({
        ...mockPayment,
        status: PaymentStatus.REFUNDED,
      });
      (prisma.booking.update as jest.Mock).mockResolvedValue({});

      await processRefund("payment-123", { amount: 1000 });

      expect(prisma.booking.update).toHaveBeenCalledWith({
        where: { id: "booking-123" },
        data: {
          status: BookingStatus.REFUNDED,
          refundAmount: 1000,
        },
      });
    });
  });
});
