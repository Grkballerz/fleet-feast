# Task Briefing: Fleet-Feast-dpx

## Task Details
- **ID**: Fleet-Feast-dpx
- **Title**: Create POST /api/inquiries endpoint for customer inquiry submission
- **Agent**: Ellis_Endpoints
- **Priority**: P0

## Objective
Create new endpoint for customers to submit booking inquiries to vendors.

## Endpoint Specification

**POST /api/inquiries**

### Request Body
```typescript
{
  vendorId: string,       // UUID of the vendor
  eventDate: string,      // YYYY-MM-DD format
  eventTime: string,      // HH:MM format
  eventType: EventType,   // Prisma enum
  location: string,       // Full address
  guestCount: number,     // 1-10000
  specialRequests?: string // Optional notes
}
```

### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "booking-uuid",
    "status": "INQUIRY",
    "createdAt": "2025-12-20T..."
  },
  "message": "Inquiry submitted successfully"
}
```

## Business Logic

1. **Validate Request**
   - Use inquiryRequestSchema from modules/booking/booking.validation.ts
   - Verify vendor exists and is APPROVED
   - Verify event date is in the future

2. **Check Vendor Availability** (optional)
   - Query Availability table for vendor + date
   - Warn if vendor marked unavailable (but don't block)

3. **Create Booking Record**
   ```prisma
   Booking {
     customerId: authenticated user
     vendorId: from vendor lookup
     eventDate, eventTime, eventType, location, guestCount, specialRequests
     status: INQUIRY
     totalAmount: 0  // Will be set by proposal
     platformFee: 0
     vendorPayout: 0
   }
   ```

4. **Create Initial Message** (optional)
   - Create first message in thread from customer
   - Content: "New inquiry for [eventType] on [eventDate]"

5. **Trigger Notification**
   - Create Notification for vendor
   - Type: INQUIRY_RECEIVED
   - Title: "New Inquiry from Customer"
   - Link: "/vendor/bookings/{bookingId}"

## Available Types/Schemas
From modules/booking/booking.validation.ts:
- `inquiryRequestSchema` - validates inquiry input

From modules/booking/booking.types.ts:
- `InquiryRequestData` - TypeScript type

## Files to Create
- app/api/inquiries/route.ts

## Dependencies
- lib/prisma (database)
- lib/middleware/auth.middleware (requireAuth)
- lib/api-response (ApiResponses)
- modules/booking/booking.validation (inquiryRequestSchema)

## Acceptance Criteria
- [ ] Endpoint accepts inquiry data
- [ ] Booking created with INQUIRY status
- [ ] Vendor notified (Notification created)
- [ ] Validation errors return 400
- [ ] Only authenticated customers can submit
- [ ] Returns booking ID on success
