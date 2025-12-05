/**
 * PUT /api/admin/users/:id/status
 * Update user account status manually (admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { updateAccountStatus } from "@/modules/violation/violation.service";
import { updateAccountStatusSchema } from "@/modules/violation/violation.validation";
import { UserRole } from "@prisma/client";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication and admin role
    const session = await getServerSession(authOptions);

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
    const validatedData = updateAccountStatusSchema.parse({
      userId: params.id,
      status: body.status,
      reason: body.reason,
      adminId: session.user.id,
      duration: body.duration,
    });

    // Update account status
    await updateAccountStatus(validatedData);

    return NextResponse.json({
      success: true,
      message: `User account status updated to ${validatedData.status}`,
    });
  } catch (error: any) {
    console.error(`[PUT /api/admin/users/${params.id}/status] Error:`, error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
