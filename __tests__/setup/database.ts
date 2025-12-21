/**
 * Database Test Setup Utilities
 * Provides helpers for seeding and cleaning test database
 */

import { PrismaClient } from "@prisma/client";

// Use a separate test database instance
const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
    },
  },
});

/**
 * Clear all test data from database
 * Run in reverse order of dependencies
 */
export async function clearDatabase() {
  await testPrisma.$transaction([
    // Quotes and requests
    testPrisma.quote.deleteMany(),
    testPrisma.quoteRequest.deleteMany(),

    // Bookings and related
    testPrisma.booking.deleteMany(),
    testPrisma.review.deleteMany(),
    testPrisma.availability.deleteMany(),

    // Disputes and violations
    testPrisma.dispute.deleteMany(),
    testPrisma.violation.deleteMany(),

    // Payments
    testPrisma.vendorPayoutBooking.deleteMany(),
    testPrisma.vendorPayout.deleteMany(),
    testPrisma.escrowTransaction.deleteMany(),
    testPrisma.payment.deleteMany(),

    // Messages and notifications
    testPrisma.message.deleteMany(),
    testPrisma.notificationPreferences.deleteMany(),
    testPrisma.notification.deleteMany(),

    // Vendor data
    testPrisma.vendorMenu.deleteMany(),
    testPrisma.vendorDocument.deleteMany(),
    testPrisma.vendor.deleteMany(),

    // User data
    testPrisma.verificationToken.deleteMany(),
    testPrisma.user.deleteMany(),
  ]);
}

/**
 * Setup database for integration tests
 * Creates a fresh test environment
 */
export async function setupDatabase() {
  await clearDatabase();
}

/**
 * Teardown database after tests
 * Cleans up all test data
 */
export async function teardownDatabase() {
  await clearDatabase();
  await testPrisma.$disconnect();
}

/**
 * Get test Prisma client instance
 */
export function getTestPrisma() {
  return testPrisma;
}

/**
 * Seed test data helper
 * Generic function to create test records
 */
export async function seedTestData<T>(
  model: keyof PrismaClient,
  data: any[]
): Promise<T[]> {
  const records: T[] = [];

  for (const item of data) {
    const record = await (testPrisma[model] as any).create({
      data: item,
    });
    records.push(record);
  }

  return records;
}

// Global setup/teardown hooks for Jest
beforeAll(async () => {
  await setupDatabase();
});

afterAll(async () => {
  await teardownDatabase();
});

// Clean between each test to ensure isolation
afterEach(async () => {
  await clearDatabase();
});

export default testPrisma;
