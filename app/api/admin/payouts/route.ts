/**
 * Admin Payouts API Route
 * GET /api/admin/payouts - List all payouts with filters
 * POST /api/admin/payouts/process - Manually trigger payout processing
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, type AuthenticatedRequest } from "@/lib/middleware/auth.middleware";
import {
  listPayouts,
  getPayoutStatistics,
  processPayouts,
} from "@/modules/payout/payout.service";
import { PayoutError } from "@/modules/payout/payout.types";
import { PayoutStatus } from "@prisma/client";

/**
 * GET /api/admin/payouts
 * List all payouts with optional filters (admin only)
 */
export const GET = requireAdmin(async (req: AuthenticatedRequest) => {
  try {
    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as PayoutStatus | null;
    const vendorId = searchParams.get("vendorId");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const includeStats = searchParams.get("includeStats") === "true";

    // List payouts
    const payouts = await listPayouts({
      status: status || undefined,
      vendorId: vendorId || undefined,
      limit,
      offset,
    });

    // Optionally include statistics
    let statistics = null;
    if (includeStats) {
      statistics = await getPayoutStatistics();
    }

    return NextResponse.json({
      success: true,
      data: payouts,
      statistics,
      pagination: {
        limit,
        offset,
        total: payouts.length,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/payouts error:", error);

    if (error instanceof PayoutError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch payouts" },
      { status: 500 }
    );
  }
});

/**
 * POST /api/admin/payouts/process
 * Manually trigger payout processing (admin only)
 */
async function handleProcessPayouts(req: AuthenticatedRequest) {
  try {
    console.log("[Admin: Process Payouts] Manual trigger initiated");

    const result = await processPayouts();

    return NextResponse.json({
      success: true,
      message: "Payouts processed successfully",
      data: {
        processed: result.processed,
        failed: result.failed,
        successfulPayouts: result.successfulPayouts,
        failedPayouts: result.failedPayouts,
      },
    });
  } catch (error) {
    console.error("POST /api/admin/payouts/process error:", error);

    if (error instanceof PayoutError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: "Failed to process payouts" },
      { status: 500 }
    );
  }
}

export const POST = requireAdmin(handleProcessPayouts);
