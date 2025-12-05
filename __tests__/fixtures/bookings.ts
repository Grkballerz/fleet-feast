/**
 * Booking Test Fixtures
 * Provides test data for bookings in various states
 */

import { BookingStatus } from "@prisma/client";
import type { Booking } from "@prisma/client";

export const testBookingPending: Partial<Booking> = {
  id: "test-booking-001",
  customerId: "test-customer-001",
  vendorId: "test-vendor-001",
  eventDate: new Date("2025-02-15T00:00:00Z"),
  eventStartTime: "12:00",
  eventEndTime: "16:00",
  guestCount: 50,
  eventType: "CORPORATE",
  location: {
    address: "123 Main St",
    city: "New York",
    state: "NY",
    zipCode: "10001",
  },
  notes: "Corporate lunch event",
  status: BookingStatus.PENDING,
  basePrice: 15000,
  pricePerGuest: 2500,
  totalAmount: 140000, // $1400.00 (base + 50 guests * $25)
  createdAt: new Date("2025-01-15T00:00:00Z"),
  updatedAt: new Date("2025-01-15T00:00:00Z"),
};

export const testBookingAccepted: Partial<Booking> = {
  id: "test-booking-002",
  customerId: "test-customer-001",
  vendorId: "test-vendor-001",
  eventDate: new Date("2025-02-20T00:00:00Z"),
  eventStartTime: "18:00",
  eventEndTime: "22:00",
  guestCount: 100,
  eventType: "WEDDING",
  location: {
    address: "456 Park Ave",
    city: "New York",
    state: "NY",
    zipCode: "10002",
  },
  notes: "Wedding reception",
  status: BookingStatus.ACCEPTED,
  basePrice: 15000,
  pricePerGuest: 2500,
  totalAmount: 265000, // $2650.00
  acceptedAt: new Date("2025-01-16T00:00:00Z"),
  createdAt: new Date("2025-01-15T00:00:00Z"),
  updatedAt: new Date("2025-01-16T00:00:00Z"),
};

export const testBookingConfirmed: Partial<Booking> = {
  id: "test-booking-003",
  customerId: "test-customer-001",
  vendorId: "test-vendor-001",
  eventDate: new Date("2025-03-01T00:00:00Z"),
  eventStartTime: "11:00",
  eventEndTime: "14:00",
  guestCount: 75,
  eventType: "BIRTHDAY",
  location: {
    address: "789 Broadway",
    city: "New York",
    state: "NY",
    zipCode: "10003",
  },
  notes: "Birthday party",
  status: BookingStatus.CONFIRMED,
  basePrice: 15000,
  pricePerGuest: 2500,
  totalAmount: 202500, // $2025.00
  acceptedAt: new Date("2025-01-17T00:00:00Z"),
  confirmedAt: new Date("2025-01-18T00:00:00Z"),
  createdAt: new Date("2025-01-16T00:00:00Z"),
  updatedAt: new Date("2025-01-18T00:00:00Z"),
};

export const testBookingCompleted: Partial<Booking> = {
  id: "test-booking-004",
  customerId: "test-customer-001",
  vendorId: "test-vendor-001",
  eventDate: new Date("2025-01-10T00:00:00Z"),
  eventStartTime: "12:00",
  eventEndTime: "15:00",
  guestCount: 60,
  eventType: "CORPORATE",
  location: {
    address: "321 5th Ave",
    city: "New York",
    state: "NY",
    zipCode: "10004",
  },
  notes: "Team building lunch",
  status: BookingStatus.COMPLETED,
  basePrice: 15000,
  pricePerGuest: 2500,
  totalAmount: 165000, // $1650.00
  acceptedAt: new Date("2024-12-20T00:00:00Z"),
  confirmedAt: new Date("2024-12-21T00:00:00Z"),
  completedAt: new Date("2025-01-10T16:00:00Z"),
  createdAt: new Date("2024-12-19T00:00:00Z"),
  updatedAt: new Date("2025-01-10T16:00:00Z"),
};

export const testBookingCancelled: Partial<Booking> = {
  id: "test-booking-005",
  customerId: "test-customer-001",
  vendorId: "test-vendor-001",
  eventDate: new Date("2025-02-25T00:00:00Z"),
  eventStartTime: "19:00",
  eventEndTime: "23:00",
  guestCount: 80,
  eventType: "OTHER",
  location: {
    address: "555 Madison Ave",
    city: "New York",
    state: "NY",
    zipCode: "10005",
  },
  notes: "Cancelled due to venue change",
  status: BookingStatus.CANCELLED,
  basePrice: 15000,
  pricePerGuest: 2500,
  totalAmount: 215000, // $2150.00
  cancelledAt: new Date("2025-01-20T00:00:00Z"),
  cancellationReason: "Venue change",
  createdAt: new Date("2025-01-18T00:00:00Z"),
  updatedAt: new Date("2025-01-20T00:00:00Z"),
};

export const testBookingDisputed: Partial<Booking> = {
  id: "test-booking-006",
  customerId: "test-customer-001",
  vendorId: "test-vendor-001",
  eventDate: new Date("2025-01-12T00:00:00Z"),
  eventStartTime: "13:00",
  eventEndTime: "17:00",
  guestCount: 90,
  eventType: "CORPORATE",
  location: {
    address: "777 Wall St",
    city: "New York",
    state: "NY",
    zipCode: "10006",
  },
  notes: "Service dispute",
  status: BookingStatus.DISPUTED,
  basePrice: 15000,
  pricePerGuest: 2500,
  totalAmount: 240000, // $2400.00
  acceptedAt: new Date("2024-12-25T00:00:00Z"),
  confirmedAt: new Date("2024-12-26T00:00:00Z"),
  completedAt: new Date("2025-01-12T18:00:00Z"),
  createdAt: new Date("2024-12-24T00:00:00Z"),
  updatedAt: new Date("2025-01-13T00:00:00Z"),
};

/**
 * Helper to create a test booking with custom properties
 */
export function createTestBooking(
  overrides: Partial<Booking> = {}
): Partial<Booking> {
  return {
    ...testBookingPending,
    ...overrides,
    id: overrides.id || `test-booking-${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
