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
