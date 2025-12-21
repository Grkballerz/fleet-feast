/**
 * Admin Release Payout API Route
 * POST /api/admin/payouts/:id/release - Release a held payout
 */

import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  getUserId,
  type AuthenticatedRequest,
} from "@/lib/middleware/auth.middleware";
import { releasePayout } from "@/modules/payout/payout.service";
import { PayoutError } from "@/modules/payout/payout.types";
import { releasePayoutSchema } from "@/modules/payout/payout.validation";
import { z } from "zod";

/**
 * POST /api/admin/payouts/:id/release
 * Release a held payout (admin only)
 */
export const POST = requireAdmin(
  async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
    try {
      const payoutId = params.id;
      const adminId = getUserId(req);

      // Parse and validate request body (optional)
      const body = await req.json().catch(() => ({}));
      releasePayoutSchema.parse(body);

      const payout = await releasePayout({
        payoutId,
        adminId,
      });

      return NextResponse.json({
        success: true,
        message: "Payout released successfully",
        data: payout,
      });
    } catch (error) {
      console.error(`POST /api/admin/payouts/${params.id}/release error:`, error);

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
        { error: "Failed to release payout" },
        { status: 500 }
      );
    }
  }
);
