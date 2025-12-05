"use client";

import React from "react";
import { Dropdown } from "@/components/ui/Dropdown";

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

  // Handle option selection
  const handleSelect = (option: typeof SORT_OPTIONS[0]) => {
    onSortChange(option.value, option.order);
  };

  return (
    <Dropdown
      trigger={
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
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
    >
      {SORT_OPTIONS.map((option, index) => (
        <button
          key={`${option.value}-${option.order}`}
          onClick={() => handleSelect(option)}
          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
            option.value === sortBy && option.order === sortOrder
              ? "bg-blue-50 text-blue-700 font-medium"
              : "text-gray-700"
          }`}
        >
          {option.label}
        </button>
      ))}
    </Dropdown>
  );
};
