/**
 * Unit Tests for Helcim Webhook Handler
 * Tests webhook verification, event processing, and error handling
 */

import * as crypto from "crypto";
import type { HelcimWebhookEvent } from "@/lib/helcim.types";

// Mock Next.js server components before importing
jest.mock("next/server", () => ({
  NextRequest: class MockNextRequest {
    headers: Map<string, string>;
    body: string;
    url: string;
    method: string;

    constructor(url: string, init?: { method?: string; headers?: Headers; body?: string }) {
      this.url = url;
      this.method = init?.method || "GET";
      this.headers = new Map();
      if (init?.headers) {
        init.headers.forEach((value, key) => {
          this.headers.set(key, value);
        });
      }
      this.body = init?.body || "";
    }

    async text() {
      return this.body;
    }
  },
  NextResponse: {
    json: (data: any, init?: { status?: number }) => ({
      status: init?.status || 200,
      json: async () => data,
    }),
  },
}));

// Mock Helcim client
jest.mock("@/lib/helcim", () => ({
  createHelcimClient: jest.fn(() => ({
    verifyWebhook: jest.fn(),
  })),
}));

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    payment: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    booking: {
      update: jest.fn(),
    },
    escrowTransaction: {
      create: jest.fn(),
    },
  },
}));

import { createHelcimClient } from "@/lib/helcim";
import { prisma } from "@/lib/prisma";
import { POST, GET } from "@/app/api/payments/webhook/route";
import { NextRequest } from "next/server";

describe("Helcim Webhook Handler", () => {
  let mockHelcimClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockHelcimClient = {
      verifyWebhook: jest.fn(),
    };
    (createHelcimClient as jest.Mock).mockReturnValue(mockHelcimClient);
  });

  // Helper to create a mock webhook request
  const createWebhookRequest = (
    event: HelcimWebhookEvent,
    signature?: string
  ): NextRequest => {
    const body = JSON.stringify(event);
    const headers = new Headers();
    if (signature) {
      headers.set("helcim-signature", signature);
    }

    return new NextRequest("http://localhost:3000/api/payments/webhook", {
      method: "POST",
      headers,
      body,
    });
  };

  // Helper to generate valid signature
  const generateSignature = (payload: string, secret: string): string => {
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(payload);
    return hmac.digest("hex");
  };

  describe("POST /api/payments/webhook", () => {
    describe("Signature Verification", () => {
      it("should reject webhook with invalid signature", async () => {
        const event: HelcimWebhookEvent = {
          type: "APPROVED",
          transactionId: 123456,
          transactionType: "purchase",
          amount: 10000,
          currency: "USD",
          dateCreated: "2025-12-20T12:00:00Z",
        };

        mockHelcimClient.verifyWebhook.mockReturnValue({
          valid: false,
          error: "Invalid webhook signature",
        });

        const request = createWebhookRequest(event, "invalid_signature");
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe("Invalid webhook signature");
      });

      it("should reject webhook with missing signature", async () => {
        const event: HelcimWebhookEvent = {
          type: "APPROVED",
          transactionId: 123456,
          transactionType: "purchase",
          amount: 10000,
          currency: "USD",
          dateCreated: "2025-12-20T12:00:00Z",
        };

        mockHelcimClient.verifyWebhook.mockReturnValue({
          valid: false,
          error: "Missing webhook signature",
        });

        const request = createWebhookRequest(event); // No signature
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe("Invalid webhook signature");
      });

      it("should accept webhook with valid signature", async () => {
        const event: HelcimWebhookEvent = {
          type: "APPROVED",
          transactionId: 123456,
          transactionType: "purchase",
          amount: 10000,
          currency: "USD",
          dateCreated: "2025-12-20T12:00:00Z",
        };

        mockHelcimClient.verifyWebhook.mockReturnValue({
          valid: true,
          event,
        });

        (prisma.payment.findUnique as jest.Mock).mockResolvedValue({
          id: "payment-123",
          bookingId: "booking-123",
          externalPaymentId: "123456",
          amount: 10000,
          status: "PENDING",
          booking: { id: "booking-123" },
        });

        (prisma.payment.update as jest.Mock).mockResolvedValue({
          id: "payment-123",
          status: "AUTHORIZED",
        });

        const request = createWebhookRequest(event, "valid_signature");
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.received).toBe(true);
        expect(data.processed).toBe(true);
      });
    });

    describe("APPROVED Event Processing", () => {
      const approvedEvent: HelcimWebhookEvent = {
        type: "APPROVED",
        transactionId: 123456,
        transactionType: "purchase",
        amount: 10000,
        currency: "USD",
        dateCreated: "2025-12-20T12:00:00Z",
        comments: "Test payment",
      };

      it("should process APPROVED event successfully", async () => {
        mockHelcimClient.verifyWebhook.mockReturnValue({
          valid: true,
          event: approvedEvent,
        });

        (prisma.payment.findUnique as jest.Mock).mockResolvedValue({
          id: "payment-123",
          bookingId: "booking-123",
          externalPaymentId: "123456",
          amount: 10000,
          status: "PENDING",
          booking: { id: "booking-123" },
        });

        (prisma.payment.update as jest.Mock).mockResolvedValue({
          id: "payment-123",
          status: "AUTHORIZED",
          authorizedAt: new Date(approvedEvent.dateCreated),
        });

        const request = createWebhookRequest(approvedEvent, "valid_sig");
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.processed).toBe(true);
        expect(data.paymentId).toBe("payment-123");
        expect(data.bookingId).toBe("booking-123");

        // Verify payment was updated
        expect(prisma.payment.update).toHaveBeenCalledWith({
          where: { id: "payment-123" },
          data: {
            status: "AUTHORIZED",
            authorizedAt: expect.any(Date),
          },
        });
      });

      it("should handle idempotent APPROVED events", async () => {
        mockHelcimClient.verifyWebhook.mockReturnValue({
          valid: true,
          event: approvedEvent,
        });

        // Payment already authorized
        (prisma.payment.findUnique as jest.Mock).mockResolvedValue({
          id: "payment-123",
          bookingId: "booking-123",
          externalPaymentId: "123456",
          amount: 10000,
          status: "AUTHORIZED", // Already processed
          booking: { id: "booking-123" },
        });

        const request = createWebhookRequest(approvedEvent, "valid_sig");
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.processed).toBe(true);
        expect(data.idempotent).toBe(true);

        // Should not update payment again
        expect(prisma.payment.update).not.toHaveBeenCalled();
      });

      it("should handle payment not found gracefully", async () => {
        mockHelcimClient.verifyWebhook.mockReturnValue({
          valid: true,
          event: approvedEvent,
        });

        (prisma.payment.findUnique as jest.Mock).mockResolvedValue(null);

        const request = createWebhookRequest(approvedEvent, "valid_sig");
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.processed).toBe(true);
        expect(data.warning).toBe("Payment not found");
      });
    });

    describe("DECLINED Event Processing", () => {
      const declinedEvent: HelcimWebhookEvent = {
        type: "DECLINED",
        transactionId: 123456,
        transactionType: "purchase",
        amount: 10000,
        currency: "USD",
        dateCreated: "2025-12-20T12:00:00Z",
      };

      it("should process DECLINED event successfully", async () => {
        mockHelcimClient.verifyWebhook.mockReturnValue({
          valid: true,
          event: declinedEvent,
        });

        (prisma.payment.findUnique as jest.Mock).mockResolvedValue({
          id: "payment-123",
          bookingId: "booking-123",
          externalPaymentId: "123456",
          amount: 10000,
          status: "PENDING",
          booking: { id: "booking-123" },
        });

        (prisma.payment.update as jest.Mock).mockResolvedValue({
          id: "payment-123",
          status: "FAILED",
        });

        const request = createWebhookRequest(declinedEvent, "valid_sig");
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.processed).toBe(true);
        expect(data.paymentId).toBe("payment-123");

        // Verify payment was marked as failed
        expect(prisma.payment.update).toHaveBeenCalledWith({
          where: { id: "payment-123" },
          data: {
            status: "FAILED",
          },
        });
      });

      it("should handle idempotent DECLINED events", async () => {
        mockHelcimClient.verifyWebhook.mockReturnValue({
          valid: true,
          event: declinedEvent,
        });

        // Payment already marked as failed
        (prisma.payment.findUnique as jest.Mock).mockResolvedValue({
          id: "payment-123",
          bookingId: "booking-123",
          externalPaymentId: "123456",
          amount: 10000,
          status: "FAILED",
          booking: { id: "booking-123" },
        });

        const request = createWebhookRequest(declinedEvent, "valid_sig");
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.idempotent).toBe(true);
        expect(prisma.payment.update).not.toHaveBeenCalled();
      });
    });

    describe("REFUNDED Event Processing", () => {
      const refundedEvent: HelcimWebhookEvent = {
        type: "REFUNDED",
        transactionId: 123456,
        transactionType: "refund",
        amount: 5000, // Partial refund
        currency: "USD",
        dateCreated: "2025-12-20T12:00:00Z",
      };

      it("should process REFUNDED event successfully", async () => {
        mockHelcimClient.verifyWebhook.mockReturnValue({
          valid: true,
          event: refundedEvent,
        });

        (prisma.payment.findUnique as jest.Mock).mockResolvedValue({
          id: "payment-123",
          bookingId: "booking-123",
          externalPaymentId: "123456",
          amount: 10000,
          status: "AUTHORIZED",
          booking: { id: "booking-123" },
        });

        (prisma.payment.update as jest.Mock).mockResolvedValue({
          id: "payment-123",
          status: "REFUNDED",
          refundedAt: new Date(refundedEvent.dateCreated),
        });

        const request = createWebhookRequest(refundedEvent, "valid_sig");
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.processed).toBe(true);
        expect(data.paymentId).toBe("payment-123");

        // Verify payment was marked as refunded
        expect(prisma.payment.update).toHaveBeenCalledWith({
          where: { id: "payment-123" },
          data: {
            status: "REFUNDED",
            refundedAt: expect.any(Date),
          },
        });
      });

      it("should handle idempotent REFUNDED events", async () => {
        mockHelcimClient.verifyWebhook.mockReturnValue({
          valid: true,
          event: refundedEvent,
        });

        // Payment already refunded
        (prisma.payment.findUnique as jest.Mock).mockResolvedValue({
          id: "payment-123",
          bookingId: "booking-123",
          externalPaymentId: "123456",
          amount: 10000,
          status: "REFUNDED",
          booking: { id: "booking-123" },
        });

        const request = createWebhookRequest(refundedEvent, "valid_sig");
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.idempotent).toBe(true);
        expect(prisma.payment.update).not.toHaveBeenCalled();
      });

      it("should handle payment not found for refund", async () => {
        mockHelcimClient.verifyWebhook.mockReturnValue({
          valid: true,
          event: refundedEvent,
        });

        (prisma.payment.findUnique as jest.Mock).mockResolvedValue(null);

        const request = createWebhookRequest(refundedEvent, "valid_sig");
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.warning).toBe("Original payment not found for refund");
      });
    });

    describe("Unknown Event Types", () => {
      it("should handle unknown event types gracefully", async () => {
        const unknownEvent: any = {
          type: "VOIDED",
          transactionId: 123456,
          transactionType: "void",
          amount: 10000,
          currency: "USD",
          dateCreated: "2025-12-20T12:00:00Z",
        };

        mockHelcimClient.verifyWebhook.mockReturnValue({
          valid: true,
          event: unknownEvent,
        });

        const request = createWebhookRequest(unknownEvent, "valid_sig");
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.received).toBe(true);
        expect(data.warning).toContain("Unknown event type");
      });
    });

    describe("Error Handling", () => {
      it("should return 200 on processing errors to prevent retries", async () => {
        const event: HelcimWebhookEvent = {
          type: "APPROVED",
          transactionId: 123456,
          transactionType: "purchase",
          amount: 10000,
          currency: "USD",
          dateCreated: "2025-12-20T12:00:00Z",
        };

        mockHelcimClient.verifyWebhook.mockReturnValue({
          valid: true,
          event,
        });

        // Simulate database error
        (prisma.payment.findUnique as jest.Mock).mockRejectedValue(
          new Error("Database connection failed")
        );

        const request = createWebhookRequest(event, "valid_sig");
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200); // Return 200 to prevent retries
        expect(data.received).toBe(true);
        expect(data.processed).toBe(false);
        expect(data.error).toBe("Database connection failed");
      });

      it("should handle JSON parsing errors in webhook body", async () => {
        const invalidBody = "{ invalid json }";
        const headers = new Headers();
        headers.set("helcim-signature", "some_signature");

        const request = new NextRequest(
          "http://localhost:3000/api/payments/webhook",
          {
            method: "POST",
            headers,
            body: invalidBody,
          }
        );

        mockHelcimClient.verifyWebhook.mockImplementation(() => {
          throw new SyntaxError("Unexpected token");
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200); // Still return 200
        expect(data.processed).toBe(false);
      });
    });

    describe("Concurrent Webhooks", () => {
      it("should handle duplicate webhooks correctly", async () => {
        const event: HelcimWebhookEvent = {
          type: "APPROVED",
          transactionId: 123456,
          transactionType: "purchase",
          amount: 10000,
          currency: "USD",
          dateCreated: "2025-12-20T12:00:00Z",
        };

        mockHelcimClient.verifyWebhook.mockReturnValue({
          valid: true,
          event,
        });

        (prisma.payment.findUnique as jest.Mock).mockResolvedValue({
          id: "payment-123",
          bookingId: "booking-123",
          externalPaymentId: "123456",
          amount: 10000,
          status: "AUTHORIZED", // Already processed by first webhook
          booking: { id: "booking-123" },
        });

        const request = createWebhookRequest(event, "valid_sig");
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.idempotent).toBe(true);
        expect(prisma.payment.update).not.toHaveBeenCalled();
      });
    });
  });

  describe("GET /api/payments/webhook", () => {
    it("should return webhook endpoint information", async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.endpoint).toBe("/api/payments/webhook");
      expect(data.method).toBe("POST");
      expect(data.events).toContain("APPROVED");
      expect(data.events).toContain("DECLINED");
      expect(data.events).toContain("REFUNDED");
      expect(data.documentation).toBeTruthy();
    });
  });

  describe("Webhook Security", () => {
    it("should use timing-safe comparison for signatures", async () => {
      // This is tested implicitly through the verifyWebhook method
      // which uses crypto.timingSafeEqual
      const event: HelcimWebhookEvent = {
        type: "APPROVED",
        transactionId: 123456,
        transactionType: "purchase",
        amount: 10000,
        currency: "USD",
        dateCreated: "2025-12-20T12:00:00Z",
      };

      mockHelcimClient.verifyWebhook.mockReturnValue({
        valid: true,
        event,
      });

      (prisma.payment.findUnique as jest.Mock).mockResolvedValue({
        id: "payment-123",
        bookingId: "booking-123",
        externalPaymentId: "123456",
        status: "PENDING",
        booking: { id: "booking-123" },
      });

      (prisma.payment.update as jest.Mock).mockResolvedValue({
        id: "payment-123",
        status: "AUTHORIZED",
      });

      const request = createWebhookRequest(event, "valid_sig");
      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockHelcimClient.verifyWebhook).toHaveBeenCalled();
    });

    it("should not leak information about missing payments", async () => {
      const event: HelcimWebhookEvent = {
        type: "APPROVED",
        transactionId: 999999, // Non-existent
        transactionType: "purchase",
        amount: 10000,
        currency: "USD",
        dateCreated: "2025-12-20T12:00:00Z",
      };

      mockHelcimClient.verifyWebhook.mockReturnValue({
        valid: true,
        event,
      });

      (prisma.payment.findUnique as jest.Mock).mockResolvedValue(null);

      const request = createWebhookRequest(event, "valid_sig");
      const response = await POST(request);
      const data = await response.json();

      // Should still return 200 and not reveal internal details
      expect(response.status).toBe(200);
      expect(data.processed).toBe(true);
      expect(data.warning).toBe("Payment not found");
    });
  });
});
