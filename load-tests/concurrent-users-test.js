// Fleet Feast Load Test: Concurrent Users Simulation
// Target: 1000 concurrent users with realistic user journey

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const searchDuration = new Trend('search_duration');
const bookingDuration = new Trend('booking_duration');
const paymentDuration = new Trend('payment_duration');
const requestCount = new Counter('total_requests');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up to 100 users
    { duration: '3m', target: 300 },   // Ramp to 300 users
    { duration: '5m', target: 500 },   // Scale to 500 users
    { duration: '5m', target: 1000 },  // Peak at 1000 users
    { duration: '5m', target: 1000 },  // Sustained peak load
    { duration: '3m', target: 500 },   // Ramp down
    { duration: '2m', target: 0 },     // Cool down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'], // 95% of requests must complete below 500ms
    'http_req_failed': ['rate<0.01'],   // Error rate must be below 1%
    'errors': ['rate<0.01'],
    'search_duration': ['p(95)<1000'],  // Search p95 < 1 second
    'booking_duration': ['p(95)<500'],
    'payment_duration': ['p(95)<500'],
  },
  ext: {
    loadimpact: {
      projectID: 3708823,
      name: 'Fleet Feast - Concurrent Users Test'
    }
  }
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Helper function to generate random data
function randomString(length = 10) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function randomDate() {
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + 90); // Next 90 days
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
}

function randomCuisineType() {
  const cuisines = ['MEXICAN', 'ITALIAN', 'AMERICAN', 'ASIAN', 'MEDITERRANEAN', 'BBQ', 'SEAFOOD', 'VEGAN'];
  return cuisines[Math.floor(Math.random() * cuisines.length)];
}

function randomPriceRange() {
  const ranges = ['BUDGET', 'MODERATE', 'PREMIUM'];
  return ranges[Math.floor(Math.random() * ranges.length)];
}

function randomEventType() {
  const types = ['CORPORATE', 'WEDDING', 'BIRTHDAY', 'FESTIVAL', 'PRIVATE_PARTY', 'OTHER'];
  return types[Math.floor(Math.random() * types.length)];
}

// Realistic user journey
export default function() {
  requestCount.add(1);

  // Simulate different user types and behaviors
  const userBehavior = Math.random();

  if (userBehavior < 0.6) {
    // 60% of users: Browse and search only
    browseAndSearch();
  } else if (userBehavior < 0.9) {
    // 30% of users: Browse, search, view details
    browseSearchAndView();
  } else {
    // 10% of users: Complete booking flow (most intensive)
    completeBookingFlow();
  }

  // Think time: users don't make requests continuously
  sleep(Math.random() * 3 + 1); // 1-4 seconds
}

function browseAndSearch() {
  group('Browse and Search Flow', function() {
    // Visit homepage
    let res = http.get(`${BASE_URL}/`);
    check(res, {
      'homepage loaded': (r) => r.status === 200,
    }) || errorRate.add(1);

    sleep(1);

    // Search for food trucks
    const searchParams = {
      cuisineType: randomCuisineType(),
      priceRange: randomPriceRange(),
      eventDate: randomDate(),
    };

    const searchUrl = `${BASE_URL}/api/trucks?${new URLSearchParams(searchParams).toString()}`;

    const searchStart = Date.now();
    res = http.get(searchUrl);
    searchDuration.add(Date.now() - searchStart);

    const searchSuccess = check(res, {
      'search returned 200': (r) => r.status === 200,
      'search has results': (r) => r.json('data.trucks') !== undefined,
    });

    if (!searchSuccess) {
      errorRate.add(1);
    }

    sleep(2);
  });
}

function browseSearchAndView() {
  browseAndSearch();

  group('View Truck Details', function() {
    // View a specific truck (simulate clicking on search result)
    // Using a realistic vendor ID (would be from search results in real scenario)
    const vendorId = `vendor-${Math.floor(Math.random() * 100) + 1}`;

    let res = http.get(`${BASE_URL}/api/trucks/${vendorId}`);
    check(res, {
      'truck details loaded': (r) => r.status === 200 || r.status === 404, // 404 is acceptable
    }) || errorRate.add(1);

    sleep(1);

    // Get vendor menu
    res = http.get(`${BASE_URL}/api/trucks/${vendorId}`);
    check(res, {
      'menu loaded': (r) => r.status === 200 || r.status === 404,
    });

    sleep(2);

    // Check availability
    res = http.get(`${BASE_URL}/api/trucks/${vendorId}/availability`);
    check(res, {
      'availability loaded': (r) => r.status === 200 || r.status === 404,
    });

    sleep(1);
  });
}

function completeBookingFlow() {
  browseSearchAndView();

  // Note: This simulates the flow but won't create real bookings without auth
  // In production load test, you'd use real test user accounts

  group('Booking Flow (Simulated)', function() {
    // Attempt to create booking (will require auth in real app)
    const bookingData = {
      vendorId: `vendor-${Math.floor(Math.random() * 100) + 1}`,
      eventDate: randomDate(),
      eventTime: '14:00',
      eventType: randomEventType(),
      location: '123 Test Street, Test City, TS 12345',
      guestCount: Math.floor(Math.random() * 400) + 50, // 50-450 guests
      totalAmount: Math.floor(Math.random() * 4000) + 1000, // $10-50
      specialRequests: 'Load test booking - do not process'
    };

    const bookingStart = Date.now();
    const res = http.post(
      `${BASE_URL}/api/bookings`,
      JSON.stringify(bookingData),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
    bookingDuration.add(Date.now() - bookingStart);

    // Expect 401 (unauthorized) in load test without auth
    check(res, {
      'booking endpoint responded': (r) => r.status === 401 || r.status === 201 || r.status === 400,
    }) || errorRate.add(1);

    sleep(1);
  });

  group('Payment Flow (Simulated)', function() {
    // Simulate payment authorization attempt
    const paymentData = {
      bookingId: `booking-${randomString(10)}`,
      amount: Math.floor(Math.random() * 4000) + 1000,
    };

    const paymentStart = Date.now();
    const res = http.post(
      `${BASE_URL}/api/payments`,
      JSON.stringify(paymentData),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
    paymentDuration.add(Date.now() - paymentStart);

    check(res, {
      'payment endpoint responded': (r) => r.status === 401 || r.status === 201 || r.status === 400,
    }) || errorRate.add(1);

    sleep(1);
  });
}

// Setup function (runs once per VU at start)
export function setup() {
  console.log('Starting Fleet Feast Load Test');
  console.log(`Base URL: ${BASE_URL}`);
  console.log('Target: 1000 concurrent users');

  // Health check
  const res = http.get(`${BASE_URL}/`);
  if (res.status !== 200) {
    throw new Error(`Health check failed: ${res.status}`);
  }

  return { startTime: Date.now() };
}

// Teardown function (runs once at end)
export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  console.log(`Load test completed in ${duration} seconds`);
}
