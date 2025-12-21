# Task Briefing: Fleet-Feast-rpi

## Task Details
- **ID**: Fleet-Feast-rpi
- **Title**: Implement payment API endpoints with Helcim integration
- **Agent**: Ellis_Endpoints
- **Priority**: P0

## Objective
Rewrite payment API endpoints to use Helcim instead of Stripe. The Helcim client is already implemented in lib/helcim.ts.

## Available Helcim Client Methods
From lib/helcim.ts:
- `preauthorize()` - Hold funds without capturing
- `capturePayment()` - Capture held funds
- `refundPayment()` - Full or partial refund
- `processPayment()` - One-step purchase
- `getTransaction()` - Get transaction details

Usage:
```typescript
import { createHelcimClient } from '@/lib/helcim';
const helcim = createHelcimClient();
```

## Endpoints to Update/Create

### POST /api/payments (create payment)
Request Body:
```json
{
  "bookingId": "uuid",
  "cardToken": "token_from_helcim_js",
  "amount": 10000,
  "currency": "USD"
}
```

Business Logic:
1. Validate booking exists and is in ACCEPTED status
2. Validate customer owns booking
3. Call `helcim.preauthorize()` to hold funds
4. Create Payment record with status PENDING
5. Create EscrowTransaction with type HOLD
6. Update booking status to PAID
7. Return payment details

### POST /api/payments/:id/capture
Request Body:
```json
{
  "amount": 10000
}
```

Business Logic:
1. Find payment by ID
2. Validate payment is AUTHORIZED
3. Find the HOLD escrow transaction to get helcimTransactionId
4. Call `helcim.capturePayment()` with preAuthTransactionId
5. Create EscrowTransaction with type CAPTURE
6. Update payment status to CAPTURED
7. Update booking status to CONFIRMED

### POST /api/payments/:id/refund
Request Body:
```json
{
  "amount": 10000,
  "reason": "Customer cancelled"
}
```

Business Logic:
1. Find payment and original transaction
2. Validate payment can be refunded
3. Calculate refund using cancellation policy
4. Call `helcim.refundPayment()`
5. Create EscrowTransaction with type REFUND
6. Update payment status to REFUNDED
7. Update booking status to CANCELLED

### GET /api/payments/:id
Return payment details including escrow transaction history.

## Escrow Transaction Model
```prisma
model EscrowTransaction {
  id        String @id @default(uuid())
  bookingId String
  type   EscrowTransactionType // HOLD, CAPTURE, RELEASE, REFUND
  amount Decimal
  status EscrowStatus // PENDING, COMPLETED, FAILED
  helcimTransactionId String? @unique
  notes String?
  createdAt   DateTime
  completedAt DateTime?
}
```

## Error Handling
- HelcimError from lib/helcim.ts for API failures
- PaymentError from payment.service.ts for business logic errors
- Return appropriate HTTP status codes

## Acceptance Criteria
- [ ] POST /api/payments creates payment via Helcim preauth
- [ ] POST /api/payments/:id/capture captures held funds
- [ ] POST /api/payments/:id/refund processes refunds
- [ ] GET /api/payments/:id returns payment with escrow history
- [ ] EscrowTransaction records created for each action
- [ ] Proper error handling for Helcim failures
- [ ] Booking status updated correctly

## Files to Modify
- app/api/payments/route.ts
- app/api/payments/[id]/route.ts
- app/api/payments/[id]/refund/route.ts
- modules/payment/payment.validation.ts (update schema for cardToken)
