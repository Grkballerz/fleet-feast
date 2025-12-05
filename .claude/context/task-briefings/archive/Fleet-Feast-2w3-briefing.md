# Task Briefing: Fleet-Feast-2w3

**Generated**: 2025-12-05T04:30:00Z
**Agent**: Taylor_Tester
**Task**: Integration Tests - API Endpoints
**Invocation**: 1

---

## Objective

Create API integration tests for auth flows, booking lifecycle, payment processing, and messaging. Test database interactions with mocked external services.

## Test Scope

### Auth Flows
- Registration flow
- Login flow (email/password)
- Password reset flow
- Session management
- Role-based access

### Booking Lifecycle
- Create booking request
- Vendor accept/decline
- Payment processing
- Status transitions
- Cancellation with refund

### Payment Processing
- Payment intent creation
- Webhook handling
- Escrow capture/release
- Refund processing

### Messaging
- Send message
- Fetch conversation
- Mark as read
- Anti-circumvention flagging

## Test Structure

```
__tests__/
├── integration/
│   ├── auth.integration.test.ts
│   ├── booking.integration.test.ts
│   ├── payment.integration.test.ts
│   └── messaging.integration.test.ts
├── fixtures/
│   ├── users.ts
│   ├── vendors.ts
│   ├── bookings.ts
│   └── payments.ts
└── setup/
    ├── database.ts
    └── server.ts
```

## Test Pattern

```typescript
import { createServer } from '@/app/api/test-utils';
import { prisma } from '@/lib/prisma';

describe('Booking API Integration', () => {
  let server: ReturnType<typeof createServer>;
  let testUser: User;
  let testVendor: Vendor;

  beforeAll(async () => {
    server = createServer();
    // Seed test data
    testUser = await prisma.user.create({ data: userFixture });
    testVendor = await prisma.vendor.create({ data: vendorFixture });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.$transaction([
      prisma.booking.deleteMany(),
      prisma.user.deleteMany(),
      prisma.vendor.deleteMany(),
    ]);
  });

  describe('POST /api/bookings', () => {
    it('should create booking with correct status', async () => {
      const response = await server.post('/api/bookings')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          vendorId: testVendor.id,
          eventDate: '2025-01-15',
          guestCount: 50,
          eventType: 'CORPORATE',
          location: { address: '123 Main St', city: 'NYC', state: 'NY', zipCode: '10001' },
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('PENDING');
      expect(response.body.totalAmount).toBeGreaterThan(0);
    });

    it('should reject booking for unavailable date', async () => {
      // First book the date
      await prisma.availability.create({
        data: { vendorId: testVendor.id, date: '2025-01-20', available: false },
      });

      const response = await server.post('/api/bookings')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ vendorId: testVendor.id, eventDate: '2025-01-20', ... });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('unavailable');
    });
  });

  describe('Booking Lifecycle', () => {
    it('should complete full booking flow', async () => {
      // 1. Create booking
      const createRes = await server.post('/api/bookings')...
      expect(createRes.body.status).toBe('PENDING');

      // 2. Vendor accepts
      const acceptRes = await server.put(`/api/bookings/${createRes.body.id}/accept`)
        .set('Authorization', `Bearer ${vendorToken}`);
      expect(acceptRes.body.status).toBe('ACCEPTED');

      // 3. Customer pays
      const payRes = await server.post('/api/payments')
        .send({ bookingId: createRes.body.id });
      expect(payRes.body.clientSecret).toBeDefined();

      // 4. Webhook confirms payment
      await server.post('/api/payments/webhook')
        .send(mockStripeWebhook('payment_intent.succeeded'));

      // 5. Verify booking confirmed
      const booking = await prisma.booking.findUnique({ where: { id: createRes.body.id }});
      expect(booking.status).toBe('CONFIRMED');
    });
  });
});
```

## External Service Mocks

```typescript
// Mock Stripe
jest.mock('stripe', () => ({
  paymentIntents: {
    create: jest.fn().mockResolvedValue({
      id: 'pi_test',
      client_secret: 'secret_test',
    }),
  },
  webhooks: {
    constructEvent: jest.fn().mockReturnValue({ type: 'payment_intent.succeeded' }),
  },
}));

// Mock SendGrid
jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn().mockResolvedValue([{ statusCode: 202 }]),
}));
```

## Deliverables

1. Integration test files for auth, booking, payment, messaging
2. Test fixtures for seeding database
3. External service mocks
4. Test database setup/teardown
5. CI-compatible test configuration

## Dependencies (Completed)

- Fleet-Feast-igb: Authentication ✓
- Fleet-Feast-wu8: Booking API ✓
- Fleet-Feast-5cl: Payment API ✓
- Fleet-Feast-e63: API Middleware ✓

## Gap Checklist

- [ ] All critical flows tested
- [ ] Database interactions verified
- [ ] External services properly mocked
- [ ] Tests isolated and repeatable
- [ ] CI-compatible

---

*Briefing generated by MASTER Orchestrator*
