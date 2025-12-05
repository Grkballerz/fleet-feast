// Fleet Feast Smoke Test
// Quick sanity check before running full load tests

import http from 'k6/http';
import { check, group, sleep } from 'k6';

export const options = {
  vus: 1,
  duration: '30s',
  thresholds: {
    'http_req_duration': ['p(95)<2000'], // Relaxed for smoke test
    'http_req_failed': ['rate<0.1'],     // 10% error rate acceptable for smoke
    'checks': ['rate>0.9'],              // 90% of checks should pass
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function() {
  // Test 1: Homepage loads
  group('Homepage', function() {
    const res = http.get(BASE_URL);
    check(res, {
      'homepage status 200': (r) => r.status === 200,
      'homepage has content': (r) => r.body.length > 0,
    });
  });

  sleep(1);

  // Test 2: Search API is reachable
  group('Search API', function() {
    const res = http.get(`${BASE_URL}/api/trucks`);
    check(res, {
      'search API reachable': (r) => r.status === 200 || r.status === 401,
      'search returns JSON': (r) => r.headers['Content-Type']?.includes('application/json'),
    });
  });

  sleep(1);

  // Test 3: Booking API is reachable
  group('Booking API', function() {
    const res = http.get(`${BASE_URL}/api/bookings`);
    check(res, {
      'booking API reachable': (r) => r.status === 200 || r.status === 401,
    });
  });

  sleep(1);

  // Test 4: Payment API is reachable
  group('Payment API', function() {
    const res = http.get(`${BASE_URL}/api/payments`);
    check(res, {
      'payment API reachable': (r) => r.status === 200 || r.status === 401,
    });
  });

  sleep(1);
}

export function setup() {
  console.log('Running smoke test...');
  console.log(`Base URL: ${BASE_URL}`);

  // Health check
  const res = http.get(BASE_URL);
  if (res.status !== 200) {
    console.warn(`Warning: Homepage returned ${res.status}`);
  }
}

export function teardown() {
  console.log('Smoke test complete');
}
