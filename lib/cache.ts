/**
 * Fleet Feast - Caching Layer
 * Next.js 14 unstable_cache for server-side data caching
 * Implements multi-tier caching strategy for optimal performance
 */

import { unstable_cache } from 'next/cache';
import { prisma } from './prisma';
import type { TruckSearchFilters, SearchPagination } from '@/modules/trucks/trucks.types';

/**
 * Cache duration constants (in seconds)
 */
export const CACHE_DURATIONS = {
  TRUCKS_LISTING: 60, // 1 minute - frequently changing availability
  TRUCK_PROFILE: 300, // 5 minutes - relatively static
  VENDOR_MENU: 300, // 5 minutes - updated occasionally
  VENDOR_AVAILABILITY: 60, // 1 minute - real-time availability
  USER_REVIEWS: 600, // 10 minutes - reviews don't change often
  STATIC_CONTENT: 3600, // 1 hour - rarely changes
  SEARCH_RESULTS: 120, // 2 minutes - balance freshness with performance
} as const;

/**
 * Cache tags for selective revalidation
 */
export const CACHE_TAGS = {
  trucks: (filters?: TruckSearchFilters) =>
    ['trucks', ...(filters ? [JSON.stringify(filters)] : [])],
  truckProfile: (id: string) => ['truck', id],
  vendorMenu: (vendorId: string) => ['menu', vendorId],
  vendorAvailability: (vendorId: string) => ['availability', vendorId],
  reviews: (vendorId: string) => ['reviews', vendorId],
} as const;

/**
 * Cached truck listings with search filters
 * Implements intelligent caching with filter-based keys
 */
export const getCachedTrucks = unstable_cache(
  async (
    filters: TruckSearchFilters,
    pagination: SearchPagination
  ) => {
    // Import service here to avoid circular dependencies
    const { searchTrucks } = await import('@/modules/trucks/trucks.service');
    return searchTrucks(filters, pagination);
  },
  ['trucks-search'],
  {
    revalidate: CACHE_DURATIONS.TRUCKS_LISTING,
    tags: ['trucks'],
  }
);

/**
 * Cached truck profile with full details
 * Higher cache duration as profile data changes infrequently
 */
export const getCachedTruckProfile = unstable_cache(
  async (truckId: string) => {
    const { getTruckProfile } = await import('@/modules/trucks/trucks.service');
    return getTruckProfile(truckId);
  },
  ['truck-profile'],
  {
    revalidate: CACHE_DURATIONS.TRUCK_PROFILE,
    tags: (truckId: string) => ['truck', truckId],
  }
);

/**
 * Cached vendor menu
 * Menu data is relatively static
 */
export const getCachedVendorMenu = unstable_cache(
  async (userId: string) => {
    const { getVendorMenu } = await import('@/modules/trucks/trucks.service');
    return getVendorMenu(userId);
  },
  ['vendor-menu'],
  {
    revalidate: CACHE_DURATIONS.VENDOR_MENU,
    tags: (userId: string) => ['menu', userId],
  }
);

/**
 * Cached vendor availability
 * Short cache as availability is near real-time
 */
export const getCachedVendorAvailability = unstable_cache(
  async (userId: string, startDate?: Date, endDate?: Date) => {
    const { getVendorAvailability } = await import('@/modules/trucks/trucks.service');
    return getVendorAvailability(userId, startDate, endDate);
  },
  ['vendor-availability'],
  {
    revalidate: CACHE_DURATIONS.VENDOR_AVAILABILITY,
    tags: (userId: string) => ['availability', userId],
  }
);

/**
 * Cached aggregated vendor reviews
 * Reviews change infrequently, can cache longer
 */
export const getCachedVendorReviews = unstable_cache(
  async (vendorUserId: string, limit: number = 10) => {
    const reviews = await prisma.review.findMany({
      where: {
        revieweeId: vendorUserId,
        hidden: false,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      include: {
        reviewer: {
          select: {
            email: true,
          },
        },
      },
    });

    // Calculate average rating
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    return {
      reviews: reviews.map(r => ({
        id: r.id,
        rating: r.rating,
        content: r.content,
        reviewerName: r.reviewer.email.split('@')[0] + '***',
        createdAt: r.createdAt,
      })),
      averageRating,
      totalReviews: reviews.length,
    };
  },
  ['vendor-reviews'],
  {
    revalidate: CACHE_DURATIONS.USER_REVIEWS,
    tags: (vendorUserId: string) => ['reviews', vendorUserId],
  }
);

/**
 * Cached approved vendors count
 * Used for homepage stats
 */
export const getCachedApprovedVendorsCount = unstable_cache(
  async () => {
    return prisma.vendor.count({
      where: {
        status: 'APPROVED',
        deletedAt: null,
      },
    });
  },
  ['approved-vendors-count'],
  {
    revalidate: CACHE_DURATIONS.STATIC_CONTENT,
    tags: ['vendors-count'],
  }
);

/**
 * Cached user bookings list
 * Lower cache duration for dashboard freshness
 */
export const getCachedUserBookings = unstable_cache(
  async (userId: string, role: 'CUSTOMER' | 'VENDOR') => {
    const { listUserBookings } = await import('@/modules/booking/booking.service');
    return listUserBookings(userId, role as any);
  },
  ['user-bookings'],
  {
    revalidate: 60, // 1 minute for dashboard freshness
    tags: (userId: string) => ['bookings', userId],
  }
);

/**
 * Manual cache revalidation helpers
 * Use these when data is updated
 */
export async function revalidateTruckCache(truckId?: string) {
  const { revalidateTag } = await import('next/cache');

  if (truckId) {
    revalidateTag(`truck-${truckId}`);
    revalidateTag('trucks'); // Also invalidate listings
  } else {
    revalidateTag('trucks');
  }
}

export async function revalidateMenuCache(vendorId: string) {
  const { revalidateTag } = await import('next/cache');
  revalidateTag(`menu-${vendorId}`);
}

export async function revalidateAvailabilityCache(vendorId: string) {
  const { revalidateTag } = await import('next/cache');
  revalidateTag(`availability-${vendorId}`);
}

export async function revalidateReviewsCache(vendorId: string) {
  const { revalidateTag } = await import('next/cache');
  revalidateTag(`reviews-${vendorId}`);
}

export async function revalidateBookingsCache(userId: string) {
  const { revalidateTag } = await import('next/cache');
  revalidateTag(`bookings-${userId}`);
}

/**
 * Cache statistics helper (for monitoring)
 */
export function getCacheConfig() {
  return {
    durations: CACHE_DURATIONS,
    tags: Object.keys(CACHE_TAGS),
  };
}

// ============================================================================
// CACHE INVALIDATION HOOKS
// ============================================================================

/**
 * Cache invalidation hooks for Prisma operations
 * Call these after mutations to ensure cache consistency
 */

/**
 * Invalidate truck-related caches after truck mutations
 * Use after: vendor profile updates, status changes
 */
export async function invalidateTruckCaches(truckId: string): Promise<void> {
  const { revalidateTag } = await import('next/cache');

  // Invalidate specific truck profile
  revalidateTag(`truck-${truckId}`);

  // Invalidate truck listings (affects search results)
  revalidateTag('trucks');

  // Track invalidation
  trackCacheInvalidation('truck', truckId);
}

/**
 * Invalidate menu cache after menu updates
 * Use after: menu item changes, pricing updates
 */
export async function invalidateMenuCaches(vendorId: string): Promise<void> {
  const { revalidateTag } = await import('next/cache');

  revalidateTag(`menu-${vendorId}`);

  // Also invalidate truck profile as it includes menu data
  const vendor = await prisma.vendor.findUnique({
    where: { userId: vendorId },
    select: { id: true },
  });

  if (vendor) {
    revalidateTag(`truck-${vendor.id}`);
  }

  trackCacheInvalidation('menu', vendorId);
}

/**
 * Invalidate availability cache after availability updates
 * Use after: availability changes, booking confirmations
 */
export async function invalidateAvailabilityCaches(vendorId: string): Promise<void> {
  const { revalidateTag } = await import('next/cache');

  revalidateTag(`availability-${vendorId}`);

  trackCacheInvalidation('availability', vendorId);
}

/**
 * Invalidate review caches after review mutations
 * Use after: new reviews, review edits, review moderation
 */
export async function invalidateReviewCaches(vendorId: string): Promise<void> {
  const { revalidateTag } = await import('next/cache');

  revalidateTag(`reviews-${vendorId}`);

  // Also invalidate truck profile as it includes review stats
  const vendor = await prisma.vendor.findUnique({
    where: { userId: vendorId },
    select: { id: true },
  });

  if (vendor) {
    revalidateTag(`truck-${vendor.id}`);
  }

  trackCacheInvalidation('reviews', vendorId);
}

/**
 * Invalidate booking caches after booking mutations
 * Use after: new bookings, status changes, cancellations
 */
export async function invalidateBookingCaches(userId: string, vendorId?: string): Promise<void> {
  const { revalidateTag } = await import('next/cache');

  // Invalidate customer bookings
  revalidateTag(`bookings-${userId}`);

  // Invalidate vendor bookings if provided
  if (vendorId) {
    revalidateTag(`bookings-${vendorId}`);

    // Invalidate availability as booking affects vendor calendar
    await invalidateAvailabilityCaches(vendorId);
  }

  trackCacheInvalidation('bookings', userId);
}

/**
 * Invalidate vendor count cache after vendor status changes
 * Use after: vendor approval, deactivation
 */
export async function invalidateVendorCountCache(): Promise<void> {
  const { revalidateTag } = await import('next/cache');

  revalidateTag('vendors-count');

  trackCacheInvalidation('vendors-count', 'all');
}

/**
 * Invalidate all truck-related caches
 * Use sparingly - only for major system updates
 */
export async function invalidateAllTruckCaches(): Promise<void> {
  const { revalidateTag } = await import('next/cache');

  revalidateTag('trucks');

  trackCacheInvalidation('trucks', 'all');
}

// ============================================================================
// CACHE WARMING
// ============================================================================

/**
 * Cache warming for frequently accessed data
 * Pre-populate cache during low traffic periods
 */

/**
 * Warm truck listings cache with common search patterns
 * Call this during app startup or scheduled jobs
 */
export async function warmTruckListingsCache(): Promise<{ warmed: number }> {
  const commonFilters = [
    // No filters - default search
    {},
    // By cuisine
    { cuisineType: ['AMERICAN'] },
    { cuisineType: ['MEXICAN'] },
    { cuisineType: ['ITALIAN'] },
    { cuisineType: ['ASIAN'] },
    { cuisineType: ['BBQ'] },
    // By price range
    { priceRange: ['BUDGET'] },
    { priceRange: ['MODERATE'] },
  ];

  const pagination = { page: 1, limit: 12 };
  let warmed = 0;

  for (const filters of commonFilters) {
    try {
      await getCachedTrucks(filters, pagination);
      warmed++;
      trackCacheWarming('trucks', JSON.stringify(filters));
    } catch (error) {
      console.error('Cache warming failed for filters:', filters, error);
    }
  }

  return { warmed };
}

/**
 * Warm vendor reviews cache for top vendors
 * Pre-load review data for popular trucks
 */
export async function warmVendorReviewsCache(limit: number = 10): Promise<{ warmed: number }> {
  // Get top approved vendors
  const topVendors = await prisma.vendor.findMany({
    where: {
      status: 'APPROVED',
      deletedAt: null,
    },
    orderBy: {
      approvedAt: 'desc',
    },
    take: limit,
    select: {
      userId: true,
    },
  });

  let warmed = 0;

  for (const vendor of topVendors) {
    try {
      await getCachedVendorReviews(vendor.userId);
      warmed++;
      trackCacheWarming('reviews', vendor.userId);
    } catch (error) {
      console.error('Cache warming failed for vendor:', vendor.userId, error);
    }
  }

  return { warmed };
}

/**
 * Warm vendor count cache
 * Pre-load homepage stats
 */
export async function warmVendorCountCache(): Promise<void> {
  await getCachedApprovedVendorsCount();
  trackCacheWarming('vendors-count', 'all');
}

/**
 * Warm all common caches
 * Comprehensive cache warming for system startup
 */
export async function warmAllCaches(): Promise<{
  trucks: number;
  reviews: number;
  vendorCount: boolean;
}> {
  const [trucksResult, reviewsResult] = await Promise.all([
    warmTruckListingsCache(),
    warmVendorReviewsCache(10),
    warmVendorCountCache(),
  ]);

  return {
    trucks: trucksResult.warmed,
    reviews: reviewsResult.warmed,
    vendorCount: true,
  };
}

// ============================================================================
// CACHE METRICS
// ============================================================================

/**
 * In-memory cache metrics tracking
 * For production, consider using Redis or a monitoring service
 */
interface CacheMetrics {
  hits: Map<string, number>;
  misses: Map<string, number>;
  invalidations: Map<string, number>;
  warmings: Map<string, number>;
  lastReset: Date;
}

const metrics: CacheMetrics = {
  hits: new Map(),
  misses: new Map(),
  invalidations: new Map(),
  warmings: new Map(),
  lastReset: new Date(),
};

/**
 * Track cache hit
 */
export function trackCacheHit(cacheKey: string): void {
  const current = metrics.hits.get(cacheKey) || 0;
  metrics.hits.set(cacheKey, current + 1);
}

/**
 * Track cache miss
 */
export function trackCacheMiss(cacheKey: string): void {
  const current = metrics.misses.get(cacheKey) || 0;
  metrics.misses.set(cacheKey, current + 1);
}

/**
 * Track cache invalidation
 */
export function trackCacheInvalidation(cacheKey: string, identifier: string): void {
  const key = `${cacheKey}:${identifier}`;
  const current = metrics.invalidations.get(key) || 0;
  metrics.invalidations.set(key, current + 1);
}

/**
 * Track cache warming
 */
export function trackCacheWarming(cacheKey: string, identifier: string): void {
  const key = `${cacheKey}:${identifier}`;
  const current = metrics.warmings.get(key) || 0;
  metrics.warmings.set(key, current + 1);
}

/**
 * Get current cache metrics
 */
export function getCacheMetrics(): {
  hits: Record<string, number>;
  misses: Record<string, number>;
  invalidations: Record<string, number>;
  warmings: Record<string, number>;
  hitRate: Record<string, number>;
  totalHits: number;
  totalMisses: number;
  totalInvalidations: number;
  totalWarmings: number;
  lastReset: Date;
} {
  const hits = Object.fromEntries(metrics.hits);
  const misses = Object.fromEntries(metrics.misses);
  const invalidations = Object.fromEntries(metrics.invalidations);
  const warmings = Object.fromEntries(metrics.warmings);

  // Calculate hit rates
  const hitRate: Record<string, number> = {};
  for (const [key, hitCount] of metrics.hits) {
    const missCount = metrics.misses.get(key) || 0;
    const total = hitCount + missCount;
    hitRate[key] = total > 0 ? (hitCount / total) * 100 : 0;
  }

  // Calculate totals
  const totalHits = Array.from(metrics.hits.values()).reduce((sum, val) => sum + val, 0);
  const totalMisses = Array.from(metrics.misses.values()).reduce((sum, val) => sum + val, 0);
  const totalInvalidations = Array.from(metrics.invalidations.values()).reduce((sum, val) => sum + val, 0);
  const totalWarmings = Array.from(metrics.warmings.values()).reduce((sum, val) => sum + val, 0);

  return {
    hits,
    misses,
    invalidations,
    warmings,
    hitRate,
    totalHits,
    totalMisses,
    totalInvalidations,
    totalWarmings,
    lastReset: metrics.lastReset,
  };
}

/**
 * Reset cache metrics
 * Useful for periodic monitoring resets
 */
export function resetCacheMetrics(): void {
  metrics.hits.clear();
  metrics.misses.clear();
  metrics.invalidations.clear();
  metrics.warmings.clear();
  metrics.lastReset = new Date();
}

/**
 * Get cache statistics summary
 * Formatted for monitoring dashboards
 */
export function getCacheStatsSummary(): {
  overallHitRate: number;
  mostHitKeys: Array<{ key: string; hits: number }>;
  mostMissedKeys: Array<{ key: string; misses: number }>;
  mostInvalidatedKeys: Array<{ key: string; invalidations: number }>;
  totalOperations: number;
} {
  const metricsData = getCacheMetrics();

  const overallHitRate =
    metricsData.totalHits + metricsData.totalMisses > 0
      ? (metricsData.totalHits / (metricsData.totalHits + metricsData.totalMisses)) * 100
      : 0;

  const mostHitKeys = Object.entries(metricsData.hits)
    .map(([key, hits]) => ({ key, hits }))
    .sort((a, b) => b.hits - a.hits)
    .slice(0, 5);

  const mostMissedKeys = Object.entries(metricsData.misses)
    .map(([key, misses]) => ({ key, misses }))
    .sort((a, b) => b.misses - a.misses)
    .slice(0, 5);

  const mostInvalidatedKeys = Object.entries(metricsData.invalidations)
    .map(([key, invalidations]) => ({ key, invalidations }))
    .sort((a, b) => b.invalidations - a.invalidations)
    .slice(0, 5);

  const totalOperations =
    metricsData.totalHits +
    metricsData.totalMisses +
    metricsData.totalInvalidations +
    metricsData.totalWarmings;

  return {
    overallHitRate,
    mostHitKeys,
    mostMissedKeys,
    mostInvalidatedKeys,
    totalOperations,
  };
}
