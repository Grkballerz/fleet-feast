/**
 * Food Truck Listing & Search API
 * GET /api/trucks - List and search food trucks with filters
 *
 * Public endpoint (no authentication required)
 */

import { NextRequest } from "next/server";
import { ApiResponses } from "@/lib/api-response";
import { searchTrucks, TruckError } from "@/modules/trucks/trucks.service";
import type { TruckSearchFilters, SearchPagination } from "@/modules/trucks/trucks.types";
import { CuisineType, PriceRange } from "@prisma/client";

/**
 * Handle GET request to search/list food trucks
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Parse search query
    const query = searchParams.get("query") || undefined;

    // Parse cuisine types (array)
    const cuisineTypeParam = searchParams.get("cuisineType");
    const cuisineType = cuisineTypeParam
      ? cuisineTypeParam.split(",").map((c) => c.trim() as CuisineType)
      : undefined;

    // Parse price ranges (array)
    const priceRangeParam = searchParams.get("priceRange");
    const priceRange = priceRangeParam
      ? priceRangeParam.split(",").map((p) => p.trim() as PriceRange)
      : undefined;

    // Parse capacity filters
    const capacityMin = searchParams.get("capacityMin")
      ? parseInt(searchParams.get("capacityMin")!)
      : undefined;
    const capacityMax = searchParams.get("capacityMax")
      ? parseInt(searchParams.get("capacityMax")!)
      : undefined;

    // Parse rating filter
    const minRating = searchParams.get("minRating")
      ? parseFloat(searchParams.get("minRating")!)
      : undefined;

    // Parse available date
    const availableDate = searchParams.get("availableDate") || undefined;

    // Parse location filter
    let location: { lat: number; lng: number; radiusMiles: number } | undefined;
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const radiusMiles = searchParams.get("radiusMiles");

    if (lat && lng && radiusMiles) {
      location = {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        radiusMiles: parseFloat(radiusMiles),
      };

      // Validate location
      if (
        isNaN(location.lat) ||
        isNaN(location.lng) ||
        isNaN(location.radiusMiles) ||
        location.lat < -90 ||
        location.lat > 90 ||
        location.lng < -180 ||
        location.lng > 180 ||
        location.radiusMiles < 1 ||
        location.radiusMiles > 100
      ) {
        return ApiResponses.badRequest("Invalid location parameters");
      }
    }

    // Parse pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const sortBy = (searchParams.get("sortBy") || "relevance") as "relevance" | "rating" | "price";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";

    // Validate pagination
    if (page < 1 || limit < 1 || limit > 100) {
      return ApiResponses.badRequest("Invalid pagination parameters");
    }

    // Validate minRating
    if (minRating !== undefined && (minRating < 1 || minRating > 5)) {
      return ApiResponses.badRequest("Rating must be between 1 and 5");
    }

    // Validate capacity
    if (
      (capacityMin !== undefined && capacityMin < 1) ||
      (capacityMax !== undefined && capacityMax < 1)
    ) {
      return ApiResponses.badRequest("Capacity must be at least 1");
    }

    // Build filters
    const filters: TruckSearchFilters = {
      query,
      cuisineType,
      priceRange,
      capacityMin,
      capacityMax,
      minRating,
      availableDate,
      location,
    };

    // Build pagination
    const pagination: SearchPagination = {
      page,
      limit,
      sortBy,
      sortOrder,
    };

    // Search trucks
    const { trucks, total } = await searchTrucks(filters, pagination);

    // Return paginated response
    return ApiResponses.paginated(trucks, page, limit, total);
  } catch (error) {
    console.error("[Trucks Search] Error:", error);

    // Handle custom truck errors
    if (error instanceof TruckError) {
      return ApiResponses.badRequest(error.message);
    }

    // Handle unexpected errors
    return ApiResponses.internalError("Failed to search food trucks");
  }
}
