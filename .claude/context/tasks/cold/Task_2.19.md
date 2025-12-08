# Task 2.19: Cancellation System Backend

## Objective
Implement the platform-wide cancellation policy with automated refund calculations and vendor penalties.

## Requirements (from PRD)
- F11: Platform-Wide Cancellation Policy
  - Full refund 7+ days before event
  - Partial refund 3-6 days
  - No refund under 3 days
  - Vendor cancellation triggers penalty
- F12: Vendor Cancellation Handling
  - Automatic penalty fee
  - Platform attempts replacement
  - Customer gets replacement OR full refund choice

## Acceptance Criteria
- [ ] POST /api/bookings/[id]/cancel - Cancel booking
- [ ] Automatic refund calculation based on timing
- [ ] Vendor penalty calculation and application
- [ ] Replacement truck matching logic
- [ ] Customer choice flow (replacement vs refund)
- [ ] Cancellation reason tracking
- [ ] Email notifications on cancellation
- [ ] Cancellation history logging

## Deliverables
- [ ] app/api/bookings/[id]/cancel/route.ts
- [ ] app/api/bookings/[id]/replacement/route.ts
- [ ] lib/cancellation.ts (cancellation logic)
- [ ] lib/refund.ts (refund calculations)

## Dependencies
- [ ] Task 2.11 - Booking Request Backend
- [ ] Task 2.13 - Stripe Payment Integration

## Assigned
Blake_Backend

## Priority
high

## Files
- app/api/bookings/[id]/cancel/route.ts
- app/api/bookings/[id]/replacement/route.ts
- lib/cancellation.ts
- lib/refund.ts

## Status
[ ]
