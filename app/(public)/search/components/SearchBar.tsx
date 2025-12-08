"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export interface SearchBarProps {
  /**
   * Initial search query
   */
  initialQuery?: string;
  /**
   * Callback when search is performed
   */
  onSearch: (query: string) => void;
  /**
   * Placeholder text
   */
  placeholder?: string;
}

/**
 * SearchBar Component
 *
 * Search input with submit button for food truck search.
 * Supports keyboard submission (Enter key).
 *
 * @example
 * ```tsx
 * <SearchBar
 *   initialQuery="tacos"
 *   onSearch={(query) => console.log(query)}
 *   placeholder="Search for food trucks..."
 * />
 * ```
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  initialQuery = "",
  onSearch,
  placeholder = "Search for food trucks (e.g., tacos, pizza, BBQ)...",
}) => {
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit(e as any);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-3">
        <div className="flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full neo-input px-4 py-3 text-base font-medium rounded-neo focus:neo-shadow-primary transition-shadow"
            aria-label="Search food trucks"
          />
        </div>
        <button
          type="submit"
          className="neo-btn-primary px-8 py-3 text-base whitespace-nowrap"
        >
          Search
        </button>
      </div>
    </form>
  );
};
