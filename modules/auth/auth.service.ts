/**
 * Authentication Service Layer
 * Handles business logic for user registration, verification, and password management
 */

import { prisma } from "@/lib/prisma";
import { generateToken, sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } from "@/lib/email";
import bcrypt from "bcryptjs";
import { UserRole, UserStatus } from "@prisma/client";

// Password validation regex
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

/**
 * Custom error classes for auth operations
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Validate password strength
 * Requirements: min 8 chars, 1 uppercase, 1 lowercase, 1 number
 */
export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters long" };
  }

  if (!PASSWORD_REGEX.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number",
    };
  }

  return { valid: true };
}

/**
 * Register a new user
 */
export async function registerUser(data: {
  email: string;
  password: string;
  role?: UserRole;
}): Promise<{ userId: string; email: string; role: UserRole }> {
  const { email, password, role = UserRole.CUSTOMER } = data;

  // Normalize email
  const normalizedEmail = email.toLowerCase().trim();

  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    throw new AuthError(
      passwordValidation.message || "Invalid password",
      "INVALID_PASSWORD"
    );
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new AuthError(
      "An account with this email already exists",
      "EMAIL_EXISTS",
      409
    );
  }

  // Hash password (cost factor 12)
  const passwordHash = await bcrypt.hash(password, 12);

  // Generate verification token
  const verificationToken = generateToken();
  const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Create user
  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      role,
      status: UserStatus.ACTIVE,
      // Store verification token in a separate table (we'll add this in a follow-up task)
      // For now, we'll use a simple approach
    },
  });

  // Store verification token
  await prisma.verificationToken.upsert({
    where: {
      userId_type: {
        userId: user.id,
        type: "EMAIL_VERIFICATION",
      },
    },
    create: {
      userId: user.id,
      token: verificationToken,
      type: "EMAIL_VERIFICATION",
      expiresAt: verificationExpiry,
    },
    update: {
      token: verificationToken,
      expiresAt: verificationExpiry,
    },
  });

  // Send verification email
  try {
    await sendVerificationEmail(normalizedEmail, verificationToken);
  } catch (error) {
    console.error("Failed to send verification email:", error);
    // Don't fail registration if email fails - user can request resend
  }

  return {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
}

/**
 * Verify user email with token
 */
export async function verifyEmail(token: string): Promise<{ success: boolean; email: string }> {
  if (!token) {
    throw new AuthError("Verification token is required", "MISSING_TOKEN");
  }

  // Find verification token
  const verification = await prisma.verificationToken.findFirst({
    where: {
      token,
      type: "EMAIL_VERIFICATION",
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          deletedAt: true,
        },
      },
    },
  });

  if (!verification || verification.user.deletedAt !== null) {
    throw new AuthError(
      "Invalid or expired verification token",
      "INVALID_TOKEN",
      404
    );
  }

  // Check if token expired
  if (new Date() > verification.expiresAt) {
    throw new AuthError(
      "Verification token has expired. Please request a new one.",
      "TOKEN_EXPIRED"
    );
  }

  // Mark email as verified (update user record)
  await prisma.user.update({
    where: { id: verification.userId },
    data: {
      // Add emailVerified field if it exists in schema
      updatedAt: new Date(),
    },
  });

  // Delete used token
  await prisma.verificationToken.delete({
    where: {
      id: verification.id,
    },
  });

  // Send welcome email
  await sendWelcomeEmail(verification.user.email, verification.user.role).catch((error) => {
    console.error("Failed to send welcome email:", error);
  });

  return { success: true, email: verification.user.email };
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string): Promise<{ success: boolean }> {
  const normalizedEmail = email.toLowerCase().trim();

  // Find user
  const user = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
      deletedAt: null,
    },
  });

  // Always return success to prevent email enumeration
  if (!user) {
    return { success: true };
  }

  // Check account status
  if (user.status !== UserStatus.ACTIVE) {
    return { success: true }; // Don't reveal account status
  }

  // Generate reset token
  const resetToken = generateToken();
  const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Store reset token
  await prisma.verificationToken.upsert({
    where: {
      userId_type: {
        userId: user.id,
        type: "PASSWORD_RESET",
      },
    },
    create: {
      userId: user.id,
      token: resetToken,
      type: "PASSWORD_RESET",
      expiresAt: resetExpiry,
    },
    update: {
      token: resetToken,
      expiresAt: resetExpiry,
    },
  });

  // Send reset email
  try {
    await sendPasswordResetEmail(normalizedEmail, resetToken);
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    throw new AuthError(
      "Failed to send password reset email. Please try again.",
      "EMAIL_SEND_FAILED",
      500
    );
  }

  return { success: true };
}

/**
 * Reset password with token
 */
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<{ success: boolean }> {
  if (!token) {
    throw new AuthError("Reset token is required", "MISSING_TOKEN");
  }

  // Validate new password
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.valid) {
    throw new AuthError(
      passwordValidation.message || "Invalid password",
      "INVALID_PASSWORD"
    );
  }

  // Find reset token
  const resetData = await prisma.verificationToken.findFirst({
    where: {
      token,
      type: "PASSWORD_RESET",
    },
    select: {
      id: true,
      userId: true,
      expiresAt: true,
    },
  });

  if (!resetData) {
    throw new AuthError(
      "Invalid or expired reset token",
      "INVALID_TOKEN",
      404
    );
  }

  // Check if token expired
  if (new Date() > resetData.expiresAt) {
    throw new AuthError(
      "Reset token has expired. Please request a new one.",
      "TOKEN_EXPIRED"
    );
  }

  // Hash new password
  const passwordHash = await bcrypt.hash(newPassword, 12);

  // Update password
  await prisma.user.update({
    where: { id: resetData.userId },
    data: { passwordHash },
  });

  // Delete used token
  await prisma.verificationToken.delete({
    where: {
      id: resetData.id,
    },
  });

  return { success: true };
}
