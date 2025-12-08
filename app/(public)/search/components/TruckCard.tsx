"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Rating } from "@/components/ui/Rating";
import { CuisineType, PriceRange } from "@prisma/client";

export interface TruckCardProps {
  id: string;
  businessName: string;
  cuisineType: CuisineType;
  priceRange: PriceRange;
  averageRating?: number;
  totalReviews?: number;
  description?: string | null;
  serviceArea?: string | null;
  distance?: number;
  imageUrl?: string | null;
}

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

const formatCuisineType = (cuisineType: CuisineType): string => {
  return cuisineType
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Cuisine-specific gradient backgrounds
const cuisineGradients: Record<string, string> = {
  MEXICAN: "from-orange-400 via-red-500 to-yellow-500",
  AMERICAN: "from-red-500 via-blue-500 to-white",
  ITALIAN: "from-green-500 via-white to-red-500",
  KOREAN: "from-red-600 via-pink-500 to-blue-500",
  ASIAN: "from-red-500 via-yellow-400 to-orange-500",
  INDIAN: "from-orange-500 via-red-600 to-yellow-400",
  MEDITERRANEAN: "from-blue-400 via-cyan-400 to-teal-500",
  BBQ: "from-amber-600 via-red-600 to-yellow-600",
  SEAFOOD: "from-blue-400 via-cyan-500 to-blue-600",
  DESSERT: "from-pink-400 via-purple-400 to-pink-500",
  VEGAN: "from-green-400 via-emerald-500 to-teal-500",
  FUSION: "from-purple-500 via-pink-500 to-red-500",
  default: "from-primary via-red-500 to-orange-500",
};

// Cuisine-specific emojis
const cuisineEmojis: Record<string, string> = {
  MEXICAN: "🌮",
  AMERICAN: "🍔",
  ITALIAN: "🍕",
  KOREAN: "🍜",
  ASIAN: "🥡",
  INDIAN: "🍛",
  MEDITERRANEAN: "🥙",
  BBQ: "🍖",
  SEAFOOD: "🦐",
  DESSERT: "🍰",
  VEGAN: "🥗",
  FUSION: "🍱",
  default: "🚚",
};

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
  imageUrl,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const gradient = cuisineGradients[cuisineType] || cuisineGradients.default;
  const emoji = cuisineEmojis[cuisineType] || cuisineEmojis.default;

  return (
    <Link
      href={`/trucks/${id}`}
      className="block h-full group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-full neo-card-glass rounded-neo overflow-hidden neo-shadow hover:neo-shadow-lg transition-all duration-300 transform hover:-translate-y-1">
        {/* Image Section */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {imageUrl && !imageError ? (
            <Image
              src={imageUrl}
              alt={businessName}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              onError={() => setImageError(true)}
              unoptimized
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center relative`}>
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.3),transparent_70%)]" />
              </div>
              <span className="text-7xl transform transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12 relative z-10">
                {emoji}
              </span>
            </div>
          )}

          {/* Overlay on hover */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

          {/* Price badge */}
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1.5 rounded-neo neo-border-thick bg-white text-gray-900 text-sm font-bold neo-shadow">
              {formatPriceRange(priceRange)}
            </span>
          </div>

          {/* Rating badge */}
          {averageRating !== undefined && averageRating > 0 && (
            <div className="absolute top-3 right-3">
              <span className="flex items-center gap-1 px-3 py-1.5 rounded-neo neo-border-thick bg-yellow-400 text-gray-900 text-sm font-bold neo-shadow">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {averageRating.toFixed(1)}
              </span>
            </div>
          )}

          {/* Quick view button */}
          <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <span className="neo-btn-primary px-6 py-3 rounded-neo text-gray-900 font-bold transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex items-center gap-2">
              View Menu
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5">
          {/* Name */}
          <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-primary transition-colors duration-300 line-clamp-1">
            {businessName}
          </h3>

          {/* Cuisine badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className="neo-border-thin rounded-neo px-3 py-1 bg-gray-100 text-gray-700 font-bold text-sm">
              {formatCuisineType(cuisineType)}
            </span>
          </div>

          {/* Rating with reviews */}
          {averageRating !== undefined && (
            <div className="flex items-center gap-2 mb-3">
              <Rating value={averageRating} readOnly size="sm" />
              {totalReviews !== undefined && totalReviews > 0 && (
                <span className="text-sm text-gray-500">
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
              <span className="flex items-center gap-1 line-clamp-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {serviceArea}
              </span>
            )}
            {distance !== undefined && (
              <span className="ml-auto font-medium text-primary">
                {distance < 1
                  ? `${(distance * 5280).toFixed(0)} ft`
                  : `${distance.toFixed(1)} mi`}
              </span>
            )}
          </div>
        </div>

        {/* Bottom accent line */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} transform origin-left transition-transform duration-500 ${isHovered ? 'scale-x-100' : 'scale-x-0'}`} />
      </div>
    </Link>
  );
};
