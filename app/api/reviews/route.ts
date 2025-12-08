/**
 * POST /api/reviews - Create a new review
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  createReview,
  formatReviewForDisplay,
  ReviewError,
} from "@/modules/reviews/reviews.service";
import { reviewCreateSchema } from "@/modules/reviews/reviews.validation";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = reviewCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Create review
    const review = await createReview(session.user.id, data);

    // Format for display (mask emails)
    const formattedReview = formatReviewForDisplay(review);

    return NextResponse.json(
      {
        success: true,
        review: formattedReview,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Review creation error:", error);

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
