"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Rating } from "@/components/ui/Rating";
import type { PublicTruckProfile } from "@/modules/trucks/trucks.types";

interface FeaturedTrucksClientProps {
  trucks: PublicTruckProfile[];
  title: string;
}

// Cuisine-specific gradient backgrounds as fallback
const cuisineGradients: Record<string, string> = {
  MEXICAN: "from-orange-400 via-red-500 to-yellow-500",
  AMERICAN: "from-red-500 via-amber-500 to-yellow-400",
  ITALIAN: "from-green-500 via-white to-red-500",
  ASIAN: "from-red-600 via-pink-500 to-blue-500",
  KOREAN: "from-red-600 via-pink-500 to-blue-500",
  BBQ: "from-amber-600 via-orange-500 to-red-600",
  SEAFOOD: "from-blue-500 via-cyan-400 to-teal-500",
  default: "from-primary via-red-500 to-orange-500",
};

// Price range display mapping
const priceRangeDisplay: Record<string, string> = {
  BUDGET: "$10-15",
  MODERATE: "$15-25",
  PREMIUM: "$25-40",
  LUXURY: "$40+",
};

export const FeaturedTrucksClient: React.FC<FeaturedTrucksClientProps> = ({
  trucks,
  title,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-neo neo-glass-brutal neo-shadow bg-primary/10 text-primary text-sm font-bold mb-4">
            🔥 Popular Choices
          </span>
          <h2 className="neo-heading-xl text-gray-900 mb-4">{title}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium">
            Discover the most popular food trucks, ready to make your event
            unforgettable
          </p>
        </div>

        {/* Trucks Carousel with Navigation */}
        <div className="relative">
          {/* Navigation Arrows - visible on tablet (md) and desktop, hidden on mobile */}
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="hidden md:flex absolute -left-2 lg:-left-4 xl:-left-14 top-28 z-20 w-10 h-10 lg:w-12 lg:h-12 rounded-neo neo-card-glass neo-shadow items-center justify-center text-gray-600 hover:text-primary hover:neo-shadow-lg transition-all duration-300 hover:scale-110"
          >
            <svg
              className="w-5 h-5 lg:w-6 lg:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="hidden md:flex absolute -right-2 lg:-right-4 xl:-right-14 top-28 z-20 w-10 h-10 lg:w-12 lg:h-12 rounded-neo neo-card-glass neo-shadow items-center justify-center text-gray-600 hover:text-primary hover:neo-shadow-lg transition-all duration-300 hover:scale-110"
          >
            <svg
              className="w-5 h-5 lg:w-6 lg:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Trucks Carousel - horizontal scroll at all breakpoints */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide scroll-smooth"
          >
            {trucks.map((truck, index) => (
              <Link
                key={truck.id}
                href={`/trucks/${truck.id}`}
                className="group flex-shrink-0 w-[280px] md:w-[320px] lg:w-[300px] snap-center"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="relative h-full bg-white rounded-neo neo-border neo-shadow overflow-hidden hover:neo-shadow-lg transition-all duration-500 transform hover:-translate-y-2">
                  {/* Card Image */}
                  <div className="relative h-56 overflow-hidden">
                    {truck.coverImageUrl ? (
                      <Image
                        src={truck.coverImageUrl}
                        alt={truck.businessName}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        unoptimized
                      />
                    ) : (
                      <div
                        className={`w-full h-full bg-gradient-to-br ${
                          cuisineGradients[truck.cuisineType] ||
                          cuisineGradients.default
                        } flex items-center justify-center`}
                      >
                        <span className="text-6xl opacity-80">🚚</span>
                      </div>
                    )}

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Featured Badge - show for first 2 trucks */}
                    {index < 2 && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white neo-border neo-shadow font-bold">
                          ⭐ Featured
                        </Badge>
                      </div>
                    )}

                    {/* Quick View Button */}
                    <div
                      className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                        hoveredIndex === index ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <span className="px-6 py-3 neo-glass-brutal rounded-neo text-gray-900 font-bold neo-shadow transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        View Menu →
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl neo-heading text-gray-900 group-hover:text-primary transition-colors duration-300 line-clamp-1">
                        {truck.businessName}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Badge
                        variant="secondary"
                        className="bg-gray-100 text-gray-700 neo-border-thin rounded-neo font-bold"
                      >
                        {truck.cuisineType}
                      </Badge>
                      <span className="text-sm font-bold text-gray-500">
                        {priceRangeDisplay[truck.priceRange] || truck.priceRange}
                      </span>
                    </div>

                    {/* Rating with Animation */}
                    {truck.averageRating !== undefined && truck.averageRating > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Rating
                            value={truck.averageRating}
                            readOnly
                            size="sm"
                          />
                        </div>
                        <span className="text-sm text-gray-600 font-bold">
                          {truck.averageRating.toFixed(1)}
                        </span>
                        {truck.totalReviews !== undefined && (
                          <span className="text-sm text-gray-400 font-medium">
                            ({truck.totalReviews} reviews)
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bottom Accent Line */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-orange-500 to-yellow-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* View All Link */}
        <div className="text-center mt-12">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-neo neo-btn-primary group"
          >
            View All Food Trucks
            <svg
              className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};
