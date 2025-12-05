/**
 * Reviews Module - Type Definitions
 * Bidirectional review system tied to completed bookings
 */

import { Review, Booking } from "@prisma/client";

/**
 * Review direction
 */
export type ReviewDirection = "CUSTOMER_TO_VENDOR" | "VENDOR_TO_CUSTOMER";

/**
 * Review submission data
 */
export interface ReviewCreateData {
  bookingId: string;
  rating: number; // 1-5 stars (required)
  content?: string; // Optional written review
}

/**
 * Review update data
 */
export interface ReviewUpdateData {
  rating?: number;
  content?: string;
}

/**
 * Review with context
 */
export interface ReviewWithContext extends Review {
  booking: {
    eventDate: Date;
    eventType: string;
    guestCount: number;
  };
  reviewer: {
    id: string;
    email: string; // Will be masked in public display
  };
  reviewee: {
    id: string;
    email: string;
  };
}

/**
 * Review listing filters
 */
export interface ReviewListFilters {
  rating?: number; // Filter by specific rating
  minRating?: number; // Minimum rating filter
  includeHidden?: boolean; // Admin only
}

/**
 * Review listing pagination
 */
export interface ReviewPagination {
  page: number;
  limit: number;
  sortBy?: "createdAt" | "rating";
  sortOrder?: "asc" | "desc";
}

/**
 * Aggregate vendor ratings
 */
export interface VendorRatingAggregate {
  vendorId: string;
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

/**
 * Review eligibility check result
 */
export interface ReviewEligibility {
  canReview: boolean;
  reason?: string;
  existingReviewId?: string;
  direction?: ReviewDirection;
}

/**
 * Review permission check result
 */
export interface ReviewPermission {
  canModify: boolean;
  reason?: string;
  withinEditWindow?: boolean;
}
