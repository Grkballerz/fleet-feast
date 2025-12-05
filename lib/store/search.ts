/**
 * Fleet Feast - Search Store
 * Zustand store for vendor search state with URL sync
 * Persists to localStorage and URL query params for shareable searches
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { VendorSearchFilters, CuisineType } from "@/types";

export interface SearchState {
  // State
  filters: VendorSearchFilters;
  activeFiltersCount: number;

  // Actions
  setFilter: <K extends keyof VendorSearchFilters>(
    key: K,
    value: VendorSearchFilters[K]
  ) => void;
  setFilters: (filters: Partial<VendorSearchFilters>) => void;
  clearFilters: () => void;
  clearFilter: (key: keyof VendorSearchFilters) => void;

  // Helpers
  hasActiveFilters: () => boolean;
  getURLSearchParams: () => URLSearchParams;
  loadFromURLSearchParams: (params: URLSearchParams) => void;
}

const initialFilters: VendorSearchFilters = {
  cuisineType: undefined,
  minPrice: undefined,
  maxPrice: undefined,
  minGuests: undefined,
  maxGuests: undefined,
  eventDate: undefined,
  location: undefined,
};

/**
 * Count number of active filters
 */
function countActiveFilters(filters: VendorSearchFilters): number {
  return Object.values(filters).filter((value) => {
    if (value === undefined || value === null) return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  }).length;
}

/**
 * Search store with localStorage persistence and URL sync
 * Maintains search filters across navigation and enables shareable search URLs
 */
export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      // Initial state
      filters: initialFilters,
      activeFiltersCount: 0,

      // Set single filter
      setFilter: (key, value) =>
        set((state) => {
          const newFilters = { ...state.filters, [key]: value };
          return {
            filters: newFilters,
            activeFiltersCount: countActiveFilters(newFilters),
          };
        }),

      // Set multiple filters at once
      setFilters: (filters) =>
        set((state) => {
          const newFilters = { ...state.filters, ...filters };
          return {
            filters: newFilters,
            activeFiltersCount: countActiveFilters(newFilters),
          };
        }),

      // Clear all filters
      clearFilters: () =>
        set({
          filters: initialFilters,
          activeFiltersCount: 0,
        }),

      // Clear specific filter
      clearFilter: (key) =>
        set((state) => {
          const newFilters = { ...state.filters, [key]: undefined };
          return {
            filters: newFilters,
            activeFiltersCount: countActiveFilters(newFilters),
          };
        }),

      // Check if any filters active
      hasActiveFilters: () => get().activeFiltersCount > 0,

      // Export filters to URL search params
      getURLSearchParams: () => {
        const params = new URLSearchParams();
        const filters = get().filters;

        if (filters.cuisineType && filters.cuisineType.length > 0) {
          params.set("cuisine", filters.cuisineType.join(","));
        }
        if (filters.minPrice !== undefined) {
          params.set("minPrice", filters.minPrice.toString());
        }
        if (filters.maxPrice !== undefined) {
          params.set("maxPrice", filters.maxPrice.toString());
        }
        if (filters.minGuests !== undefined) {
          params.set("minGuests", filters.minGuests.toString());
        }
        if (filters.maxGuests !== undefined) {
          params.set("maxGuests", filters.maxGuests.toString());
        }
        if (filters.eventDate) {
          params.set("eventDate", filters.eventDate);
        }
        if (filters.location) {
          params.set("location", filters.location);
        }

        return params;
      },

      // Load filters from URL search params
      loadFromURLSearchParams: (params) => {
        const filters: Partial<VendorSearchFilters> = {};

        const cuisine = params.get("cuisine");
        if (cuisine) {
          filters.cuisineType = cuisine.split(",") as CuisineType[];
        }

        const minPrice = params.get("minPrice");
        if (minPrice) {
          filters.minPrice = parseInt(minPrice, 10);
        }

        const maxPrice = params.get("maxPrice");
        if (maxPrice) {
          filters.maxPrice = parseInt(maxPrice, 10);
        }

        const minGuests = params.get("minGuests");
        if (minGuests) {
          filters.minGuests = parseInt(minGuests, 10);
        }

        const maxGuests = params.get("maxGuests");
        if (maxGuests) {
          filters.maxGuests = parseInt(maxGuests, 10);
        }

        const eventDate = params.get("eventDate");
        if (eventDate) {
          filters.eventDate = eventDate;
        }

        const location = params.get("location");
        if (location) {
          filters.location = location;
        }

        set({
          filters: { ...initialFilters, ...filters },
          activeFiltersCount: countActiveFilters({ ...initialFilters, ...filters }),
        });
      },
    }),
    {
      name: "fleet-feast-search", // localStorage key
      partialize: (state) => ({
        filters: state.filters,
      }),
    }
  )
);
