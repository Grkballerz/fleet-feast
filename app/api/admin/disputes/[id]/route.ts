/**
 * Admin Dispute Detail API Route
 * GET /api/admin/disputes/[id] - Get dispute details
 * PUT /api/admin/disputes/[id] - Update dispute status
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, getUserId, type AuthenticatedRequest } from "@/lib/middleware/auth.middleware";
import {
  getDisputeDetails,
  updateDisputeStatus,
  autoResolveDispute,
} from "@/modules/dispute/dispute.service";
import { updateDisputeSchema } from "@/modules/dispute/dispute.validation";
import { DisputeError } from "@/modules/dispute/dispute.types";
import { ZodError } from "zod";

/**
 * GET /api/admin/disputes/[id]
 * Get complete dispute details (admin only)
 */
export const GET = requireAdmin(async (
  req: AuthenticatedRequest,
  { params }: { params: { id: string } }
) => {
  try {

    const disputeId = params.id;

    // Get dispute details
    const dispute = await getDisputeDetails(disputeId);

    return NextResponse.json({
      success: true,
      data: dispute,
    });
  } catch (error) {
    console.error(`GET /api/admin/disputes/${params.id} error:`, error);

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
      { error: "Failed to fetch dispute details" },
      { status: 500 }
    );
  }
});

/**
 * PUT /api/admin/disputes/[id]
 * Update dispute status (admin only)
 */
export const PUT = requireAdmin(async (
  req: AuthenticatedRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const userId = getUserId(req);

    const disputeId = params.id;
    const body = await req.json();

    // Check for auto-resolve flag
    if (body.autoResolve === true) {
      const result = await autoResolveDispute(disputeId, userId);

      return NextResponse.json({
        success: true,
        data: result.details,
        autoResolved: result.resolved,
        message: result.resolved
          ? "Dispute auto-resolved successfully"
          : "Dispute cannot be auto-resolved - manual review required",
      });
    }

    // Validate request body
    const validatedData = updateDisputeSchema.parse(body);

    // Update dispute
    const dispute = await updateDisputeStatus(disputeId, validatedData);

    return NextResponse.json({
      success: true,
      data: dispute,
      message: "Dispute updated successfully",
    });
  } catch (error) {
    console.error(`PUT /api/admin/disputes/${params.id} error:`, error);

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
      { error: "Failed to update dispute" },
      { status: 500 }
    );
  }
});
