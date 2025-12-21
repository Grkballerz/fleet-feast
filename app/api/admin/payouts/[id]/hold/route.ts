/**
 * Admin Hold Payout API Route
 * POST /api/admin/payouts/:id/hold - Hold a payout
 */

import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  getUserId,
  type AuthenticatedRequest,
} from "@/lib/middleware/auth.middleware";
import { holdPayout } from "@/modules/payout/payout.service";
import { PayoutError } from "@/modules/payout/payout.types";
import { holdPayoutSchema } from "@/modules/payout/payout.validation";
import { z } from "zod";

/**
 * POST /api/admin/payouts/:id/hold
 * Hold a payout (admin only)
 */
export const POST = requireAdmin(
  async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
    try {
      const payoutId = params.id;
      const adminId = getUserId(req);

      // Parse and validate request body
      const body = await req.json();
      const validatedData = holdPayoutSchema.parse(body);

      const payout = await holdPayout({
        payoutId,
        reason: validatedData.reason,
        adminId,
      });

      return NextResponse.json({
        success: true,
        message: "Payout held successfully",
        data: payout,
      });
    } catch (error) {
      console.error(`POST /api/admin/payouts/${params.id}/hold error:`, error);

      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation error", details: error.errors },
          { status: 400 }
        );
      }

      if (error instanceof PayoutError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.statusCode }
        );
      }

      return NextResponse.json(
        { error: "Failed to hold payout" },
        { status: 500 }
      );
    }
  }
);
