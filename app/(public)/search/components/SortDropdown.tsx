"use client";

import React from "react";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";

export type SortOption = "relevance" | "rating" | "price";
export type SortOrder = "asc" | "desc";

export interface SortDropdownProps {
  /**
   * Current sort option
   */
  sortBy: SortOption;
  /**
   * Current sort order
   */
  sortOrder: SortOrder;
  /**
   * Callback when sort changes
   */
  onSortChange: (sortBy: SortOption, sortOrder: SortOrder) => void;
}

/**
 * Sort options with labels
 */
const SORT_OPTIONS: {
  value: SortOption;
  label: string;
  order: SortOrder;
}[] = [
  { value: "relevance", label: "Relevance", order: "desc" },
  { value: "rating", label: "Rating: High to Low", order: "desc" },
  { value: "rating", label: "Rating: Low to High", order: "asc" },
  { value: "price", label: "Price: Low to High", order: "asc" },
  { value: "price", label: "Price: High to Low", order: "desc" },
];

/**
 * SortDropdown Component
 *
 * Dropdown for selecting sort order of search results.
 * Supports sorting by relevance, rating, and price.
 *
 * @example
 * ```tsx
 * <SortDropdown
 *   sortBy="rating"
 *   sortOrder="desc"
 *   onSortChange={(sortBy, order) => console.log(sortBy, order)}
 * />
 * ```
 */
export const SortDropdown: React.FC<SortDropdownProps> = ({
  sortBy,
  sortOrder,
  onSortChange,
}) => {
  // Find current option label
  const currentOption = SORT_OPTIONS.find(
    (opt) => opt.value === sortBy && opt.order === sortOrder
  );
  const currentLabel = currentOption?.label || "Sort by";

  // Convert SORT_OPTIONS to DropdownItem[] format
  const sortItems: DropdownItem[] = SORT_OPTIONS.map((option) => ({
    label: option.label,
    onClick: () => onSortChange(option.value, option.order),
  }));

  return (
    <Dropdown
      trigger={
        <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-gray-900 bg-white neo-border rounded-neo neo-shadow hover:neo-shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all focus:outline-none focus:neo-shadow-primary">
          <span>Sort: {currentLabel}</span>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      }
      items={sortItems}
      align="right"
    />
  );
};
