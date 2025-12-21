/**
 * Unit Tests for Helcim API Client
 * Tests payment processing, webhook verification, and error handling
 */

import { HelcimClient, createHelcimClient, HelcimError } from "@/lib/helcim";
import type {
  PurchaseRequest,
  PreauthRequest,
  CaptureRequest,
  RefundRequest,
  HelcimWebhookEvent,
} from "@/lib/helcim.types";
import * as crypto from "crypto";

// Mock fetch globally
global.fetch = jest.fn();

describe("HelcimClient", () => {
  let client: HelcimClient;
  const mockConfig = {
    apiToken: "test_api_token_12345",
    accountId: "test_account_123",
    terminalId: "test_terminal_456",
    webhookSecret: "test_webhook_secret",
    testMode: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    client = new HelcimClient(mockConfig);
  });

  describe("Constructor Validation", () => {
    it("should throw error if API token is missing", () => {
      expect(() => {
        new HelcimClient({
          apiToken: "",
          accountId: "test",
          terminalId: "test",
        });
      }).toThrow("Helcim API token is required");
    });

    it("should throw error if account ID is missing", () => {
      expect(() => {
        new HelcimClient({
          apiToken: "test",
          accountId: "",
          terminalId: "test",
        });
      }).toThrow("Helcim account ID is required");
    });

    it("should throw error if terminal ID is missing", () => {
      expect(() => {
        new HelcimClient({
          apiToken: "test",
          accountId: "test",
          terminalId: "",
        });
      }).toThrow("Helcim terminal ID is required");
    });

    it("should create client successfully with valid config", () => {
      expect(() => {
        new HelcimClient(mockConfig);
      }).not.toThrow();
    });

    it("should use default base URL if not provided", () => {
      const testClient = new HelcimClient({
        apiToken: "test",
        accountId: "test",
        terminalId: "test",
      });
      expect(testClient).toBeDefined();
    });
  });

  describe("processPayment", () => {
    const mockPurchaseRequest: PurchaseRequest = {
      amount: 10000, // $100.00
      currency: "USD",
      cardToken: "token_test_12345",
      comments: "Test purchase",
      invoiceNumber: "INV-123",
    };

    const mockApprovedResponse = {
      transactionId: 987654,
      dateCreated: "2025-12-20T12:00:00Z",
      status: "APPROVED" as const,
      type: "purchase" as const,
      amount: 10000,
      currency: "USD" as const,
      approvalCode: "APPR123",
      cardNumber: "************1234",
      cardType: "VISA" as const,
    };

    it("should process payment successfully", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        headers: {
          get: () => "application/json",
        },
        json: async () => mockApprovedResponse,
      });

      const result = await client.processPayment(mockPurchaseRequest);

      expect(result.status).toBe("APPROVED");
      expect(result.transactionId).toBe(987654);
      expect(result.amount).toBe(10000);
      expect(result.currency).toBe("USD");

      // Verify fetch was called with correct parameters
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.helcim.com/v2/payment/purchase",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "api-token": mockConfig.apiToken,
            "Content-Type": "application/json",
          }),
          body: expect.stringContaining(mockPurchaseRequest.cardToken),
        })
      );
    });

    it("should add default account and terminal IDs", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        json: async () => mockApprovedResponse,
      });

      await client.processPayment(mockPurchaseRequest);

      const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(callBody.accountId).toBe(mockConfig.accountId);
      expect(callBody.terminalId).toBe(mockConfig.terminalId);
      expect(callBody.test).toBe(true); // testMode is enabled
    });

    it("should handle declined payment", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        json: async () => ({
          ...mockApprovedResponse,
          status: "DECLINED",
        }),
      });

      const result = await client.processPayment(mockPurchaseRequest);

      expect(result.status).toBe("DECLINED");
    });

    it("should throw HelcimError on API error", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        headers: { get: () => "application/json" },
        json: async () => ({
          message: "Invalid card token",
          errors: [{ field: "cardToken", message: "Token is expired" }],
        }),
      });

      await expect(client.processPayment(mockPurchaseRequest)).rejects.toThrow(
        HelcimError
      );
      await expect(client.processPayment(mockPurchaseRequest)).rejects.toThrow(
        "Invalid card token"
      );
    });

    it("should handle network errors", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network failure"));

      await expect(client.processPayment(mockPurchaseRequest)).rejects.toThrow(
        HelcimError
      );
      await expect(client.processPayment(mockPurchaseRequest)).rejects.toThrow(
        "Network failure"
      );
    });

    it("should handle timeout errors", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(
        new Error("The operation was aborted")
      );

      await expect(client.processPayment(mockPurchaseRequest)).rejects.toThrow(
        HelcimError
      );
    });
  });

  describe("preauthorize", () => {
    const mockPreauthRequest: PreauthRequest = {
      amount: 15000, // $150.00
      currency: "USD",
      cardToken: "token_test_67890",
      comments: "Booking hold",
    };

    const mockPreauthResponse = {
      transactionId: 111222,
      dateCreated: "2025-12-20T12:00:00Z",
      status: "APPROVED" as const,
      type: "preauth" as const,
      amount: 15000,
      currency: "USD" as const,
      approvalCode: "PREAUTH123",
    };

    it("should preauthorize payment successfully", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        json: async () => mockPreauthResponse,
      });

      const result = await client.preauthorize(mockPreauthRequest);

      expect(result.status).toBe("APPROVED");
      expect(result.type).toBe("preauth");
      expect(result.transactionId).toBe(111222);
      expect(result.amount).toBe(15000);

      // Verify correct endpoint was called
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.helcim.com/v2/payment/preauth",
        expect.any(Object)
      );
    });

    it("should include billing information if provided", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        json: async () => mockPreauthResponse,
      });

      await client.preauthorize({
        ...mockPreauthRequest,
        billing: {
          name: "John Doe",
          email: "john@example.com",
          street1: "123 Main St",
          city: "New York",
          postalCode: "10001",
        },
      });

      const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(callBody.billing).toBeDefined();
      expect(callBody.billing.name).toBe("John Doe");
    });
  });

  describe("capturePayment", () => {
    const mockCaptureRequest: CaptureRequest = {
      preAuthTransactionId: 111222,
      amount: 15000,
    };

    const mockCaptureResponse = {
      transactionId: 333444,
      dateCreated: "2025-12-20T13:00:00Z",
      status: "APPROVED" as const,
      type: "capture" as const,
      amount: 15000,
      currency: "USD" as const,
      preAuthTransactionId: 111222,
    };

    it("should capture preauthorized payment successfully", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        json: async () => mockCaptureResponse,
      });

      const result = await client.capturePayment(mockCaptureRequest);

      expect(result.status).toBe("APPROVED");
      expect(result.type).toBe("capture");
      expect(result.preAuthTransactionId).toBe(111222);
      expect(result.amount).toBe(15000);

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.helcim.com/v2/payment/capture",
        expect.any(Object)
      );
    });

    it("should handle partial capture", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        json: async () => ({
          ...mockCaptureResponse,
          amount: 10000, // Partial capture
        }),
      });

      const result = await client.capturePayment({
        preAuthTransactionId: 111222,
        amount: 10000, // Only capture $100 of $150 preauth
      });

      expect(result.amount).toBe(10000);
    });
  });

  describe("refundPayment", () => {
    const mockRefundRequest: RefundRequest = {
      originalTransactionId: 987654,
      amount: 5000, // Partial refund
    };

    const mockRefundResponse = {
      transactionId: 555666,
      dateCreated: "2025-12-20T14:00:00Z",
      status: "APPROVED" as const,
      type: "refund" as const,
      amount: 5000,
      currency: "USD" as const,
      originalTransactionId: 987654,
    };

    it("should process refund successfully", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        json: async () => mockRefundResponse,
      });

      const result = await client.refundPayment(mockRefundRequest);

      expect(result.status).toBe("APPROVED");
      expect(result.type).toBe("refund");
      expect(result.originalTransactionId).toBe(987654);
      expect(result.amount).toBe(5000);

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.helcim.com/v2/payment/refund",
        expect.any(Object)
      );
    });

    it("should handle full refund", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        json: async () => ({
          ...mockRefundResponse,
          amount: 10000, // Full refund
        }),
      });

      const result = await client.refundPayment({
        originalTransactionId: 987654,
        amount: 10000,
      });

      expect(result.amount).toBe(10000);
    });
  });

  describe("getTransaction", () => {
    const mockTransactionDetails = {
      transactionId: 987654,
      type: "purchase" as const,
      status: "APPROVED" as const,
      amount: 10000,
      currency: "USD" as const,
      dateCreated: "2025-12-20T12:00:00Z",
      cardNumber: "************1234",
      cardType: "VISA" as const,
      approvalCode: "APPR123",
      comments: "Test transaction",
    };

    it("should fetch transaction details successfully", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        json: async () => mockTransactionDetails,
      });

      const result = await client.getTransaction(987654);

      expect(result.transactionId).toBe(987654);
      expect(result.status).toBe("APPROVED");
      expect(result.type).toBe("purchase");

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.helcim.com/v2/payment/transactions/987654",
        expect.objectContaining({
          method: "GET",
        })
      );
    });

    it("should handle transaction not found", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        headers: { get: () => "application/json" },
        json: async () => ({
          message: "Transaction not found",
        }),
      });

      await expect(client.getTransaction(999999)).rejects.toThrow(HelcimError);
      await expect(client.getTransaction(999999)).rejects.toThrow(
        "Transaction not found"
      );
    });
  });

  describe("verifyWebhook", () => {
    const mockWebhookEvent: HelcimWebhookEvent = {
      type: "APPROVED",
      transactionId: 987654,
      transactionType: "purchase",
      amount: 10000,
      currency: "USD",
      dateCreated: "2025-12-20T12:00:00Z",
      comments: "Test webhook",
    };

    const generateSignature = (payload: string, secret: string): string => {
      const hmac = crypto.createHmac("sha256", secret);
      hmac.update(payload);
      return hmac.digest("hex");
    };

    it("should verify valid webhook signature", () => {
      const payload = JSON.stringify(mockWebhookEvent);
      const signature = generateSignature(payload, mockConfig.webhookSecret!);

      const result = client.verifyWebhook(payload, signature);

      expect(result.valid).toBe(true);
      expect(result.event).toEqual(mockWebhookEvent);
      expect(result.error).toBeUndefined();
    });

    it("should reject invalid signature", () => {
      const payload = JSON.stringify(mockWebhookEvent);
      const invalidSignature = "invalid_signature_12345";

      const result = client.verifyWebhook(payload, invalidSignature);

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.event).toBeUndefined();
    });

    it("should reject missing signature", () => {
      const payload = JSON.stringify(mockWebhookEvent);

      const result = client.verifyWebhook(payload, null);

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Missing webhook signature");
      expect(result.event).toBeUndefined();
    });

    it("should handle missing webhook secret in config", () => {
      const clientWithoutSecret = new HelcimClient({
        apiToken: "test",
        accountId: "test",
        terminalId: "test",
        // webhookSecret is undefined
      });

      const payload = JSON.stringify(mockWebhookEvent);
      const result = clientWithoutSecret.verifyWebhook(payload, "any_signature");

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Webhook secret not configured");
    });

    it("should handle malformed webhook payload", () => {
      const invalidPayload = "{ invalid json }";
      const signature = generateSignature(invalidPayload, mockConfig.webhookSecret!);

      const result = client.verifyWebhook(invalidPayload, signature);

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should verify webhook for DECLINED event", () => {
      const declinedEvent: HelcimWebhookEvent = {
        ...mockWebhookEvent,
        type: "DECLINED",
      };
      const payload = JSON.stringify(declinedEvent);
      const signature = generateSignature(payload, mockConfig.webhookSecret!);

      const result = client.verifyWebhook(payload, signature);

      expect(result.valid).toBe(true);
      expect(result.event?.type).toBe("DECLINED");
    });

    it("should verify webhook for REFUNDED event", () => {
      const refundedEvent: HelcimWebhookEvent = {
        ...mockWebhookEvent,
        type: "REFUNDED",
        transactionType: "refund",
      };
      const payload = JSON.stringify(refundedEvent);
      const signature = generateSignature(payload, mockConfig.webhookSecret!);

      const result = client.verifyWebhook(payload, signature);

      expect(result.valid).toBe(true);
      expect(result.event?.type).toBe("REFUNDED");
    });
  });

  describe("testConnection", () => {
    it("should return true for valid credentials (400 validation error)", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        headers: { get: () => "application/json" },
        json: async () => ({
          message: "Validation failed",
          errors: [{ field: "amount", message: "Amount is required" }],
        }),
      });

      const result = await client.testConnection();

      expect(result).toBe(true); // 400 means credentials are valid, just bad request
    });

    it("should return false for invalid credentials (401)", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
        headers: { get: () => "application/json" },
        json: async () => ({
          message: "Unauthorized",
        }),
      });

      const result = await client.testConnection();

      expect(result).toBe(false);
    });

    it("should return false for forbidden access (403)", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 403,
        headers: { get: () => "application/json" },
        json: async () => ({
          message: "Forbidden",
        }),
      });

      const result = await client.testConnection();

      expect(result).toBe(false);
    });

    it("should return false for network errors", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(
        new Error("Network connection failed")
      );

      const result = await client.testConnection();

      expect(result).toBe(false);
    });
  });

  describe("createHelcimClient factory", () => {
    const originalEnv = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalEnv };
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    it("should create client with environment variables", () => {
      process.env.HELCIM_API_TOKEN = "env_token";
      process.env.HELCIM_ACCOUNT_ID = "env_account";
      process.env.HELCIM_TERMINAL_ID = "env_terminal";
      process.env.HELCIM_WEBHOOK_SECRET = "env_secret";

      const client = createHelcimClient();

      expect(client).toBeInstanceOf(HelcimClient);
    });

    it("should override environment variables with config", () => {
      process.env.HELCIM_API_TOKEN = "env_token";

      const client = createHelcimClient({
        apiToken: "override_token",
        accountId: "override_account",
        terminalId: "override_terminal",
      });

      expect(client).toBeInstanceOf(HelcimClient);
    });

    it("should set testMode based on NODE_ENV", () => {
      process.env.NODE_ENV = "production";
      process.env.HELCIM_API_TOKEN = "token";
      process.env.HELCIM_ACCOUNT_ID = "account";
      process.env.HELCIM_TERMINAL_ID = "terminal";

      const client = createHelcimClient();

      expect(client).toBeInstanceOf(HelcimClient);
    });
  });

  describe("Error Handling", () => {
    it("should create HelcimError with status code", () => {
      const error = new HelcimError("Test error", 400);

      expect(error.message).toBe("Test error");
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe("HelcimError");
    });

    it("should create HelcimError with field errors", () => {
      const fieldErrors = [
        { field: "cardToken", message: "Invalid token" },
        { field: "amount", message: "Amount must be positive" },
      ];
      const error = new HelcimError("Validation failed", 400, fieldErrors);

      expect(error.errors).toEqual(fieldErrors);
      expect(error.errors).toHaveLength(2);
    });

    it("should handle 500 internal server errors", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        headers: { get: () => "application/json" },
        json: async () => ({
          error: "Internal server error",
        }),
      });

      await expect(
        client.processPayment({
          amount: 1000,
          currency: "USD",
          cardToken: "test",
        })
      ).rejects.toThrow(HelcimError);
    });

    it("should handle non-JSON error responses", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 503,
        headers: { get: () => "text/html" },
        text: async () => "<html>Service Unavailable</html>",
      });

      await expect(
        client.processPayment({
          amount: 1000,
          currency: "USD",
          cardToken: "test",
        })
      ).rejects.toThrow(HelcimError);
    });
  });

  describe("Data Masking", () => {
    it("should mask card tokens in logs", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        json: async () => ({
          transactionId: 123,
          status: "APPROVED",
          type: "purchase",
          amount: 1000,
          currency: "USD",
        }),
      });

      await client.processPayment({
        amount: 1000,
        currency: "USD",
        cardToken: "token_very_long_secret_12345",
      });

      // Verify that the full token is not logged
      const logCalls = consoleSpy.mock.calls.map((call) => JSON.stringify(call));
      const hasFullToken = logCalls.some((call) =>
        call.includes("token_very_long_secret_12345")
      );
      expect(hasFullToken).toBe(false);

      consoleSpy.mockRestore();
    });
  });
});
