/**
 * E2E Test Fixtures and Test Data
 * Provides reusable test data for all E2E tests
 */

import { faker } from '@faker-js/faker';

/**
 * Test Customer Data
 */
export const testCustomer = {
  email: 'e2e-customer@test.com',
  password: 'TestPass123!',
  name: 'E2E Test Customer',
  phone: '+1234567890',
  address: {
    street: '123 Test St',
    city: 'Test City',
    state: 'CA',
    zip: '90210',
  },
};

/**
 * Test Vendor Data
 */
export const testVendor = {
  email: 'e2e-vendor@test.com',
  password: 'VendorPass123!',
  name: 'E2E Test Vendor',
  businessName: 'E2E Food Truck',
  phone: '+1987654320',
  description: 'Test food truck serving delicious E2E meals',
  cuisineTypes: ['AMERICAN', 'BBQ'],
  serviceRadius: 25,
  minBookingAmount: 500,
};

/**
 * Test Admin Data
 */
export const testAdmin = {
  email: 'e2e-admin@test.com',
  password: 'AdminPass123!',
  name: 'E2E Test Admin',
};

/**
 * Test Booking Data
 */
export const testBooking = {
  eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 weeks from now
  eventTime: '18:00',
  guestCount: 50,
  eventType: 'CORPORATE',
  duration: 4,
  location: {
    address: '456 Event Ave',
    city: 'Test City',
    state: 'CA',
    zip: '90211',
  },
  specialRequests: 'Please arrive 30 minutes early for setup',
};

/**
 * Test Message Data
 */
export const testMessage = {
  subject: 'Question about event catering',
  content: 'Hi, I have some questions about your catering services for our upcoming corporate event.',
};

/**
 * Test Review Data
 */
export const testReview = {
  rating: 5,
  comment: 'Excellent service! The food was amazing and the staff was very professional. Highly recommended!',
};

/**
 * Stripe Test Card Numbers
 */
export const stripeTestCards = {
  success: {
    number: '4242424242424242',
    expiry: '12/30',
    cvc: '123',
    zip: '12345',
  },
  requiresAuthentication: {
    number: '4000002500003155',
    expiry: '12/30',
    cvc: '123',
    zip: '12345',
  },
  declined: {
    number: '4000000000000002',
    expiry: '12/30',
    cvc: '123',
    zip: '12345',
  },
  insufficientFunds: {
    number: '4000000000009995',
    expiry: '12/30',
    cvc: '123',
    zip: '12345',
  },
};

/**
 * Helper Functions
 */

/**
 * Generate unique test customer
 */
export function generateTestCustomer() {
  return {
    email: faker.internet.email().toLowerCase(),
    password: 'TestPass123!',
    name: faker.person.fullName(),
    phone: faker.phone.number('+1##########'),
    address: {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state({ abbreviated: true }),
      zip: faker.location.zipCode(),
    },
  };
}

/**
 * Generate unique test vendor
 */
export function generateTestVendor() {
  return {
    email: faker.internet.email().toLowerCase(),
    password: 'VendorPass123!',
    name: faker.person.fullName(),
    businessName: faker.company.name() + ' Food Truck',
    phone: faker.phone.number('+1##########'),
    description: faker.company.catchPhrase(),
    cuisineTypes: ['AMERICAN', 'BBQ'],
    serviceRadius: 25,
    minBookingAmount: 500,
  };
}

/**
 * Generate test booking
 */
export function generateTestBooking() {
  const futureDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  return {
    eventDate: futureDate.toISOString().split('T')[0],
    eventTime: '18:00',
    guestCount: faker.number.int({ min: 20, max: 200 }),
    eventType: faker.helpers.arrayElement(['WEDDING', 'CORPORATE', 'PRIVATE', 'FESTIVAL']),
    duration: faker.helpers.arrayElement([2, 3, 4, 6, 8]),
    location: {
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state({ abbreviated: true }),
      zip: faker.location.zipCode(),
    },
    specialRequests: faker.lorem.sentence(),
  };
}

/**
 * Wait helper for animations and transitions
 */
export const waitFor = {
  animation: 300,
  transition: 500,
  navigation: 1000,
  api: 2000,
};

/**
 * Test database cleanup helpers
 */
export const cleanup = {
  emails: [
    testCustomer.email,
    testVendor.email,
    testAdmin.email,
    'e2e-*.test.com',
  ],
};
