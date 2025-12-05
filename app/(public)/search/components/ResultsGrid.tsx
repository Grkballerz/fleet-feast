"use client";

import React from "react";
import { TruckCard, TruckCardProps } from "./TruckCard";
import { Spinner } from "@/components/ui/Spinner";

export interface ResultsGridProps {
  /**
   * Array of truck data
   */
  trucks: TruckCardProps[];
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
 * ResultsGrid Component
 *
 * Grid layout for displaying food truck search results.
 * Shows loading state and empty state when appropriate.
 *
 * @example
 * ```tsx
 * <ResultsGrid
 *   trucks={trucks}
 *   isLoading={false}
 *   emptyMessage="No trucks found"
 * />
 * ```
 */
export const ResultsGrid: React.FC<ResultsGridProps> = ({
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

  // Grid of truck cards
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {trucks.map((truck) => (
        <TruckCard key={truck.id} {...truck} />
      ))}
    </div>
  );
};
