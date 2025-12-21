# Task Briefing: Fleet-Feast-azl4

## Task Details
- **ID**: Fleet-Feast-azl4
- **Title**: Integration verification for Helcim payment system
- **Priority**: P0
- **Agent**: Jordan_Junction
- **Phase**: 4 (Post-Completion Verification)

## Objective
Final integration verification for the complete Helcim payment system. This is a verification task - review all components, test integration points, and fix any issues found.

## Verification Checklist

### 1. Customer Payment Flow
- [ ] HelcimPaymentForm loads correctly
- [ ] Card tokenization works with Helcim.js
- [ ] Payment processes via Helcim API
- [ ] Success/failure handled correctly
- [ ] Fee split (5% customer + 5% vendor) calculated and stored

### 2. Webhook Integration
- [ ] Webhooks received from Helcim at /api/webhooks/helcim
- [ ] Payment status updates correctly
- [ ] Notifications triggered on payment events
- [ ] Idempotency works (no duplicate processing)

### 3. Vendor Bank Setup
- [ ] Bank account form submits correctly
- [ ] Data encrypted with AES-256-GCM at rest
- [ ] Account displays masked in UI
- [ ] Verification status updates

### 4. Payout System
- [ ] Scheduler runs correctly (cron endpoint)
- [ ] Payouts created for eligible bookings (7 days after event)
- [ ] Disputes block payouts
- [ ] Admin can hold/release payouts
- [ ] Vendor sees payout history

### 5. Edge Cases
- [ ] Payment decline handled gracefully
- [ ] Webhook timeout/retry works
- [ ] Invalid bank account detection
- [ ] Payout failure recovery

### 6. Stripe Removal Verification
- [ ] No Stripe errors in console
- [ ] No Stripe API calls anywhere
- [ ] No Stripe UI elements (Elements, etc.)
- [ ] Environment clean of Stripe keys

## Key Files to Verify

### Helcim Core
- `lib/helcim.ts` - Helcim API client
- `components/helcim/HelcimPaymentForm.tsx` - Payment form
- `app/api/webhooks/helcim/route.ts` - Webhook handler

### Payment Flow
- `app/api/payments/route.ts` - Payment processing
- `modules/payment/payment.service.ts` - Payment service
- `app/customer/bookings/[id]/pay/page.tsx` - Payment page

### Payout System
- `modules/payout/payout.service.ts` - Payout service
- `app/api/cron/schedule-payouts/route.ts` - Scheduler
- `app/admin/payouts/page.tsx` - Admin dashboard
- `app/vendor/settings/payouts/page.tsx` - Vendor settings

### Bank Account
- `components/vendor/VendorBankAccountForm.tsx` - Bank form
- `lib/encryption.ts` - Encryption utilities

## Test Resources
- Helcim sandbox/test mode (configured in .env)
- Test card numbers from Helcim docs
- Use Playwright MCP for visual verification

## Acceptance Criteria
- [ ] All flows work end-to-end
- [ ] No regressions from Stripe removal
- [ ] Performance acceptable
- [ ] Error handling robust
- [ ] All test files pass

## Notes
This is the final verification before the Helcim migration is complete. Fix any issues found during verification directly.
