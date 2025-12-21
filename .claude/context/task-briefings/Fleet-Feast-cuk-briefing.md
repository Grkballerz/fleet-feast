# Task Briefing: Fleet-Feast-cuk

## Task Details
- **ID**: Fleet-Feast-cuk
- **Title**: Update POST /api/bookings/:id/decline for inquiry/proposal decline
- **Agent**: Ellis_Endpoints
- **Priority**: P0

## Objective
Update the existing decline endpoint to handle both vendor declining inquiries and customers declining proposals.

## Endpoint Specification

**POST /api/bookings/:id/decline**

### Request Body
```typescript
{
  reason?: string  // Optional decline reason
}
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "booking-uuid",
    "status": "DECLINED",
    "declinedAt": "2025-12-20T..."
  },
  "message": "Booking declined"
}
```

## Business Logic

### Scenario 1: Vendor Declines Inquiry
- Booking status must be INQUIRY
- Authenticated user must be the vendor
- Updates booking:
  - status: DECLINED
  - respondedAt: now
- Creates notification for customer:
  - Type: BOOKING_DECLINED
  - Title: "Inquiry Declined"

### Scenario 2: Customer Declines Proposal
- Booking status must be PROPOSAL_SENT
- Authenticated user must be the customer
- Updates booking:
  - status: DECLINED
  - respondedAt: now
- Creates notification for vendor:
  - Type: BOOKING_DECLINED
  - Title: "Proposal Declined"

### Validation Rules
- If status is INQUIRY: only vendor can decline
- If status is PROPOSAL_SENT: only customer can decline
- Other statuses: return 400 "Booking cannot be declined in current status"

## Existing File to Update
- app/api/bookings/[id]/decline/route.ts

## Check Existing Implementation
Look at the current decline endpoint structure and update it to handle:
1. INQUIRY → DECLINED (vendor action)
2. PROPOSAL_SENT → DECLINED (customer action)

## Message Thread
If reason provided:
- Create message in thread with decline reason
- Sender: the declining party

## Notifications
Use existing notification creation pattern from other endpoints.

## Acceptance Criteria
- [ ] Customer can decline proposals (PROPOSAL_SENT → DECLINED)
- [ ] Vendor can decline inquiries (INQUIRY → DECLINED)
- [ ] Proper notifications sent to other party
- [ ] Reason stored in messages if provided
- [ ] Invalid status returns 400
- [ ] Wrong user role returns 403
