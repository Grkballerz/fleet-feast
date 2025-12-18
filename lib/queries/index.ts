/**
 * Fleet Feast - TanStack Query Configuration
 * QueryClient setup with default options, retry logic, and caching strategy
 */

import { QueryClient, DefaultOptions } from "@tanstack/react-query";

/**
 * Default query options for TanStack Query
 */
const defaultQueryOptions: DefaultOptions = {
  queries: {
    // Stale time: How long data is considered fresh (5 minutes)
    staleTime: 5 * 60 * 1000,

    // Garbage collection time: How long inactive data stays in cache (10 minutes)
    gcTime: 10 * 60 * 1000,

    // Retry configuration
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors (client errors)
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }

      // Retry up to 2 times for 5xx errors (server errors)
      return failureCount < 2;
    },

    // Retry delay with exponential backoff
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

    // Don't refetch on window focus by default (can be overridden per query)
    refetchOnWindowFocus: false,

    // Refetch on mount if data is stale
    refetchOnMount: true,

    // Don't refetch on reconnect by default
    refetchOnReconnect: false,
  },
  mutations: {
    // Retry mutations once on network errors
    retry: (failureCount, error: any) => {
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < 1;
    },
  },
};

/**
 * Create QueryClient instance
 * Use this in Providers component
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: defaultQueryOptions,
  });
}

/**
 * Query keys for consistent cache management
 * Use these constants instead of hardcoding strings
 *
 * Hierarchical structure allows targeted invalidation:
 * - queryKeys.vendors invalidates ALL vendor queries
 * - queryKeys.vendor(id) invalidates only that vendor's data
 * - queryKeys.vendorSearch(filters) invalidates only that search
 */
export const queryKeys = {
  // Auth
  session: ["session"] as const,

  // Users
  user: (id: string) => ["user", id] as const,
  userProfile: ["userProfile"] as const,

  // Vendors/Trucks
  vendors: {
    all: ["vendors"] as const,
    lists: () => [...queryKeys.vendors.all, "list"] as const,
    list: (filters: Record<string, any>) => [...queryKeys.vendors.lists(), filters] as const,
    details: () => [...queryKeys.vendors.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.vendors.details(), id] as const,
    search: (filters: Record<string, any>) => [...queryKeys.vendors.all, "search", filters] as const,
    featured: () => [...queryKeys.vendors.all, "featured"] as const,
    documents: (vendorId: string) => [...queryKeys.vendors.detail(vendorId), "documents"] as const,
    menu: (vendorId: string) => [...queryKeys.vendors.detail(vendorId), "menu"] as const,
    availability: (vendorId: string) => [...queryKeys.vendors.detail(vendorId), "availability"] as const,
  },

  // Backward compatibility (to be deprecated)
  vendor: (id: string) => ["vendor", id] as const,
  vendorSearch: (filters: Record<string, any>) => ["vendors", "search", filters] as const,
  vendorDocuments: (vendorId: string) => ["vendor", vendorId, "documents"] as const,
  vendorMenu: (vendorId: string) => ["vendor", vendorId, "menu"] as const,
  vendorAvailability: (vendorId: string) => ["vendor", vendorId, "availability"] as const,

  // Bookings
  bookings: {
    all: ["bookings"] as const,
    lists: () => [...queryKeys.bookings.all, "list"] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.bookings.lists(), filters ?? {}] as const,
    details: () => [...queryKeys.bookings.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.bookings.details(), id] as const,
    customer: (customerId: string) => [...queryKeys.bookings.all, "customer", customerId] as const,
    vendor: (vendorId: string) => [...queryKeys.bookings.all, "vendor", vendorId] as const,
  },

  // Backward compatibility (to be deprecated)
  booking: (id: string) => ["booking", id] as const,
  customerBookings: (customerId: string) => ["bookings", "customer", customerId] as const,
  vendorBookings: (vendorId: string) => ["bookings", "vendor", vendorId] as const,

  // Payments
  payments: {
    all: ["payments"] as const,
    lists: () => [...queryKeys.payments.all, "list"] as const,
    details: () => [...queryKeys.payments.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.payments.details(), id] as const,
    booking: (bookingId: string) => [...queryKeys.payments.all, "booking", bookingId] as const,
  },

  // Backward compatibility (to be deprecated)
  payment: (id: string) => ["payment", id] as const,
  bookingPayment: (bookingId: string) => ["payment", "booking", bookingId] as const,

  // Messages
  messages: {
    all: ["messages"] as const,
    lists: () => [...queryKeys.messages.all, "list"] as const,
    booking: (bookingId: string) => [...queryKeys.messages.all, "booking", bookingId] as const,
  },

  // Reviews
  reviews: {
    all: ["reviews"] as const,
    lists: () => [...queryKeys.reviews.all, "list"] as const,
    details: () => [...queryKeys.reviews.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.reviews.details(), id] as const,
    vendor: (vendorId: string) => [...queryKeys.reviews.all, "vendor", vendorId] as const,
    customer: (customerId: string) => [...queryKeys.reviews.all, "customer", customerId] as const,
  },

  // Backward compatibility (to be deprecated)
  review: (id: string) => ["review", id] as const,
  vendorReviews: (vendorId: string) => ["reviews", "vendor", vendorId] as const,
  customerReviews: (customerId: string) => ["reviews", "customer", customerId] as const,

  // Admin
  admin: {
    all: ["admin"] as const,
    vendors: {
      all: ["admin", "vendors"] as const,
      lists: () => [...queryKeys.admin.vendors.all, "list"] as const,
      pending: () => [...queryKeys.admin.vendors.all, "pending"] as const,
      detail: (id: string) => [...queryKeys.admin.vendors.all, "detail", id] as const,
    },
    disputes: {
      all: ["admin", "disputes"] as const,
      lists: () => [...queryKeys.admin.disputes.all, "list"] as const,
      detail: (id: string) => [...queryKeys.admin.disputes.all, "detail", id] as const,
    },
    violations: {
      all: ["admin", "violations"] as const,
      lists: () => [...queryKeys.admin.violations.all, "list"] as const,
      detail: (id: string) => [...queryKeys.admin.violations.all, "detail", id] as const,
    },
  },

  // Backward compatibility (to be deprecated)
  adminVendors: ["admin", "vendors"] as const,
  adminDisputes: ["admin", "disputes"] as const,
  adminViolations: ["admin", "violations"] as const,
} as const;

/**
 * Query options presets for common use cases
 *
 * Stale time recommendations by data type:
 * - Real-time (bookings, notifications): 0-30 seconds
 * - Frequently changing (search results, availability): 1-2 minutes
 * - Semi-static (vendor profiles, reviews): 5-15 minutes
 * - Static (cuisine types, service areas): 30-60 minutes
 */
export const queryPresets = {
  // Real-time data (notifications, live bookings)
  // Refetch aggressively, short cache
  realtime: {
    staleTime: 0,
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5000, // Poll every 5 seconds
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  },

  // Frequently changing data (bookings, messages)
  // 30 second stale time, refetch on mount
  frequent: {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  },

  // Search results (moderate caching)
  // 2 minute stale time, don't refetch on mount
  search: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  },

  // Semi-static data (vendor profiles, reviews)
  // 5 minute stale time, refetch on mount
  semiStatic: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  },

  // Static data (cuisine types, service areas, featured lists)
  // 30 minute stale time, long cache
  static: {
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  },

  // User-specific data (profile, settings)
  // 5 minute stale time, refetch on mount
  userSpecific: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  },

  // Admin data (pending reviews, disputes)
  // 1 minute stale time, refetch on window focus
  admin: {
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  },
} as const;
