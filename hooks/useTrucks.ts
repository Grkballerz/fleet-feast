/**
 * Fleet Feast - useTrucks Hook
 * React Query hooks for truck/vendor data fetching
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys, queryPresets } from "@/lib/queries";
import { CuisineType, PriceRange } from "@prisma/client";

// Types
interface TruckSearchFilters {
  query?: string;
  cuisineType?: CuisineType[];
  priceRange?: PriceRange[];
  capacityMin?: number;
  capacityMax?: number;
  minRating?: number;
  availableDate?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}

interface TruckSearchResult {
  id: string;
  businessName: string;
  cuisineType: CuisineType;
  priceRange: PriceRange;
  description: string | null;
  serviceArea: string | null;
  averageRating?: number;
  totalReviews?: number;
  distance?: number;
  capacityMin?: number;
  capacityMax?: number;
  coverImageUrl?: string | null;
}

interface SearchResponse {
  data: TruckSearchResult[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface PublicTruckProfile {
  id: string;
  businessName: string;
  cuisineType: CuisineType;
  priceRange: PriceRange;
  description: string | null;
  serviceArea: string | null;
  averageRating?: number;
  totalReviews?: number;
  coverImageUrl?: string | null;
}

// API Functions
async function searchTrucks(filters: TruckSearchFilters): Promise<SearchResponse> {
  const params = new URLSearchParams();

  if (filters.query) params.set("query", filters.query);
  if (filters.cuisineType?.length) params.set("cuisineType", filters.cuisineType.join(","));
  if (filters.priceRange?.length) params.set("priceRange", filters.priceRange.join(","));
  if (filters.capacityMin) params.set("capacityMin", filters.capacityMin.toString());
  if (filters.capacityMax) params.set("capacityMax", filters.capacityMax.toString());
  if (filters.minRating) params.set("minRating", filters.minRating.toString());
  if (filters.availableDate) params.set("availableDate", filters.availableDate);
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
  if (filters.page) params.set("page", filters.page.toString());
  if (filters.limit) params.set("limit", filters.limit.toString());

  const response = await fetch(`/api/trucks?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch trucks");
  }

  return response.json();
}

async function fetchFeaturedTrucks(): Promise<PublicTruckProfile[]> {
  const response = await fetch("/api/trucks?featured=true&limit=6");

  if (!response.ok) {
    throw new Error("Failed to fetch featured trucks");
  }

  const data = await response.json();
  return data.data || [];
}

async function fetchTruckById(id: string): Promise<PublicTruckProfile> {
  const response = await fetch(`/api/trucks/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch truck details");
  }

  const data = await response.json();
  return data.data;
}

async function fetchTruckAvailability(vendorId: string, date: string): Promise<any> {
  const response = await fetch(`/api/trucks/${vendorId}/availability?date=${date}`);

  if (!response.ok) {
    throw new Error("Failed to fetch availability");
  }

  return response.json();
}

// Hooks

/**
 * Hook to search trucks with filters
 * Stale time: 2 minutes (search results change moderately)
 */
export function useTruckSearch(filters: TruckSearchFilters) {
  return useQuery({
    queryKey: queryKeys.vendors.search(filters),
    queryFn: () => searchTrucks(filters),
    ...queryPresets.search,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch featured trucks
 * Stale time: 15 minutes (featured list is relatively static)
 */
export function useFeaturedTrucks() {
  return useQuery({
    queryKey: queryKeys.vendors.featured(),
    queryFn: fetchFeaturedTrucks,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook to fetch truck details by ID
 * Stale time: 5 minutes (vendor profiles don't change often)
 */
export function useTruck(id: string) {
  return useQuery({
    queryKey: queryKeys.vendors.detail(id),
    queryFn: () => fetchTruckById(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled: !!id,
  });
}

/**
 * Hook to fetch truck availability
 * Stale time: 1 minute (availability changes frequently)
 */
export function useTruckAvailability(vendorId: string, date: string) {
  return useQuery({
    queryKey: queryKeys.vendors.availability(vendorId),
    queryFn: () => fetchTruckAvailability(vendorId, date),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!vendorId && !!date,
  });
}

/**
 * Hook to toggle favorite vendor
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vendorId: string) => {
      const response = await fetch(`/api/favorites/${vendorId}`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to toggle favorite");
      }

      return response.json();
    },
    onSuccess: (_, vendorId) => {
      // Invalidate all vendor queries to refresh favorite status
      queryClient.invalidateQueries({ queryKey: queryKeys.vendors.all });
      // Specifically invalidate the vendor detail to refresh immediately
      queryClient.invalidateQueries({ queryKey: queryKeys.vendors.detail(vendorId) });
    },
  });
}
