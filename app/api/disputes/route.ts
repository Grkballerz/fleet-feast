/**
 * Disputes API Route
 * POST /api/disputes - Create new dispute
 * GET /api/disputes - List user's disputes
 */

import { NextRequest, NextResponse } from "next/server";
import {
  requireAuth,
  getUserId,
  type AuthenticatedRequest,
} from "@/lib/middleware/auth.middleware";
import {
  createDispute,
  listDisputes,
} from "@/modules/dispute/dispute.service";
import { createDisputeSchema } from "@/modules/dispute/dispute.validation";
import { DisputeType } from "@/modules/dispute/dispute.types";
import { DisputeStatus } from "@prisma/client";
import { ZodError } from "zod";

/**
 * POST /api/disputes
 * Create a new dispute for a booking
 */
export const POST = requireAuth(async (req: AuthenticatedRequest) => {
  try {
    const userId = getUserId(req);

    const body = await req.json();

    // Validate request body
    const validatedData = createDisputeSchema.parse(body);

    // Store dispute data with metadata in reason field as JSON
    const disputeData = {
      bookingId: validatedData.bookingId,
      userId,
      type: validatedData.type as DisputeType,
      description: JSON.stringify({
        type: validatedData.type,
        description: validatedData.description,
        metadata: validatedData.metadata || {},
      }),
      evidence: validatedData.evidence,
    };

    // Create dispute
    const dispute = await createDispute(disputeData);

    return NextResponse.json(
      {
        success: true,
        data: dispute,
        message: "Dispute created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/disputes error:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.errors,
        },
        { status: 400 }
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
      { error: "Failed to create dispute" },
      { status: 500 }
    );
  }
});

/**
 * GET /api/disputes
 * List user's disputes with optional filters
 */
export const GET = requireAuth(async (req: AuthenticatedRequest) => {
  try {
    const userId = getUserId(req);

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as DisputeStatus | null;
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // List disputes
    const disputes = await listDisputes({
      userId,
      status: status || undefined,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      data: disputes,
      pagination: {
        limit,
        offset,
        total: disputes.length,
      },
    });
  } catch (error) {
    console.error("GET /api/disputes error:", error);

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
