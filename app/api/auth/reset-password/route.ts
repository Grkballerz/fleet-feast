/**
 * Password Reset API Endpoint
 * POST /api/auth/reset-password
 *
 * Handles both:
 * 1. Request password reset (send reset email)
 * 2. Confirm password reset (update password with token)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requestPasswordReset, resetPassword, AuthError } from "@/modules/auth/auth.service";

// Request password reset schema
const requestResetSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// Confirm password reset schema
const confirmResetSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number"
    ),
});

/**
 * Handle POST request for password reset
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if this is a reset request or confirmation
    if ("email" in body && !("token" in body)) {
      // REQUEST PASSWORD RESET
      const validationResult = requestResetSchema.safeParse(body);

      if (!validationResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: "VALIDATION_ERROR",
            message: "Invalid request data",
            details: validationResult.error.flatten().fieldErrors,
          },
          { status: 400 }
        );
      }

      await requestPasswordReset(validationResult.data.email);

      // Always return success to prevent email enumeration
      return NextResponse.json(
        {
          success: true,
          message: "If an account exists with this email, a password reset link has been sent.",
        },
        { status: 200 }
      );
    } else if ("token" in body && "password" in body) {
      // CONFIRM PASSWORD RESET
      const validationResult = confirmResetSchema.safeParse(body);

      if (!validationResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: "VALIDATION_ERROR",
            message: "Invalid request data",
            details: validationResult.error.flatten().fieldErrors,
          },
          { status: 400 }
        );
      }

      await resetPassword(validationResult.data.token, validationResult.data.password);

      return NextResponse.json(
        {
          success: true,
          message: "Password reset successfully. You can now sign in with your new password.",
        },
        { status: 200 }
      );
    } else {
      // Invalid request format
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_REQUEST",
          message: "Invalid request format. Provide either 'email' (to request reset) or 'token' and 'password' (to confirm reset).",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Password reset error:", error);

    // Handle custom auth errors
    if (error instanceof AuthError) {
      return NextResponse.json(
        {
          success: false,
          error: error.code,
          message: error.message,
        },
        { status: error.statusCode }
      );
    }

    // Handle unexpected errors
    return NextResponse.json(
      {
        success: false,
        error: "INTERNAL_ERROR",
        message: "An unexpected error occurred. Please try again later.",
      },
      { status: 500 }
    );
  }
}
