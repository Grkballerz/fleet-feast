/**
 * GET /api/admin/violations/:id
 * Get violation details by ID (admin only)
 *
 * PUT /api/admin/violations/:id
 * Update violation (admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getViolationById } from "@/modules/violation/violation.service";
import { getViolationByIdSchema } from "@/modules/violation/violation.validation";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function GET(
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

    // Validate violation ID
    const validatedData = getViolationByIdSchema.parse({
      violationId: params.id,
    });

    // Get violation
    const violation = await getViolationById(validatedData.violationId);

    if (!violation) {
      return NextResponse.json(
        { error: "Violation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: violation,
    });
  } catch (error: any) {
    console.error(`[GET /api/admin/violations/${params.id}] Error:`, error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          error: "Invalid violation ID",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    // Validate violation ID
    const validatedId = getViolationByIdSchema.parse({
      violationId: params.id,
    });

    // Update violation (admin notes, resolution, etc.)
    const updatedViolation = await prisma.violation.update({
      where: { id: validatedId.violationId },
      data: {
        notes: body.notes,
        resolvedAt: body.resolved ? new Date() : null,
        resolvedBy: body.resolved ? session.user.id : null,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedViolation,
    });
  } catch (error: any) {
    console.error(`[PUT /api/admin/violations/${params.id}] Error:`, error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          error: "Invalid violation ID",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Violation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
