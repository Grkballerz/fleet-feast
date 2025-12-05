// Fleet Feast Load Test: Rate Limit Verification
// Verifies rate limits hold under load as specified in API design

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Counter, Trend } from 'k6/metrics';

// Custom metrics
const rateLimitHits = new Counter('rate_limit_hits');
const rateLimitPassed = new Counter('rate_limit_passed');
const unexpectedErrors = new Counter('unexpected_errors');
const rateLimitLatency = new Trend('rate_limit_response_time');

export const options = {
  scenarios: {
    // Test authenticated user rate limit (100 req/min)
    authenticated_limit: {
      executor: 'constant-arrival-rate',
      rate: 150, // Attempt 150 req/min to exceed limit
      timeUnit: '1m',
      duration: '2m',
      preAllocatedVUs: 10,
      maxVUs: 50,
      exec: 'testAuthenticatedRateLimit',
      tags: { rateLimit: 'authenticated' },
    },

    // Test unauthenticated user rate limit (20 req/min)
    unauthenticated_limit: {
      executor: 'constant-arrival-rate',
      rate: 30, // Attempt 30 req/min to exceed limit
      timeUnit: '1m',
      duration: '2m',
      preAllocatedVUs: 5,
      maxVUs: 20,
      exec: 'testUnauthenticatedRateLimit',
      tags: { rateLimit: 'unauthenticated' },
      startTime: '30s',
    },

    // Test search endpoint specific limit (30 req/min per API design)
    search_limit: {
      executor: 'constant-arrival-rate',
      rate: 45, // Attempt 45 req/min to exceed limit
      timeUnit: '1m',
      duration: '2m',
      preAllocatedVUs: 5,
      maxVUs: 20,
      exec: 'testSearchRateLimit',
      tags: { rateLimit: 'search' },
      startTime: '1m',
    },

    // Test burst protection
    burst_protection: {
      executor: 'constant-arrival-rate',
      rate: 200, // High burst rate
      timeUnit: '10s',
      duration: '30s',
      preAllocatedVUs: 20,
      maxVUs: 100,
      exec: 'testBurstProtection',
      tags: { rateLimit: 'burst' },
      startTime: '2m30s',
    },
  },
  thresholds: {
    'rate_limit_hits': ['count>0'], // Should trigger rate limits
    'http_req_duration': ['p(95)<500'],
    'rate_limit_response_time': ['p(95)<100'], // Rate limit responses should be fast
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Test authenticated user rate limit (100 req/min)
export function testAuthenticatedRateLimit() {
  group('Authenticated Rate Limit Test', function() {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/api/bookings`, {
      tags: { endpoint: 'bookings' },
    });
    const duration = Date.now() - start;

    rateLimitLatency.add(duration);

    // Check for rate limit response
    if (res.status === 429) {
      rateLimitHits.add(1);

      const rateLimitCheck = check(res, {
        'has 429 status': (r) => r.status === 429,
        'has rate limit headers': (r) =>
          r.headers['X-RateLimit-Limit'] !== undefined ||
          r.headers['x-ratelimit-limit'] !== undefined,
        'has retry-after': (r) =>
          r.headers['Retry-After'] !== undefined ||
          r.headers['retry-after'] !== undefined,
        'has error body': (r) => {
          try {
            const body = r.json();
            return body.error && body.error.code === 'RATE_LIMIT_EXCEEDED';
          } catch (e) {
            return false;
          }
        },
        'rate limit response is fast': () => duration < 100,
      });

      if (!rateLimitCheck) {
        unexpectedErrors.add(1);
      }
    } else if (res.status === 401 || res.status === 200) {
      // Expected responses when rate limit not hit
      rateLimitPassed.add(1);

      check(res, {
        'has rate limit headers': (r) =>
          r.headers['X-RateLimit-Limit'] !== undefined ||
          r.headers['x-ratelimit-limit'] !== undefined,
        'has remaining count': (r) =>
          r.headers['X-RateLimit-Remaining'] !== undefined ||
          r.headers['x-ratelimit-remaining'] !== undefined,
      });
    } else {
      unexpectedErrors.add(1);
    }

    sleep(0.1);
  });
}

// Test unauthenticated user rate limit (20 req/min)
export function testUnauthenticatedRateLimit() {
  group('Unauthenticated Rate Limit Test', function() {
    const start = Date.now();
    // Use search endpoint which should be publicly accessible
    const res = http.get(`${BASE_URL}/api/trucks`, {
      tags: { endpoint: 'search' },
    });
    const duration = Date.now() - start;

    rateLimitLatency.add(duration);

    if (res.status === 429) {
      rateLimitHits.add(1);

      check(res, {
        'unauthenticated rate limit triggered': (r) => r.status === 429,
        'has rate limit body': (r) => {
          try {
            const body = r.json();
            return body.error && body.error.code === 'RATE_LIMIT_EXCEEDED';
          } catch (e) {
            return false;
          }
        },
        'suggests retry delay': (r) => {
          try {
            const body = r.json();
            return body.error.details && body.error.details.retryAfter !== undefined;
          } catch (e) {
            return false;
          }
        },
      });
    } else {
      rateLimitPassed.add(1);
    }

    sleep(0.1);
  });
}

// Test search-specific rate limit (30 req/min)
export function testSearchRateLimit() {
  group('Search Rate Limit Test', function() {
    const searchParams = {
      cuisineType: 'MEXICAN',
      priceRange: 'MODERATE',
      limit: '10',
    };

    const url = `${BASE_URL}/api/trucks?${new URLSearchParams(searchParams).toString()}`;
    const start = Date.now();
    const res = http.get(url, {
      tags: { endpoint: 'search' },
    });
    const duration = Date.now() - start;

    rateLimitLatency.add(duration);

    if (res.status === 429) {
      rateLimitHits.add(1);

      check(res, {
        'search rate limit triggered': (r) => r.status === 429,
        'rate limit message clear': (r) => {
          try {
            const body = r.json();
            return body.error && body.error.message.includes('Too many requests');
          } catch (e) {
            return false;
          }
        },
      });
    } else {
      rateLimitPassed.add(1);
    }

    sleep(0.1);
  });
}

// Test burst protection
export function testBurstProtection() {
  group('Burst Protection Test', function() {
    // Rapid-fire requests
    const requests = [];
    for (let i = 0; i < 5; i++) {
      requests.push({
        method: 'GET',
        url: `${BASE_URL}/api/trucks`,
        tags: { burst: true },
      });
    }

    const start = Date.now();
    const responses = http.batch(requests);
    const duration = Date.now() - start;

    rateLimitLatency.add(duration);

    // Check if any were rate limited
    let hitCount = 0;
    responses.forEach(res => {
      if (res.status === 429) {
        hitCount++;
        rateLimitHits.add(1);
      } else {
        rateLimitPassed.add(1);
      }
    });

    check(responses, {
      'burst handled gracefully': (resps) =>
        resps.every(r => r.status === 200 || r.status === 429 || r.status === 401),
      'some requests rate limited': () => hitCount > 0,
      'burst response time acceptable': () => duration < 1000,
    });

    sleep(1);
  });
}

// Test rate limit recovery
export function testRateLimitRecovery() {
  group('Rate Limit Recovery Test', function() {
    // First, hit rate limit
    for (let i = 0; i < 25; i++) {
      http.get(`${BASE_URL}/api/trucks`);
    }

    // Verify rate limited
    let res = http.get(`${BASE_URL}/api/trucks`);
    const wasLimited = res.status === 429;

    if (wasLimited) {
      // Wait for rate limit window to pass (assuming 1 minute window)
      sleep(65);

      // Try again - should succeed now
      res = http.get(`${BASE_URL}/api/trucks`);

      check(res, {
        'recovered from rate limit': (r) => r.status !== 429,
        'rate limit reset': (r) => {
          const remaining = r.headers['X-RateLimit-Remaining'] ||
                           r.headers['x-ratelimit-remaining'];
          return remaining !== undefined && parseInt(remaining) > 0;
        },
      });
    }
  });
}

export function setup() {
  console.log('Starting Rate Limit Verification Test');
  console.log(`Base URL: ${BASE_URL}`);
  console.log('\nExpected Rate Limits:');
  console.log('  - Authenticated: 100 req/min');
  console.log('  - Unauthenticated: 20 req/min');
  console.log('  - Search: 30 req/min');
  console.log('\nTest will intentionally exceed limits to verify enforcement\n');

  return { startTime: Date.now() };
}

export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  console.log(`\nRate limit test completed in ${duration} seconds`);
}

export function handleSummary(data) {
  let summary = '\n=== Rate Limit Test Summary ===\n\n';

  if (data.metrics.rate_limit_hits) {
    summary += `Rate Limit Triggers: ${data.metrics.rate_limit_hits.values.count}\n`;
  }

  if (data.metrics.rate_limit_passed) {
    summary += `Requests Passed: ${data.metrics.rate_limit_passed.values.count}\n`;
  }

  if (data.metrics.unexpected_errors) {
    summary += `Unexpected Errors: ${data.metrics.unexpected_errors.values.count}\n`;
  }

  if (data.metrics.rate_limit_latency) {
    summary += `\nRate Limit Response Time:\n`;
    summary += `  p50: ${data.metrics.rate_limit_latency.values['p(50)'].toFixed(2)}ms\n`;
    summary += `  p95: ${data.metrics.rate_limit_latency.values['p(95)'].toFixed(2)}ms\n`;
  }

  summary += '\n';

  return {
    'rate-limit-summary.json': JSON.stringify(data),
    stdout: summary,
  };
}
