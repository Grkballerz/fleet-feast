# Helcim Payment Integration

This document explains how to use the Helcim API client for payment processing in Fleet Feast.

## Overview

Helcim is our payment processor for handling credit card transactions. **Helcim does not provide an official npm SDK**, so we've built a typed REST API client using `fetch`.

### Key Files

| File | Purpose |
|------|---------|
| `lib/helcim.types.ts` | TypeScript type definitions for Helcim API |
| `lib/helcim.ts` | Main API client with typed methods |
| `lib/helcim.example.ts` | Usage examples and patterns |
| `.env.example` | Environment variable documentation |

## Setup

### 1. Get Helcim Credentials

1. Sign up at [app.helcim.com](https://app.helcim.com)
2. Navigate to **Settings → API Access → API Tokens**
3. Create a new API token
4. Copy your credentials:
   - API Token
   - Account ID (Settings → Business Info)
   - Terminal ID (Settings → Payment Terminals)
   - JS Config Token (Settings → HelcimPay.js)

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and add your credentials:

```bash
HELCIM_API_TOKEN="your_api_token_here"
HELCIM_ACCOUNT_ID="your_account_id_here"
HELCIM_TERMINAL_ID="your_terminal_id_here"
HELCIM_JS_CONFIG_TOKEN="your_js_config_token_here"
HELCIM_WEBHOOK_SECRET="your_webhook_secret_here"
```

### 3. Set Up Webhooks

1. Go to **Settings → Webhooks** in Helcim dashboard
2. Create a new webhook pointing to: `https://yourdomain.com/api/webhooks/helcim`
3. Copy the webhook secret to `HELCIM_WEBHOOK_SECRET`
4. Enable events: `APPROVED`, `DECLINED`, `REFUNDED`

## Usage

### Initialize Client

```typescript
import { createHelcimClient } from '@/lib/helcim';

// Automatically reads from environment variables
const helcim = createHelcimClient();
```

### Basic Payment Flow

```typescript
// 1. Process a simple payment (instant charge)
const result = await helcim.processPayment({
  amount: 10000, // $100.00 in cents
  currency: 'USD',
  cardToken: 'token_from_helcimpay_js',
  comments: 'Booking #12345',
});

console.log('Transaction ID:', result.transactionId);
console.log('Status:', result.status); // 'APPROVED'
```

### Recommended: Two-Step Flow (Preauth → Capture)

For Fleet Feast bookings, use the two-step flow:

```typescript
// Step 1: Pre-authorize when booking is created
const preauth = await helcim.preauthorize({
  amount: 10000, // $100.00
  currency: 'USD',
  cardToken: cardToken,
  comments: 'Booking #12345 - Hold until event',
});

// Store preauth.transactionId with the booking
await prisma.booking.update({
  where: { id: bookingId },
  data: { preauthTransactionId: preauth.transactionId },
});

// Step 2: Capture after event completes
const capture = await helcim.capturePayment({
  preAuthTransactionId: preauth.transactionId,
  amount: 10000, // Full amount
});
```

### Refunds

```typescript
// Full refund
await helcim.refundPayment({
  originalTransactionId: 123456,
  amount: 10000,
});

// Partial refund
await helcim.refundPayment({
  originalTransactionId: 123456,
  amount: 5000, // $50 of $100
});
```

### Transaction Lookup

```typescript
const transaction = await helcim.getTransaction(123456);
console.log('Status:', transaction.status);
console.log('Amount:', transaction.amount / 100);
```

## Frontend Integration (HelcimPay.js)

For secure card tokenization, use HelcimPay.js on the frontend:

### 1. Add Script to Layout

```tsx
// app/layout.tsx
<Script src="https://myhelcim.com/js/helcim-pay.js" />
```

### 2. Initialize HelcimPay

```typescript
// components/PaymentForm.tsx
useEffect(() => {
  if (window.HelcimPay) {
    window.HelcimPay.init({
      token: process.env.NEXT_PUBLIC_HELCIM_JS_CONFIG_TOKEN,
      language: 'en',
    });
  }
}, []);
```

### 3. Tokenize Card

```typescript
const handlePayment = async (cardData) => {
  // Get token from HelcimPay.js
  const token = await window.HelcimPay.createToken(cardData);

  // Send token to backend
  const response = await fetch('/api/bookings/payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cardToken: token,
      amount: 10000,
    }),
  });
};
```

## Webhook Handler

Create a webhook endpoint to receive payment notifications:

```typescript
// app/api/webhooks/helcim/route.ts
import { createHelcimClient } from '@/lib/helcim';

export async function POST(request: Request) {
  const helcim = createHelcimClient();

  // Get signature from headers
  const signature = request.headers.get('helcim-signature');

  // Get raw body
  const payload = await request.text();

  // Verify signature (CRITICAL for security)
  const result = helcim.verifyWebhook(payload, signature);

  if (!result.valid) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Process the event
  const event = result.event!;

  switch (event.type) {
    case 'APPROVED':
      await updateBookingStatus(event.invoiceNumber, 'paid');
      break;

    case 'DECLINED':
      await updateBookingStatus(event.invoiceNumber, 'failed');
      break;

    case 'REFUNDED':
      await updateBookingStatus(event.invoiceNumber, 'refunded');
      break;
  }

  return new Response('OK', { status: 200 });
}
```

## Error Handling

```typescript
import { HelcimError } from '@/lib/helcim';

try {
  const result = await helcim.processPayment({...});
} catch (error) {
  if (error instanceof HelcimError) {
    console.error('Helcim Error:', error.message);
    console.error('Status Code:', error.statusCode);
    console.error('Errors:', error.errors);

    // Handle specific errors
    if (error.statusCode === 401) {
      // Invalid API token
    } else if (error.statusCode === 400) {
      // Validation error
    }
  }
}
```

## Testing

### Test Connection

```typescript
const isConnected = await helcim.testConnection();
if (isConnected) {
  console.log('Helcim API is configured correctly');
} else {
  console.error('Check your HELCIM_API_TOKEN');
}
```

### Test Mode

Set `testMode: true` in the client config:

```typescript
const helcim = createHelcimClient({
  testMode: true, // Will add 'test: true' to all requests
});
```

Or set in environment:

```bash
NODE_ENV=development # Automatically enables test mode
```

## Best Practices

### Security

- ✅ **DO**: Use HelcimPay.js for card tokenization
- ✅ **DO**: Verify webhook signatures
- ✅ **DO**: Use HTTPS in production
- ❌ **DON'T**: Send raw card numbers to your server
- ❌ **DON'T**: Commit API tokens to git

### Payment Flow

- ✅ **DO**: Use preauth → capture for bookings
- ✅ **DO**: Store transaction IDs in database
- ✅ **DO**: Handle declined transactions gracefully
- ❌ **DON'T**: Capture before service is delivered
- ❌ **DON'T**: Skip error handling

### Logging

```typescript
// Good: Masked sensitive data
console.log('Payment:', {
  amount: 10000,
  currency: 'USD',
  cardToken: 'tok_****1234', // Masked
});

// Bad: Exposing sensitive data
console.log('Payment:', {
  cardToken: 'full_token_here', // NEVER DO THIS
});
```

## Fleet Feast Payment Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Customer Creates Booking                                  │
│    → Preauthorize funds (hold on card)                      │
│    → Store transactionId in database                        │
│    → Booking status: "authorized"                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Event Happens                                             │
│    → Service is delivered                                   │
│    → Food truck serves customers                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Capture Payment                                           │
│    → Capture held funds                                     │
│    → Booking status: "paid"                                 │
│    → Vendor receives payment (minus platform fee)           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Optional: Refund (if needed)                             │
│    → Full or partial refund                                 │
│    → Booking status: "refunded" or "partially_refunded"     │
└─────────────────────────────────────────────────────────────┘
```

## API Reference

See `lib/helcim.example.ts` for detailed examples of all API methods.

## Support

- **Helcim Documentation**: https://devdocs.helcim.com/
- **Helcim Support**: support@helcim.com
- **Dashboard**: https://app.helcim.com

## Migration from Stripe

If you're migrating from Stripe, here's a mapping:

| Stripe | Helcim |
|--------|--------|
| `stripe.paymentIntents.create()` | `helcim.preauthorize()` |
| `stripe.paymentIntents.capture()` | `helcim.capturePayment()` |
| `stripe.refunds.create()` | `helcim.refundPayment()` |
| `stripe.charges.retrieve()` | `helcim.getTransaction()` |
| `stripe.webhooks.constructEvent()` | `helcim.verifyWebhook()` |

Key differences:
- Amounts in **cents** (same as Stripe)
- Card tokenization via **HelcimPay.js** (similar to Stripe.js)
- No SDK - use REST API directly
- Webhook signature verification built-in
