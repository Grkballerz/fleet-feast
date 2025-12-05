"use client";

import React from "react";
import useSWR from "swr";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Rating } from "@/components/ui/Rating";
import { Spinner } from "@/components/ui/Spinner";
import { CuisineType, PriceRange } from "@prisma/client";
import { cn } from "@/lib/utils";

export interface SimilarTrucksProps {
  currentTruckId: string;
  cuisineType: CuisineType;
  className?: string;
}

interface TruckCardData {
  id: string;
  businessName: string;
  cuisineType: CuisineType;
  priceRange: PriceRange;
  description: string | null;
  averageRating?: number;
  totalReviews?: number;
  coverImageUrl?: string;
}

/**
 * Fetcher for SWR
 */
const fetcher = (url: string) => fetch(url).then((res) => res.json());

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
 * Cuisine type display mapping
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
 * TruckCard Component
 * Displays a single similar truck card
 */
interface TruckCardProps {
  truck: TruckCardData;
}

const TruckCard: React.FC<TruckCardProps> = ({ truck }) => {
  const coverImage = truck.coverImageUrl || "/images/placeholder-truck.jpg";
  const rating = truck.averageRating || 0;
  const reviewCount = truck.totalReviews || 0;

  return (
    <Link
      href={`/trucks/${truck.id}`}
      className="group block bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
    >
      {/* Image */}
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={coverImage}
          alt={truck.businessName}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {/* Cuisine Badge */}
        <div className="absolute top-2 left-2">
          <Badge
            variant="primary"
            size="sm"
            className="bg-white/90 backdrop-blur-sm text-primary"
          >
            {cuisineTypeDisplay[truck.cuisineType]}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        {/* Truck Name */}
        <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
          {truck.businessName}
        </h3>

        {/* Description */}
        {truck.description && (
          <p className="text-sm text-text-secondary line-clamp-2">
            {truck.description}
          </p>
        )}

        {/* Rating and Price */}
        <div className="flex items-center justify-between pt-2">
          {rating > 0 ? (
            <div className="flex items-center gap-1">
              <Rating value={rating} readOnly size="sm" />
              <span className="text-sm font-medium">{rating.toFixed(1)}</span>
              {reviewCount > 0 && (
                <span className="text-xs text-text-secondary">
                  ({reviewCount})
                </span>
              )}
            </div>
          ) : (
            <span className="text-sm text-text-secondary">No reviews yet</span>
          )}

          <span className="text-sm font-semibold text-text-secondary">
            {priceRangeDisplay[truck.priceRange]}
          </span>
        </div>
      </div>
    </Link>
  );
};

/**
 * SimilarTrucks Component
 *
 * Displays a grid of 3-4 similar food trucks based on cuisine type.
 * Excludes the current truck from results.
 *
 * @example
 * ```tsx
 * <SimilarTrucks
 *   currentTruckId={truckId}
 *   cuisineType="MEXICAN"
 * />
 * ```
 */
export const SimilarTrucks: React.FC<SimilarTrucksProps> = ({
  currentTruckId,
  cuisineType,
  className,
}) => {
  // Build API URL
  const apiUrl = `/api/trucks?cuisineType=${cuisineType}&limit=4&exclude=${currentTruckId}`;

  // Fetch similar trucks with SWR
  const { data, error, isLoading } = useSWR(apiUrl, fetcher);

  return (
    <div className={cn("space-y-4", className)}>
      <h2 className="text-2xl font-bold">Similar Trucks</h2>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-error">Failed to load similar trucks.</p>
        </div>
      ) : !data?.data || data.data.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-secondary">
            No similar trucks found at this time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data.data.map((truck: TruckCardData) => (
            <TruckCard key={truck.id} truck={truck} />
          ))}
        </div>
      )}
    </div>
  );
};
