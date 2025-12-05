/**
 * GET /api/reviews/vendor/:vendorId - Get reviews for a vendor
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getVendorReviews,
  getVendorRating,
  formatReviewForDisplay,
} from "@/modules/reviews/reviews.service";
import {
  vendorIdParamSchema,
  reviewListQuerySchema,
} from "@/modules/reviews/reviews.validation";

export async function GET(
  request: NextRequest,
  { params }: { params: { vendorId: string } }
) {
  try {
    // Validate vendor ID parameter
    const idValidation = vendorIdParamSchema.safeParse({
      vendorId: params.vendorId,
    });

    if (!idValidation.success) {
      return NextResponse.json(
        {
          error: "Invalid vendor ID",
          details: idValidation.error.errors,
        },
        { status: 400 }
      );
    }

    const vendorId = idValidation.data.vendorId;

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
    const { reviews, total } = await getVendorReviews(
      vendorId,
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

    // Get aggregate rating
    const aggregate = await getVendorRating(vendorId);

    // Format reviews for display (mask emails)
    const formattedReviews = reviews.map(formatReviewForDisplay);

    return NextResponse.json({
      success: true,
      reviews: formattedReviews,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
      aggregate: {
        averageRating: aggregate.averageRating,
        totalReviews: aggregate.totalReviews,
        ratingBreakdown: aggregate.ratingBreakdown,
      },
    });
  } catch (error) {
    console.error("Vendor reviews fetch error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
