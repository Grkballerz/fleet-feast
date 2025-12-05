/**
 * Environment Variable Validation Security Tests
 * Tests for production secret validation
 */

import { validateProductionEnv, validateDevelopmentEnv, EnvValidationError } from "@/lib/env-validation";

describe("Environment Variable Validation", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment variables before each test
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe("Production Environment Validation", () => {
    beforeEach(() => {
      process.env.NODE_ENV = "production";
    });

    it("should pass when all required variables are set", () => {
      process.env.STRIPE_WEBHOOK_SECRET = "whsec_test123";
      process.env.NEXT_PUBLIC_APP_URL = "https://fleetfeast.com";
      process.env.NEXTAUTH_SECRET = "secret123";
      process.env.DATABASE_URL = "postgresql://localhost/test";
      process.env.STRIPE_SECRET_KEY = "sk_test_123";

      expect(() => validateProductionEnv()).not.toThrow();
    });

    it("should throw error when STRIPE_WEBHOOK_SECRET is missing", () => {
      process.env.NEXT_PUBLIC_APP_URL = "https://fleetfeast.com";
      process.env.NEXTAUTH_SECRET = "secret123";
      process.env.DATABASE_URL = "postgresql://localhost/test";
      process.env.STRIPE_SECRET_KEY = "sk_test_123";
      delete process.env.STRIPE_WEBHOOK_SECRET;

      expect(() => validateProductionEnv()).toThrow(EnvValidationError);
      expect(() => validateProductionEnv()).toThrow(/STRIPE_WEBHOOK_SECRET/);
    });

    it("should throw error when NEXT_PUBLIC_APP_URL is missing", () => {
      process.env.STRIPE_WEBHOOK_SECRET = "whsec_test123";
      process.env.NEXTAUTH_SECRET = "secret123";
      process.env.DATABASE_URL = "postgresql://localhost/test";
      process.env.STRIPE_SECRET_KEY = "sk_test_123";
      delete process.env.NEXT_PUBLIC_APP_URL;

      expect(() => validateProductionEnv()).toThrow(EnvValidationError);
      expect(() => validateProductionEnv()).toThrow(/NEXT_PUBLIC_APP_URL/);
    });

    it("should throw error when NEXTAUTH_SECRET is missing", () => {
      process.env.STRIPE_WEBHOOK_SECRET = "whsec_test123";
      process.env.NEXT_PUBLIC_APP_URL = "https://fleetfeast.com";
      process.env.DATABASE_URL = "postgresql://localhost/test";
      process.env.STRIPE_SECRET_KEY = "sk_test_123";
      delete process.env.NEXTAUTH_SECRET;

      expect(() => validateProductionEnv()).toThrow(EnvValidationError);
      expect(() => validateProductionEnv()).toThrow(/NEXTAUTH_SECRET/);
    });

    it("should throw error when DATABASE_URL is missing", () => {
      process.env.STRIPE_WEBHOOK_SECRET = "whsec_test123";
      process.env.NEXT_PUBLIC_APP_URL = "https://fleetfeast.com";
      process.env.NEXTAUTH_SECRET = "secret123";
      process.env.STRIPE_SECRET_KEY = "sk_test_123";
      delete process.env.DATABASE_URL;

      expect(() => validateProductionEnv()).toThrow(EnvValidationError);
      expect(() => validateProductionEnv()).toThrow(/DATABASE_URL/);
    });

    it("should throw error when STRIPE_SECRET_KEY is missing", () => {
      process.env.STRIPE_WEBHOOK_SECRET = "whsec_test123";
      process.env.NEXT_PUBLIC_APP_URL = "https://fleetfeast.com";
      process.env.NEXTAUTH_SECRET = "secret123";
      process.env.DATABASE_URL = "postgresql://localhost/test";
      delete process.env.STRIPE_SECRET_KEY;

      expect(() => validateProductionEnv()).toThrow(EnvValidationError);
      expect(() => validateProductionEnv()).toThrow(/STRIPE_SECRET_KEY/);
    });

    it("should throw error with all missing variables listed", () => {
      delete process.env.STRIPE_WEBHOOK_SECRET;
      delete process.env.NEXT_PUBLIC_APP_URL;
      delete process.env.NEXTAUTH_SECRET;
      delete process.env.DATABASE_URL;
      delete process.env.STRIPE_SECRET_KEY;

      expect(() => validateProductionEnv()).toThrow(EnvValidationError);

      try {
        validateProductionEnv();
      } catch (error) {
        if (error instanceof EnvValidationError) {
          expect(error.message).toContain("STRIPE_WEBHOOK_SECRET");
          expect(error.message).toContain("NEXT_PUBLIC_APP_URL");
          expect(error.message).toContain("NEXTAUTH_SECRET");
          expect(error.message).toContain("DATABASE_URL");
          expect(error.message).toContain("STRIPE_SECRET_KEY");
        }
      }
    });

    it("should reject empty string values", () => {
      process.env.STRIPE_WEBHOOK_SECRET = "";
      process.env.NEXT_PUBLIC_APP_URL = "https://fleetfeast.com";
      process.env.NEXTAUTH_SECRET = "secret123";
      process.env.DATABASE_URL = "postgresql://localhost/test";
      process.env.STRIPE_SECRET_KEY = "sk_test_123";

      expect(() => validateProductionEnv()).toThrow(EnvValidationError);
      expect(() => validateProductionEnv()).toThrow(/STRIPE_WEBHOOK_SECRET/);
    });

    it("should reject whitespace-only values", () => {
      process.env.STRIPE_WEBHOOK_SECRET = "   ";
      process.env.NEXT_PUBLIC_APP_URL = "https://fleetfeast.com";
      process.env.NEXTAUTH_SECRET = "secret123";
      process.env.DATABASE_URL = "postgresql://localhost/test";
      process.env.STRIPE_SECRET_KEY = "sk_test_123";

      expect(() => validateProductionEnv()).toThrow(EnvValidationError);
    });
  });

  describe("Development Environment Validation", () => {
    beforeEach(() => {
      process.env.NODE_ENV = "development";
    });

    it("should not throw error even when variables are missing", () => {
      delete process.env.STRIPE_WEBHOOK_SECRET;
      delete process.env.NEXT_PUBLIC_APP_URL;
      delete process.env.NEXTAUTH_SECRET;
      delete process.env.DATABASE_URL;
      delete process.env.STRIPE_SECRET_KEY;

      // Should only warn, not throw
      expect(() => validateDevelopmentEnv()).not.toThrow();
    });

    it("should warn when DATABASE_URL is missing", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();
      delete process.env.DATABASE_URL;

      validateDevelopmentEnv();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Development Environment Warnings")
      );

      consoleSpy.mockRestore();
    });
  });

  describe("validateEnvironment wrapper", () => {
    it("should call validateProductionEnv in production", () => {
      process.env.NODE_ENV = "production";
      process.env.STRIPE_WEBHOOK_SECRET = "whsec_test123";
      process.env.NEXT_PUBLIC_APP_URL = "https://fleetfeast.com";
      process.env.NEXTAUTH_SECRET = "secret123";
      process.env.DATABASE_URL = "postgresql://localhost/test";
      process.env.STRIPE_SECRET_KEY = "sk_test_123";

      const { validateEnvironment } = require("@/lib/env-validation");

      expect(() => validateEnvironment()).not.toThrow();
    });

    it("should call validateDevelopmentEnv in development", () => {
      process.env.NODE_ENV = "development";

      const { validateEnvironment } = require("@/lib/env-validation");

      expect(() => validateEnvironment()).not.toThrow();
    });
  });
});
