/**
 * Fleet Feast - Optimized Database Queries
 * Performance-optimized query builders with selective field loading
 */

import { Prisma } from '@prisma/client';

/**
 * Selective field loading to reduce payload size
 * Only load fields that are actually used
 */

/**
 * Minimal truck listing fields (for search results)
 * Reduces payload by ~60% compared to full vendor object
 */
export const truckListingSelect = {
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
  // Exclude: documents, menu (loaded separately), detailed fields
} satisfies Prisma.VendorSelect;

/**
 * Booking list fields (for dashboard)
 * Minimal fields needed for booking cards
 */
export const bookingListSelect = {
  id: true,
  eventDate: true,
  eventTime: true,
  eventType: true,
  location: true,
  guestCount: true,
  totalAmount: true,
  status: true,
  createdAt: true,
  vendorProfile: {
    select: {
      businessName: true,
    },
  },
  customer: {
    select: {
      email: true,
    },
  },
} satisfies Prisma.BookingSelect;

/**
 * Review summary fields
 * For displaying review snippets
 */
export const reviewSummarySelect = {
  id: true,
  rating: true,
  content: true,
  createdAt: true,
  reviewer: {
    select: {
      email: true,
    },
  },
} satisfies Prisma.ReviewSelect;

/**
 * Notification fields
 * Minimal fields for notification list
 */
export const notificationListSelect = {
  id: true,
  type: true,
  title: true,
  message: true,
  link: true,
  read: true,
  createdAt: true,
} satisfies Prisma.NotificationSelect;

/**
 * Optimized query for truck search with pagination
 * Uses cursor-based pagination for better performance at scale
 */
export function buildTruckSearchQuery(
  filters: {
    cuisineType?: string[];
    priceRange?: string[];
    capacityMin?: number;
    capacityMax?: number;
    minRating?: number;
  },
  pagination: {
    cursor?: string;
    limit: number;
  }
): Prisma.VendorFindManyArgs {
  const where: Prisma.VendorWhereInput = {
    status: 'APPROVED',
    deletedAt: null,
  };

  // Add filters
  if (filters.cuisineType?.length) {
    where.cuisineType = { in: filters.cuisineType as any };
  }

  if (filters.priceRange?.length) {
    where.priceRange = { in: filters.priceRange as any };
  }

  if (filters.capacityMin !== undefined) {
    where.capacityMax = { gte: filters.capacityMin };
  }

  if (filters.capacityMax !== undefined) {
    where.capacityMin = { lte: filters.capacityMax };
  }

  return {
    where,
    select: truckListingSelect,
    take: pagination.limit,
    ...(pagination.cursor && { cursor: { id: pagination.cursor }, skip: 1 }),
    orderBy: { approvedAt: 'desc' },
  };
}

/**
 * Optimized query for user dashboard bookings
 * Pre-joins only necessary relations
 */
export function buildUserBookingsQuery(
  userId: string,
  role: 'CUSTOMER' | 'VENDOR',
  status?: string[]
): Prisma.BookingFindManyArgs {
  const whereClause: Prisma.BookingWhereInput =
    role === 'CUSTOMER'
      ? { customerId: userId }
      : { vendorId: userId };

  if (status?.length) {
    whereClause.status = { in: status as any };
  }

  return {
    where: whereClause,
    select: bookingListSelect,
    orderBy: { eventDate: 'desc' },
    take: 50, // Limit dashboard to recent 50 bookings
  };
}

/**
 * Optimized query for vendor reviews with aggregation
 * Single query to get reviews + rating stats
 */
export function buildVendorReviewsQuery(
  vendorUserId: string,
  limit: number = 10
): Prisma.ReviewFindManyArgs {
  return {
    where: {
      revieweeId: vendorUserId,
      hidden: false,
      deletedAt: null,
    },
    select: reviewSummarySelect,
    orderBy: { createdAt: 'desc' },
    take: limit,
  };
}

/**
 * Optimized query for unread notifications
 * Only load unread with minimal fields
 */
export function buildUnreadNotificationsQuery(
  userId: string
): Prisma.NotificationFindManyArgs {
  return {
    where: {
      userId,
      read: false,
    },
    select: notificationListSelect,
    orderBy: { createdAt: 'desc' },
    take: 20, // Limit to recent 20 unread
  };
}

/**
 * Batch loading helper for N+1 query prevention
 * Use with DataLoader pattern if needed
 */
export async function batchLoadVendorRatings(
  prisma: any,
  vendorIds: string[]
): Promise<Map<string, { average: number; count: number }>> {
  const ratings = await prisma.review.groupBy({
    by: ['revieweeId'],
    where: {
      revieweeId: { in: vendorIds },
      hidden: false,
      deletedAt: null,
    },
    _avg: { rating: true },
    _count: { id: true },
  });

  return new Map(
    ratings.map((r: any) => [
      r.revieweeId,
      {
        average: r._avg.rating || 0,
        count: r._count.id || 0,
      },
    ])
  );
}

/**
 * Connection pooling configuration
 * Optimize for serverless/edge deployment
 */
export const prismaConnectionConfig = {
  // Connection pool settings for better performance
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  // Enable connection pooling
  // connection_limit: 10, // Adjust based on deployment
};

/**
 * Query timeout helper
 * Prevent long-running queries from blocking
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 5000,
  errorMessage: string = 'Query timeout'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ]);
}
