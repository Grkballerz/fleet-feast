/**
 * GET /api/admin/violations
 * List all violations with filters (admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listViolations } from "@/modules/violation/violation.service";
import { violationListFiltersSchema } from "@/modules/violation/violation.validation";
import { UserRole } from "@prisma/client";

export async function GET(req: NextRequest) {
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

    // Extract query parameters
    const { searchParams } = new URL(req.url);

    const filters: any = {
      userId: searchParams.get("userId") || undefined,
      type: searchParams.get("type") || undefined,
      severity: searchParams.get("severity") || undefined,
      resolved: searchParams.get("resolved")
        ? searchParams.get("resolved") === "true"
        : undefined,
      automated: searchParams.get("automated")
        ? searchParams.get("automated") === "true"
        : undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      page: searchParams.get("page")
        ? parseInt(searchParams.get("page")!)
        : 1,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : 20,
    };

    // Validate filters
    const validatedFilters = violationListFiltersSchema.parse(filters);

    // Convert date strings to Date objects
    const processedFilters = {
      ...validatedFilters,
      startDate: validatedFilters.startDate
        ? new Date(validatedFilters.startDate)
        : undefined,
      endDate: validatedFilters.endDate
        ? new Date(validatedFilters.endDate)
        : undefined,
    };

    // Get violations
    const result = await listViolations(processedFilters);

    return NextResponse.json({
      success: true,
      data: result.violations,
      pagination: {
        total: result.total,
        page: validatedFilters.page,
        limit: validatedFilters.limit,
        totalPages: Math.ceil(result.total / validatedFilters.limit),
      },
    });
  } catch (error: any) {
    console.error("[GET /api/admin/violations] Error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          error: "Validation failed",
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
