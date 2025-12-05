/**
 * User Registration API Endpoint
 * POST /api/auth/register
 *
 * Creates a new user account with email/password
 * Sends verification email
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { registerUser, AuthError } from "@/modules/auth/auth.service";
import { UserRole } from "@prisma/client";

// Request validation schema
const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number"
    ),
  role: z.nativeEnum(UserRole).optional(),
});

type RegisterRequest = z.infer<typeof registerSchema>;

/**
 * Handle POST request for user registration
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = registerSchema.safeParse(body);

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

    const data: RegisterRequest = validationResult.data;

    // Register user
    const result = await registerUser({
      email: data.email,
      password: data.password,
      role: data.role || UserRole.CUSTOMER,
    });

    // Return success response (without sensitive data)
    return NextResponse.json(
      {
        success: true,
        message: "Registration successful. Please check your email to verify your account.",
        data: {
          userId: result.userId,
          email: result.email,
          role: result.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

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
