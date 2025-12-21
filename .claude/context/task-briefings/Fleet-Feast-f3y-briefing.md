# Task Briefing: Fleet-Feast-f3y

## Task Details
- **ID**: Fleet-Feast-f3y
- **Title**: Implement automated vendor payout scheduling system
- **Agent**: Blake_Backend
- **Priority**: P0

## Objective
Create system to automatically schedule and process vendor payouts 7 days after event completion.

## Payout Rules (from PRD)
- Payouts scheduled 7 days after event completion
- Only if no active dispute
- Deduct platform fee (5% vendor portion from 10% total split)
- Batch by vendor (multiple bookings = one payout)

## Database Models Available
```prisma
model VendorPayout {
  id       String @id
  vendorId String
  amount Decimal
  status PayoutStatus // PENDING, PROCESSING, COMPLETED, FAILED
  payoutMethod PayoutMethod? // ACH, EFT, WIRE
  scheduledFor DateTime
  processedAt DateTime?
  externalReference String?
  failureReason String?
  bookings VendorPayoutBooking[]
}

model VendorPayoutBooking {
  id        String
  payoutId  String
  bookingId String
  amount Decimal // Amount from this booking
}
```

## Components to Create

### 1. Payout Service (modules/payout/payout.service.ts)

Functions needed:
- `schedulePayouts()` - Find eligible bookings, create payout records
- `processPayouts()` - Process pending payouts (stub for now, actual ACH integration later)
- `getVendorPayouts(vendorId)` - List payouts for vendor
- `getPayoutDetails(payoutId)` - Get single payout with bookings
- `holdPayout(payoutId)` - Admin holds a payout
- `releasePayout(payoutId)` - Admin releases held payout

Eligibility criteria:
- Booking status = COMPLETED
- Event date >= 7 days ago
- No active dispute (Dispute.status = OPEN or INVESTIGATING)
- Not already in a payout

### 2. Cron Endpoints

**POST /api/cron/schedule-payouts**
- Should run daily at 6 AM
- Call schedulePayouts() service
- Return count of payouts created

**POST /api/cron/process-payouts**
- Should run daily at 7 AM
- Call processPayouts() service
- Return count processed/failed

### 3. Admin Endpoints

**GET /api/admin/payouts**
Query params: status, vendorId, page, limit
Return paginated list of all payouts

**GET /api/admin/payouts/:id**
Return payout details with included bookings

**POST /api/admin/payouts/:id/hold**
Set payout status to PENDING with hold flag
Body: { reason: string }

**POST /api/admin/payouts/:id/release**
Release held payout, set back to PENDING for processing

**POST /api/admin/payouts/process**
Manually trigger payout processing (for testing)

### 4. Vendor Endpoints

**GET /api/vendor/payouts**
Return payouts for authenticated vendor

**GET /api/vendor/payouts/:id**
Return payout details (verify vendor ownership)

## Payout Calculation

For each booking:
```
vendorPayout = booking.vendorPayout (already calculated minus 10% platform fee)
platformFeeVendor = booking.platformFeeVendor (5% of total)
netPayout = vendorPayout - platformFeeVendor
```

## Acceptance Criteria
- [ ] Payout service schedules payouts after 7 days
- [ ] Disputes block payout scheduling
- [ ] Platform fee deducted correctly (5% vendor portion)
- [ ] Multiple bookings batched into single payout per vendor
- [ ] Cron endpoints work correctly
- [ ] Admin can view/hold/release payouts
- [ ] Vendor can view their payouts
- [ ] VendorPayout and VendorPayoutBooking records created correctly

## Files to Create
- modules/payout/payout.service.ts
- modules/payout/payout.types.ts
- modules/payout/payout.validation.ts
- app/api/cron/schedule-payouts/route.ts
- app/api/cron/process-payouts/route.ts
- app/api/admin/payouts/route.ts
- app/api/admin/payouts/[id]/route.ts
- app/api/admin/payouts/[id]/hold/route.ts
- app/api/admin/payouts/[id]/release/route.ts
- app/api/vendor/payouts/route.ts
- app/api/vendor/payouts/[id]/route.ts
