/**
 * Rate Limiting Security Tests
 * Tests for rate limiting on authentication endpoints
 */

import { NextRequest } from "next/server";
import { rateLimitStore } from "@/lib/rate-limit-store";

// Mock the rate limit store
jest.mock("@/lib/rate-limit-store");

describe("Rate Limiting Security", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Authentication Endpoints", () => {
    it("should have strict rate limits on /api/auth/register", async () => {
      // Import after mock is set up
      const { POST } = await import("@/app/api/auth/register/route");

      // Mock rate limit store to simulate allowed requests
      (rateLimitStore.check as jest.Mock).mockReturnValue({
        allowed: true,
        remaining: 4,
        resetAt: Date.now() + 900000, // 15 minutes
      });

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          email: "test@example.com",
          password: "Password123",
          role: "CUSTOMER",
        }),
        headers: new Headers({
          "x-forwarded-for": "192.168.1.1",
        }),
        nextUrl: {
          pathname: "/api/auth/register",
        },
      } as unknown as NextRequest;

      // Call should succeed within rate limit
      const response = await POST(mockRequest);

      // Verify rate limit was checked
      expect(rateLimitStore.check).toHaveBeenCalled();
    });

    it("should block excessive registration attempts", async () => {
      const { POST } = await import("@/app/api/auth/register/route");

      // Mock rate limit store to simulate exceeded limit
      (rateLimitStore.check as jest.Mock).mockReturnValue({
        allowed: false,
        remaining: 0,
        resetAt: Date.now() + 900000,
      });

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          email: "test@example.com",
          password: "Password123",
        }),
        headers: new Headers({
          "x-forwarded-for": "192.168.1.1",
        }),
        nextUrl: {
          pathname: "/api/auth/register",
        },
      } as unknown as NextRequest;

      const response = await POST(mockRequest);

      // Should return 429 Too Many Requests
      expect(response.status).toBe(429);

      // Should include Retry-After header
      expect(response.headers.has("Retry-After")).toBe(true);
    });

    it("should have strict rate limits on password reset", async () => {
      const { POST } = await import("@/app/api/auth/reset-password/route");

      (rateLimitStore.check as jest.Mock).mockReturnValue({
        allowed: true,
        remaining: 3,
        resetAt: Date.now() + 900000,
      });

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          email: "test@example.com",
        }),
        headers: new Headers({
          "x-forwarded-for": "192.168.1.1",
        }),
        nextUrl: {
          pathname: "/api/auth/reset-password",
        },
      } as unknown as NextRequest;

      await POST(mockRequest);

      expect(rateLimitStore.check).toHaveBeenCalled();
    });

    it("should have strict rate limits on email verification", async () => {
      const { POST } = await import("@/app/api/auth/verify-email/route");

      (rateLimitStore.check as jest.Mock).mockReturnValue({
        allowed: true,
        remaining: 2,
        resetAt: Date.now() + 900000,
      });

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          token: "valid-token-123",
        }),
        headers: new Headers({
          "x-forwarded-for": "192.168.1.1",
        }),
        nextUrl: {
          pathname: "/api/auth/verify-email",
        },
      } as unknown as NextRequest;

      await POST(mockRequest);

      expect(rateLimitStore.check).toHaveBeenCalled();
    });
  });

  describe("Rate Limit Configuration", () => {
    it("strict preset should allow 5 requests per 15 minutes", () => {
      const { RateLimitPresets } = require("@/lib/middleware/rate-limit");

      expect(RateLimitPresets.strict).toEqual({
        limit: 5,
        windowMs: 15 * 60 * 1000, // 15 minutes
      });
    });

    it("should include rate limit headers in response", async () => {
      const { POST } = await import("@/app/api/auth/register/route");

      (rateLimitStore.check as jest.Mock).mockReturnValue({
        allowed: true,
        remaining: 3,
        resetAt: Date.now() + 900000,
      });

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          email: "test@example.com",
          password: "Password123",
        }),
        headers: new Headers({
          "x-forwarded-for": "192.168.1.1",
        }),
        nextUrl: {
          pathname: "/api/auth/register",
        },
      } as unknown as NextRequest;

      const response = await POST(mockRequest);

      // Should include rate limit headers
      expect(response.headers.has("X-RateLimit-Limit")).toBe(true);
      expect(response.headers.has("X-RateLimit-Remaining")).toBe(true);
      expect(response.headers.has("X-RateLimit-Reset")).toBe(true);
    });
  });

  describe("IP-based Rate Limiting", () => {
    it("should rate limit by IP address for unauthenticated requests", async () => {
      const { POST } = await import("@/app/api/auth/register/route");

      (rateLimitStore.check as jest.Mock).mockReturnValue({
        allowed: true,
        remaining: 4,
        resetAt: Date.now() + 900000,
      });

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          email: "test@example.com",
          password: "Password123",
        }),
        headers: new Headers({
          "x-forwarded-for": "203.0.113.5",
        }),
        nextUrl: {
          pathname: "/api/auth/register",
        },
      } as unknown as NextRequest;

      await POST(mockRequest);

      // Verify rate limit key includes IP
      const checkCall = (rateLimitStore.check as jest.Mock).mock.calls[0];
      const key = checkCall[0];
      expect(key).toContain("ip:");
    });
  });
});
