# Briefing: Fleet-Feast-y1r

**Generated**: 2025-12-20T00:45:00-05:00
**Agent**: Dana_Database
**Task ID**: Fleet-Feast-y1r
**Phase**: 1

---

## Task Details

**Title**: Add proposal fields to Booking model

**Objective**: Add new fields to the Booking model to support the vendor proposal workflow.

**Priority**: High (Phase 1 - Schema Foundation)

---

## Acceptance Criteria

- [ ] All 6 new fields added to Booking model
- [ ] Proper types and optionality set
- [ ] Indexes added for proposal queries
- [ ] Schema validates: `npx prisma validate`

---

## New Fields to Add

Add these fields to the Booking model in prisma/schema.prisma:

```prisma
// Proposal fields
proposalAmount      Decimal?  @map("proposal_amount") @db.Decimal(10, 2)
proposalDetails     Json?     @map("proposal_details") // Line items, inclusions, terms
proposalSentAt      DateTime? @map("proposal_sent_at")
proposalExpiresAt   DateTime? @map("proposal_expires_at")

// Platform fee split (50/50 model)
platformFeeCustomer Decimal?  @map("platform_fee_customer") @db.Decimal(10, 2)
platformFeeVendor   Decimal?  @map("platform_fee_vendor") @db.Decimal(10, 2)
```

### Field Explanations

1. **proposalAmount**: The vendor's proposed total price
2. **proposalDetails**: JSON with line items, what's included, terms
3. **proposalSentAt**: When vendor sent the proposal
4. **proposalExpiresAt**: Proposal expiration deadline (48-72 hours typical)
5. **platformFeeCustomer**: 5% service fee charged to customer
6. **platformFeeVendor**: 5% fee deducted from vendor payout

---

## Current Booking Model Location

The Booking model starts around line 304 in prisma/schema.prisma.

Add the new fields after the existing `vendorPayout` field (around line 325).

---

## Index to Add

Add an index for proposal-related queries:

```prisma
@@index([status, proposalExpiresAt]) // For finding expiring proposals
```

---

## Important Notes

1. All proposal fields are OPTIONAL (nullable) because:
   - Bookings start as inquiries with no proposal
   - Only populated when vendor sends proposal

2. Keep existing fields intact - this is additive only

3. DO NOT run migrations - that will be done in a separate task

---

## Gap Checklist

After completing work, verify:
- [ ] All 6 fields added with correct types
- [ ] Fields use @map for snake_case database columns
- [ ] Decimal fields have @db.Decimal(10, 2)
- [ ] DateTime fields are optional (DateTime?)
- [ ] New index added for proposal queries
- [ ] `npx prisma validate` passes
