/**
 * POST /api/admin/violations/:id/appeal
 * Handle violation appeal decision (admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { handleAppeal } from "@/modules/violation/violation.service";
import { handleAppealSchema } from "@/modules/violation/violation.validation";
import { UserRole } from "@prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication and admin role
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Validate input
    const validatedData = handleAppealSchema.parse({
      violationId: params.id,
      adminId: session.user.id,
      decision: body.decision,
      notes: body.notes,
    });

    // Handle appeal
    const violation = await handleAppeal(validatedData);

    return NextResponse.json({
      success: true,
      data: violation,
      message: `Appeal ${validatedData.decision.toLowerCase()} successfully`,
    });
  } catch (error: any) {
    console.error(`[POST /api/admin/violations/${params.id}/appeal] Error:`, error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    if (error.code === "VIOLATION_NOT_FOUND") {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
