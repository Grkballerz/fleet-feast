/**
 * User Test Fixtures
 * Provides test data for users in various roles and states
 */

import { UserRole, UserStatus } from "@prisma/client";
import type { User } from "@prisma/client";

export const testCustomer: Partial<User> = {
  id: "test-customer-001",
  email: "customer@test.com",
  role: UserRole.CUSTOMER,
  status: UserStatus.ACTIVE,
  emailVerified: new Date("2025-01-01T00:00:00Z"),
  createdAt: new Date("2025-01-01T00:00:00Z"),
  updatedAt: new Date("2025-01-01T00:00:00Z"),
};

export const testVendorUser: Partial<User> = {
  id: "test-vendor-user-001",
  email: "vendor@test.com",
  role: UserRole.VENDOR,
  status: UserStatus.ACTIVE,
  emailVerified: new Date("2025-01-01T00:00:00Z"),
  createdAt: new Date("2025-01-01T00:00:00Z"),
  updatedAt: new Date("2025-01-01T00:00:00Z"),
};

export const testAdmin: Partial<User> = {
  id: "test-admin-001",
  email: "admin@test.com",
  role: UserRole.ADMIN,
  status: UserStatus.ACTIVE,
  emailVerified: new Date("2025-01-01T00:00:00Z"),
  createdAt: new Date("2025-01-01T00:00:00Z"),
  updatedAt: new Date("2025-01-01T00:00:00Z"),
};

export const unverifiedUser: Partial<User> = {
  id: "test-unverified-001",
  email: "unverified@test.com",
  role: UserRole.CUSTOMER,
  status: UserStatus.ACTIVE,
  emailVerified: null,
  createdAt: new Date("2025-01-01T00:00:00Z"),
  updatedAt: new Date("2025-01-01T00:00:00Z"),
};

export const suspendedUser: Partial<User> = {
  id: "test-suspended-001",
  email: "suspended@test.com",
  role: UserRole.CUSTOMER,
  status: UserStatus.SUSPENDED,
  emailVerified: new Date("2025-01-01T00:00:00Z"),
  createdAt: new Date("2025-01-01T00:00:00Z"),
  updatedAt: new Date("2025-01-01T00:00:00Z"),
};

// Test password hash for "Test1234!" (pre-hashed with bcrypt)
export const testPasswordHash =
  "$2a$10$YourPreHashedPasswordHere.TestPasswordForTesting";

export const testPassword = "Test1234!";

/**
 * Helper to create a test user with custom properties
 */
export function createTestUser(
  overrides: Partial<User> = {}
): Partial<User> {
  return {
    ...testCustomer,
    ...overrides,
    id: overrides.id || `test-user-${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
