"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Rating } from "@/components/ui/Rating";

export interface FoodTruck {
  /**
   * Truck ID
   */
  id: string;
  /**
   * Truck name
   */
  name: string;
  /**
   * Cuisine type
   */
  cuisine: string;
  /**
   * Truck image URL
   */
  image?: string;
  /**
   * Average rating
   */
  rating?: number;
  /**
   * Number of reviews
   */
  reviewCount?: number;
  /**
   * Price per person range
   */
  priceRange?: string;
  /**
   * Featured badge
   */
  featured?: boolean;
}

export interface FeaturedTrucksProps {
  /**
   * Array of food trucks to display
   */
  trucks?: FoodTruck[];
  /**
   * Section title
   */
  title?: string;
  /**
   * Show as carousel (default: false)
   */
  carousel?: boolean;
}

// Placeholder trucks for demo
const defaultTrucks: FoodTruck[] = [
  {
    id: "1",
    name: "Taco Paradise",
    cuisine: "Mexican",
    image: "/placeholder-truck.jpg",
    rating: 4.8,
    reviewCount: 127,
    priceRange: "$12-18",
    featured: true,
  },
  {
    id: "2",
    name: "Burger Bliss",
    cuisine: "American",
    image: "/placeholder-truck.jpg",
    rating: 4.6,
    reviewCount: 89,
    priceRange: "$10-15",
    featured: false,
  },
  {
    id: "3",
    name: "Pizza On Wheels",
    cuisine: "Italian",
    image: "/placeholder-truck.jpg",
    rating: 4.9,
    reviewCount: 203,
    priceRange: "$14-20",
    featured: true,
  },
  {
    id: "4",
    name: "Seoul Street Food",
    cuisine: "Korean",
    image: "/placeholder-truck.jpg",
    rating: 4.7,
    reviewCount: 156,
    priceRange: "$13-17",
    featured: false,
  },
];

/**
 * FeaturedTrucks Component
 *
 * Displays a grid of featured food trucks with ratings, cuisine type, and pricing.
 * Links to individual truck profile pages.
 *
 * @example
 * ```tsx
 * <FeaturedTrucks
 *   title="Featured Food Trucks"
 *   trucks={trucks}
 * />
 * ```
 */
export const FeaturedTrucks: React.FC<FeaturedTrucksProps> = ({
  trucks = defaultTrucks,
  title = "Featured Food Trucks",
  carousel = false,
}) => {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover NYC's most popular food trucks, ready to make your event unforgettable
          </p>
        </div>

        {/* Trucks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trucks.map((truck) => (
            <Link
              key={truck.id}
              href={`/vendors/${truck.id}`}
              className="group"
            >
              <Card className="h-full overflow-hidden hover:shadow-xl transition-shadow duration-300">
                {/* Truck Image */}
                <div className="relative h-48 bg-gray-200 overflow-hidden">
                  {truck.image ? (
                    <img
                      src={truck.image}
                      alt={truck.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                      <svg
                        className="h-20 w-20 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                      </svg>
                    </div>
                  )}
                  {truck.featured && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="primary">Featured</Badge>
                    </div>
                  )}
                </div>

                {/* Truck Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                    {truck.name}
                  </h3>

                  <Badge variant="secondary" className="mb-3">
                    {truck.cuisine}
                  </Badge>

                  {/* Rating */}
                  {truck.rating && (
                    <div className="flex items-center gap-2 mb-2">
                      <Rating value={truck.rating} readonly size="sm" />
                      <span className="text-sm text-gray-600">
                        ({truck.reviewCount})
                      </span>
                    </div>
                  )}

                  {/* Price Range */}
                  {truck.priceRange && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Price:</span> {truck.priceRange} per person
                    </p>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-10">
          <Link
            href="/search"
            className="inline-flex items-center text-primary font-semibold hover:underline"
          >
            View All Food Trucks
            <svg
              className="ml-2 h-5 w-5"
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
          </Link>
        </div>
      </div>
    </section>
  );
};
