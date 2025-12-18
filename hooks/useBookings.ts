/**
 * Fleet Feast - useBookings Hook
 * React Query hooks for booking data fetching
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";

// Types
type BookingStatus =
  | "PENDING"
  | "ACCEPTED"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED"
  | "DISPUTED";

interface BookingSummary {
  id: string;
  vendorId: string;
  vendorName: string;
  eventDate: string;
  eventTime: string;
  location: {
    city: string;
    state: string;
  };
  guestCount: number;
  eventType: string;
  totalAmount: number;
  status: BookingStatus;
  createdAt: string;
}

interface BookingDetails extends BookingSummary {
  customerId: string;
  eventLocation: string;
  specialRequests?: string;
  paymentStatus: string;
  // Add other detailed fields as needed
}

// API Functions
async function fetchBookings(): Promise<BookingSummary[]> {
  const response = await fetch("/api/bookings");

  if (!response.ok) {
    throw new Error("Failed to fetch bookings");
  }

  const data = await response.json();
  return data.bookings || [];
}

async function fetchBookingById(id: string): Promise<BookingDetails> {
  const response = await fetch(`/api/bookings/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch booking details");
  }

  const data = await response.json();
  return data.booking;
}

async function fetchCustomerBookings(customerId: string): Promise<BookingSummary[]> {
  const response = await fetch(`/api/bookings?customerId=${customerId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch customer bookings");
  }

  const data = await response.json();
  return data.bookings || [];
}

async function fetchVendorBookings(vendorId: string): Promise<BookingSummary[]> {
  const response = await fetch(`/api/bookings?vendorId=${vendorId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch vendor bookings");
  }

  const data = await response.json();
  return data.bookings || [];
}

async function acceptBooking(bookingId: string): Promise<void> {
  const response = await fetch(`/api/bookings/${bookingId}/accept`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to accept booking");
  }
}

async function declineBooking(bookingId: string, reason?: string): Promise<void> {
  const response = await fetch(`/api/bookings/${bookingId}/decline`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });

  if (!response.ok) {
    throw new Error("Failed to decline booking");
  }
}

// Hooks

/**
 * Hook to fetch all bookings for current user
 * Stale time: 30 seconds (bookings change frequently)
 */
export function useBookings() {
  return useQuery({
    queryKey: queryKeys.bookings.lists(),
    queryFn: fetchBookings,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch booking details by ID
 * Stale time: 1 minute (booking details may update)
 */
export function useBookingDetails(id: string) {
  return useQuery({
    queryKey: queryKeys.bookings.detail(id),
    queryFn: () => fetchBookingById(id),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!id,
  });
}

/**
 * Hook to fetch customer bookings
 * Stale time: 30 seconds (frequently changing data)
 */
export function useCustomerBookings(customerId: string) {
  return useQuery({
    queryKey: queryKeys.bookings.customer(customerId),
    queryFn: () => fetchCustomerBookings(customerId),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!customerId,
  });
}

/**
 * Hook to fetch vendor bookings
 * Stale time: 30 seconds (frequently changing data)
 */
export function useVendorBookings(vendorId: string) {
  return useQuery({
    queryKey: queryKeys.bookings.vendor(vendorId),
    queryFn: () => fetchVendorBookings(vendorId),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!vendorId,
  });
}

/**
 * Hook to accept a booking
 */
export function useAcceptBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: acceptBooking,
    onSuccess: (_, bookingId) => {
      // Invalidate all booking queries using hierarchical keys
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      // Also invalidate the specific booking detail
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(bookingId) });
    },
  });
}

/**
 * Hook to decline a booking
 */
export function useDeclineBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, reason }: { bookingId: string; reason?: string }) =>
      declineBooking(bookingId, reason),
    onSuccess: (_, { bookingId }) => {
      // Invalidate all booking queries using hierarchical keys
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      // Also invalidate the specific booking detail
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(bookingId) });
    },
  });
}
