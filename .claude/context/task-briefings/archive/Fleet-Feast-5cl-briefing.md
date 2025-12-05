# Task Briefing: Fleet-Feast-5cl

**Generated**: 2025-12-05T03:45:00Z
**Agent**: Blake_Backend
**Task**: Payment & Escrow System
**Invocation**: 1
**Priority**: CRITICAL PATH

---

## Objective

Implement Stripe Connect marketplace integration with escrow functionality: hold payments for 7 days post-event, calculate 15% platform commission, handle vendor payouts and refunds.

## Acceptance Criteria

1. **Stripe Connect Setup**
   - Marketplace account configuration
   - Connected account onboarding for vendors
   - Webhook handlers for payment events

2. **Payment Flow**
   - `POST /api/payments/create-intent` - Create payment intent
   - Customer pays when booking is CONFIRMED
   - Funds held in escrow (7 days after event)
   - Automatic release to vendor after hold period

3. **Commission Calculation**
   ```typescript
   const PLATFORM_COMMISSION = 0.15; // 15%

   function calculatePaymentSplit(totalAmount: number) {
     const platformFee = Math.round(totalAmount * PLATFORM_COMMISSION);
     const vendorPayout = totalAmount - platformFee;
     return { totalAmount, platformFee, vendorPayout };
   }
   ```

4. **Refund Handling**
   - `POST /api/payments/:id/refund` - Process refund
   - Apply cancellation policy:
     - 7+ days before: 100% refund
     - 3-6 days before: 50% refund
     - Under 3 days: 0% refund
   - Partial refunds for disputes

5. **Vendor Payout**
   - `GET /api/vendor/payouts` - List vendor payouts
   - `POST /api/vendor/payouts/request` - Request early payout
   - Automatic payout 7 days post-event

## Technical Details

### File Structure
```
modules/payment/
├── payment.service.ts     # Business logic
├── payment.validation.ts  # Zod schemas
├── payment.types.ts       # TypeScript types
└── stripe.client.ts       # Stripe SDK wrapper

app/api/payments/
├── route.ts               # POST (create intent)
├── [id]/
│   ├── route.ts          # GET payment status
│   └── refund/route.ts   # POST refund
├── webhook/route.ts       # Stripe webhooks
└── connect/
    └── onboard/route.ts   # Vendor onboarding

app/api/vendor/payouts/
├── route.ts               # GET list, POST request
└── [id]/route.ts          # GET single payout
```

### Stripe Connect Flow
```typescript
// Vendor onboarding
async function createConnectedAccount(vendorId: string) {
  const account = await stripe.accounts.create({
    type: 'express',
    country: 'US',
    capabilities: {
      transfers: { requested: true },
    },
  });

  // Store account.id in Vendor model
  await prisma.vendor.update({
    where: { id: vendorId },
    data: { stripeAccountId: account.id },
  });

  // Generate onboarding link
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${process.env.APP_URL}/vendor/stripe-onboarding/refresh`,
    return_url: `${process.env.APP_URL}/vendor/stripe-onboarding/complete`,
    type: 'account_onboarding',
  });

  return accountLink.url;
}
```

### Payment Intent with Escrow
```typescript
async function createPaymentForBooking(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { vendor: true },
  });

  const { platformFee, vendorPayout } = calculatePaymentSplit(booking.totalAmount);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: booking.totalAmount * 100, // cents
    currency: 'usd',
    application_fee_amount: platformFee * 100,
    transfer_data: {
      destination: booking.vendor.stripeAccountId,
    },
    metadata: {
      bookingId,
      vendorId: booking.vendorId,
      releaseDate: new Date(booking.eventDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    // Hold funds with manual capture for escrow
    capture_method: 'manual',
  });

  return paymentIntent;
}
```

### Webhook Handlers
```typescript
const webhookHandlers: Record<string, Function> = {
  'payment_intent.succeeded': handlePaymentSuccess,
  'payment_intent.payment_failed': handlePaymentFailed,
  'transfer.created': handleTransferCreated,
  'account.updated': handleAccountUpdated,
  'charge.refunded': handleRefund,
};
```

### Escrow Release (Scheduled Job)
```typescript
// Run daily to release held payments
async function releaseEscrowPayments() {
  const today = new Date();
  const paymentsToRelease = await prisma.payment.findMany({
    where: {
      status: 'HELD',
      releaseDate: { lte: today },
    },
    include: { booking: true },
  });

  for (const payment of paymentsToRelease) {
    await stripe.paymentIntents.capture(payment.stripePaymentIntentId);
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'RELEASED' },
    });
  }
}
```

## Dependencies (Completed)

- Fleet-Feast-wu8: Booking System API ✓
- Fleet-Feast-ok7: Vendor Application API ✓

## PRD Reference

- **F8**: Secure Payment Processing
- **Business Rules**: Commission Structure (15% platform fee)
- **Business Rules**: Escrow (7-day hold post-event)

## Environment Variables Needed

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Gap Checklist

After completing the task, verify:
- [ ] Stripe Connect account creation works
- [ ] Payment intent created with correct amounts
- [ ] 15% commission calculated correctly
- [ ] Manual capture (escrow) implemented
- [ ] Webhook signature verification
- [ ] Refund policy enforced correctly
- [ ] Vendor payout endpoints functional
- [ ] Error handling for Stripe API failures
- [ ] Idempotency keys for payment operations

---

*Briefing generated by MASTER Orchestrator*
