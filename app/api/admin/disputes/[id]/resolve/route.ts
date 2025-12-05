/**
 * Admin Dispute Resolution API Route
 * POST /api/admin/disputes/[id]/resolve - Resolve dispute with outcome
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, getUserId, type AuthenticatedRequest } from "@/lib/middleware/auth.middleware";
import { resolveDispute } from "@/modules/dispute/dispute.service";
import { resolveDisputeSchema } from "@/modules/dispute/dispute.validation";
import { DisputeError } from "@/modules/dispute/dispute.types";
import { ZodError } from "zod";

/**
 * POST /api/admin/disputes/[id]/resolve
 * Resolve a dispute with specific outcome (admin only)
 */
export const POST = requireAdmin(async (
  req: AuthenticatedRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const userId = getUserId(req);

    const disputeId = params.id;
    const body = await req.json();

    // Validate request body
    const validatedData = resolveDisputeSchema.parse(body);

    // Resolve dispute
    const dispute = await resolveDispute(disputeId, {
      ...validatedData,
      adminId: userId,
    });

    return NextResponse.json(
      {
        success: true,
        data: dispute,
        message: "Dispute resolved successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`POST /api/admin/disputes/${params.id}/resolve error:`, error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    if (error instanceof DisputeError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    if (error instanceof Error) {
      const statusCode = (error as any).statusCode || 500;
      return NextResponse.json(
        { error: error.message },
        { status: statusCode }
      );
    }

    return NextResponse.json(
      { error: "Failed to resolve dispute" },
      { status: 500 }
    );
  }
});
