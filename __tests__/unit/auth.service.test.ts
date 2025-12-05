/**
 * Unit Tests for Auth Service
 * Tests password validation, registration, verification, and password reset
 */

import {
  registerUser,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  validatePassword,
  AuthError,
} from "@/modules/auth/auth.service";
import { UserRole, UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

// Mock dependencies
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    verificationToken: {
      findFirst: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock("@/lib/email", () => ({
  generateToken: jest.fn(() => "mock-token-123"),
  sendVerificationEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  sendWelcomeEmail: jest.fn(),
}));

jest.mock("bcryptjs");

import { prisma } from "@/lib/prisma";
import {
  generateToken,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from "@/lib/email";

describe("AuthService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("validatePassword", () => {
    it("should accept valid password", () => {
      const result = validatePassword("Password123");
      expect(result.valid).toBe(true);
      expect(result.message).toBeUndefined();
    });

    it("should reject password too short", () => {
      const result = validatePassword("Pass1");
      expect(result.valid).toBe(false);
      expect(result.message).toContain("at least 8 characters");
    });

    it("should reject password without uppercase", () => {
      const result = validatePassword("password123");
      expect(result.valid).toBe(false);
      expect(result.message).toContain("uppercase");
    });

    it("should reject password without lowercase", () => {
      const result = validatePassword("PASSWORD123");
      expect(result.valid).toBe(false);
      expect(result.message).toContain("lowercase");
    });

    it("should reject password without number", () => {
      const result = validatePassword("PasswordABC");
      expect(result.valid).toBe(false);
      expect(result.message).toContain("number");
    });
  });

  describe("registerUser", () => {
    const validUserData = {
      email: "test@example.com",
      password: "Password123",
      role: UserRole.CUSTOMER,
    };

    it("should create a new user successfully", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        role: UserRole.CUSTOMER,
        passwordHash: "hashed-password",
        status: UserStatus.ACTIVE,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
      (prisma.verificationToken.upsert as jest.Mock).mockResolvedValue({});

      const result = await registerUser(validUserData);

      expect(result).toEqual({
        userId: "user-123",
        email: "test@example.com",
        role: UserRole.CUSTOMER,
      });

      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: "test@example.com",
            passwordHash: "hashed-password",
            role: UserRole.CUSTOMER,
            status: UserStatus.ACTIVE,
          }),
        })
      );

      expect(sendVerificationEmail).toHaveBeenCalledWith(
        "test@example.com",
        "mock-token-123"
      );
    });

    it("should normalize email to lowercase", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
        role: UserRole.CUSTOMER,
      });
      (prisma.verificationToken.upsert as jest.Mock).mockResolvedValue({});

      await registerUser({
        ...validUserData,
        email: "TEST@EXAMPLE.COM",
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
    });

    it("should throw error if email already exists", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "existing-user",
        email: "test@example.com",
      });

      await expect(registerUser(validUserData)).rejects.toThrow(AuthError);
      await expect(registerUser(validUserData)).rejects.toThrow(
        "An account with this email already exists"
      );
    });

    it("should throw error if password is invalid", async () => {
      await expect(
        registerUser({
          ...validUserData,
          password: "weak",
        })
      ).rejects.toThrow(AuthError);
    });

    it("should hash password with cost factor 12", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
        role: UserRole.CUSTOMER,
      });
      (prisma.verificationToken.upsert as jest.Mock).mockResolvedValue({});

      await registerUser(validUserData);

      expect(bcrypt.hash).toHaveBeenCalledWith("Password123", 12);
    });

    it("should default to CUSTOMER role if not specified", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
        role: UserRole.CUSTOMER,
      });
      (prisma.verificationToken.upsert as jest.Mock).mockResolvedValue({});

      const result = await registerUser({
        email: "test@example.com",
        password: "Password123",
      });

      expect(result.role).toBe(UserRole.CUSTOMER);
    });

    it("should not fail if verification email send fails", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
        role: UserRole.CUSTOMER,
      });
      (prisma.verificationToken.upsert as jest.Mock).mockResolvedValue({});
      (sendVerificationEmail as jest.Mock).mockRejectedValue(
        new Error("Email service down")
      );

      const result = await registerUser(validUserData);

      expect(result.userId).toBe("user-123");
    });
  });

  describe("verifyEmail", () => {
    it("should verify email with valid token", async () => {
      const mockVerification = {
        id: "verification-123",
        userId: "user-123",
        token: "valid-token",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        user: {
          id: "user-123",
          email: "test@example.com",
          role: UserRole.CUSTOMER,
          deletedAt: null,
        },
      };

      (prisma.verificationToken.findFirst as jest.Mock).mockResolvedValue(
        mockVerification
      );
      (prisma.user.update as jest.Mock).mockResolvedValue({});
      (prisma.verificationToken.delete as jest.Mock).mockResolvedValue({});

      const result = await verifyEmail("valid-token");

      expect(result).toEqual({
        success: true,
        email: "test@example.com",
      });

      expect(prisma.verificationToken.delete).toHaveBeenCalledWith({
        where: { id: "verification-123" },
      });

      expect(sendWelcomeEmail).toHaveBeenCalledWith(
        "test@example.com",
        UserRole.CUSTOMER
      );
    });

    it("should throw error if token not found", async () => {
      (prisma.verificationToken.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(verifyEmail("invalid-token")).rejects.toThrow(AuthError);
      await expect(verifyEmail("invalid-token")).rejects.toThrow(
        "Invalid or expired verification token"
      );
    });

    it("should throw error if token expired", async () => {
      const mockVerification = {
        id: "verification-123",
        userId: "user-123",
        token: "expired-token",
        expiresAt: new Date(Date.now() - 1000), // Expired
        user: {
          id: "user-123",
          email: "test@example.com",
          role: UserRole.CUSTOMER,
          deletedAt: null,
        },
      };

      (prisma.verificationToken.findFirst as jest.Mock).mockResolvedValue(
        mockVerification
      );

      await expect(verifyEmail("expired-token")).rejects.toThrow(AuthError);
      await expect(verifyEmail("expired-token")).rejects.toThrow("expired");
    });

    it("should throw error if user is deleted", async () => {
      const mockVerification = {
        id: "verification-123",
        userId: "user-123",
        token: "valid-token",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        user: {
          id: "user-123",
          email: "test@example.com",
          role: UserRole.CUSTOMER,
          deletedAt: new Date(), // Deleted
        },
      };

      (prisma.verificationToken.findFirst as jest.Mock).mockResolvedValue(
        mockVerification
      );

      await expect(verifyEmail("valid-token")).rejects.toThrow(AuthError);
    });

    it("should throw error if token is missing", async () => {
      await expect(verifyEmail("")).rejects.toThrow(AuthError);
      await expect(verifyEmail("")).rejects.toThrow(
        "Verification token is required"
      );
    });
  });

  describe("requestPasswordReset", () => {
    it("should create reset token and send email for valid user", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        status: UserStatus.ACTIVE,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.verificationToken.upsert as jest.Mock).mockResolvedValue({});

      const result = await requestPasswordReset("test@example.com");

      expect(result).toEqual({ success: true });
      expect(sendPasswordResetEmail).toHaveBeenCalledWith(
        "test@example.com",
        "mock-token-123"
      );
    });

    it("should return success even if user not found (security)", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await requestPasswordReset("nonexistent@example.com");

      expect(result).toEqual({ success: true });
      expect(sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it("should return success for inactive user without sending email (security)", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        status: UserStatus.SUSPENDED,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await requestPasswordReset("test@example.com");

      expect(result).toEqual({ success: true });
      expect(sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it("should throw error if email send fails", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        status: UserStatus.ACTIVE,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.verificationToken.upsert as jest.Mock).mockResolvedValue({});
      (sendPasswordResetEmail as jest.Mock).mockRejectedValue(
        new Error("Email service down")
      );

      await expect(
        requestPasswordReset("test@example.com")
      ).rejects.toThrow(AuthError);
      await expect(
        requestPasswordReset("test@example.com")
      ).rejects.toThrow("Failed to send password reset email");
    });
  });

  describe("resetPassword", () => {
    it("should reset password with valid token", async () => {
      const mockResetData = {
        id: "reset-123",
        userId: "user-123",
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      };

      (prisma.verificationToken.findFirst as jest.Mock).mockResolvedValue(
        mockResetData
      );
      (bcrypt.hash as jest.Mock).mockResolvedValue("new-hashed-password");
      (prisma.user.update as jest.Mock).mockResolvedValue({});
      (prisma.verificationToken.delete as jest.Mock).mockResolvedValue({});

      const result = await resetPassword("valid-token", "NewPassword123");

      expect(result).toEqual({ success: true });
      expect(bcrypt.hash).toHaveBeenCalledWith("NewPassword123", 12);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-123" },
        data: { passwordHash: "new-hashed-password" },
      });
      expect(prisma.verificationToken.delete).toHaveBeenCalledWith({
        where: { id: "reset-123" },
      });
    });

    it("should throw error if token not found", async () => {
      (prisma.verificationToken.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        resetPassword("invalid-token", "NewPassword123")
      ).rejects.toThrow(AuthError);
      await expect(
        resetPassword("invalid-token", "NewPassword123")
      ).rejects.toThrow("Invalid or expired reset token");
    });

    it("should throw error if token expired", async () => {
      const mockResetData = {
        id: "reset-123",
        userId: "user-123",
        expiresAt: new Date(Date.now() - 1000), // Expired
      };

      (prisma.verificationToken.findFirst as jest.Mock).mockResolvedValue(
        mockResetData
      );

      await expect(
        resetPassword("expired-token", "NewPassword123")
      ).rejects.toThrow(AuthError);
      await expect(
        resetPassword("expired-token", "NewPassword123")
      ).rejects.toThrow("expired");
    });

    it("should throw error if new password is invalid", async () => {
      await expect(resetPassword("valid-token", "weak")).rejects.toThrow(
        AuthError
      );
    });

    it("should throw error if token is missing", async () => {
      await expect(resetPassword("", "NewPassword123")).rejects.toThrow(
        AuthError
      );
      await expect(resetPassword("", "NewPassword123")).rejects.toThrow(
        "Reset token is required"
      );
    });
  });
});
