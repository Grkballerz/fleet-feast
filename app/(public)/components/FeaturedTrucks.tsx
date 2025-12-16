import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Rating } from "@/components/ui/Rating";
import { FeaturedTrucksClient } from "./FeaturedTrucksClient";
import type { PublicTruckProfile } from "@/modules/trucks/trucks.types";

export interface FeaturedTrucksProps {
  title?: string;
}

// Cuisine-specific gradient backgrounds as fallback
const cuisineGradients: Record<string, string> = {
  Mexican: "from-orange-400 via-red-500 to-yellow-500",
  American: "from-red-500 via-amber-500 to-yellow-400",
  Italian: "from-green-500 via-white to-red-500",
  Asian: "from-red-600 via-pink-500 to-blue-500",
  Korean: "from-red-600 via-pink-500 to-blue-500",
  default: "from-primary via-red-500 to-orange-500",
};

// Price range display mapping
const priceRangeDisplay: Record<string, string> = {
  BUDGET: "$10-15",
  MODERATE: "$15-25",
  PREMIUM: "$25-40",
  LUXURY: "$40+",
};

/**
 * Fetch featured trucks from the API
 */
async function getFeaturedTrucks(): Promise<PublicTruckProfile[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/trucks?limit=5`, {
      cache: "no-store", // Ensure fresh data
    });

    if (!response.ok) {
      console.error("Failed to fetch trucks:", response.status);
      return [];
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching featured trucks:", error);
    return [];
  }
}

export const FeaturedTrucks: React.FC<FeaturedTrucksProps> = async ({
  title = "Featured Food Trucks",
}) => {
  const trucks = await getFeaturedTrucks();

  // Show message if no trucks found
  if (trucks.length === 0) {
    return (
      <section className="py-20 md:py-28 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h2 className="neo-heading-xl text-gray-900 mb-4">{title}</h2>
            <p className="text-lg text-gray-600">
              No food trucks available at the moment. Check back soon!
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Pass data to client component for interactive features
  return <FeaturedTrucksClient trucks={trucks} title={title} />;
};
