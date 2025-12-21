# Briefing: Fleet-Feast-zt6

**Generated**: 2025-12-20T00:55:00-05:00
**Agent**: Ellis_Endpoints
**Task ID**: Fleet-Feast-zt6
**Phase**: 2

---

## Task Details

**Title**: Create Helcim webhook handler for payment events

**Objective**: Implement webhook endpoint for Helcim payment notifications.

---

## Acceptance Criteria

- [ ] Webhook endpoint at POST /api/payments/webhook
- [ ] HMAC signature verification using lib/helcim.ts verifyWebhook
- [ ] All event types handled
- [ ] Proper error responses
- [ ] Idempotency handling

---

## Endpoint: POST /api/payments/webhook

The webhook route already exists at `app/api/payments/webhook/route.ts` but was gutted during Stripe removal. It needs to be rebuilt for Helcim.

---

## Helcim Webhook Events

| Event | Action |
|-------|--------|
| transaction.approved | Update Payment to AUTHORIZED |
| transaction.declined | Update Payment to FAILED |
| transaction.refunded | Update Payment, create refund record |
| transaction.voided | Handle authorization cancellation |

---

## Implementation

```typescript
import { verifyWebhook } from '@/lib/helcim';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  // 1. Get raw body and signature
  const body = await request.text();
  const signature = request.headers.get('x-helcim-signature');

  // 2. Verify webhook signature
  if (!verifyWebhook(body, signature)) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // 3. Parse event
  const event = JSON.parse(body);

  // 4. Handle idempotency (check if already processed)
  // Use transactionId as idempotency key

  // 5. Process based on event type
  switch (event.type) {
    case 'transaction.approved':
      // Update payment status
      break;
    // ... other cases
  }

  // 6. Return 200 OK
  return Response.json({ received: true });
}
```

---

## Important Notes

1. Use verifyWebhook from lib/helcim.ts (already created)
2. Log all events for debugging
3. Handle duplicate webhooks gracefully (idempotency)
4. Return 200 even if processing fails internally (prevents retries)

---

## Gap Checklist

- [ ] Signature verification implemented
- [ ] All 4 event types handled
- [ ] Idempotency check in place
- [ ] Error logging implemented
- [ ] Returns proper responses
