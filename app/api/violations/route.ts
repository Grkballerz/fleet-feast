/**
 * POST /api/violations
 * Create a new violation (admin or automated)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createViolation } from "@/modules/violation/violation.service";
import { createViolationSchema } from "@/modules/violation/violation.validation";
import { UserRole } from "@prisma/client";
import { getErrorMessage } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only admins can manually create violations
    // Automated systems should use internal service methods
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Validate input
    const validatedData = createViolationSchema.parse(body);

    // Create violation
    const violation = await createViolation(validatedData);

    return NextResponse.json(
      {
        success: true,
        data: violation,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("[POST /api/violations] Error:", error);

    if (error && typeof error === "object" && "name" in error && error.name === "ZodError") {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: "errors" in error ? error.errors : undefined,
        },
        { status: 400 }
      );
    }

    if (error && typeof error === "object" && "code" in error && error.code === "USER_NOT_FOUND") {
      return NextResponse.json(
        { error: getErrorMessage(error) },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
