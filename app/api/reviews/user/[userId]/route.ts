/**
 * GET /api/reviews/user/:userId - Get reviews by a user
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getUserReviews,
  formatReviewForDisplay,
} from "@/modules/reviews/reviews.service";
import {
  userIdParamSchema,
  reviewListQuerySchema,
} from "@/modules/reviews/reviews.validation";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Validate user ID parameter
    const idValidation = userIdParamSchema.safeParse({
      userId: params.userId,
    });

    if (!idValidation.success) {
      return NextResponse.json(
        {
          error: "Invalid user ID",
          details: idValidation.error.errors,
        },
        { status: 400 }
      );
    }

    const userId = idValidation.data.userId;

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryValidation = reviewListQuerySchema.safeParse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      sortBy: searchParams.get("sortBy"),
      sortOrder: searchParams.get("sortOrder"),
      rating: searchParams.get("rating"),
      minRating: searchParams.get("minRating"),
    });

    if (!queryValidation.success) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: queryValidation.error.errors,
        },
        { status: 400 }
      );
    }

    const query = queryValidation.data;

    // Get reviews
    const { reviews, total } = await getUserReviews(
      userId,
      {
        rating: query.rating,
        minRating: query.minRating,
        includeHidden: false, // Public endpoint, don't show hidden reviews
      },
      {
        page: query.page,
        limit: query.limit,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      }
    );

    // Format reviews for display (mask emails)
    const formattedReviews = reviews.map(formatReviewForDisplay);

    return NextResponse.json({
      success: true,
      reviews: formattedReviews,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    });
  } catch (error) {
    console.error("User reviews fetch error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
