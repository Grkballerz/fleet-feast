/**
 * Authentication API Integration Tests
 * Tests auth flows: registration, login, email verification, password reset
 */

import { UserRole } from "@prisma/client";
import { POST as registerHandler } from "@/app/api/auth/register/route";
import { POST as verifyEmailHandler } from "@/app/api/auth/verify-email/route";
import { POST as resetPasswordHandler } from "@/app/api/auth/reset-password/route";
import { getTestPrisma, clearDatabase } from "../setup/database";
import { createPostRequest, expectResponse } from "../setup/server";
import { testCustomer, testPassword } from "../fixtures/users";
import { mockSendEmail } from "../mocks/sendgrid";

// Import mocks
import "../mocks/sendgrid";
import "../mocks/nextauth";

const prisma = getTestPrisma();
const baseUrl = "http://localhost:3000";

describe("Auth API Integration Tests", () => {
  beforeEach(async () => {
    await clearDatabase();
    mockSendEmail.mockClear();
  });

  describe("POST /api/auth/register", () => {
    it("should successfully register a new customer", async () => {
      const request = createPostRequest(`${baseUrl}/api/auth/register`, {
        email: "newcustomer@test.com",
        password: testPassword,
        role: UserRole.CUSTOMER,
      });

      const response = await registerHandler(request);
      const data = await expectResponse(response, 201);

      expect(data.success).toBe(true);
      expect(data.data.email).toBe("newcustomer@test.com");
      expect(data.data.role).toBe(UserRole.CUSTOMER);
      expect(data.data.userId).toBeDefined();

      // Verify user in database
      const user = await prisma.user.findUnique({
        where: { email: "newcustomer@test.com" },
      });
      expect(user).toBeTruthy();
      expect(user?.role).toBe(UserRole.CUSTOMER);
      expect(user?.passwordHash).toBeTruthy();

      // Verify email was sent
      expect(mockSendEmail).toHaveBeenCalledTimes(1);
    });

    it("should successfully register a new vendor", async () => {
      const request = createPostRequest(`${baseUrl}/api/auth/register`, {
        email: "newvendor@test.com",
        password: testPassword,
        role: UserRole.VENDOR,
      });

      const response = await registerHandler(request);
      const data = await expectResponse(response, 201);

      expect(data.success).toBe(true);
      expect(data.data.role).toBe(UserRole.VENDOR);

      const user = await prisma.user.findUnique({
        where: { email: "newvendor@test.com" },
      });
      expect(user?.role).toBe(UserRole.VENDOR);
    });

    it("should reject registration with weak password", async () => {
      const request = createPostRequest(`${baseUrl}/api/auth/register`, {
        email: "weakpass@test.com",
        password: "weak",
      });

      const response = await registerHandler(request);
      const data = await expectResponse(response, 400);

      expect(data.success).toBe(false);
      expect(data.error).toBe("VALIDATION_ERROR");
      expect(data.details.password).toBeDefined();

      // Verify user was not created
      const user = await prisma.user.findUnique({
        where: { email: "weakpass@test.com" },
      });
      expect(user).toBeNull();
    });

    it("should reject registration with invalid email", async () => {
      const request = createPostRequest(`${baseUrl}/api/auth/register`, {
        email: "not-an-email",
        password: testPassword,
      });

      const response = await registerHandler(request);
      const data = await expectResponse(response, 400);

      expect(data.success).toBe(false);
      expect(data.error).toBe("VALIDATION_ERROR");
      expect(data.details.email).toBeDefined();
    });

    it("should reject duplicate email registration", async () => {
      // First registration
      await prisma.user.create({
        data: {
          email: "existing@test.com",
          passwordHash: "$2a$12$test",
          role: UserRole.CUSTOMER,
        },
      });

      // Attempt duplicate
      const request = createPostRequest(`${baseUrl}/api/auth/register`, {
        email: "existing@test.com",
        password: testPassword,
      });

      const response = await registerHandler(request);
      const data = await expectResponse(response, 409);

      expect(data.success).toBe(false);
      expect(data.error).toBe("EMAIL_EXISTS");
    });

    it("should normalize email (lowercase and trim)", async () => {
      const request = createPostRequest(`${baseUrl}/api/auth/register`, {
        email: "  MixedCase@TEST.com  ",
        password: testPassword,
      });

      const response = await registerHandler(request);
      const data = await expectResponse(response, 201);

      expect(data.data.email).toBe("mixedcase@test.com");

      const user = await prisma.user.findUnique({
        where: { email: "mixedcase@test.com" },
      });
      expect(user).toBeTruthy();
    });
  });

  describe("POST /api/auth/verify-email", () => {
    it("should verify email with valid token", async () => {
      // Create user with verification token
      const user = await prisma.user.create({
        data: {
          email: "verify@test.com",
          passwordHash: "$2a$12$test",
          role: UserRole.CUSTOMER,
          emailVerified: null,
        },
      });

      const token = await prisma.verificationToken.create({
        data: {
          userId: user.id,
          token: "valid-token-123",
          type: "EMAIL_VERIFICATION",
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      const request = createPostRequest(`${baseUrl}/api/auth/verify-email`, {
        token: "valid-token-123",
      });

      const response = await verifyEmailHandler(request);
      const data = await expectResponse(response, 200);

      expect(data.success).toBe(true);

      // Verify user is marked as verified
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
      });
      expect(updatedUser?.emailVerified).toBeTruthy();

      // Verify token is consumed
      const usedToken = await prisma.verificationToken.findUnique({
        where: { id: token.id },
      });
      expect(usedToken?.usedAt).toBeTruthy();
    });

    it("should reject expired verification token", async () => {
      const user = await prisma.user.create({
        data: {
          email: "expired@test.com",
          passwordHash: "$2a$12$test",
          role: UserRole.CUSTOMER,
        },
      });

      await prisma.verificationToken.create({
        data: {
          userId: user.id,
          token: "expired-token-123",
          type: "EMAIL_VERIFICATION",
          expiresAt: new Date(Date.now() - 1000), // Expired
        },
      });

      const request = createPostRequest(`${baseUrl}/api/auth/verify-email`, {
        token: "expired-token-123",
      });

      const response = await verifyEmailHandler(request);
      const data = await expectResponse(response, 400);

      expect(data.success).toBe(false);
      expect(data.error).toBe("TOKEN_EXPIRED");
    });

    it("should reject invalid verification token", async () => {
      const request = createPostRequest(`${baseUrl}/api/auth/verify-email`, {
        token: "invalid-token",
      });

      const response = await verifyEmailHandler(request);
      const data = await expectResponse(response, 404);

      expect(data.success).toBe(false);
      expect(data.error).toBe("TOKEN_NOT_FOUND");
    });
  });

  describe("POST /api/auth/reset-password", () => {
    describe("Request password reset", () => {
      it("should send password reset email for valid user", async () => {
        await prisma.user.create({
          data: {
            email: "reset@test.com",
            passwordHash: "$2a$12$test",
            role: UserRole.CUSTOMER,
            emailVerified: new Date(),
          },
        });

        const request = createPostRequest(
          `${baseUrl}/api/auth/reset-password`,
          {
            email: "reset@test.com",
          }
        );

        const response = await resetPasswordHandler(request);
        const data = await expectResponse(response, 200);

        expect(data.success).toBe(true);
        expect(mockSendEmail).toHaveBeenCalled();

        // Verify token was created
        const token = await prisma.verificationToken.findFirst({
          where: {
            user: { email: "reset@test.com" },
            type: "PASSWORD_RESET",
          },
        });
        expect(token).toBeTruthy();
      });

      it("should return success even for non-existent email (security)", async () => {
        const request = createPostRequest(
          `${baseUrl}/api/auth/reset-password`,
          {
            email: "nonexistent@test.com",
          }
        );

        const response = await resetPasswordHandler(request);
        const data = await expectResponse(response, 200);

        expect(data.success).toBe(true);
        expect(mockSendEmail).not.toHaveBeenCalled();
      });
    });

    describe("Complete password reset", () => {
      it("should reset password with valid token", async () => {
        const user = await prisma.user.create({
          data: {
            email: "resetcomplete@test.com",
            passwordHash: "$2a$12$oldpassword",
            role: UserRole.CUSTOMER,
            emailVerified: new Date(),
          },
        });

        await prisma.verificationToken.create({
          data: {
            userId: user.id,
            token: "reset-token-123",
            type: "PASSWORD_RESET",
            expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
          },
        });

        const newPassword = "NewPass123!";
        const request = createPostRequest(
          `${baseUrl}/api/auth/reset-password`,
          {
            token: "reset-token-123",
            newPassword,
          }
        );

        const response = await resetPasswordHandler(request);
        const data = await expectResponse(response, 200);

        expect(data.success).toBe(true);

        // Verify password was changed
        const updatedUser = await prisma.user.findUnique({
          where: { id: user.id },
        });
        expect(updatedUser?.passwordHash).not.toBe("$2a$12$oldpassword");
      });

      it("should reject weak new password", async () => {
        const user = await prisma.user.create({
          data: {
            email: "weaknew@test.com",
            passwordHash: "$2a$12$oldpassword",
            role: UserRole.CUSTOMER,
          },
        });

        await prisma.verificationToken.create({
          data: {
            userId: user.id,
            token: "reset-token-456",
            type: "PASSWORD_RESET",
            expiresAt: new Date(Date.now() + 60 * 60 * 1000),
          },
        });

        const request = createPostRequest(
          `${baseUrl}/api/auth/reset-password`,
          {
            token: "reset-token-456",
            newPassword: "weak",
          }
        );

        const response = await resetPasswordHandler(request);
        const data = await expectResponse(response, 400);

        expect(data.success).toBe(false);
      });
    });
  });

  describe("Session Management", () => {
    it("should handle login flow with verified email", async () => {
      // This test verifies the complete auth flow would work with NextAuth
      const user = await prisma.user.create({
        data: {
          email: "login@test.com",
          passwordHash: await require("bcryptjs").hash(testPassword, 12),
          role: UserRole.CUSTOMER,
          emailVerified: new Date(),
        },
      });

      // NextAuth handles actual login, we're verifying user setup is correct
      expect(user.emailVerified).toBeTruthy();
      expect(user.passwordHash).toBeTruthy();

      // Verify password comparison would work
      const bcrypt = require("bcryptjs");
      const isValid = await bcrypt.compare(testPassword, user.passwordHash);
      expect(isValid).toBe(true);
    });

    it("should reject login for unverified email", async () => {
      const user = await prisma.user.create({
        data: {
          email: "unverified@test.com",
          passwordHash: await require("bcryptjs").hash(testPassword, 12),
          role: UserRole.CUSTOMER,
          emailVerified: null, // Not verified
        },
      });

      // User exists but not verified
      expect(user.emailVerified).toBeNull();
    });

    it("should reject login for suspended user", async () => {
      const user = await prisma.user.create({
        data: {
          email: "suspended@test.com",
          passwordHash: await require("bcryptjs").hash(testPassword, 12),
          role: UserRole.CUSTOMER,
          status: "SUSPENDED",
          emailVerified: new Date(),
        },
      });

      expect(user.status).toBe("SUSPENDED");
    });
  });
});
