"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Rating } from "@/components/ui/Rating";
import { CuisineType, PriceRange } from "@prisma/client";

export interface FilterState {
  cuisineType: CuisineType[];
  priceRange: PriceRange[];
  capacityMin?: number;
  capacityMax?: number;
  minRating?: number;
  availableDate?: string;
}

export interface FilterPanelProps {
  /**
   * Current filter state
   */
  filters: FilterState;
  /**
   * Callback when filters change
   */
  onFiltersChange: (filters: FilterState) => void;
  /**
   * Callback to clear all filters
   */
  onClearFilters: () => void;
  /**
   * Show as sidebar (desktop) or drawer (mobile)
   */
  variant?: "sidebar" | "drawer";
}

/**
 * Cuisine type options
 */
const CUISINE_OPTIONS: { value: CuisineType; label: string }[] = [
  { value: "AMERICAN", label: "American" },
  { value: "MEXICAN", label: "Mexican" },
  { value: "ITALIAN", label: "Italian" },
  { value: "ASIAN", label: "Asian" },
  { value: "BBQ", label: "BBQ" },
  { value: "SEAFOOD", label: "Seafood" },
  { value: "VEGETARIAN", label: "Vegetarian" },
  { value: "VEGAN", label: "Vegan" },
  { value: "DESSERTS", label: "Desserts" },
  { value: "COFFEE", label: "Coffee" },
  { value: "OTHER", label: "Other" },
];

/**
 * Price range options
 */
const PRICE_OPTIONS: { value: PriceRange; label: string; description: string }[] = [
  { value: "BUDGET", label: "$", description: "Under $15/person" },
  { value: "MODERATE", label: "$$", description: "$15-25/person" },
  { value: "PREMIUM", label: "$$$", description: "$25-40/person" },
  { value: "LUXURY", label: "$$$$", description: "Over $40/person" },
];

/**
 * FilterPanel Component
 *
 * Comprehensive filter panel for food truck search.
 * Supports cuisine type, price range, capacity, rating, and date filters.
 *
 * @example
 * ```tsx
 * <FilterPanel
 *   filters={filters}
 *   onFiltersChange={setFilters}
 *   onClearFilters={() => setFilters({})}
 * />
 * ```
 */
export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  variant = "sidebar",
}) => {
  // Toggle cuisine type
  const toggleCuisineType = (cuisine: CuisineType) => {
    const current = filters.cuisineType || [];
    const updated = current.includes(cuisine)
      ? current.filter((c) => c !== cuisine)
      : [...current, cuisine];
    onFiltersChange({ ...filters, cuisineType: updated });
  };

  // Toggle price range
  const togglePriceRange = (price: PriceRange) => {
    const current = filters.priceRange || [];
    const updated = current.includes(price)
      ? current.filter((p) => p !== price)
      : [...current, price];
    onFiltersChange({ ...filters, priceRange: updated });
  };

  // Update capacity
  const updateCapacity = (field: "capacityMin" | "capacityMax", value: string) => {
    const numValue = value === "" ? undefined : parseInt(value);
    onFiltersChange({ ...filters, [field]: numValue });
  };

  // Update rating
  const updateRating = (rating: number) => {
    // Toggle rating - if same rating clicked, clear it
    const newRating = filters.minRating === rating ? undefined : rating;
    onFiltersChange({ ...filters, minRating: newRating });
  };

  // Update date
  const updateDate = (date: string) => {
    onFiltersChange({ ...filters, availableDate: date || undefined });
  };

  // Count active filters
  const activeFilterCount =
    (filters.cuisineType?.length || 0) +
    (filters.priceRange?.length || 0) +
    (filters.capacityMin ? 1 : 0) +
    (filters.capacityMax ? 1 : 0) +
    (filters.minRating ? 1 : 0) +
    (filters.availableDate ? 1 : 0);

  return (
    <div className={`${variant === "sidebar" ? "p-6" : "p-4"}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900">Filters</h2>
        {activeFilterCount > 0 && (
          <button
            onClick={onClearFilters}
            className="text-sm font-bold text-primary hover:underline"
          >
            Clear all ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Cuisine Type */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-gray-900 mb-3">Cuisine Type</h3>
        <div className="space-y-2">
          {CUISINE_OPTIONS.map((option) => (
            <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.cuisineType?.includes(option.value) || false}
                onChange={() => toggleCuisineType(option.value)}
                className="w-5 h-5 neo-border-thin rounded-neo checked:bg-primary checked:border-primary focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-sm text-gray-700 font-medium group-hover:text-primary transition-colors">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-gray-900 mb-3">Price Range</h3>
        <div className="space-y-2">
          {PRICE_OPTIONS.map((option) => (
            <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.priceRange?.includes(option.value) || false}
                onChange={() => togglePriceRange(option.value)}
                className="w-5 h-5 neo-border-thin rounded-neo checked:bg-primary checked:border-primary focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-sm text-gray-700 font-medium group-hover:text-primary transition-colors">
                {option.label} <span className="text-xs text-gray-500 font-normal">({option.description})</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Guest Capacity */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-gray-900 mb-3">Guest Capacity</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="capacityMin" className="text-xs font-bold text-gray-600 mb-1 block">
              Minimum
            </label>
            <input
              id="capacityMin"
              type="number"
              min="1"
              value={filters.capacityMin || ""}
              onChange={(e) => updateCapacity("capacityMin", e.target.value)}
              placeholder="Min"
              className="neo-input w-full px-3 py-2 text-sm font-medium rounded-neo"
            />
          </div>
          <div>
            <label htmlFor="capacityMax" className="text-xs font-bold text-gray-600 mb-1 block">
              Maximum
            </label>
            <input
              id="capacityMax"
              type="number"
              min="1"
              value={filters.capacityMax || ""}
              onChange={(e) => updateCapacity("capacityMax", e.target.value)}
              placeholder="Max"
              className="neo-input w-full px-3 py-2 text-sm font-medium rounded-neo"
            />
          </div>
        </div>
      </div>

      {/* Minimum Rating */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-gray-900 mb-3">Minimum Rating</h3>
        <div className="flex flex-col gap-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => updateRating(rating)}
              className={`flex items-center gap-2 p-2 rounded-neo font-medium text-sm transition-all ${
                filters.minRating === rating
                  ? "neo-border-primary bg-primary/10 neo-shadow"
                  : "neo-border-thin hover:bg-gray-50"
              }`}
            >
              <Rating value={rating} readOnly size="sm" />
              <span className="text-gray-700">& up</span>
            </button>
          ))}
        </div>
      </div>

      {/* Available Date */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-gray-900 mb-3">Available Date</h3>
        <input
          type="date"
          value={filters.availableDate || ""}
          onChange={(e) => updateDate(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          className="neo-input w-full px-3 py-2 text-sm font-medium rounded-neo"
        />
      </div>
    </div>
  );
};
