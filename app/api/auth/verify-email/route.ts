/**
 * Email Verification API Endpoint
 * POST /api/auth/verify-email
 *
 * Verifies user email address with token
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyEmail, AuthError } from "@/modules/auth/auth.service";

// Request validation schema
const verifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

type VerifyEmailRequest = z.infer<typeof verifyEmailSchema>;

/**
 * Handle POST request for email verification
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = verifyEmailSchema.safeParse(body);

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

    const data: VerifyEmailRequest = validationResult.data;

    // Verify email
    const result = await verifyEmail(data.token);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Email verified successfully. You can now sign in.",
        data: {
          email: result.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email verification error:", error);

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

/**
 * Handle GET request for email verification (support link clicks)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(new URL("/verify-email?error=missing_token", request.url));
    }

    // Verify email
    const result = await verifyEmail(token);

    // Redirect to login with success message
    return NextResponse.redirect(
      new URL(`/login?verified=true&email=${encodeURIComponent(result.email)}`, request.url)
    );
  } catch (error) {
    console.error("Email verification error:", error);

    // Redirect to verification page with error
    if (error instanceof AuthError) {
      return NextResponse.redirect(
        new URL(`/verify-email?error=${error.code}`, request.url)
      );
    }

    return NextResponse.redirect(new URL("/verify-email?error=unknown", request.url));
  }
}
