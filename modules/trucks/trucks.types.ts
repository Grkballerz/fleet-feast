/**
 * Trucks Module TypeScript Types
 * Shared types for food truck search and profiles
 */

import { CuisineType, PriceRange, VendorStatus } from "@prisma/client";

/**
 * Menu item structure
 */
export interface MenuItem {
  name: string;
  description?: string;
  price: number;
  dietaryTags?: string[]; // e.g., "vegan", "gluten-free", "halal"
}

/**
 * Menu structure
 */
export interface Menu {
  items: MenuItem[];
  pricingModel: "per_person" | "flat_rate" | "custom";
}

/**
 * Availability calendar entry
 */
export interface AvailabilityEntry {
  date: string; // ISO date
  isAvailable: boolean;
  notes?: string;
}

/**
 * Search filters
 */
export interface TruckSearchFilters {
  query?: string; // Full-text search
  cuisineType?: CuisineType[];
  priceRange?: PriceRange[];
  capacityMin?: number;
  capacityMax?: number;
  minRating?: number; // 1-5
  availableDate?: string; // ISO date
  location?: {
    lat: number;
    lng: number;
    radiusMiles: number;
  };
  excludeId?: string; // Exclude a specific truck (for similar trucks)
}

/**
 * Search pagination
 */
export interface SearchPagination {
  page: number;
  limit: number;
  sortBy?: "relevance" | "rating" | "price";
  sortOrder?: "asc" | "desc";
}

/**
 * Public truck profile (for customers)
 */
export interface PublicTruckProfile {
  id: string;
  businessName: string;
  cuisineType: CuisineType;
  description: string | null;
  priceRange: PriceRange;
  capacityMin: number;
  capacityMax: number;
  serviceArea: string | null;
  status: VendorStatus;
  approvedAt: Date | null;
  createdAt: Date;
  coverImageUrl?: string | null;
  // Calculated fields
  averageRating?: number;
  totalReviews?: number;
}

/**
 * Full truck profile with menu and availability
 */
export interface TruckProfileWithDetails extends PublicTruckProfile {
  menu?: Menu | null;
  availability?: AvailabilityEntry[];
  recentReviews?: TruckReview[];
}

/**
 * Truck search result
 */
export interface TruckSearchResult extends PublicTruckProfile {
  relevanceScore?: number; // For full-text search ranking
  distance?: number; // For location-based search (in miles)
  location?: string | null; // Temporary field for distance calculation (removed before public return)
}

/**
 * Review summary for truck
 */
export interface TruckReview {
  id: string;
  rating: number;
  content: string | null;
  reviewerName?: string;
  createdAt: Date;
}

/**
 * Menu update data
 */
export interface MenuUpdateData {
  items: MenuItem[];
  pricingModel: "per_person" | "flat_rate" | "custom";
}

/**
 * Availability update data
 */
export interface AvailabilityUpdateData {
  dates: {
    date: string; // ISO date
    isAvailable: boolean;
    notes?: string;
  }[];
}
