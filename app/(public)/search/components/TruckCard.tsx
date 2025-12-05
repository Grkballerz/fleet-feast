"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Rating } from "@/components/ui/Rating";
import { CuisineType, PriceRange } from "@prisma/client";

export interface TruckCardProps {
  /**
   * Truck ID
   */
  id: string;
  /**
   * Business name
   */
  businessName: string;
  /**
   * Cuisine type
   */
  cuisineType: CuisineType;
  /**
   * Price range
   */
  priceRange: PriceRange;
  /**
   * Average rating (1-5)
   */
  averageRating?: number;
  /**
   * Total number of reviews
   */
  totalReviews?: number;
  /**
   * Description
   */
  description?: string | null;
  /**
   * Service area
   */
  serviceArea?: string | null;
  /**
   * Distance from user location (in miles)
   */
  distance?: number;
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
 * TruckCard Component
 *
 * Card display for a food truck in search results (grid view).
 * Shows key information and links to truck profile.
 *
 * @example
 * ```tsx
 * <TruckCard
 *   id="123"
 *   businessName="Taco Paradise"
 *   cuisineType="MEXICAN"
 *   priceRange="MODERATE"
 *   averageRating={4.5}
 *   totalReviews={120}
 * />
 * ```
 */
export const TruckCard: React.FC<TruckCardProps> = ({
  id,
  businessName,
  cuisineType,
  priceRange,
  averageRating,
  totalReviews,
  description,
  serviceArea,
  distance,
}) => {
  return (
    <Link href={`/trucks/${id}`} className="block h-full">
      <Card className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer">
        {/* Placeholder for image - will be added when image upload is implemented */}
        <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-lg flex items-center justify-center">
          <span className="text-4xl">🚚</span>
        </div>

        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
              {businessName}
            </h3>
            <span className="text-sm font-medium text-gray-600 ml-2">
              {formatPriceRange(priceRange)}
            </span>
          </div>

          {/* Cuisine type badge */}
          <div className="mb-3">
            <Badge variant="secondary" size="sm">
              {formatCuisineType(cuisineType)}
            </Badge>
          </div>

          {/* Rating */}
          {averageRating !== undefined && (
            <div className="flex items-center gap-2 mb-3">
              <Rating value={averageRating} readOnly size="sm" />
              {totalReviews !== undefined && totalReviews > 0 && (
                <span className="text-sm text-gray-600">
                  ({totalReviews} {totalReviews === 1 ? "review" : "reviews"})
                </span>
              )}
            </div>
          )}

          {/* Description */}
          {description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {description}
            </p>
          )}

          {/* Service area and distance */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            {serviceArea && (
              <span className="line-clamp-1">{serviceArea}</span>
            )}
            {distance !== undefined && (
              <span className="ml-auto">
                {distance < 1
                  ? `${(distance * 1000).toFixed(0)} ft`
                  : `${distance.toFixed(1)} mi`}
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
};
