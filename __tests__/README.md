# Fleet Feast Test Suite

This directory contains the complete test suite for Fleet Feast, including unit tests and integration tests.

## Directory Structure

```
__tests__/
├── integration/           # API integration tests
│   ├── auth.integration.test.ts
│   ├── booking.integration.test.ts
│   ├── payment.integration.test.ts
│   └── messaging.integration.test.ts
├── unit/                  # Unit tests (to be added)
├── fixtures/              # Test data fixtures
│   ├── users.ts
│   ├── vendors.ts
│   ├── bookings.ts
│   ├── payments.ts
│   └── index.ts
├── mocks/                 # Mock implementations
│   ├── prisma.ts
│   ├── stripe.ts
│   ├── sendgrid.ts
│   └── nextauth.ts
└── setup/                 # Test setup utilities
    ├── database.ts
    ├── server.ts
    └── index.ts
```

## Running Tests

### All Tests
```bash
npm test
```

### Unit Tests Only
```bash
npm run test:unit
```

### Integration Tests Only
```bash
npm run test:integration
```

### Watch Mode
```bash
npm run test:watch                    # All tests
npm run test:integration:watch        # Integration tests only
```

### Coverage Report
```bash
npm run test:coverage
```

## Integration Tests

Integration tests verify the complete API workflows with database interactions and mocked external services.

### Test Suites

#### 1. Auth Integration Tests (`auth.integration.test.ts`)
- User registration flow
- Email verification
- Password reset
- Session management
- Role-based access

**Coverage:**
- ✓ Registration with valid/invalid data
- ✓ Email normalization and validation
- ✓ Password strength requirements
- ✓ Duplicate email prevention
- ✓ Email verification tokens
- ✓ Password reset flow

#### 2. Booking Integration Tests (`booking.integration.test.ts`)
- Booking creation and validation
- Vendor acceptance/decline
- Booking lifecycle management
- Permission checks

**Coverage:**
- ✓ Create booking with valid data
- ✓ Price calculation
- ✓ Guest count validation (min/max)
- ✓ Vendor availability checks
- ✓ Date validation
- ✓ Vendor accept/decline flows
- ✓ Full booking lifecycle

#### 3. Payment Integration Tests (`payment.integration.test.ts`)
- Payment intent creation
- Stripe webhook handling
- Escrow and capture
- Refund processing

**Coverage:**
- ✓ Payment intent creation
- ✓ Webhook signature verification
- ✓ Payment success handling
- ✓ Payment failure handling
- ✓ Refund processing
- ✓ Full payment lifecycle
- ✓ Escrow management

#### 4. Messaging Integration Tests (`messaging.integration.test.ts`)
- Message sending and receiving
- Conversation management
- Read status tracking
- Anti-circumvention flagging

**Coverage:**
- ✓ Send messages between parties
- ✓ Fetch inbox and conversations
- ✓ Mark messages as read
- ✓ Contact info detection and flagging
- ✓ Payment circumvention detection
- ✓ Violation tracking
- ✓ Message length validation

## Test Fixtures

Fixtures provide consistent test data across all tests.

### Available Fixtures

- **Users**: `testCustomer`, `testVendorUser`, `testAdmin`, `unverifiedUser`, `suspendedUser`
- **Vendors**: `testVendor`, `pendingVendor`, `suspendedVendor`, `testVendorWithStripe`
- **Bookings**: `testBookingPending`, `testBookingAccepted`, `testBookingConfirmed`, `testBookingCompleted`
- **Payments**: `testPaymentPending`, `testPaymentAuthorized`, `testPaymentCaptured`, `testPaymentRefunded`

### Helper Functions

```typescript
import { createTestUser, createTestVendor, createTestBooking } from "@/__tests__/fixtures";

// Create custom test user
const user = createTestUser({ role: UserRole.VENDOR });

// Create custom test vendor
const vendor = createTestVendor({ status: VendorStatus.APPROVED });

// Create custom test booking
const booking = createTestBooking({ guestCount: 100 });
```

## Mocks

### External Services Mocked

1. **Stripe** (`mocks/stripe.ts`)
   - Payment intent creation
   - Webhook event construction
   - Refund processing
   - Transfer creation

2. **SendGrid** (`mocks/sendgrid.ts`)
   - Email sending
   - Template rendering

3. **NextAuth** (`mocks/nextauth.ts`)
   - Session management
   - User authentication

4. **Prisma** (`mocks/prisma.ts`)
   - Database operations (for unit tests)

## Test Database

Integration tests use a real test database (separate from development).

### Setup

1. Create test database:
```bash
createdb fleet_feast_test
```

2. Set environment variable:
```env
TEST_DATABASE_URL="postgresql://user:pass@localhost:5432/fleet_feast_test"
```

3. Run migrations:
```bash
npx prisma migrate deploy
```

### Database Lifecycle

- **beforeAll**: Setup database schema
- **beforeEach**: Clear all data
- **afterEach**: Clear all data
- **afterAll**: Disconnect and teardown

## Best Practices

### 1. Test Isolation
Each test should be completely independent:
```typescript
beforeEach(async () => {
  await clearDatabase();
  // Setup test data
});
```

### 2. Descriptive Test Names
Use clear, specific test descriptions:
```typescript
it("should reject booking for unavailable vendor", async () => {
  // Test code
});
```

### 3. Arrange-Act-Assert Pattern
```typescript
it("should create payment intent", async () => {
  // Arrange
  const session = createMockSession(customer.id, UserRole.CUSTOMER);
  const request = createPostRequest(url, data, session);

  // Act
  const response = await handler(request);

  // Assert
  const data = await expectResponse(response, 201);
  expect(data.paymentIntent).toBeDefined();
});
```

### 4. Mock External Services
Never make real API calls in tests:
```typescript
mockStripePayments.createPaymentIntent.mockResolvedValue({
  id: "pi_test_123",
  client_secret: "secret_test_123",
});
```

### 5. Test Both Success and Failure Cases
```typescript
describe("POST /api/bookings", () => {
  it("should create booking with valid data", async () => {
    // Success case
  });

  it("should reject booking with invalid data", async () => {
    // Failure case
  });
});
```

## CI/CD Integration

Tests run automatically in CI/CD pipeline:

1. **Pre-commit**: Unit tests
2. **Pull Request**: All tests + coverage
3. **Pre-deploy**: Integration tests against staging DB

### Required Coverage

- **Lines**: 80%
- **Functions**: 70%
- **Branches**: 70%
- **Statements**: 80%

## Troubleshooting

### Tests Hanging
- Check database connections are closed in `afterAll`
- Verify no pending promises or timers

### Database Errors
- Ensure `TEST_DATABASE_URL` is set
- Run `prisma generate` after schema changes
- Clear test database: `npx prisma migrate reset`

### Mock Not Working
- Import mock files at top of test file
- Clear mocks in `beforeEach` if needed
- Check mock is defined before test runs

### TypeScript Errors
- Run `npm run type-check`
- Ensure types are updated with `prisma generate`

## Adding New Tests

### Integration Test Template

```typescript
import { UserRole } from "@prisma/client";
import { POST as handler } from "@/app/api/your-endpoint/route";
import { getTestPrisma, clearDatabase } from "../setup/database";
import { createPostRequest, createMockSession, expectResponse } from "../setup/server";

import "../mocks/sendgrid";
import "../mocks/nextauth";

const prisma = getTestPrisma();
const baseUrl = "http://localhost:3000";

describe("Your Feature Integration Tests", () => {
  beforeEach(async () => {
    await clearDatabase();
    // Setup test data
  });

  describe("POST /api/your-endpoint", () => {
    it("should do something successfully", async () => {
      const session = createMockSession("user-id", UserRole.CUSTOMER);
      const request = createPostRequest(`${baseUrl}/api/your-endpoint`, {
        // request data
      }, session);

      const response = await handler(request);
      const data = await expectResponse(response, 200);

      expect(data).toBeDefined();
      // More assertions
    });
  });
});
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing)
- [Next.js Testing](https://nextjs.org/docs/testing)
