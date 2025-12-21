# Briefing: Fleet-Feast-bb0

**Generated**: 2025-12-20T00:20:00-05:00
**Agent**: Blake_Backend
**Task ID**: Fleet-Feast-bb0
**Phase**: 1

---

## Task Details

**Title**: Remove Stripe dependencies and clean up Stripe-specific code

**Objective**: Remove all Stripe SDK dependencies and Stripe-specific code to prepare for Helcim payment integration.

**Priority**: High (Phase 1 - Foundation)

---

## Acceptance Criteria

- [ ] No Stripe packages in package.json (@stripe/stripe-js, @stripe/react-stripe-js, stripe)
- [ ] No Stripe imports in codebase
- [ ] Database fields renamed appropriately (stripePaymentIntentId → externalPaymentId, etc.)
- [ ] Build succeeds without Stripe
- [ ] All Stripe environment variables documented for removal

---

## Files to Modify

### Primary Files:
1. **package.json** - Remove:
   - `@stripe/react-stripe-js: ^2.9.0`
   - `@stripe/stripe-js: ^4.7.0`
   - `stripe: ^17.0.0`

2. **prisma/schema.prisma** - Rename/Remove fields:
   - `Vendor.stripeAccountId` → Remove (will be replaced by bank fields in next task)
   - `Vendor.stripeConnected` → Remove (will be replaced by bankVerified)
   - `Payment.stripePaymentIntentId` → Rename to `externalPaymentId`
   - `Payment.stripeTransferId` → Rename to `externalTransferId`
   - Update index on `stripePaymentIntentId` to `externalPaymentId`

3. **modules/payment/stripe.client.ts** - DELETE this file

4. **modules/payment/payment.service.ts** - Remove Stripe-specific code

5. **modules/payment/payment.types.ts** - Update types

6. **app/api/payments/connect/onboard/route.ts** - DELETE (Stripe Connect specific)

7. **app/api/payments/webhook/route.ts** - Remove Stripe webhook handling (will be replaced by Helcim)

8. **.env.example** - Remove Stripe environment variables:
   - STRIPE_SECRET_KEY
   - STRIPE_PUBLISHABLE_KEY
   - STRIPE_WEBHOOK_SECRET
   - Any STRIPE_CONNECT_* variables

9. **lib/env-validation.ts** - Remove Stripe validation

10. **__tests__/mocks/stripe.ts** - DELETE

### Files to Update (remove Stripe references):
- app/customer/booking/[id]/payment/page.tsx
- app/vendor/payouts/page.tsx
- lib/monitoring/index.ts

---

## Current State Analysis

### package.json Stripe Dependencies:
```json
"@stripe/react-stripe-js": "^2.9.0",
"@stripe/stripe-js": "^4.7.0",
"stripe": "^17.0.0"
```

### Prisma Schema Stripe Fields:
```prisma
// Vendor model (lines 206-207)
stripeAccountId String? @unique @map("stripe_account_id")
stripeConnected Boolean @default(false) @map("stripe_connected")

// Payment model (lines 366-367)
stripePaymentIntentId String? @unique @map("stripe_payment_intent_id")
stripeTransferId      String? @unique @map("stripe_transfer_id")
```

---

## Database Migration Strategy

1. Rename payment fields in Prisma schema
2. Remove Vendor Stripe fields (they'll be replaced by bank account fields in Fleet-Feast-0jt)
3. Generate migration: `npx prisma migrate dev --name remove-stripe-fields`
4. Handle existing data gracefully (NULL out removed fields)

---

## Downstream Dependencies (3 tasks blocked by this)

1. **Fleet-Feast-0jt** - Add vendor bank account fields to Vendor model
2. **Fleet-Feast-1p1** - Install and configure Helcim SDK and API client
3. **Fleet-Feast-ndn** - Create internal escrow ledger system

---

## PRD Reference

From MASTER_PRD.md - Technical Requirements:
- **Payment Processing**: Migrating from Stripe Connect to Helcim
- The platform should support marketplace payments with escrow

---

## Important Notes

1. DO NOT delete payment API routes entirely - they will be repurposed for Helcim
2. Keep the Payment model structure - just rename Stripe-specific fields
3. The Vendor model changes are just removing Stripe fields; new bank account fields come in a separate task
4. Run `npm install` after removing packages to update package-lock.json
5. Ensure build passes: `npm run build`

---

## Gap Checklist

After completing work, verify:
- [ ] No "stripe" imports anywhere in codebase (case-insensitive search)
- [ ] package.json has no Stripe packages
- [ ] prisma/schema.prisma has no stripeAccountId or stripeConnected
- [ ] Payment model uses externalPaymentId/externalTransferId
- [ ] Build succeeds
- [ ] Type-check passes: `npm run type-check`
