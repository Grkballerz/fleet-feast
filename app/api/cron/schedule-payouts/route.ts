/**
 * Cron Endpoint: Schedule Payouts
 * POST /api/cron/schedule-payouts
 *
 * Scheduled to run daily at 6 AM
 * Finds eligible bookings and creates payout records
 *
 * Should be called by cron service (e.g., Vercel Cron, GitHub Actions)
 */

import { NextRequest, NextResponse } from "next/server";
import { schedulePayouts } from "@/modules/payout/payout.service";

/**
 * POST /api/cron/schedule-payouts
 * Schedule payouts for eligible bookings
 */
export async function POST(req: NextRequest) {
  try {
    // Verify cron secret (if configured)
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("[Cron: Schedule Payouts] Starting payout scheduling...");

    const result = await schedulePayouts();

    console.log("[Cron: Schedule Payouts] Completed:", {
      payoutsCreated: result.payoutsCreated,
      totalAmount: result.totalAmount,
      vendors: result.vendors.length,
    });

    return NextResponse.json({
      success: true,
      message: "Payouts scheduled successfully",
      data: {
        payoutsCreated: result.payoutsCreated,
        totalAmount: result.totalAmount,
        vendors: result.vendors,
      },
    });
  } catch (error) {
    console.error("[Cron: Schedule Payouts] Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to schedule payouts",
      },
      { status: 500 }
    );
  }
}
