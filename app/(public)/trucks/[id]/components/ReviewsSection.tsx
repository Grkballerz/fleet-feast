"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { Rating } from "@/components/ui/Rating";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";

export interface Review {
  id: string;
  rating: number;
  content: string | null;
  createdAt: string;
  reviewer: {
    name: string;
  };
}

export interface ReviewsSectionProps {
  vendorId: string;
  averageRating: number;
  totalReviews: number;
  className?: string;
}

/**
 * Fetcher for SWR
 */
const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * ReviewCard Component
 * Displays a single review with rating, content, and date
 */
interface ReviewCardProps {
  review: Review;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  return (
    <div className="neo-border-thin border-b py-4 last:border-0">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-primary/10 text-primary rounded-neo neo-border flex items-center justify-center font-black">
            {review.reviewer.name.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Review Content */}
        <div className="flex-1 space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="font-bold">{review.reviewer.name}</p>
              <p className="text-xs text-text-secondary font-medium">
                {formatRelativeTime(new Date(review.createdAt))}
              </p>
            </div>
            <Rating value={review.rating} readOnly size="sm" />
          </div>

          {/* Review Text */}
          {review.content && (
            <p className="text-sm text-text-primary leading-relaxed font-medium">
              {review.content}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Pagination Component
 */
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1 px-4 py-2 rounded-neo neo-border font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:neo-shadow transition-all bg-white"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </button>

      <span className="text-sm text-text-primary font-bold px-4">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 px-4 py-2 rounded-neo neo-border font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:neo-shadow transition-all bg-white"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};

/**
 * ReviewsSection Component
 *
 * Displays reviews for a food truck with pagination and rating filter.
 * Uses SWR for client-side data fetching and caching.
 *
 * @example
 * ```tsx
 * <ReviewsSection
 *   vendorId={vendorId}
 *   averageRating={4.5}
 *   totalReviews={124}
 * />
 * ```
 */
export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  vendorId,
  averageRating,
  totalReviews,
  className,
}) => {
  const [page, setPage] = useState(1);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);

  const limit = 10;

  // Build API URL
  const apiUrl = `/api/reviews/vendor/${vendorId}?page=${page}&limit=${limit}${
    ratingFilter ? `&rating=${ratingFilter}` : ""
  }`;

  // Fetch reviews with SWR
  const { data, error, isLoading } = useSWR(apiUrl, fetcher);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="neo-heading text-2xl">Reviews</h2>
          <div className="flex items-center gap-2 mt-2">
            <Rating value={averageRating} readOnly size="md" />
            <span className="font-black">{averageRating.toFixed(1)}</span>
            <span className="text-sm text-text-secondary font-medium">
              ({totalReviews.toLocaleString()} {totalReviews === 1 ? "review" : "reviews"})
            </span>
          </div>
        </div>

        {/* Rating Filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="rating-filter" className="text-sm font-bold">
            Filter by rating:
          </label>
          <select
            id="rating-filter"
            value={ratingFilter || ""}
            onChange={(e) => {
              setRatingFilter(e.target.value ? Number(e.target.value) : null);
              setPage(1); // Reset to page 1 when filter changes
            }}
            className="neo-input px-3 py-2 rounded-neo text-sm font-medium"
          >
            <option value="">All ratings</option>
            {[5, 4, 3, 2, 1].map((rating) => (
              <option key={rating} value={rating}>
                {rating} star{rating !== 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="neo-card-glass rounded-neo neo-shadow p-4 md:p-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-error font-bold">Failed to load reviews. Please try again later.</p>
          </div>
        ) : data?.reviews?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-secondary font-medium">
              {ratingFilter
                ? `No ${ratingFilter}-star reviews found.`
                : "No reviews yet. Be the first to review!"}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {data?.reviews?.map((review: Review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={page}
              totalPages={data?.totalPages || 1}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      {/* Rating Breakdown (optional enhancement) */}
      {data?.aggregate?.ratingBreakdown && (
        <div className="neo-card-glass rounded-neo neo-shadow p-4 md:p-6">
          <h3 className="font-black mb-4">Rating Breakdown</h3>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = data.aggregate.ratingBreakdown[rating] || 0;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

              return (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm font-bold w-12">{rating} star</span>
                  <div className="flex-1 h-3 bg-gray-200 rounded-neo overflow-hidden neo-border-thin">
                    <div
                      className="h-full bg-warning transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-text-secondary font-bold w-12 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
