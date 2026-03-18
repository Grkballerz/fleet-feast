/**
 * Trucks Service Layer
 * Handles business logic for food truck search, profiles, menu, and availability
 */

import { prisma } from "@/lib/prisma";
import { VendorStatus, Prisma } from "@prisma/client";
import type {
  TruckSearchFilters,
  SearchPagination,
  TruckSearchResult,
  TruckProfileWithDetails,
  MenuUpdateData,
  AvailabilityUpdateData,
  Menu,
  AvailabilityEntry,
} from "./trucks.types";

/**
 * Custom error class for truck operations
 */
export class TruckError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "TruckError";
  }
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in miles
 */
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Search for food trucks with filters and pagination
 * Uses PostgreSQL full-text search when query is provided
 */
export async function searchTrucks(
  filters: TruckSearchFilters,
  pagination: SearchPagination
): Promise<{ trucks: TruckSearchResult[]; total: number }> {
  const { query, cuisineType, priceRange, capacityMin, capacityMax, minRating, availableDate, location, excludeId } = filters;
  const { page, limit, sortBy = "relevance", sortOrder = "desc" } = pagination;

  const offset = (page - 1) * limit;

  // Build WHERE conditions using parameterized queries
  const whereConditions: Prisma.Sql[] = [
    Prisma.sql`v.status = 'APPROVED'`,
    Prisma.sql`v.deleted_at IS NULL`
  ];

  // Exclude specific truck ID (for similar trucks) - FIXED SQL INJECTION
  if (excludeId) {
    whereConditions.push(Prisma.sql`v.id != ${excludeId}`);
  }

  // Cuisine type filter - FIXED SQL INJECTION
  if (cuisineType && cuisineType.length > 0) {
    whereConditions.push(Prisma.sql`v.cuisine_type = ANY(${cuisineType})`);
  }

  // Price range filter - FIXED SQL INJECTION
  if (priceRange && priceRange.length > 0) {
    whereConditions.push(Prisma.sql`v.price_range = ANY(${priceRange})`);
  }

  // Capacity filters - validate as numbers
  if (capacityMin !== undefined) {
    if (typeof capacityMin !== 'number' || isNaN(capacityMin)) {
      throw new TruckError("Invalid capacityMin", "INVALID_CAPACITY", 400);
    }
    whereConditions.push(Prisma.sql`v.capacity_max >= ${capacityMin}`);
  }
  if (capacityMax !== undefined) {
    if (typeof capacityMax !== 'number' || isNaN(capacityMax)) {
      throw new TruckError("Invalid capacityMax", "INVALID_CAPACITY", 400);
    }
    whereConditions.push(Prisma.sql`v.capacity_min <= ${capacityMax}`);
  }

  // Available date filter - FIXED SQL INJECTION
  if (availableDate) {
    // Validate date format to prevent injection
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(availableDate)) {
      throw new TruckError("Invalid date format (use YYYY-MM-DD)", "INVALID_DATE", 400);
    }

    whereConditions.push(Prisma.sql`
      EXISTS (
        SELECT 1 FROM availability a
        WHERE a.vendor_id = v.id
          AND a.date = ${availableDate}::date
          AND a.is_available = true
      )
    `);
  }

  // Full-text search with ranking
  let selectClause = "v.*";
  let orderByClause = "";

  if (query && query.trim()) {
    // Add full-text search with ranking (includes menu items)
    selectClause = `
      v.*,
      ts_rank(
        to_tsvector('english',
          COALESCE(v.business_name, '') || ' ' ||
          COALESCE(v.description, '') || ' ' ||
          COALESCE((SELECT string_agg(item->>'name' || ' ' || COALESCE(item->>'description', ''), ' ')
                    FROM vendor_menus vm, jsonb_array_elements(vm.items) AS item
                    WHERE vm.vendor_id = v.id), '')
        ),
        plainto_tsquery('english', ${Prisma.sql`${query}`})
      ) as rank
    `;

    whereConditions.push(Prisma.sql`
      to_tsvector('english',
        COALESCE(v.business_name, '') || ' ' ||
        COALESCE(v.description, '') || ' ' ||
        COALESCE((SELECT string_agg(item->>'name' || ' ' || COALESCE(item->>'description', ''), ' ')
                  FROM vendor_menus vm, jsonb_array_elements(vm.items) AS item
                  WHERE vm.vendor_id = v.id), '')
      )
      @@ plainto_tsquery('english', ${query})
    `);

    // Default sort by relevance for search
    if (sortBy === "relevance") {
      orderByClause = "ORDER BY rank DESC";
    }
  }

  // Sort by rating
  if (sortBy === "rating" && !orderByClause) {
    const ratingOrder = sortOrder === "asc" ? "ASC" : "DESC";
    orderByClause = `ORDER BY avg_rating ${ratingOrder} NULLS LAST`;
  }

  // Sort by price
  if (sortBy === "price" && !orderByClause) {
    const priceOrder = sortOrder === "asc" ? "ASC" : "DESC";
    // Use CASE to convert enum to numeric for sorting
    orderByClause = `
      ORDER BY
        CASE v.price_range
          WHEN 'BUDGET' THEN 1
          WHEN 'MODERATE' THEN 2
          WHEN 'PREMIUM' THEN 3
          WHEN 'LUXURY' THEN 4
        END ${priceOrder}
    `;
  }

  // Default order if none specified
  if (!orderByClause) {
    orderByClause = "ORDER BY v.approved_at DESC";
  }

  // Combine WHERE conditions using Prisma.join for safety
  const whereClause = Prisma.join(whereConditions, ' AND ');

  // Execute search query with reviews aggregation
  const trucksRaw = await prisma.$queryRaw<any[]>`
    SELECT
      ${Prisma.raw(selectClause)},
      COALESCE(AVG(r.rating), 0) as avg_rating,
      COUNT(r.id) as total_reviews
    FROM vendors v
    LEFT JOIN users u ON v.user_id = u.id
    LEFT JOIN reviews r ON r.reviewee_id = u.id AND r.hidden = false AND r.deleted_at IS NULL
    WHERE ${whereClause}
    GROUP BY v.id
    HAVING ${minRating ? Prisma.sql`COALESCE(AVG(r.rating), 0) >= ${minRating}` : Prisma.sql`true`}
    ${Prisma.raw(orderByClause)}
    LIMIT ${limit}
    OFFSET ${offset}
  `;

  // Get total count for pagination
  const countResult = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(DISTINCT v.id) as count
    FROM vendors v
    LEFT JOIN users u ON v.user_id = u.id
    LEFT JOIN reviews r ON r.reviewee_id = u.id AND r.hidden = false AND r.deleted_at IS NULL
    WHERE ${whereClause}
    GROUP BY v.id
    HAVING ${minRating ? Prisma.sql`COALESCE(AVG(r.rating), 0) >= ${minRating}` : Prisma.sql`true`}
  `;

  const total = countResult.length;

  // Transform results and apply location filter if needed
  let trucks: TruckSearchResult[] = trucksRaw.map((truck) => ({
    id: truck.id,
    businessName: truck.business_name,
    cuisineType: truck.cuisine_type,
    description: truck.description,
    priceRange: truck.price_range,
    capacityMin: truck.capacity_min,
    capacityMax: truck.capacity_max,
    serviceArea: truck.service_area,
    status: truck.status,
    approvedAt: truck.approved_at,
    createdAt: truck.created_at,
    coverImageUrl: truck.cover_image_url,
    averageRating: parseFloat(truck.avg_rating) || 0,
    totalReviews: parseInt(truck.total_reviews) || 0,
    relevanceScore: truck.rank ? parseFloat(truck.rank) : undefined,
    location: truck.location, // Include location for distance filtering
  }));

  // Apply location filter (post-query)
  if (location) {
    trucks = trucks
      .map((truck) => {
        // Parse location from "lat,lng" format
        if (!truck.location) return null;

        const [lat, lng] = truck.location.split(",").map(parseFloat);
        if (isNaN(lat) || isNaN(lng)) return null;

        const distance = calculateDistance(
          location.lat,
          location.lng,
          lat,
          lng
        );

        if (distance <= location.radiusMiles) {
          // Remove location before returning to public (sensitive data)
          const { location: _, ...publicTruck } = truck;
          return { ...publicTruck, distance };
        }
        return null;
      })
      .filter((truck): truck is TruckSearchResult => truck !== null)
      .sort((a, b) => (a.distance || 0) - (b.distance || 0)); // Sort by distance
  } else {
    // Remove location from results if no location filter (don't expose coordinates publicly)
    trucks = trucks.map(({ location: _, ...truck }) => truck);
  }

  return { trucks, total };
}

/**
 * Get single truck profile with menu, availability, and reviews
 */
export async function getTruckProfile(
  truckId: string
): Promise<TruckProfileWithDetails> {
  // Fetch truck with related data
  const truck = await prisma.vendor.findUnique({
    where: { id: truckId, deletedAt: null },
    select: {
      id: true,
      businessName: true,
      cuisineType: true,
      description: true,
      priceRange: true,
      capacityMin: true,
      capacityMax: true,
      serviceArea: true,
      status: true,
      approvedAt: true,
      createdAt: true,
      coverImageUrl: true,
      menu: {
        select: {
          items: true,
          pricingModel: true,
        },
      },
      availability: {
        where: {
          date: {
            gte: new Date(), // Only future dates
          },
        },
        select: {
          date: true,
          isAvailable: true,
          notes: true,
        },
        orderBy: {
          date: "asc",
        },
        take: 90, // Next 3 months
      },
      user: {
        select: {
          reviewsReceived: {
            where: {
              hidden: false,
              deletedAt: null,
            },
            select: {
              id: true,
              rating: true,
              content: true,
              createdAt: true,
              reviewer: {
                select: {
                  email: true, // We'll mask this
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 10, // Recent 10 reviews
          },
        },
      },
    },
  });

  if (!truck) {
    throw new TruckError("Food truck not found", "TRUCK_NOT_FOUND", 404);
  }

  // Only show approved trucks publicly
  if (truck.status !== VendorStatus.APPROVED) {
    throw new TruckError("Food truck profile not available", "TRUCK_NOT_AVAILABLE", 404);
  }

  // Calculate average rating
  const reviews = truck.user.reviewsReceived;
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  // Transform menu
  const menu: Menu | null = truck.menu
    ? {
        items: truck.menu.items as any[], // JSON field
        pricingModel: truck.menu.pricingModel as "per_person" | "flat_rate" | "custom",
      }
    : null;

  // Transform availability
  const availability: AvailabilityEntry[] = truck.availability.map((a) => ({
    date: a.date.toISOString().split("T")[0],
    isAvailable: a.isAvailable,
    notes: a.notes || undefined,
  }));

  // Transform reviews (mask email)
  const recentReviews = reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    content: r.content,
    reviewerName: r.reviewer.email.split("@")[0] + "***", // Masked
    createdAt: r.createdAt,
  }));

  return {
    id: truck.id,
    businessName: truck.businessName,
    cuisineType: truck.cuisineType,
    description: truck.description,
    priceRange: truck.priceRange,
    capacityMin: truck.capacityMin,
    capacityMax: truck.capacityMax,
    serviceArea: truck.serviceArea,
    status: truck.status,
    approvedAt: truck.approvedAt,
    createdAt: truck.createdAt,
    coverImageUrl: truck.coverImageUrl,
    averageRating,
    totalReviews: reviews.length,
    menu,
    availability,
    recentReviews,
  };
}

/**
 * Get vendor's own menu
 */
export async function getVendorMenu(userId: string): Promise<Menu | null> {
  const vendor = await prisma.vendor.findUnique({
    where: { userId, deletedAt: null },
    select: {
      id: true,
      menu: {
        select: {
          items: true,
          pricingModel: true,
        },
      },
    },
  });

  if (!vendor) {
    throw new TruckError("Vendor profile not found", "VENDOR_NOT_FOUND", 404);
  }

  if (!vendor.menu) {
    return null;
  }

  return {
    items: vendor.menu.items as any[],
    pricingModel: vendor.menu.pricingModel as "per_person" | "flat_rate" | "custom",
  };
}

/**
 * Update vendor's menu (creates if doesn't exist)
 */
export async function updateVendorMenu(
  userId: string,
  data: MenuUpdateData
): Promise<Menu> {
  const vendor = await prisma.vendor.findUnique({
    where: { userId, deletedAt: null },
  });

  if (!vendor) {
    throw new TruckError("Vendor profile not found", "VENDOR_NOT_FOUND", 404);
  }

  // Upsert menu
  const menu = await prisma.vendorMenu.upsert({
    where: { vendorId: vendor.id },
    create: {
      vendorId: vendor.id,
      items: data.items as any,
      pricingModel: data.pricingModel,
    },
    update: {
      items: data.items as any,
      pricingModel: data.pricingModel,
    },
  });

  return {
    items: menu.items as any[],
    pricingModel: menu.pricingModel as "per_person" | "flat_rate" | "custom",
  };
}

/**
 * Get vendor's availability calendar
 */
export async function getVendorAvailability(
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<AvailabilityEntry[]> {
  const vendor = await prisma.vendor.findUnique({
    where: { userId, deletedAt: null },
  });

  if (!vendor) {
    throw new TruckError("Vendor profile not found", "VENDOR_NOT_FOUND", 404);
  }

  const whereClause: any = { vendorId: vendor.id };

  if (startDate || endDate) {
    whereClause.date = {};
    if (startDate) whereClause.date.gte = startDate;
    if (endDate) whereClause.date.lte = endDate;
  }

  const availability = await prisma.availability.findMany({
    where: whereClause,
    orderBy: { date: "asc" },
  });

  return availability.map((a) => ({
    date: a.date.toISOString().split("T")[0],
    isAvailable: a.isAvailable,
    notes: a.notes || undefined,
  }));
}

/**
 * Update vendor's availability (batch upsert)
 */
export async function updateVendorAvailability(
  userId: string,
  data: AvailabilityUpdateData
): Promise<{ updated: number }> {
  const vendor = await prisma.vendor.findUnique({
    where: { userId, deletedAt: null },
  });

  if (!vendor) {
    throw new TruckError("Vendor profile not found", "VENDOR_NOT_FOUND", 404);
  }

  // Batch upsert availability
  const operations = data.dates.map((entry) =>
    prisma.availability.upsert({
      where: {
        vendorId_date: {
          vendorId: vendor.id,
          date: new Date(entry.date),
        },
      },
      create: {
        vendorId: vendor.id,
        date: new Date(entry.date),
        isAvailable: entry.isAvailable,
        notes: entry.notes,
      },
      update: {
        isAvailable: entry.isAvailable,
        notes: entry.notes,
      },
    })
  );

  await prisma.$transaction(operations);

  return { updated: operations.length };
}

/**
 * Check truck availability for a specific date (public)
 */
export async function checkTruckAvailability(
  truckId: string,
  date: string
): Promise<{ isAvailable: boolean; notes?: string }> {
  const truck = await prisma.vendor.findUnique({
    where: { id: truckId, deletedAt: null },
  });

  if (!truck) {
    throw new TruckError("Food truck not found", "TRUCK_NOT_FOUND", 404);
  }

  if (truck.status !== VendorStatus.APPROVED) {
    throw new TruckError("Food truck profile not available", "TRUCK_NOT_AVAILABLE", 404);
  }

  const availability = await prisma.availability.findUnique({
    where: {
      vendorId_date: {
        vendorId: truck.id,
        date: new Date(date),
      },
    },
  });

  // If no record exists, assume unavailable
  if (!availability) {
    return { isAvailable: false };
  }

  return {
    isAvailable: availability.isAvailable,
    notes: availability.notes || undefined,
  };
}
