/**
 * Reviews Service Layer
 * Handles business logic for bidirectional review system tied to completed bookings
 */

import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";
import type {
  ReviewCreateData,
  ReviewUpdateData,
  ReviewWithContext,
  ReviewListFilters,
  ReviewPagination,
  VendorRatingAggregate,
  ReviewEligibility,
  ReviewPermission,
  ReviewDirection,
} from "./reviews.types";

/**
 * Custom error class for review operations
 */
export class ReviewError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "ReviewError";
  }
}

/**
 * Determine review direction based on reviewer and booking
 */
function getReviewDirection(
  reviewerId: string,
  booking: { customerId: string; vendorId: string }
): ReviewDirection {
  return reviewerId === booking.customerId
    ? "CUSTOMER_TO_VENDOR"
    : "VENDOR_TO_CUSTOMER";
}

/**
 * Check if user can review a booking
 */
export async function checkReviewEligibility(
  userId: string,
  bookingId: string
): Promise<ReviewEligibility> {
  // Get booking details
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    return {
      canReview: false,
      reason: "Booking not found",
    };
  }

  // Check if booking is completed
  if (booking.status !== BookingStatus.COMPLETED) {
    return {
      canReview: false,
      reason: "Reviews are only allowed for completed bookings",
    };
  }

  // Check if user is a party to the booking
  const isCustomer = booking.customerId === userId;
  const isVendor = booking.vendorId === userId;

  if (!isCustomer && !isVendor) {
    return {
      canReview: false,
      reason: "You are not a party to this booking",
    };
  }

  // Check if review already exists for this user and booking
  const existingReview = await prisma.review.findFirst({
    where: {
      bookingId,
      reviewerId: userId,
      deletedAt: null,
    },
  });

  if (existingReview) {
    return {
      canReview: false,
      reason: "You have already reviewed this booking",
      existingReviewId: existingReview.id,
    };
  }

  return {
    canReview: true,
    direction: getReviewDirection(userId, booking),
  };
}

/**
 * Create a new review
 */
export async function createReview(
  userId: string,
  data: ReviewCreateData
): Promise<ReviewWithContext> {
  // Check eligibility
  const eligibility = await checkReviewEligibility(userId, data.bookingId);

  if (!eligibility.canReview) {
    throw new ReviewError(
      eligibility.reason || "Cannot create review",
      "REVIEW_NOT_ELIGIBLE",
      403
    );
  }

  // Get booking to determine reviewee
  const booking = await prisma.booking.findUnique({
    where: { id: data.bookingId },
    select: {
      customerId: true,
      vendorId: true,
      eventDate: true,
      eventType: true,
      guestCount: true,
    },
  });

  if (!booking) {
    throw new ReviewError("Booking not found", "BOOKING_NOT_FOUND", 404);
  }

  // Determine reviewee based on reviewer
  const revieweeId = userId === booking.customerId
    ? booking.vendorId
    : booking.customerId;

  // Create review
  const review = await prisma.review.create({
    data: {
      bookingId: data.bookingId,
      reviewerId: userId,
      revieweeId,
      rating: data.rating,
      content: data.content || null,
    },
    include: {
      booking: {
        select: {
          eventDate: true,
          eventType: true,
          guestCount: true,
        },
      },
      reviewer: {
        select: {
          id: true,
          email: true,
        },
      },
      reviewee: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });

  // Update vendor rating aggregate if this is a vendor review
  if (eligibility.direction === "CUSTOMER_TO_VENDOR") {
    await updateVendorRating(revieweeId);
  }

  return review;
}

/**
 * Get review by ID
 */
export async function getReviewById(
  reviewId: string,
  includeHidden: boolean = false
): Promise<ReviewWithContext | null> {
  const review = await prisma.review.findFirst({
    where: {
      id: reviewId,
      deletedAt: null,
      ...(includeHidden ? {} : { hidden: false }),
    },
    include: {
      booking: {
        select: {
          eventDate: true,
          eventType: true,
          guestCount: true,
        },
      },
      reviewer: {
        select: {
          id: true,
          email: true,
        },
      },
      reviewee: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });

  return review;
}

/**
 * Check if user can modify a review
 */
export async function checkReviewPermission(
  userId: string,
  reviewId: string
): Promise<ReviewPermission> {
  const review = await prisma.review.findFirst({
    where: {
      id: reviewId,
      deletedAt: null,
    },
  });

  if (!review) {
    return {
      canModify: false,
      reason: "Review not found",
    };
  }

  if (review.reviewerId !== userId) {
    return {
      canModify: false,
      reason: "You can only modify your own reviews",
    };
  }

  // Check 7-day edit window
  const createdAt = new Date(review.createdAt);
  const now = new Date();
  const daysSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  const withinEditWindow = daysSinceCreation <= 7;

  if (!withinEditWindow) {
    return {
      canModify: false,
      reason: "Review can only be edited within 7 days of creation",
      withinEditWindow: false,
    };
  }

  return {
    canModify: true,
    withinEditWindow: true,
  };
}

/**
 * Update a review
 */
export async function updateReview(
  userId: string,
  reviewId: string,
  data: ReviewUpdateData
): Promise<ReviewWithContext> {
  // Check permission
  const permission = await checkReviewPermission(userId, reviewId);

  if (!permission.canModify) {
    throw new ReviewError(
      permission.reason || "Cannot modify review",
      "REVIEW_NOT_MODIFIABLE",
      403
    );
  }

  // Get review to determine if it's a vendor review
  const existingReview = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { revieweeId: true },
  });

  // Update review
  const review = await prisma.review.update({
    where: { id: reviewId },
    data: {
      rating: data.rating,
      content: data.content,
      updatedAt: new Date(),
    },
    include: {
      booking: {
        select: {
          eventDate: true,
          eventType: true,
          guestCount: true,
        },
      },
      reviewer: {
        select: {
          id: true,
          email: true,
        },
      },
      reviewee: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });

  // Update vendor rating aggregate if rating changed
  if (data.rating !== undefined && existingReview) {
    await updateVendorRating(existingReview.revieweeId);
  }

  return review;
}

/**
 * Soft delete a review
 */
export async function deleteReview(
  userId: string,
  reviewId: string
): Promise<void> {
  // Check permission
  const permission = await checkReviewPermission(userId, reviewId);

  if (!permission.canModify) {
    throw new ReviewError(
      permission.reason || "Cannot delete review",
      "REVIEW_NOT_DELETABLE",
      403
    );
  }

  // Get review to determine if it's a vendor review
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { revieweeId: true },
  });

  // Soft delete
  await prisma.review.update({
    where: { id: reviewId },
    data: {
      deletedAt: new Date(),
    },
  });

  // Update vendor rating aggregate
  if (review) {
    await updateVendorRating(review.revieweeId);
  }
}

/**
 * Get reviews for a vendor
 */
export async function getVendorReviews(
  vendorId: string,
  filters: ReviewListFilters,
  pagination: ReviewPagination
): Promise<{ reviews: ReviewWithContext[]; total: number }> {
  const { rating, minRating, includeHidden = false } = filters;
  const { page, limit, sortBy = "createdAt", sortOrder = "desc" } = pagination;

  const offset = (page - 1) * limit;

  // Build where clause
  const where: any = {
    revieweeId: vendorId,
    deletedAt: null,
    ...(includeHidden ? {} : { hidden: false }),
  };

  if (rating !== undefined) {
    where.rating = rating;
  }

  if (minRating !== undefined) {
    where.rating = { gte: minRating };
  }

  // Get reviews and count
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        booking: {
          select: {
            eventDate: true,
            eventType: true,
            guestCount: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            email: true,
          },
        },
        reviewee: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: offset,
      take: limit,
    }),
    prisma.review.count({ where }),
  ]);

  return { reviews, total };
}

/**
 * Get reviews by a user (as reviewer)
 */
export async function getUserReviews(
  userId: string,
  filters: ReviewListFilters,
  pagination: ReviewPagination
): Promise<{ reviews: ReviewWithContext[]; total: number }> {
  const { rating, minRating, includeHidden = false } = filters;
  const { page, limit, sortBy = "createdAt", sortOrder = "desc" } = pagination;

  const offset = (page - 1) * limit;

  // Build where clause
  const where: any = {
    reviewerId: userId,
    deletedAt: null,
    ...(includeHidden ? {} : { hidden: false }),
  };

  if (rating !== undefined) {
    where.rating = rating;
  }

  if (minRating !== undefined) {
    where.rating = { gte: minRating };
  }

  // Get reviews and count
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        booking: {
          select: {
            eventDate: true,
            eventType: true,
            guestCount: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            email: true,
          },
        },
        reviewee: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: offset,
      take: limit,
    }),
    prisma.review.count({ where }),
  ]);

  return { reviews, total };
}

/**
 * Calculate and cache vendor rating aggregate
 */
export async function updateVendorRating(
  vendorId: string
): Promise<VendorRatingAggregate> {
  // Get all non-hidden, non-deleted reviews for the vendor
  const reviews = await prisma.review.findMany({
    where: {
      revieweeId: vendorId,
      hidden: false,
      deletedAt: null,
    },
    select: {
      rating: true,
    },
  });

  const totalReviews = reviews.length;

  // Calculate average
  const averageRating = totalReviews > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0;

  // Calculate rating breakdown
  const ratingBreakdown = {
    1: reviews.filter(r => r.rating === 1).length,
    2: reviews.filter(r => r.rating === 2).length,
    3: reviews.filter(r => r.rating === 3).length,
    4: reviews.filter(r => r.rating === 4).length,
    5: reviews.filter(r => r.rating === 5).length,
  };

  // Note: In a production system, you would cache this in the Vendor model
  // or a separate cache table. For now, we just return the calculated values.
  // This could be extended to store in vendor table with fields like:
  // - averageRating: Decimal
  // - totalReviews: Int
  // - ratingBreakdown: Json

  return {
    vendorId,
    averageRating,
    totalReviews,
    ratingBreakdown,
  };
}

/**
 * Get vendor rating aggregate
 */
export async function getVendorRating(
  vendorId: string
): Promise<VendorRatingAggregate> {
  return updateVendorRating(vendorId);
}

/**
 * Mask email address for public display
 * Examples:
 * - john.doe@example.com -> j***@example.com
 * - test@mail.com -> t***@mail.com
 */
export function maskEmail(email: string): string {
  const [localPart, domain] = email.split("@");

  if (!localPart || !domain) {
    return email; // Invalid email, return as-is
  }

  const masked = localPart.charAt(0) + "***";
  return `${masked}@${domain}`;
}

/**
 * Format review for public display (masks emails)
 */
export function formatReviewForDisplay(review: ReviewWithContext): any {
  return {
    ...review,
    reviewer: {
      ...review.reviewer,
      email: maskEmail(review.reviewer.email),
    },
    reviewee: {
      ...review.reviewee,
      email: maskEmail(review.reviewee.email),
    },
  };
}
