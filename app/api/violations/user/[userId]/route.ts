/**
 * GET /api/violations/user/:userId
 * Get user's violation summary and history
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserViolationSummary } from "@/modules/violation/violation.service";
import { getUserViolationsSchema } from "@/modules/violation/violation.validation";
import { UserRole } from "@prisma/client";
import { getErrorMessage } from "@/lib/api-response";

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Verify authentication
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Users can only view their own violations, admins can view any
    if (
      session.user.id !== params.userId &&
      session.user.role !== UserRole.ADMIN
    ) {
      return NextResponse.json(
        { error: "Forbidden - Cannot view other users' violations" },
        { status: 403 }
      );
    }

    // Validate userId
    const validatedData = getUserViolationsSchema.parse({
      userId: params.userId,
    });

    // Get violation summary
    const summary = await getUserViolationSummary(validatedData.userId);

    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error: unknown) {
    console.error(`[GET /api/violations/user/${params.userId}] Error:`, error);

    if (error && typeof error === "object" && "name" in error && error.name === "ZodError") {
      return NextResponse.json(
        {
          error: "Invalid user ID",
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
