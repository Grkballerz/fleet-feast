/**
 * Admin Payout Details API Route
 * GET /api/admin/payouts/:id - Get payout details
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, type AuthenticatedRequest } from "@/lib/middleware/auth.middleware";
import { getPayoutDetails } from "@/modules/payout/payout.service";
import { PayoutError } from "@/modules/payout/payout.types";

/**
 * GET /api/admin/payouts/:id
 * Get payout details (admin only)
 */
export const GET = requireAdmin(
  async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
    try {
      const payoutId = params.id;

      const payout = await getPayoutDetails(payoutId);

      return NextResponse.json({
        success: true,
        data: payout,
      });
    } catch (error) {
      console.error(`GET /api/admin/payouts/${params.id} error:`, error);

      if (error instanceof PayoutError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.statusCode }
        );
      }

      return NextResponse.json(
        { error: "Failed to fetch payout details" },
        { status: 500 }
      );
    }
  }
);
