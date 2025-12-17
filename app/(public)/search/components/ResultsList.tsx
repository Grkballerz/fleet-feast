"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Rating } from "@/components/ui/Rating";
import { Spinner } from "@/components/ui/Spinner";
import { CuisineType, PriceRange } from "@prisma/client";

export interface TruckListItem {
  id: string;
  businessName: string;
  cuisineType: CuisineType;
  priceRange: PriceRange;
  averageRating?: number;
  totalReviews?: number;
  description?: string | null;
  serviceArea?: string | null;
  distance?: number;
  capacityMin?: number;
  capacityMax?: number;
  imageUrl?: string | null;
}

export interface ResultsListProps {
  /**
   * Array of truck data
   */
  trucks: TruckListItem[];
  /**
   * Loading state
   */
  isLoading?: boolean;
  /**
   * Empty state message
   */
  emptyMessage?: string;
}

/**
 * Format price range for display
 */
const formatPriceRange = (priceRange: PriceRange): string => {
  switch (priceRange) {
    case "BUDGET":
      return "$";
    case "MODERATE":
      return "$$";
    case "PREMIUM":
      return "$$$";
    case "LUXURY":
      return "$$$$";
    default:
      return "$$";
  }
};

/**
 * Format cuisine type for display
 */
const formatCuisineType = (cuisineType: CuisineType): string => {
  return cuisineType
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * ResultsList Component
 *
 * List layout for displaying food truck search results.
 * Shows more details than grid view.
 *
 * @example
 * ```tsx
 * <ResultsList
 *   trucks={trucks}
 *   isLoading={false}
 *   emptyMessage="No trucks found"
 * />
 * ```
 */
export const ResultsList: React.FC<ResultsListProps> = ({
  trucks,
  isLoading = false,
  emptyMessage = "No food trucks found matching your criteria.",
}) => {
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Searching for food trucks...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (trucks.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="mb-4 text-6xl">🔍</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No Results Found
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          {emptyMessage}
        </p>
        <p className="text-sm text-gray-500 mt-4">
          Try adjusting your filters or search query.
        </p>
      </div>
    );
  }

  // List of truck rows
  return (
    <div className="space-y-4">
      {trucks.map((truck) => (
        <ListItem key={truck.id} truck={truck} />
      ))}
    </div>
  );
};

// Separate component to handle image error state
const ListItem: React.FC<{ truck: TruckListItem }> = ({ truck }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <Link
      href={`/trucks/${truck.id}`}
      className="block neo-card-glass rounded-neo neo-shadow hover:neo-shadow-lg transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
    >
      <div className="flex flex-col md:flex-row">
        {/* Image */}
        <div className="w-full md:w-48 h-48 md:h-auto bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
          {truck.imageUrl && !imageError ? (
            <Image
              src={truck.imageUrl}
              alt={truck.businessName}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
              unoptimized
            />
          ) : (
            <span className="text-5xl">🚚</span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-bold text-xl text-gray-900 mb-1">
                {truck.businessName}
              </h3>
              <div className="flex items-center gap-2 mb-2">
                <span className="neo-border-thin rounded-neo px-3 py-1 bg-gray-100 text-gray-700 font-bold text-xs">
                  {formatCuisineType(truck.cuisineType)}
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {formatPriceRange(truck.priceRange)}
                </span>
              </div>
            </div>
            {truck.distance !== undefined && (
              <div className="text-right ml-4">
                <span className="text-sm text-gray-600">
                  {truck.distance < 1
                    ? `${(truck.distance * 1000).toFixed(0)} ft`
                    : `${truck.distance.toFixed(1)} mi`}
                </span>
              </div>
            )}
          </div>

          {/* Rating */}
          {truck.averageRating !== undefined && (
            <div className="flex items-center gap-2 mb-3">
              <Rating value={truck.averageRating} readOnly size="sm" />
              {truck.totalReviews !== undefined && truck.totalReviews > 0 && (
                <span className="text-sm text-gray-600">
                  ({truck.totalReviews} {truck.totalReviews === 1 ? "review" : "reviews"})
                </span>
              )}
            </div>
          )}

          {/* Description */}
          {truck.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {truck.description}
            </p>
          )}

          {/* Details */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            {truck.serviceArea && (
              <div className="flex items-center gap-1">
                <span>📍</span>
                <span>{truck.serviceArea}</span>
              </div>
            )}
            {truck.capacityMin !== undefined && truck.capacityMax !== undefined && (
              <div className="flex items-center gap-1">
                <span>👥</span>
                <span>
                  {truck.capacityMin}-{truck.capacityMax} guests
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};
