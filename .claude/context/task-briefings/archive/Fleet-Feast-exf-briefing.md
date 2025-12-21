# Task Briefing: Fleet-Feast-exf

## Task Details
- **ID**: Fleet-Feast-exf
- **Title**: Create and run Prisma migration for inquiry-proposal schema
- **Agent**: Dana_Database
- **Priority**: P0

## Objective
Generate and apply Prisma migration for all schema changes made in Phase 1 of the Stripe-to-Helcim migration.

## Schema Changes to Migrate

### 1. BookingStatus Enum (from Fleet-Feast-5vo)
Changed from: `PENDING, ACCEPTED, CONFIRMED, COMPLETED, CANCELLED, DECLINED`
Changed to: `INQUIRY, PROPOSAL_SENT, ACCEPTED, PAID, CONFIRMED, COMPLETED, DECLINED, EXPIRED, CANCELLED`

### 2. Booking Model - Proposal Fields (from Fleet-Feast-y1r)
New fields:
- `proposalAmount Decimal?`
- `proposalDetails Json?`
- `proposalSentAt DateTime?`
- `proposalExpiresAt DateTime?`
- `platformFeeCustomer Decimal?`
- `platformFeeVendor Decimal?`
- New index: `@@index([status, proposalExpiresAt])`

### 3. NotificationType Enum (from Fleet-Feast-tp2)
New values added:
- `INQUIRY_RECEIVED`
- `PROPOSAL_SENT`
- `PROPOSAL_ACCEPTED`
- `PROPOSAL_EXPIRING`
- `PROPOSAL_EXPIRED`

### 4. Vendor Bank Account Fields (from Fleet-Feast-0jt)
New fields:
- `bankAccountHolder String?`
- `bankAccountNumber String?` (encrypted)
- `bankRoutingNumber String?`
- `bankAccountType BankAccountType?`
- `bankName String?`
- `bankVerified Boolean @default(false)`
- `bankVerifiedAt DateTime?`
- `payoutMethod PayoutMethod?`

New enums:
- `BankAccountType` (CHECKING, SAVINGS)
- `PayoutMethod` (ACH, EFT, WIRE)

### 5. Escrow & Payout Models (from Fleet-Feast-ndn)
New models:
- `EscrowTransaction` - tracks payment hold/capture/release/refund
- `VendorPayout` - tracks vendor payout batches
- `VendorPayoutBooking` - join table for payout-booking relationship

New enums:
- `EscrowTransactionType` (HOLD, CAPTURE, RELEASE, REFUND)
- `EscrowStatus` (PENDING, COMPLETED, FAILED)
- `PayoutStatus` (PENDING, PROCESSING, COMPLETED, FAILED)

### 6. Previous Migration (already applied)
- `20251220_remove_stripe_fields/` - Removed stripeAccountId, stripeConnected from Vendor; renamed Payment fields

## Migration Commands

```bash
# Generate and apply migration
npx prisma migrate dev --name inquiry-proposal-flow

# Regenerate Prisma client
npx prisma generate

# Verify schema
npx prisma validate
```

## Data Migration Strategy

For existing bookings with status `PENDING`:
- These should be migrated to `INQUIRY` status
- The migration SQL should handle this transformation

## Rollback Strategy

If migration fails:
```bash
# Reset to previous migration
npx prisma migrate reset

# Or rollback specific migration
npx prisma migrate resolve --rolled-back inquiry-proposal-flow
```

## Acceptance Criteria
- [ ] Migration created successfully
- [ ] Migration applied to database
- [ ] Prisma client regenerated
- [ ] Schema validates with `npx prisma validate`
- [ ] Existing data properly transformed (PENDING → INQUIRY)
- [ ] Rollback strategy documented

## Files to Create/Modify
- `prisma/migrations/YYYYMMDD_inquiry-proposal-flow/migration.sql`

## Dependencies Completed
- Fleet-Feast-5vo: BookingStatus enum updated
- Fleet-Feast-y1r: Proposal fields added
- Fleet-Feast-tp2: Notification types added
- Fleet-Feast-0jt: Bank account fields added
- Fleet-Feast-ndn: Escrow/Payout models added
