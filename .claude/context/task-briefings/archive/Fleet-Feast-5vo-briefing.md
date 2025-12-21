# Briefing: Fleet-Feast-5vo

**Generated**: 2025-12-20T00:35:00-05:00
**Agent**: Dana_Database
**Task ID**: Fleet-Feast-5vo
**Phase**: 1

---

## Task Details

**Title**: Update BookingStatus enum with inquiry-proposal flow statuses

**Objective**: Update the BookingStatus enum in Prisma schema to support the new inquiry-to-proposal booking flow.

**Priority**: High (Phase 1 - Foundation)

---

## Current BookingStatus Enum

```prisma
enum BookingStatus {
  PENDING       // Customer submitted, awaiting vendor response
  ACCEPTED      // Vendor accepted, awaiting payment
  PAYMENT_FAILED // Payment authorization failed
  CONFIRMED     // Payment authorized, booking confirmed
  COMPLETED     // Event occurred, in 7-day dispute window
  CANCELLED     // Cancelled by customer or vendor
  DISPUTED      // Dispute raised
  REFUNDED      // Payment refunded
}
```

---

## New BookingStatus Enum (Required)

```prisma
enum BookingStatus {
  INQUIRY        // Customer submitted inquiry, awaiting vendor proposal
  PROPOSAL_SENT  // Vendor sent proposal, awaiting customer acceptance
  ACCEPTED       // Customer accepted proposal, awaiting payment
  PAID           // Payment completed, pending confirmation
  CONFIRMED      // Payment confirmed, booking active
  COMPLETED      // Event occurred successfully
  DECLINED       // Customer or vendor declined
  EXPIRED        // Proposal or inquiry expired without action
  CANCELLED      // Cancelled after confirmation
}
```

---

## Acceptance Criteria

- [ ] BookingStatus enum updated with all 9 new statuses
- [ ] Backward compatibility migration strategy documented
- [ ] Existing PENDING/ACCEPTED bookings handled gracefully
- [ ] Schema generates valid Prisma client
- [ ] PaymentStatus enum comment updated (remove "Stripe" references)

---

## Status Mapping for Migration

| Old Status | New Status | Notes |
|------------|------------|-------|
| PENDING | INQUIRY | Semantically similar |
| ACCEPTED | ACCEPTED | Keep as-is |
| PAYMENT_FAILED | (remove) | Handle as DECLINED or keep payment failure separate |
| CONFIRMED | CONFIRMED | Keep as-is |
| COMPLETED | COMPLETED | Keep as-is |
| CANCELLED | CANCELLED | Keep as-is |
| DISPUTED | (handle in migration) | Could map to CONFIRMED with dispute flag |
| REFUNDED | (handle in migration) | Could map to CANCELLED |

---

## Files to Modify

**prisma/schema.prisma** (lines 50-59):
- Update BookingStatus enum with new values
- Add comments explaining each status
- Update PaymentStatus enum comments (line 63: remove "Stripe PaymentIntent" reference)

---

## Migration Strategy

1. Add new enum values first (non-breaking)
2. Remove/rename old values with data migration
3. Handle existing bookings:
   - PENDING → INQUIRY
   - PAYMENT_FAILED → DECLINED
   - DISPUTED → Keep status, add separate dispute tracking
   - REFUNDED → CANCELLED (with refund flag on payment)

---

## Downstream Dependencies (3 tasks blocked by this)

1. **Fleet-Feast-exf** - Create and run Prisma migration
2. **Fleet-Feast-tp2** - Add proposal notification types
3. **Fleet-Feast-y1r** - Add proposal fields to Booking model

---

## PRD Reference

From MASTER_PRD.md - User Journeys:
- Customer submits booking request → Receives acceptance/decline from truck
- The new flow: Customer submits inquiry → Vendor sends proposal → Customer accepts/declines → Payment

---

## Important Notes

1. This is an ENUM update - be careful with existing data
2. The migration should NOT be run in this task - that's a separate task (Fleet-Feast-exf)
3. Just update the schema.prisma file with the new enum values
4. Add clear comments for each status explaining its purpose

---

## Gap Checklist

After completing work, verify:
- [ ] All 9 new statuses defined in BookingStatus enum
- [ ] Each status has a comment explaining its purpose
- [ ] PaymentStatus comments don't reference Stripe
- [ ] Schema is syntactically valid: `npx prisma validate`
