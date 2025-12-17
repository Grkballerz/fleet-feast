"use client";

import React from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Rating } from "@/components/ui/Rating";
import { CuisineType, PriceRange } from "@prisma/client";
import { cn } from "@/lib/utils";

export interface TruckHeroProps {
  truck: {
    id: string;
    businessName: string;
    cuisineType: CuisineType;
    priceRange: PriceRange;
    description?: string | null;
    averageRating?: number;
    totalReviews?: number;
    coverImageUrl?: string;
  };
  className?: string;
}

/**
 * Price range display mapping
 */
const priceRangeDisplay: Record<PriceRange, string> = {
  BUDGET: "$",
  MODERATE: "$$",
  PREMIUM: "$$$",
  LUXURY: "$$$$",
};

/**
 * Cuisine type display mapping (formatted)
 */
const cuisineTypeDisplay: Record<CuisineType, string> = {
  AMERICAN: "American",
  MEXICAN: "Mexican",
  ITALIAN: "Italian",
  ASIAN: "Asian",
  BBQ: "BBQ",
  SEAFOOD: "Seafood",
  VEGETARIAN: "Vegetarian",
  VEGAN: "Vegan",
  DESSERTS: "Desserts",
  COFFEE: "Coffee & Drinks",
  OTHER: "Other",
};

/**
 * TruckHero Component
 *
 * Hero section for food truck profile pages.
 * Displays cover image, truck name, rating, cuisine badge, and price range.
 *
 * @example
 * ```tsx
 * <TruckHero truck={truckData} />
 * ```
 */
export const TruckHero: React.FC<TruckHeroProps> = ({ truck, className }) => {
  const coverImage = truck.coverImageUrl || "/images/placeholder-truck.jpg";
  const rating = truck.averageRating || 0;
  const reviewCount = truck.totalReviews || 0;

  return (
    <div className={cn("relative h-64 md:h-96 w-full overflow-hidden", className)}>
      {/* Cover Image */}
      <div className="absolute inset-0">
        <Image
          src={coverImage}
          alt={truck.businessName}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 lg:p-8 text-white">
        <div className="max-w-7xl mx-auto">
          {/* Cuisine Badge */}
          <div className="mb-3">
            <Badge
              variant="primary"
              size="md"
              className="neo-glass-brutal rounded-neo text-black neo-shadow-primary"
            >
              {cuisineTypeDisplay[truck.cuisineType]}
            </Badge>
          </div>

          {/* Truck Name */}
          <h1 className="neo-heading-xl mb-3 drop-shadow-lg text-white">
            {truck.businessName}
          </h1>

          {/* Description (optional) */}
          {truck.description && (
            <p className="text-base md:text-lg text-white/90 mb-4 max-w-3xl line-clamp-2 drop-shadow font-medium">
              {truck.description}
            </p>
          )}

          {/* Rating, Reviews, and Price */}
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            {/* Rating */}
            {rating > 0 && (
              <div className="flex items-center gap-2 neo-glass-brutal rounded-neo px-3 py-1 neo-shadow">
                <Rating value={rating} readOnly size="md" />
                <span className="text-sm md:text-base font-bold text-black">
                  {rating.toFixed(1)}
                </span>
              </div>
            )}

            {/* Review Count */}
            {reviewCount > 0 && (
              <span className="text-sm md:text-base text-white/90 font-semibold">
                ({reviewCount.toLocaleString()} {reviewCount === 1 ? "review" : "reviews"})
              </span>
            )}

            {/* Price Range */}
            <div className="flex items-center gap-2 neo-glass-brutal rounded-neo px-3 py-1 neo-shadow">
              <span className="text-sm md:text-base text-black font-medium">Price:</span>
              <span className="text-lg md:text-xl font-black tracking-wider text-black">
                {priceRangeDisplay[truck.priceRange]}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
