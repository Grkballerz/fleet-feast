# Fleet Feast Load Testing Suite

Comprehensive load testing suite for Fleet Feast platform using k6.

## Overview

This suite includes 4 specialized load tests targeting different aspects of the system:

1. **Concurrent Users Test** - Simulates 1000 concurrent users with realistic journeys
2. **API Stress Test** - Hammers critical API endpoints with high traffic
3. **Payment Flow Test** - Tests 100 concurrent payment transactions
4. **Rate Limit Test** - Verifies rate limiting under load

## Prerequisites

- [k6](https://k6.io/docs/getting-started/installation/) installed
- Fleet Feast application running locally or on staging
- Database seeded with test data

## Quick Start

```bash
# Run all tests
npm run load-test:all

# Run individual tests
npm run load-test:users      # Concurrent users
npm run load-test:api        # API stress
npm run load-test:payments   # Payment flow
npm run load-test:ratelimit  # Rate limits
```

## Test Details

### 1. Concurrent Users Test

**File:** `concurrent-users-test.js`

**Purpose:** Simulate realistic user behavior at scale

**Load Profile:**
- Ramp: 0 → 100 → 300 → 500 → 1000 users over 15 minutes
- Sustain: 1000 users for 5 minutes
- Cool down: 5 minutes

**User Behaviors:**
- 60%: Browse and search
- 30%: Browse, search, view details
- 10%: Complete booking flow (most intensive)

**Thresholds:**
- p95 response time: <500ms
- Error rate: <1%
- Search p95: <1000ms

**Run:**
```bash
k6 run --out json=results/concurrent-users.json concurrent-users-test.js
```

### 2. API Stress Test

**File:** `api-stress-test.js`

**Purpose:** Stress test individual API endpoints

**Concurrent Scenarios:**
- Search endpoint: 400 concurrent VUs (highest traffic)
- Booking endpoint: 200 concurrent VUs
- Payment endpoint: 100 concurrent VUs
- Message endpoint: 150 concurrent VUs

**Thresholds:**
- Overall p95: <500ms
- Search p95: <1000ms
- Error rate per endpoint: <1%

**Run:**
```bash
k6 run --out json=results/api-stress.json api-stress-test.js
```

### 3. Payment Flow Test

**File:** `payment-flow-test.js`

**Purpose:** Verify payment processing under load

**Scenarios:**
- Spike: 100 concurrent payments for 1 minute
- Sustained: Ramp to 100 payments over 3 minutes
- Retry: 20 users simulating payment retries

**Thresholds:**
- Payment p95: <500ms
- Payment p99: <1000ms
- Error rate: <2% (slightly higher acceptable for payments)

**Run:**
```bash
k6 run --out json=results/payment-flow.json payment-flow-test.js
```

### 4. Rate Limit Test

**File:** `rate-limit-test.js`

**Purpose:** Verify rate limits enforce correctly

**Tests:**
- Authenticated limit: 100 req/min (attempt 150)
- Unauthenticated limit: 20 req/min (attempt 30)
- Search limit: 30 req/min (attempt 45)
- Burst protection: 200 req/10s

**Expected:** Rate limit (429) responses when thresholds exceeded

**Run:**
```bash
k6 run --out json=results/rate-limit.json rate-limit-test.js
```

## Environment Configuration

Set `BASE_URL` environment variable:

```bash
# Local testing
export BASE_URL=http://localhost:3000
k6 run concurrent-users-test.js

# Staging
export BASE_URL=https://staging.fleetfeast.com
k6 run concurrent-users-test.js

# Production (use with caution!)
export BASE_URL=https://fleetfeast.com
k6 run concurrent-users-test.js
```

## Running Full Test Suite

```bash
# Create results directory
mkdir -p results

# Set environment
export BASE_URL=http://localhost:3000

# Run all tests sequentially
k6 run --out json=results/concurrent-users.json concurrent-users-test.js
k6 run --out json=results/api-stress.json api-stress-test.js
k6 run --out json=results/payment-flow.json payment-flow-test.js
k6 run --out json=results/rate-limit.json rate-limit-test.js

# Generate summary report
k6 summary results/*.json
```

## Performance Targets

| Metric | Target | Test |
|--------|--------|------|
| **Response Time (p95)** | <500ms | All tests |
| **Search Response (p95)** | <1000ms | Concurrent users, API stress |
| **Error Rate** | <1% | All tests |
| **Concurrent Users** | 1000 | Concurrent users test |
| **Payment Throughput** | 100/min | Payment flow test |
| **Rate Limit Enforcement** | 100% | Rate limit test |

## Analyzing Results

### Terminal Output

k6 provides real-time statistics during test execution:

```
     ✓ search returned 200
     ✓ search has results
     ✓ response time OK

     checks.........................: 98.45% ✓ 29536    ✗ 465
     data_received..................: 150 MB 2.5 MB/s
     data_sent......................: 15 MB  250 kB/s
     http_req_duration..............: avg=245ms  min=45ms  med=198ms  max=2.1s  p(95)=458ms p(99)=876ms
     http_req_failed................: 0.85%  ✓ 256      ✗ 29745
     http_reqs......................: 30001  500/s
```

### JSON Output

Detailed results saved to `results/*.json`:

```bash
# Pretty print results
cat results/concurrent-users.json | jq '.metrics | {
  http_req_duration,
  http_req_failed,
  total_requests: .http_reqs
}'
```

### Cloud Results (k6 Cloud)

For detailed dashboards and historical tracking:

```bash
k6 cloud concurrent-users-test.js
```

## Troubleshooting

### Test Fails Immediately

**Issue:** Connection refused
**Solution:** Verify app is running on correct port

```bash
curl http://localhost:3000
# or
curl $BASE_URL
```

### High Error Rates

**Issue:** Error rate >1%
**Causes:**
- Database connection pool exhausted
- Server not scaled for load
- Memory leaks

**Debug:**
```bash
# Check server logs
tail -f logs/server.log

# Monitor database connections
psql -c "SELECT count(*) FROM pg_stat_activity;"
```

### Rate Limits Not Triggering

**Issue:** Rate limit test doesn't hit 429
**Solution:** Rate limiting may not be implemented yet
**Expected:** Will show 429 responses when implemented

## CI/CD Integration

Add to GitHub Actions:

```yaml
# .github/workflows/load-test.yml
name: Load Tests
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM
  workflow_dispatch:

jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install k6
        run: |
          sudo apt-get update
          sudo apt-get install k6
      - name: Run Load Tests
        run: |
          k6 run --out json=results/test.json load-tests/concurrent-users-test.js
        env:
          BASE_URL: ${{ secrets.STAGING_URL }}
      - name: Upload Results
        uses: actions/upload-artifact@v3
        with:
          name: load-test-results
          path: results/
```

## Best Practices

1. **Never run load tests against production** without explicit approval
2. **Start small** - Begin with 10-100 users, then scale up
3. **Monitor infrastructure** - Watch CPU, memory, database during tests
4. **Run during off-peak** - Avoid impacting real users
5. **Clean up test data** - Load tests can create thousands of records
6. **Version control results** - Track performance over time

## Key Metrics Glossary

- **VUs (Virtual Users)**: Simulated concurrent users
- **Iterations**: Number of times test function executed
- **http_req_duration**: Total request duration (sending + waiting + receiving)
- **http_req_waiting**: Time waiting for response (server processing time)
- **http_req_blocked**: Time spent blocked (DNS lookup, TCP connection)
- **http_req_failed**: Percentage of failed requests (non-2xx/3xx)
- **checks**: User-defined success criteria (similar to assertions)

## Next Steps

After running tests:

1. Review `docs/Load_Testing_Report.md` for findings
2. Implement recommended optimizations
3. Re-run tests to verify improvements
4. Set up continuous load testing in CI/CD

## Resources

- [k6 Documentation](https://k6.io/docs/)
- [k6 Examples](https://k6.io/docs/examples/)
- [k6 Cloud](https://app.k6.io/)
- Fleet Feast API Design: `docs/api/api-design.md`
