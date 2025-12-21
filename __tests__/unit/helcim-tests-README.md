# Helcim Payment Integration Tests

This directory contains comprehensive unit tests for the Helcim payment integration.

## Test Files

### 1. `helcim.test.ts` - Helcim Client Tests
Tests for the Helcim API client (`lib/helcim.ts`)

**Coverage:**
- Constructor validation
- Payment processing (purchase)
- Pre-authorization (hold funds)
- Capture pre-authorized payments
- Refunds (full and partial)
- Transaction retrieval
- Webhook signature verification
- Connection testing
- Error handling
- Data masking (security)

**Total Tests:** 38

**Key Features Tested:**
- ✅ Validates required configuration (API token, account ID, terminal ID)
- ✅ Processes payments with proper request formatting
- ✅ Handles approved and declined transactions
- ✅ Supports pre-auth → capture workflow
- ✅ Verifies webhook signatures using HMAC-SHA256
- ✅ Masks sensitive data in logs
- ✅ Handles network errors and timeouts
- ✅ Tests authentication failures

### 2. `helcim-webhook.test.ts` - Webhook Handler Tests
Tests for the webhook endpoint (`app/api/payments/webhook/route.ts`)

**Coverage:**
- Signature verification
- APPROVED event processing
- DECLINED event processing
- REFUNDED event processing
- Idempotency (duplicate webhooks)
- Error handling
- Unknown event types
- Security features

**Total Tests:** 18

**Key Features Tested:**
- ✅ Rejects webhooks with invalid signatures
- ✅ Rejects webhooks with missing signatures
- ✅ Processes APPROVED events and updates payment status
- ✅ Processes DECLINED events and marks payment as failed
- ✅ Processes REFUNDED events
- ✅ Handles duplicate webhooks (idempotency)
- ✅ Returns 200 on errors to prevent retries
- ✅ Handles missing payments gracefully

## Running the Tests

```bash
# Run all Helcim tests
npm test -- __tests__/unit/helcim

# Run only client tests
npm test -- __tests__/unit/helcim.test.ts

# Run only webhook tests
npm test -- __tests__/unit/helcim-webhook.test.ts

# Run with coverage
npm test -- __tests__/unit/helcim --coverage

# Watch mode
npm test -- __tests__/unit/helcim --watch
```

## Test Structure

### Mock Setup
Both test files use Jest mocks to avoid making real API calls:

```typescript
// Mock fetch globally
global.fetch = jest.fn();

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    payment: { findUnique: jest.fn(), update: jest.fn() },
    booking: { update: jest.fn() },
  },
}));
```

### Test Helpers

#### `helcim.test.ts` Helpers
- None needed - uses direct client method calls

#### `helcim-webhook.test.ts` Helpers
- `createWebhookRequest(event, signature)` - Creates mock NextRequest
- `generateSignature(payload, secret)` - Generates HMAC-SHA256 signature

## Coverage Targets

| Component | Branches | Functions | Lines | Statements |
|-----------|----------|-----------|-------|------------|
| `lib/helcim.ts` | 90%+ | 95%+ | 95%+ | 95%+ |
| `app/api/payments/webhook/route.ts` | 85%+ | 90%+ | 90%+ | 90%+ |

## Example Test Cases

### Testing Payment Processing
```typescript
it("should process payment successfully", async () => {
  (global.fetch as jest.Mock).mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ status: "APPROVED", transactionId: 123 }),
  });

  const result = await client.processPayment({
    amount: 10000,
    currency: "USD",
    cardToken: "token_test",
  });

  expect(result.status).toBe("APPROVED");
});
```

### Testing Webhook Verification
```typescript
it("should verify valid webhook signature", () => {
  const payload = JSON.stringify(event);
  const signature = generateSignature(payload, "secret");

  const result = client.verifyWebhook(payload, signature);

  expect(result.valid).toBe(true);
  expect(result.event).toEqual(event);
});
```

## Security Tests

### Signature Verification
- ✅ Valid signatures accepted
- ✅ Invalid signatures rejected
- ✅ Missing signatures rejected
- ✅ Timing-safe comparison used

### Data Masking
- ✅ Card tokens masked in logs
- ✅ Full tokens never logged

### Error Handling
- ✅ Returns 200 on processing errors (prevents retries)
- ✅ Doesn't leak internal details
- ✅ Handles malformed payloads

## Edge Cases Tested

1. **Idempotency** - Duplicate webhooks handled correctly
2. **Missing Payments** - Graceful handling when payment not found
3. **Network Errors** - Proper error propagation
4. **Timeout Errors** - AbortSignal timeout handling
5. **Non-JSON Responses** - Handles HTML error pages
6. **Partial Operations** - Partial captures and refunds
7. **Different Event Types** - APPROVED, DECLINED, REFUNDED, unknown

## Mocking Strategy

### Why Mock?
- Avoid real payment API calls during testing
- Faster test execution
- Deterministic test results
- No API rate limits or costs

### What's Mocked?
- `fetch` - All HTTP requests
- `prisma` - Database operations
- `createHelcimClient` - Webhook handler tests

### What's NOT Mocked?
- Cryptographic functions (crypto.createHmac)
- Business logic
- Validation logic

## Common Issues

### Issue: "Request is not defined"
**Solution:** Ensure Next.js server components are mocked before importing route handlers.

### Issue: "Network timeout"
**Solution:** Mock fetch is properly configured - check jest.clearAllMocks() in beforeEach.

### Issue: "Signature verification fails"
**Solution:** Ensure payload and signature use the same secret key.

## Future Test Additions

- [ ] Integration tests with test Helcim sandbox
- [ ] Load testing webhook endpoint
- [ ] Concurrent webhook handling
- [ ] Retry logic testing
- [ ] Dead letter queue testing

## Related Documentation

- [Helcim API Docs](https://devdocs.helcim.com/)
- [Helcim Webhooks Guide](https://devdocs.helcim.com/webhooks/)
- [Project Payment Tests](./__tests__/unit/payment.service.test.ts)
- [E2E Payment Tests](./e2e/payment.spec.ts)

## Maintenance

Tests should be updated when:
- Helcim API changes
- New payment methods added
- Webhook event types added
- Error handling logic changes
- Security requirements change

Last Updated: 2025-12-20
