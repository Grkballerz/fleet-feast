// Fleet Feast Load Test: API Endpoint Stress Testing
// Focuses on high-traffic API endpoints

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics for each endpoint
const searchErrors = new Rate('search_errors');
const bookingErrors = new Rate('booking_errors');
const paymentErrors = new Rate('payment_errors');
const messageErrors = new Rate('message_errors');

const searchLatency = new Trend('search_latency');
const bookingLatency = new Trend('booking_latency');
const paymentLatency = new Trend('payment_latency');
const messageLatency = new Trend('message_latency');

const requestsPerEndpoint = new Counter('requests_per_endpoint');

export const options = {
  scenarios: {
    // Search endpoint - highest traffic
    search_heavy: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 200 },
        { duration: '5m', target: 400 },
        { duration: '3m', target: 0 },
      ],
      exec: 'searchStress',
      tags: { endpoint: 'search' },
    },

    // Booking endpoint - medium traffic
    booking_medium: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 100 },
        { duration: '5m', target: 200 },
        { duration: '3m', target: 0 },
      ],
      exec: 'bookingStress',
      tags: { endpoint: 'booking' },
    },

    // Payment endpoint - critical transactions
    payment_critical: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 50 },
        { duration: '5m', target: 100 },
        { duration: '3m', target: 0 },
      ],
      exec: 'paymentStress',
      tags: { endpoint: 'payment' },
    },

    // Message endpoint - moderate traffic
    message_moderate: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 75 },
        { duration: '5m', target: 150 },
        { duration: '3m', target: 0 },
      ],
      exec: 'messageStress',
      tags: { endpoint: 'message' },
    },
  },
  thresholds: {
    'http_req_duration': ['p(95)<500'],
    'http_req_duration{endpoint:search}': ['p(95)<1000'], // Search can be slower
    'http_req_duration{endpoint:booking}': ['p(95)<500'],
    'http_req_duration{endpoint:payment}': ['p(95)<500'],
    'http_req_duration{endpoint:message}': ['p(95)<300'],
    'http_req_failed': ['rate<0.01'],
    'search_errors': ['rate<0.01'],
    'booking_errors': ['rate<0.01'],
    'payment_errors': ['rate<0.01'],
    'message_errors': ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

function randomCuisineType() {
  const cuisines = ['MEXICAN', 'ITALIAN', 'AMERICAN', 'ASIAN', 'MEDITERRANEAN', 'BBQ', 'SEAFOOD', 'VEGAN'];
  return cuisines[Math.floor(Math.random() * cuisines.length)];
}

function randomPriceRange() {
  const ranges = ['BUDGET', 'MODERATE', 'PREMIUM'];
  return ranges[Math.floor(Math.random() * ranges.length)];
}

function randomDate() {
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + 90);
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
}

// Search endpoint stress test
export function searchStress() {
  group('Search API Stress', function() {
    requestsPerEndpoint.add(1, { endpoint: 'search' });

    const params = {
      cuisineType: randomCuisineType(),
      priceRange: randomPriceRange(),
      eventDate: randomDate(),
      location: 'New York, NY',
      limit: '20',
    };

    const url = `${BASE_URL}/api/trucks?${new URLSearchParams(params).toString()}`;

    const start = Date.now();
    const res = http.get(url);
    const duration = Date.now() - start;

    searchLatency.add(duration);

    const success = check(res, {
      'search status 200': (r) => r.status === 200,
      'search has data': (r) => {
        try {
          const body = r.json();
          return body.success === true || body.data !== undefined;
        } catch (e) {
          return false;
        }
      },
      'search response time OK': (r) => duration < 1000,
    });

    if (!success) {
      searchErrors.add(1);
    }

    sleep(0.5);
  });
}

// Booking endpoint stress test
export function bookingStress() {
  group('Booking API Stress', function() {
    requestsPerEndpoint.add(1, { endpoint: 'booking' });

    // GET bookings (would require auth)
    let start = Date.now();
    let res = http.get(`${BASE_URL}/api/bookings`);
    let duration = Date.now() - start;

    bookingLatency.add(duration);

    let success = check(res, {
      'booking list responded': (r) => r.status === 401 || r.status === 200,
    });

    if (!success) {
      bookingErrors.add(1);
    }

    sleep(0.3);

    // POST booking (would require auth)
    const bookingData = {
      vendorId: `vendor-${Math.floor(Math.random() * 100) + 1}`,
      eventDate: randomDate(),
      eventTime: '14:00',
      eventType: 'CORPORATE',
      location: '123 Test St, Test City',
      guestCount: Math.floor(Math.random() * 400) + 50,
      totalAmount: Math.floor(Math.random() * 4000) + 1000,
    };

    start = Date.now();
    res = http.post(
      `${BASE_URL}/api/bookings`,
      JSON.stringify(bookingData),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
    duration = Date.now() - start;

    bookingLatency.add(duration);

    success = check(res, {
      'booking create responded': (r) => r.status === 401 || r.status === 201 || r.status === 400,
      'booking response time OK': (r) => duration < 500,
    });

    if (!success) {
      bookingErrors.add(1);
    }

    sleep(0.5);
  });
}

// Payment endpoint stress test (100 concurrent payments as per briefing)
export function paymentStress() {
  group('Payment API Stress', function() {
    requestsPerEndpoint.add(1, { endpoint: 'payment' });

    const paymentData = {
      bookingId: `booking-${__VU}-${__ITER}`,
      amount: Math.floor(Math.random() * 4000) + 1000,
    };

    const start = Date.now();
    const res = http.post(
      `${BASE_URL}/api/payments`,
      JSON.stringify(paymentData),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
    const duration = Date.now() - start;

    paymentLatency.add(duration);

    const success = check(res, {
      'payment responded': (r) => r.status === 401 || r.status === 201 || r.status === 400,
      'payment response time OK': (r) => duration < 500,
    });

    if (!success) {
      paymentErrors.add(1);
    }

    sleep(1);
  });
}

// Message endpoint stress test
export function messageStress() {
  group('Message API Stress', function() {
    requestsPerEndpoint.add(1, { endpoint: 'message' });

    // GET messages
    let start = Date.now();
    let res = http.get(`${BASE_URL}/api/messages`);
    let duration = Date.now() - start;

    messageLatency.add(duration);

    let success = check(res, {
      'message list responded': (r) => r.status === 401 || r.status === 200 || r.status === 400,
    });

    if (!success) {
      messageErrors.add(1);
    }

    sleep(0.3);

    // POST message
    const messageData = {
      bookingId: `booking-${Math.floor(Math.random() * 1000) + 1}`,
      recipientId: `user-${Math.floor(Math.random() * 100) + 1}`,
      content: 'This is a load test message. Please disregard.',
    };

    start = Date.now();
    res = http.post(
      `${BASE_URL}/api/messages`,
      JSON.stringify(messageData),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
    duration = Date.now() - start;

    messageLatency.add(duration);

    success = check(res, {
      'message create responded': (r) => r.status === 401 || r.status === 201 || r.status === 400,
      'message response time OK': (r) => duration < 300,
    });

    if (!success) {
      messageErrors.add(1);
    }

    sleep(0.5);
  });
}

export function setup() {
  console.log('Starting API Endpoint Stress Test');
  console.log(`Base URL: ${BASE_URL}`);

  // Verify all endpoints are reachable
  const endpoints = [
    '/api/trucks',
    '/api/bookings',
    '/api/payments',
    '/api/messages',
  ];

  endpoints.forEach(endpoint => {
    const res = http.get(`${BASE_URL}${endpoint}`);
    console.log(`${endpoint}: ${res.status}`);
  });

  return { startTime: Date.now() };
}

export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  console.log(`API stress test completed in ${duration} seconds`);
}
