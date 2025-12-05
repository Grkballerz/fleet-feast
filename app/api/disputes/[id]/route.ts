/**
 * Individual Dispute API Route
 * GET /api/disputes/[id] - Get dispute details
 * PUT /api/disputes/[id] - Update dispute (limited)
 */

import { NextRequest, NextResponse } from "next/server";
import {
  requireAuth,
  getUserId,
  getUser,
  type AuthenticatedRequest,
} from "@/lib/middleware/auth.middleware";
import {
  getDisputeDetails,
} from "@/modules/dispute/dispute.service";
import { DisputeError } from "@/modules/dispute/dispute.types";

/**
 * GET /api/disputes/[id]
 * Get details of a specific dispute
 */
export const GET = requireAuth(async (
  req: AuthenticatedRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const userId = getUserId(req);
    const user = getUser(req);

    const disputeId = params.id;

    // Get dispute details
    const dispute = await getDisputeDetails(disputeId);

    // Verify user is authorized (customer, vendor, or admin)
    if (
      dispute.initiatorId !== userId &&
      user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "You don't have permission to view this dispute" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: dispute,
    });
  } catch (error) {
    console.error(`GET /api/disputes/${params.id} error:`, error);

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
 * PUT /api/disputes/[id]
 * Update dispute (customer can add evidence/notes)
 */
export const PUT = requireAuth(async (
  req: AuthenticatedRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const userId = getUserId(req);

    const disputeId = params.id;

    // Get dispute to verify ownership
    const dispute = await getDisputeDetails(disputeId);

    // Only initiator can update
    if (dispute.initiatorId !== userId) {
      return NextResponse.json(
        { error: "You don't have permission to update this dispute" },
        { status: 403 }
      );
    }

    // Only allow updates if still OPEN or INVESTIGATING
    if (
      dispute.status !== "OPEN" &&
      dispute.status !== "INVESTIGATING"
    ) {
      return NextResponse.json(
        { error: "Cannot update dispute in current status" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Dispute updates are managed by admins. Please contact support to add additional information.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error(`PUT /api/disputes/${params.id} error:`, error);

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
