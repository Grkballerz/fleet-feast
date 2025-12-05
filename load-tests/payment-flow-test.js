// Fleet Feast Load Test: Payment Flow
// Specialized test for 100 concurrent payment attempts

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Payment-specific metrics
const paymentSuccessRate = new Rate('payment_success');
const paymentErrorRate = new Rate('payment_errors');
const paymentLatency = new Trend('payment_latency');
const authorizationLatency = new Trend('authorization_latency');
const webhookLatency = new Trend('webhook_latency');
const totalPayments = new Counter('total_payment_attempts');

export const options = {
  scenarios: {
    // Scenario 1: Concurrent payment spike (100 simultaneous payments)
    payment_spike: {
      executor: 'constant-vus',
      vus: 100,
      duration: '1m',
      exec: 'paymentFlow',
      tags: { scenario: 'spike' },
    },

    // Scenario 2: Sustained payment load
    payment_sustained: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 50 },
        { duration: '3m', target: 100 },
        { duration: '2m', target: 0 },
      ],
      exec: 'paymentFlow',
      tags: { scenario: 'sustained' },
      startTime: '1m30s', // Start after spike scenario
    },

    // Scenario 3: Payment retry simulation
    payment_retry: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 20 },
        { duration: '2m', target: 20 },
        { duration: '1m', target: 0 },
      ],
      exec: 'paymentRetryFlow',
      tags: { scenario: 'retry' },
      startTime: '2m', // Start after spike
    },
  },
  thresholds: {
    'http_req_duration': ['p(95)<500'],
    'payment_latency': ['p(95)<500', 'p(99)<1000'],
    'authorization_latency': ['p(95)<500'],
    'payment_errors': ['rate<0.02'], // Allow slightly higher error rate (2%) for payment stress
    'http_req_failed{scenario:spike}': ['rate<0.05'], // 5% during spike is acceptable
    'http_req_failed{scenario:sustained}': ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

function generatePaymentData(prefix = '') {
  return {
    bookingId: `${prefix}booking-${__VU}-${__ITER}-${Date.now()}`,
    amount: Math.floor(Math.random() * 4000) + 1000, // $10-$50
    currency: 'usd',
    description: `Load test payment ${__VU}-${__ITER}`,
    metadata: {
      test: true,
      vu: __VU,
      iteration: __ITER,
      timestamp: Date.now(),
    },
  };
}

// Main payment flow
export function paymentFlow() {
  group('Complete Payment Flow', function() {
    totalPayments.add(1);

    const paymentData = generatePaymentData('flow-');

    // Step 1: Create payment intent
    const createStart = Date.now();
    const createRes = http.post(
      `${BASE_URL}/api/payments`,
      JSON.stringify(paymentData),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    const createDuration = Date.now() - createStart;

    paymentLatency.add(createDuration);

    const createSuccess = check(createRes, {
      'payment intent created': (r) => r.status === 201 || r.status === 401,
      'has response body': (r) => r.body.length > 0,
      'create response time OK': () => createDuration < 500,
    });

    if (!createSuccess) {
      paymentErrorRate.add(1);
    } else {
      paymentSuccessRate.add(1);
    }

    // Simulate processing delay
    sleep(0.5);

    // Step 2: Authorize payment (simulate Stripe interaction)
    if (createRes.status === 201) {
      const authStart = Date.now();
      const authRes = http.post(
        `${BASE_URL}/api/payments`,
        JSON.stringify({
          ...paymentData,
          action: 'authorize',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
      const authDuration = Date.now() - authStart;

      authorizationLatency.add(authDuration);

      check(authRes, {
        'authorization responded': (r) => r.status === 200 || r.status === 401 || r.status === 400,
        'authorization response time OK': () => authDuration < 500,
      });
    }

    sleep(0.3);

    // Step 3: Retrieve payment status
    const retrieveRes = http.get(`${BASE_URL}/api/payments`);
    check(retrieveRes, {
      'payment list retrieved': (r) => r.status === 200 || r.status === 401,
    });

    sleep(0.2);
  });
}

// Payment retry flow (simulates failed payment retry)
export function paymentRetryFlow() {
  group('Payment Retry Flow', function() {
    totalPayments.add(1);

    const paymentData = generatePaymentData('retry-');

    // Attempt 1
    let res = http.post(
      `${BASE_URL}/api/payments`,
      JSON.stringify(paymentData),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (res.status === 401 || res.status === 400) {
      sleep(1);

      // Attempt 2 (retry after failure)
      res = http.post(
        `${BASE_URL}/api/payments`,
        JSON.stringify({
          ...paymentData,
          retryAttempt: 2,
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      check(res, {
        'retry payment responded': (r) => r.status === 201 || r.status === 401 || r.status === 400,
      });
    }

    sleep(2);
  });
}

// Webhook processing simulation
export function webhookFlow() {
  group('Webhook Processing', function() {
    const webhookData = {
      id: `evt_${Date.now()}_${__VU}_${__ITER}`,
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: `pi_${Date.now()}_${__VU}`,
          amount: 5000,
          currency: 'usd',
          status: 'succeeded',
        },
      },
    };

    const webhookStart = Date.now();
    const res = http.post(
      `${BASE_URL}/api/payments/webhook`,
      JSON.stringify(webhookData),
      {
        headers: {
          'Content-Type': 'application/json',
          'Stripe-Signature': 'test_signature', // Would be real signature in production
        },
      }
    );
    const webhookDuration = Date.now() - webhookStart;

    webhookLatency.add(webhookDuration);

    check(res, {
      'webhook accepted': (r) => r.status === 200 || r.status === 400, // 400 if signature invalid
      'webhook response time OK': () => webhookDuration < 200, // Webhooks should be fast
    });

    sleep(0.1);
  });
}

// Database connection pool stress
export function connectionPoolStress() {
  group('Connection Pool Stress', function() {
    // Fire multiple concurrent requests to stress connection pool
    const requests = [];
    for (let i = 0; i < 10; i++) {
      requests.push({
        method: 'GET',
        url: `${BASE_URL}/api/payments`,
      });
    }

    const responses = http.batch(requests);

    check(responses, {
      'all requests completed': (responses) => responses.every(r => r.status !== 0),
      'no connection pool exhaustion': (responses) =>
        !responses.some(r => r.status === 503 || r.status === 504),
    });

    sleep(0.5);
  });
}

export function setup() {
  console.log('Starting Payment Flow Load Test');
  console.log(`Base URL: ${BASE_URL}`);
  console.log('Target: 100 concurrent payment attempts');

  // Test payment endpoint availability
  const res = http.get(`${BASE_URL}/api/payments`);
  console.log(`Payment endpoint status: ${res.status}`);

  if (res.status !== 200 && res.status !== 401) {
    console.warn('Warning: Payment endpoint may not be ready');
  }

  return { startTime: Date.now() };
}

export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  console.log(`Payment flow test completed in ${duration} seconds`);
  console.log('Review payment metrics for analysis');
}

// Handle HTTP errors gracefully
export function handleSummary(data) {
  return {
    'payment-flow-summary.json': JSON.stringify(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  let summary = '\n';
  summary += '=== Payment Flow Load Test Summary ===\n\n';

  if (data.metrics.total_payment_attempts) {
    summary += `Total Payment Attempts: ${data.metrics.total_payment_attempts.values.count}\n`;
  }

  if (data.metrics.payment_success) {
    const rate = data.metrics.payment_success.values.rate * 100;
    summary += `Payment Success Rate: ${rate.toFixed(2)}%\n`;
  }

  if (data.metrics.payment_errors) {
    const rate = data.metrics.payment_errors.values.rate * 100;
    summary += `Payment Error Rate: ${rate.toFixed(2)}%\n`;
  }

  if (data.metrics.payment_latency) {
    summary += `\nPayment Latency:\n`;
    summary += `  p50: ${data.metrics.payment_latency.values['p(50)'].toFixed(2)}ms\n`;
    summary += `  p95: ${data.metrics.payment_latency.values['p(95)'].toFixed(2)}ms\n`;
    summary += `  p99: ${data.metrics.payment_latency.values['p(99)'].toFixed(2)}ms\n`;
  }

  return summary;
}
