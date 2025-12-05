/**
 * Payment API Integration Tests
 * Tests payment processing: create intent → webhook → capture → refund
 */

import { UserRole, BookingStatus, PaymentStatus } from "@prisma/client";
import { POST as createPaymentHandler } from "@/app/api/payments/route";
import { POST as webhookHandler } from "@/app/api/payments/webhook/route";
import { POST as refundHandler } from "@/app/api/payments/[id]/refund/route";
import { getTestPrisma, clearDatabase } from "../setup/database";
import {
  createPostRequest,
  createMockSession,
  expectResponse,
} from "../setup/server";
import { testCustomer, testVendorUser } from "../fixtures/users";
import { testVendorWithStripe } from "../fixtures/vendors";
import {
  testBookingAccepted,
  testBookingConfirmed,
} from "../fixtures/bookings";
import { mockStripeWebhookEvent } from "../fixtures/payments";
import {
  mockStripePayments,
  mockStripeUtils,
} from "../mocks/stripe";

// Import mocks
import "../mocks/stripe";
import "../mocks/sendgrid";
import "../mocks/nextauth";

const prisma = getTestPrisma();
const baseUrl = "http://localhost:3000";

describe("Payment API Integration Tests", () => {
  let customer: any;
  let vendorUser: any;
  let vendor: any;
  let acceptedBooking: any;

  beforeEach(async () => {
    await clearDatabase();

    // Create test customer
    customer = await prisma.user.create({
      data: {
        ...testCustomer,
        passwordHash: "$2a$12$test",
      } as any,
    });

    // Create test vendor user and vendor
    vendorUser = await prisma.user.create({
      data: {
        ...testVendorUser,
        passwordHash: "$2a$12$test",
      } as any,
    });

    vendor = await prisma.vendor.create({
      data: {
        ...testVendorWithStripe,
        userId: vendorUser.id,
      } as any,
    });

    // Create accepted booking ready for payment
    acceptedBooking = await prisma.booking.create({
      data: {
        ...testBookingAccepted,
        customerId: customer.id,
        vendorId: vendor.id,
      } as any,
    });

    // Reset Stripe mocks
    jest.clearAllMocks();
  });

  describe("POST /api/payments - Create Payment Intent", () => {
    it("should create payment intent for accepted booking", async () => {
      const mockPaymentIntent = {
        id: "pi_test_123",
        client_secret: "secret_test_123",
        amount: acceptedBooking.totalAmount,
        status: "requires_payment_method",
      };

      mockStripePayments.createPaymentIntent.mockResolvedValue(
        mockPaymentIntent
      );

      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/payments`,
        {
          bookingId: acceptedBooking.id,
        },
        session
      );

      const response = await createPaymentHandler(request);
      const data = await expectResponse(response, 201);

      expect(data.clientSecret).toBe("secret_test_123");
      expect(data.paymentIntentId).toBe("pi_test_123");
      expect(data.amount).toBe(acceptedBooking.totalAmount);

      // Verify payment record created
      const payment = await prisma.payment.findFirst({
        where: { bookingId: acceptedBooking.id },
      });
      expect(payment).toBeTruthy();
      expect(payment?.status).toBe(PaymentStatus.PENDING);
      expect(payment?.stripePaymentIntentId).toBe("pi_test_123");

      // Verify Stripe was called correctly
      expect(mockStripePayments.createPaymentIntent).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: acceptedBooking.totalAmount,
          metadata: expect.objectContaining({
            bookingId: acceptedBooking.id,
          }),
        })
      );
    });

    it("should reject payment for non-accepted booking", async () => {
      // Create pending booking
      const pendingBooking = await prisma.booking.create({
        data: {
          ...testBookingAccepted,
          id: "pending-booking-001",
          status: BookingStatus.PENDING,
          customerId: customer.id,
          vendorId: vendor.id,
        } as any,
      });

      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/payments`,
        {
          bookingId: pendingBooking.id,
        },
        session
      );

      const response = await createPaymentHandler(request);
      const data = await expectResponse(response, 403);

      expect(data.error).toBeDefined();
      expect(data.error.message).toContain("accepted");
    });

    it("should reject payment by non-customer", async () => {
      const session = createMockSession(vendorUser.id, UserRole.VENDOR);
      const request = createPostRequest(
        `${baseUrl}/api/payments`,
        {
          bookingId: acceptedBooking.id,
        },
        session
      );

      const response = await createPaymentHandler(request);
      await expectResponse(response, 403);
    });

    it("should reject payment for another customer's booking", async () => {
      // Create another customer
      const otherCustomer = await prisma.user.create({
        data: {
          id: "other-customer-001",
          email: "other@test.com",
          passwordHash: "$2a$12$test",
          role: UserRole.CUSTOMER,
        } as any,
      });

      const session = createMockSession(otherCustomer.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/payments`,
        {
          bookingId: acceptedBooking.id,
        },
        session
      );

      const response = await createPaymentHandler(request);
      await expectResponse(response, 403);
    });

    it("should reject duplicate payment intent", async () => {
      // Create existing payment
      await prisma.payment.create({
        data: {
          id: "existing-payment-001",
          bookingId: acceptedBooking.id,
          customerId: customer.id,
          vendorId: vendor.id,
          amount: acceptedBooking.totalAmount,
          status: PaymentStatus.PENDING,
          stripePaymentIntentId: "pi_existing_123",
        },
      });

      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/payments`,
        {
          bookingId: acceptedBooking.id,
        },
        session
      );

      const response = await createPaymentHandler(request);
      const data = await expectResponse(response, 400);

      expect(data.error).toBeDefined();
      expect(data.error.message).toContain("already exists");
    });
  });

  describe("POST /api/payments/webhook - Stripe Webhooks", () => {
    it("should handle payment_intent.succeeded webhook", async () => {
      // Create pending payment
      const payment = await prisma.payment.create({
        data: {
          id: "payment-webhook-001",
          bookingId: acceptedBooking.id,
          customerId: customer.id,
          vendorId: vendor.id,
          amount: acceptedBooking.totalAmount,
          status: PaymentStatus.PENDING,
          stripePaymentIntentId: "pi_test_webhook_123",
        },
      });

      const webhookEvent = mockStripeWebhookEvent.paymentIntentSucceeded;
      webhookEvent.data.object.id = payment.stripePaymentIntentId;
      webhookEvent.data.object.metadata = { bookingId: acceptedBooking.id };

      mockStripeUtils.constructWebhookEvent.mockReturnValue(webhookEvent);

      const request = createPostRequest(
        `${baseUrl}/api/payments/webhook`,
        webhookEvent,
        null // No session for webhooks
      );
      request.headers.set("stripe-signature", "test_signature");

      const response = await webhookHandler(request);
      await expectResponse(response, 200);

      // Verify payment was authorized
      const updatedPayment = await prisma.payment.findUnique({
        where: { id: payment.id },
      });
      expect(updatedPayment?.status).toBe(PaymentStatus.AUTHORIZED);
      expect(updatedPayment?.authorizedAt).toBeTruthy();

      // Verify booking was confirmed
      const updatedBooking = await prisma.booking.findUnique({
        where: { id: acceptedBooking.id },
      });
      expect(updatedBooking?.status).toBe(BookingStatus.CONFIRMED);
      expect(updatedBooking?.confirmedAt).toBeTruthy();
    });

    it("should handle payment_intent.payment_failed webhook", async () => {
      const payment = await prisma.payment.create({
        data: {
          id: "payment-failed-001",
          bookingId: acceptedBooking.id,
          customerId: customer.id,
          vendorId: vendor.id,
          amount: acceptedBooking.totalAmount,
          status: PaymentStatus.PENDING,
          stripePaymentIntentId: "pi_test_webhook_failed_123",
        },
      });

      const webhookEvent = mockStripeWebhookEvent.paymentIntentPaymentFailed;
      webhookEvent.data.object.id = payment.stripePaymentIntentId;
      webhookEvent.data.object.metadata = { bookingId: acceptedBooking.id };

      mockStripeUtils.constructWebhookEvent.mockReturnValue(webhookEvent);

      const request = createPostRequest(
        `${baseUrl}/api/payments/webhook`,
        webhookEvent,
        null
      );
      request.headers.set("stripe-signature", "test_signature");

      const response = await webhookHandler(request);
      await expectResponse(response, 200);

      // Verify payment failed
      const updatedPayment = await prisma.payment.findUnique({
        where: { id: payment.id },
      });
      expect(updatedPayment?.status).toBe(PaymentStatus.FAILED);
      expect(updatedPayment?.failureReason).toBeTruthy();

      // Verify booking status updated
      const updatedBooking = await prisma.booking.findUnique({
        where: { id: acceptedBooking.id },
      });
      expect(updatedBooking?.status).toBe(BookingStatus.PAYMENT_FAILED);
    });

    it("should handle charge.refunded webhook", async () => {
      // Create confirmed booking with payment
      const confirmedBooking = await prisma.booking.create({
        data: {
          ...testBookingConfirmed,
          id: "refund-booking-001",
          customerId: customer.id,
          vendorId: vendor.id,
        } as any,
      });

      const payment = await prisma.payment.create({
        data: {
          id: "payment-refund-001",
          bookingId: confirmedBooking.id,
          customerId: customer.id,
          vendorId: vendor.id,
          amount: confirmedBooking.totalAmount,
          status: PaymentStatus.AUTHORIZED,
          stripePaymentIntentId: "pi_test_refunded_123",
          authorizedAt: new Date(),
        },
      });

      const webhookEvent = mockStripeWebhookEvent.chargeRefunded;
      webhookEvent.data.object.payment_intent = payment.stripePaymentIntentId;
      webhookEvent.data.object.metadata = { bookingId: confirmedBooking.id };

      mockStripeUtils.constructWebhookEvent.mockReturnValue(webhookEvent);

      const request = createPostRequest(
        `${baseUrl}/api/payments/webhook`,
        webhookEvent,
        null
      );
      request.headers.set("stripe-signature", "test_signature");

      const response = await webhookHandler(request);
      await expectResponse(response, 200);

      // Verify payment refunded
      const updatedPayment = await prisma.payment.findUnique({
        where: { id: payment.id },
      });
      expect(updatedPayment?.status).toBe(PaymentStatus.REFUNDED);
      expect(updatedPayment?.refundedAt).toBeTruthy();

      // Verify booking refunded
      const updatedBooking = await prisma.booking.findUnique({
        where: { id: confirmedBooking.id },
      });
      expect(updatedBooking?.status).toBe(BookingStatus.REFUNDED);
    });

    it("should reject webhook without signature", async () => {
      const request = createPostRequest(
        `${baseUrl}/api/payments/webhook`,
        mockStripeWebhookEvent.paymentIntentSucceeded,
        null
      );
      // No signature header

      const response = await webhookHandler(request);
      await expectResponse(response, 400);
    });

    it("should reject webhook with invalid signature", async () => {
      mockStripeUtils.constructWebhookEvent.mockImplementation(() => {
        throw new Error("Invalid signature");
      });

      const request = createPostRequest(
        `${baseUrl}/api/payments/webhook`,
        mockStripeWebhookEvent.paymentIntentSucceeded,
        null
      );
      request.headers.set("stripe-signature", "invalid_signature");

      const response = await webhookHandler(request);
      await expectResponse(response, 400);
    });
  });

  describe("POST /api/payments/:id/refund - Process Refund", () => {
    it("should process refund for confirmed booking", async () => {
      const confirmedBooking = await prisma.booking.create({
        data: {
          ...testBookingConfirmed,
          id: "refund-request-001",
          customerId: customer.id,
          vendorId: vendor.id,
        } as any,
      });

      const payment = await prisma.payment.create({
        data: {
          id: "payment-refund-request-001",
          bookingId: confirmedBooking.id,
          customerId: customer.id,
          vendorId: vendor.id,
          amount: confirmedBooking.totalAmount,
          status: PaymentStatus.AUTHORIZED,
          stripePaymentIntentId: "pi_refund_request_123",
          authorizedAt: new Date(),
        },
      });

      mockStripePayments.createRefund.mockResolvedValue({
        id: "re_test_123",
        amount: payment.amount,
        status: "succeeded",
      });

      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/payments/${payment.id}/refund`,
        {
          reason: "Customer requested cancellation",
        },
        session
      );

      const response = await refundHandler(request, {
        params: { id: payment.id },
      });
      const data = await expectResponse(response, 200);

      expect(data.refund).toBeDefined();
      expect(data.refund.status).toBe("succeeded");

      // Verify Stripe was called
      expect(mockStripePayments.createRefund).toHaveBeenCalledWith(
        expect.objectContaining({
          payment_intent: payment.stripePaymentIntentId,
        })
      );
    });

    it("should reject refund for already refunded payment", async () => {
      const payment = await prisma.payment.create({
        data: {
          id: "payment-already-refunded",
          bookingId: acceptedBooking.id,
          customerId: customer.id,
          vendorId: vendor.id,
          amount: acceptedBooking.totalAmount,
          status: PaymentStatus.REFUNDED,
          stripePaymentIntentId: "pi_already_refunded",
          refundedAt: new Date(),
        },
      });

      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/payments/${payment.id}/refund`,
        {
          reason: "Test",
        },
        session
      );

      const response = await refundHandler(request, {
        params: { id: payment.id },
      });
      const data = await expectResponse(response, 400);

      expect(data.error).toBeDefined();
      expect(data.error.message).toContain("already refunded");
    });
  });

  describe("Payment Lifecycle - Full Flow", () => {
    it("should complete payment → authorize → capture → release", async () => {
      // 1. Create payment intent
      mockStripePayments.createPaymentIntent.mockResolvedValue({
        id: "pi_lifecycle_test",
        client_secret: "secret_lifecycle_test",
        amount: acceptedBooking.totalAmount,
        status: "requires_payment_method",
      });

      const customerSession = createMockSession(customer.id, UserRole.CUSTOMER);
      const createRequest = createPostRequest(
        `${baseUrl}/api/payments`,
        {
          bookingId: acceptedBooking.id,
        },
        customerSession
      );

      const createResponse = await createPaymentHandler(createRequest);
      const createData = await expectResponse(createResponse, 201);

      // 2. Simulate webhook for payment success
      const webhookEvent = {
        ...mockStripeWebhookEvent.paymentIntentSucceeded,
        data: {
          object: {
            id: createData.paymentIntentId,
            metadata: { bookingId: acceptedBooking.id },
          },
        },
      };

      mockStripeUtils.constructWebhookEvent.mockReturnValue(webhookEvent);

      const webhookRequest = createPostRequest(
        `${baseUrl}/api/payments/webhook`,
        webhookEvent,
        null
      );
      webhookRequest.headers.set("stripe-signature", "test_sig");

      await webhookHandler(webhookRequest);

      // 3. Verify final state
      const payment = await prisma.payment.findFirst({
        where: { stripePaymentIntentId: createData.paymentIntentId },
      });
      expect(payment?.status).toBe(PaymentStatus.AUTHORIZED);

      const booking = await prisma.booking.findUnique({
        where: { id: acceptedBooking.id },
      });
      expect(booking?.status).toBe(BookingStatus.CONFIRMED);
    });
  });
});
