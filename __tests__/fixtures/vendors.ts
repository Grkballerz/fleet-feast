/**
 * Vendor Test Fixtures
 * Provides test data for vendors in various states
 */

import { VendorStatus } from "@prisma/client";
import type { Vendor } from "@prisma/client";

export const testVendor: Partial<Vendor> = {
  id: "test-vendor-001",
  userId: "test-vendor-user-001",
  businessName: "Test Food Truck",
  businessType: "FOOD_TRUCK",
  cuisineTypes: ["AMERICAN", "BBQ"],
  description: "Best BBQ in town",
  phoneNumber: "+1-555-0100",
  status: VendorStatus.APPROVED,
  rating: 4.5,
  totalReviews: 42,
  basePrice: 15000, // $150.00
  pricePerGuest: 2500, // $25.00
  minGuests: 25,
  maxGuests: 200,
  servingRadius: 50, // 50 miles
  createdAt: new Date("2025-01-01T00:00:00Z"),
  updatedAt: new Date("2025-01-01T00:00:00Z"),
};

export const pendingVendor: Partial<Vendor> = {
  id: "test-vendor-002",
  userId: "test-vendor-user-002",
  businessName: "Pending Food Truck",
  businessType: "FOOD_TRUCK",
  cuisineTypes: ["MEXICAN"],
  description: "Authentic Mexican cuisine",
  phoneNumber: "+1-555-0101",
  status: VendorStatus.PENDING,
  rating: 0,
  totalReviews: 0,
  basePrice: 12000,
  pricePerGuest: 2000,
  minGuests: 20,
  maxGuests: 150,
  servingRadius: 30,
  createdAt: new Date("2025-01-02T00:00:00Z"),
  updatedAt: new Date("2025-01-02T00:00:00Z"),
};

export const suspendedVendor: Partial<Vendor> = {
  id: "test-vendor-003",
  userId: "test-vendor-user-003",
  businessName: "Suspended Vendor",
  businessType: "FOOD_TRUCK",
  cuisineTypes: ["ITALIAN"],
  description: "Suspended for violations",
  phoneNumber: "+1-555-0102",
  status: VendorStatus.SUSPENDED,
  rating: 3.0,
  totalReviews: 10,
  basePrice: 10000,
  pricePerGuest: 1500,
  minGuests: 15,
  maxGuests: 100,
  servingRadius: 20,
  createdAt: new Date("2025-01-03T00:00:00Z"),
  updatedAt: new Date("2025-01-03T00:00:00Z"),
};

export const testVendorWithStripe: Partial<Vendor> = {
  ...testVendor,
  id: "test-vendor-stripe-001",
  stripeAccountId: "acct_test_vendor_123",
  stripeOnboarded: true,
  stripeChargesEnabled: true,
  stripePayoutsEnabled: true,
};

/**
 * Helper to create a test vendor with custom properties
 */
export function createTestVendor(
  overrides: Partial<Vendor> = {}
): Partial<Vendor> {
  return {
    ...testVendor,
    ...overrides,
    id: overrides.id || `test-vendor-${Date.now()}`,
    userId: overrides.userId || `test-vendor-user-${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
