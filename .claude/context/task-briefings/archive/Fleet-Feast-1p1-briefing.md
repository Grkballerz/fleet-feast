# Briefing: Fleet-Feast-1p1

**Generated**: 2025-12-20T00:45:00-05:00
**Agent**: Blake_Backend
**Task ID**: Fleet-Feast-1p1
**Phase**: 2

---

## Task Details

**Title**: Install and configure Helcim SDK and API client

**Objective**: Set up Helcim API integration for payment processing to replace Stripe.

**Priority**: High (Phase 2 - Backend Infrastructure)

---

## Acceptance Criteria

- [ ] Helcim API client configured (use REST API directly - no SDK available)
- [ ] lib/helcim.ts created with typed API functions
- [ ] Environment variables documented in .env.example
- [ ] TypeScript types for Helcim API responses
- [ ] Basic connectivity test function

---

## Implementation Details

### Environment Variables (add to .env.example)

```
# Helcim Payment Processing
HELCIM_API_TOKEN=your_api_token_here
HELCIM_ACCOUNT_ID=your_account_id_here
HELCIM_TERMINAL_ID=your_terminal_id_here
HELCIM_JS_CONFIG_TOKEN=your_js_config_token_here
HELCIM_WEBHOOK_SECRET=your_webhook_secret_here
```

### Create lib/helcim.ts

```typescript
// Helcim API client for Fleet Feast payment processing
// API Docs: https://devdocs.helcim.com/

// Core functions needed:
// - processPayment(cardToken, amount, currency, bookingId)
// - preauthorize(cardToken, amount, currency, bookingId)
// - capturePayment(transactionId, amount)
// - refundPayment(transactionId, amount)
// - getTransaction(transactionId)
// - verifyWebhookSignature(payload, signature)
```

### Helcim API Endpoints

Base URL: `https://api.helcim.com/v2`

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /payment/purchase | POST | One-step payment |
| /payment/preauth | POST | Authorize (hold) funds |
| /payment/capture | POST | Capture held funds |
| /payment/refund | POST | Process refund |
| /payment/verify | POST | Verify card |
| /helcim-pay/initialize | POST | Initialize HelcimPay.js |

### Request Authentication

```typescript
headers: {
  'api-token': process.env.HELCIM_API_TOKEN,
  'Content-Type': 'application/json'
}
```

---

## Files to Create/Modify

1. **lib/helcim.ts** (NEW) - Main Helcim API client
2. **lib/helcim.types.ts** (NEW) - TypeScript types
3. **.env.example** - Add Helcim environment variables

---

## Important Notes

1. Helcim does NOT have an npm SDK - use REST API directly with fetch
2. Use HelcimPay.js for frontend card tokenization (secure)
3. Never send raw card numbers to our server
4. Include proper error handling for API failures
5. Log transactions for debugging (mask sensitive data)

---

## Gap Checklist

After completing work, verify:
- [ ] lib/helcim.ts exports all required functions
- [ ] TypeScript types are comprehensive
- [ ] Environment variables documented
- [ ] No hardcoded credentials
- [ ] Error handling implemented
