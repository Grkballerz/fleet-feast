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
 * Inquiry-Proposal Flow Fixtures (New Flow)
 */
export const testBookingInquiry: Partial<Booking> = {
  id: "test-booking-inquiry-001",
  customerId: "test-customer-001",
  vendorId: "test-vendor-001",
  eventDate: new Date("2025-03-15T00:00:00Z"),
  eventTime: "18:00",
  eventType: "WEDDING",
  location: "123 Wedding Venue Lane, City, ST 12345",
  guestCount: 100,
  specialRequests: "Vegetarian options needed",
  status: BookingStatus.INQUIRY,
  totalAmount: 0,
  platformFee: 0,
  vendorPayout: 0,
  createdAt: new Date("2025-01-20T00:00:00Z"),
  updatedAt: new Date("2025-01-20T00:00:00Z"),
};

export const testBookingProposalSent: Partial<Booking> = {
  id: "test-booking-proposal-001",
  customerId: "test-customer-001",
  vendorId: "test-vendor-001",
  eventDate: new Date("2025-03-20T00:00:00Z"),
  eventTime: "12:00",
  eventType: "CORPORATE",
  location: "456 Corporate Center, City, ST 12345",
  guestCount: 75,
  specialRequests: null,
  status: BookingStatus.PROPOSAL_SENT,
  proposalAmount: 200000, // $2000.00
  proposalDetails: {
    lineItems: [
      { name: "Tacos", quantity: 75, unitPrice: 1500, total: 112500 },
      { name: "Burritos", quantity: 75, unitPrice: 1500, total: 112500 },
    ],
    inclusions: ["Plates", "Napkins", "Utensils", "Setup/Cleanup"],
    terms: "Payment due 48 hours before event",
  },
  proposalSentAt: new Date("2025-01-21T00:00:00Z"),
  proposalExpiresAt: new Date("2025-01-28T00:00:00Z"), // 7 days later
  platformFeeCustomer: 10000, // 5% of 200000
  platformFeeVendor: 10000, // 5% of 200000
  platformFee: 20000, // Total 10%
  totalAmount: 210000, // proposalAmount + platformFeeCustomer
  vendorPayout: 190000, // proposalAmount - platformFeeVendor
  createdAt: new Date("2025-01-20T00:00:00Z"),
  updatedAt: new Date("2025-01-21T00:00:00Z"),
};

export const testBookingProposalAccepted: Partial<Booking> = {
  id: "test-booking-accepted-001",
  customerId: "test-customer-001",
  vendorId: "test-vendor-001",
  eventDate: new Date("2025-03-25T00:00:00Z"),
  eventTime: "19:00",
  eventType: "BIRTHDAY",
  location: "789 Party Place, City, ST 12345",
  guestCount: 50,
  status: BookingStatus.ACCEPTED,
  proposalAmount: 150000, // $1500.00
  proposalDetails: {
    lineItems: [
      { name: "Burgers", quantity: 50, unitPrice: 2000, total: 100000 },
      { name: "Fries", quantity: 50, unitPrice: 1000, total: 50000 },
    ],
    inclusions: ["Plates", "Napkins"],
    terms: "Payment due upon acceptance",
  },
  proposalSentAt: new Date("2025-01-22T00:00:00Z"),
  proposalExpiresAt: new Date("2025-01-29T00:00:00Z"),
  platformFeeCustomer: 7500,
  platformFeeVendor: 7500,
  platformFee: 15000,
  totalAmount: 157500,
  vendorPayout: 142500,
  createdAt: new Date("2025-01-21T00:00:00Z"),
  updatedAt: new Date("2025-01-22T10:00:00Z"),
};

export const testBookingVendorDeclined: Partial<Booking> = {
  id: "test-booking-vendor-declined-001",
  customerId: "test-customer-001",
  vendorId: "test-vendor-001",
  eventDate: new Date("2025-03-30T00:00:00Z"),
  eventTime: "14:00",
  eventType: "OTHER",
  location: "321 Event Space, City, ST 12345",
  guestCount: 60,
  status: BookingStatus.VENDOR_DECLINED,
  totalAmount: 0,
  platformFee: 0,
  vendorPayout: 0,
  declineReason: "Not available on this date",
  createdAt: new Date("2025-01-23T00:00:00Z"),
  updatedAt: new Date("2025-01-24T00:00:00Z"),
};

export const testBookingCustomerDeclined: Partial<Booking> = {
  id: "test-booking-customer-declined-001",
  customerId: "test-customer-001",
  vendorId: "test-vendor-001",
  eventDate: new Date("2025-04-05T00:00:00Z"),
  eventTime: "11:00",
  eventType: "FESTIVAL",
  location: "555 Park Street, City, ST 12345",
  guestCount: 200,
  status: BookingStatus.CUSTOMER_DECLINED,
  proposalAmount: 500000, // $5000.00
  proposalDetails: {
    lineItems: [
      { name: "Tacos", quantity: 200, unitPrice: 2500, total: 500000 },
    ],
    inclusions: ["Everything"],
  },
  proposalSentAt: new Date("2025-01-24T00:00:00Z"),
  proposalExpiresAt: new Date("2025-01-31T00:00:00Z"),
  platformFeeCustomer: 25000,
  platformFeeVendor: 25000,
  platformFee: 50000,
  totalAmount: 525000,
  vendorPayout: 475000,
  declineReason: "Found a better price",
  createdAt: new Date("2025-01-23T00:00:00Z"),
  updatedAt: new Date("2025-01-25T00:00:00Z"),
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
