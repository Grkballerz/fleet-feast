# E2E Test Suite

End-to-end tests for Fleet Feast using Playwright.

## Overview

This test suite covers all critical user flows:
- **Authentication**: Registration, login, logout, password reset
- **Vendor Onboarding**: Application submission, approval workflow
- **Search & Booking**: Food truck search, filtering, booking requests
- **Payment Processing**: Stripe integration, refunds, vendor payouts
- **Messaging**: Customer-vendor communication, anti-circumvention
- **Reviews**: Submission, display, vendor responses

## Quick Start

### Install Dependencies

```bash
npm install
npx playwright install chromium
```

### Run Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI (interactive mode)
npm run test:e2e:ui

# Run with visible browser
npm run test:e2e:headed

# Debug specific test
npm run test:e2e:debug

# View last test report
npm run test:e2e:report
```

## Test Structure

```
e2e/
├── fixtures/
│   └── test-data.ts          # Test data and helpers
├── auth.spec.ts              # Authentication tests
├── vendor-onboarding.spec.ts # Vendor application tests
├── search-booking.spec.ts    # Search and booking tests
├── payment.spec.ts           # Payment processing tests
├── messaging.spec.ts         # Messaging tests
└── review.spec.ts            # Review submission tests
```

## Configuration

See `playwright.config.ts` for configuration options:
- **Base URL**: http://localhost:3000 (dev) or `PLAYWRIGHT_BASE_URL` env var
- **Retries**: 2 retries in CI, 0 locally
- **Parallel**: Full parallelization enabled
- **Screenshots**: On failure only
- **Videos**: Retained on failure

## Test Data

Test data is defined in `e2e/fixtures/test-data.ts`:

```typescript
import { testCustomer, testVendor, stripeTestCards } from './fixtures/test-data';

// Use predefined test users
await page.fill('[name="email"]', testCustomer.email);

// Or generate unique users
const customer = generateTestCustomer();
```

### Test Accounts

| Account | Email | Password |
|---------|-------|----------|
| Customer | e2e-customer@test.com | TestPass123! |
| Vendor | e2e-vendor@test.com | VendorPass123! |
| Admin | e2e-admin@test.com | AdminPass123! |

### Stripe Test Cards

| Card Type | Number | Use Case |
|-----------|--------|----------|
| Success | 4242 4242 4242 4242 | Successful payment |
| Declined | 4000 0000 0000 0002 | Card declined |
| Insufficient Funds | 4000 0000 0000 9995 | Not enough money |
| 3D Secure | 4000 0025 0000 3155 | Requires authentication |

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { waitFor } from './fixtures/test-data';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: login, navigate, etc.
  });

  test('should do something', async ({ page }) => {
    // Arrange
    await page.goto('/some-page');

    // Act
    await page.click('button:has-text("Submit")');

    // Assert
    await expect(page.locator('.success-message')).toBeVisible();
  });
});
```

### Best Practices

1. **Use flexible selectors**
   ```typescript
   // Good: Multiple fallback strategies
   const button = page.locator('button:has-text("Login"), [data-testid="login-btn"]');

   // Avoid: Brittle CSS selectors
   const button = page.locator('.btn.btn-primary.login-btn');
   ```

2. **Wait for elements properly**
   ```typescript
   // Good: Wait for specific state
   await expect(page.locator('.message')).toBeVisible();

   // Avoid: Arbitrary timeouts
   await page.waitForTimeout(5000);
   ```

3. **Use test data helpers**
   ```typescript
   // Good: Use fixtures
   const customer = generateTestCustomer();

   // Avoid: Hardcoded values
   const email = 'test123@example.com';
   ```

4. **Isolate tests**
   ```typescript
   // Good: Each test creates its own data
   test('should book truck', async ({ page }) => {
     const customer = generateTestCustomer();
     // ...
   });

   // Avoid: Sharing state between tests
   let sharedCustomer;
   test.beforeAll(() => { sharedCustomer = generateTestCustomer(); });
   ```

## Debugging Tests

### Visual Debugging

```bash
# Open Playwright Inspector
npm run test:e2e:debug

# Run specific test file
npx playwright test e2e/auth.spec.ts --debug

# Run specific test
npx playwright test -g "should login existing customer"
```

### Screenshots and Videos

Failed tests automatically capture:
- **Screenshots**: `test-results/` directory
- **Videos**: `test-results/` directory
- **Traces**: Available for retried tests

View trace files:
```bash
npx playwright show-trace test-results/trace.zip
```

### Browser Console Logs

Add to your test:
```typescript
page.on('console', msg => console.log('PAGE LOG:', msg.text()));
```

## CI/CD Integration

Tests run automatically on:
- Pull requests to `main`
- Pushes to `main` and `develop`

### CI Configuration

The E2E job in `.github/workflows/ci.yml`:
- Installs Playwright browsers
- Sets up PostgreSQL database
- Runs tests with environment variables
- Uploads test reports as artifacts

### Viewing CI Reports

1. Go to GitHub Actions run
2. Download `playwright-report` artifact
3. Extract and open `index.html`

## Common Issues

### Database Connection

Ensure PostgreSQL is running:
```bash
# Check .env file
DATABASE_URL=postgresql://...

# Test connection
npx prisma db push
```

### Port Already in Use

If port 3000 is busy:
```bash
# Kill process using port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill
```

### Test Timeouts

Increase timeout in `playwright.config.ts`:
```typescript
timeout: 60000, // 60 seconds
```

Or for specific test:
```typescript
test('slow test', async ({ page }) => {
  test.setTimeout(120000); // 2 minutes
  // ...
});
```

## Test Maintenance

### Updating Selectors

When UI changes, update selectors in test files:
1. Run tests with `--headed` to see what's failing
2. Use Playwright Inspector to find new selectors
3. Update test files with flexible selectors

### Adding New Tests

1. Identify the user flow to test
2. Create test file in `e2e/` directory
3. Add test data to `fixtures/test-data.ts` if needed
4. Write test following patterns in existing tests
5. Run locally to verify
6. Commit and let CI validate

## Performance

### Parallel Execution

Tests run in parallel by default. To control:
```bash
# Run with specific number of workers
npx playwright test --workers=4

# Run serially
npx playwright test --workers=1
```

### Test Duration

Expected run times:
- **Local (parallel)**: ~5-10 minutes
- **CI (serial)**: ~15-20 minutes
- **Single test file**: ~1-2 minutes

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Test API](https://playwright.dev/docs/api/class-test)
- [Selector Strategies](https://playwright.dev/docs/selectors)

## Support

For issues or questions:
1. Check this README
2. Review existing tests for patterns
3. Consult Playwright documentation
4. Ask in team chat or create an issue
