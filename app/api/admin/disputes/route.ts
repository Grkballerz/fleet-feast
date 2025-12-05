/**
 * Admin Disputes API Route
 * GET /api/admin/disputes - List all disputes with filters
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, type AuthenticatedRequest } from "@/lib/middleware/auth.middleware";
import {
  listDisputes,
  getDisputeStatistics,
} from "@/modules/dispute/dispute.service";
import { DisputeType } from "@/modules/dispute/dispute.types";
import { DisputeStatus } from "@prisma/client";

/**
 * GET /api/admin/disputes
 * List all disputes with optional filters (admin only)
 */
export const GET = requireAdmin(async (req: AuthenticatedRequest) => {
  try {

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as DisputeStatus | null;
    const type = searchParams.get("type") as DisputeType | null;
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const includeStats = searchParams.get("includeStats") === "true";

    // List disputes (no userId filter for admin)
    const disputes = await listDisputes({
      status: status || undefined,
      type: type || undefined,
      limit,
      offset,
    });

    // Optionally include statistics
    let statistics = null;
    if (includeStats) {
      statistics = await getDisputeStatistics();
    }

    return NextResponse.json({
      success: true,
      data: disputes,
      statistics,
      pagination: {
        limit,
        offset,
        total: disputes.length,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/disputes error:", error);

    if (error instanceof Error) {
      const statusCode = (error as any).statusCode || 500;
      return NextResponse.json(
        { error: error.message },
        { status: statusCode }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch disputes" },
      { status: 500 }
    );
  }
});
