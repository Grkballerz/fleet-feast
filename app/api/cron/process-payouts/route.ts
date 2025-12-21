/**
 * Cron Endpoint: Process Payouts
 * POST /api/cron/process-payouts
 *
 * Scheduled to run daily at 7 AM
 * Processes pending payouts (initiates ACH transfers)
 *
 * Should be called by cron service (e.g., Vercel Cron, GitHub Actions)
 */

import { NextRequest, NextResponse } from "next/server";
import { processPayouts } from "@/modules/payout/payout.service";

/**
 * POST /api/cron/process-payouts
 * Process pending payouts
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

    console.log("[Cron: Process Payouts] Starting payout processing...");

    const result = await processPayouts();

    console.log("[Cron: Process Payouts] Completed:", {
      processed: result.processed,
      failed: result.failed,
    });

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
    console.error("[Cron: Process Payouts] Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to process payouts",
      },
      { status: 500 }
    );
  }
}
