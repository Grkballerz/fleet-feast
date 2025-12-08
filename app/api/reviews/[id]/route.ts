/**
 * GET /api/reviews/:id - Get a single review
 * PUT /api/reviews/:id - Update a review
 * DELETE /api/reviews/:id - Delete a review
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getReviewById,
  updateReview,
  deleteReview,
  formatReviewForDisplay,
  ReviewError,
} from "@/modules/reviews/reviews.service";
import {
  uuidParamSchema,
  reviewUpdateSchema,
} from "@/modules/reviews/reviews.validation";

/**
 * GET /api/reviews/:id
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate ID parameter
    const validation = uuidParamSchema.safeParse({ id: params.id });

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid review ID",
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const reviewId = validation.data.id;

    // Get review (public endpoint, no auth required, but don't show hidden reviews)
    const review = await getReviewById(reviewId, false);

    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    // Format for display (mask emails)
    const formattedReview = formatReviewForDisplay(review);

    return NextResponse.json({
      success: true,
      review: formattedReview,
    });
  } catch (error) {
    console.error("Review fetch error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/reviews/:id
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Validate ID parameter
    const idValidation = uuidParamSchema.safeParse({ id: params.id });

    if (!idValidation.success) {
      return NextResponse.json(
        {
          error: "Invalid review ID",
          details: idValidation.error.errors,
        },
        { status: 400 }
      );
    }

    const reviewId = idValidation.data.id;

    // Parse and validate request body
    const body = await request.json();
    const bodyValidation = reviewUpdateSchema.safeParse(body);

    if (!bodyValidation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: bodyValidation.error.errors,
        },
        { status: 400 }
      );
    }

    const data = bodyValidation.data;

    // Update review
    const review = await updateReview(session.user.id, reviewId, data);

    // Format for display (mask emails)
    const formattedReview = formatReviewForDisplay(review);

    return NextResponse.json({
      success: true,
      review: formattedReview,
    });
  } catch (error) {
    console.error("Review update error:", error);

    if (error instanceof ReviewError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reviews/:id
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Validate ID parameter
    const validation = uuidParamSchema.safeParse({ id: params.id });

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid review ID",
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const reviewId = validation.data.id;

    // Delete review (soft delete)
    await deleteReview(session.user.id, reviewId);

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Review deletion error:", error);

    if (error instanceof ReviewError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
