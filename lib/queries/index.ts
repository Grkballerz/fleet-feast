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
 */
export const queryKeys = {
  // Auth
  session: ["session"] as const,

  // Users
  user: (id: string) => ["user", id] as const,
  userProfile: ["userProfile"] as const,

  // Vendors
  vendors: ["vendors"] as const,
  vendor: (id: string) => ["vendor", id] as const,
  vendorSearch: (filters: Record<string, any>) => ["vendors", "search", filters] as const,
  vendorDocuments: (vendorId: string) => ["vendor", vendorId, "documents"] as const,
  vendorMenu: (vendorId: string) => ["vendor", vendorId, "menu"] as const,
  vendorAvailability: (vendorId: string) => ["vendor", vendorId, "availability"] as const,

  // Bookings
  bookings: ["bookings"] as const,
  booking: (id: string) => ["booking", id] as const,
  customerBookings: (customerId: string) => ["bookings", "customer", customerId] as const,
  vendorBookings: (vendorId: string) => ["bookings", "vendor", vendorId] as const,

  // Payments
  payments: ["payments"] as const,
  payment: (id: string) => ["payment", id] as const,
  bookingPayment: (bookingId: string) => ["payment", "booking", bookingId] as const,

  // Messages
  messages: (bookingId: string) => ["messages", "booking", bookingId] as const,

  // Reviews
  reviews: ["reviews"] as const,
  review: (id: string) => ["review", id] as const,
  vendorReviews: (vendorId: string) => ["reviews", "vendor", vendorId] as const,
  customerReviews: (customerId: string) => ["reviews", "customer", customerId] as const,

  // Admin
  adminVendors: ["admin", "vendors"] as const,
  adminDisputes: ["admin", "disputes"] as const,
  adminViolations: ["admin", "violations"] as const,
} as const;

/**
 * Query options presets for common use cases
 */
export const queryPresets = {
  // Real-time data (refetch frequently)
  realtime: {
    staleTime: 0,
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5000, // Poll every 5 seconds
    refetchOnWindowFocus: true,
  },

  // Static data (rarely changes)
  static: {
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  },

  // Search results (moderate caching)
  search: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: false,
  },

  // User-specific data (cache but refetch on mount)
  userSpecific: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  },
} as const;
