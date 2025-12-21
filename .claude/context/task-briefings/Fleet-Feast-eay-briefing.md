# Task Briefing: Fleet-Feast-eay

## Task Details
- **ID**: Fleet-Feast-eay
- **Title**: Create POST /api/bookings/:id/proposal endpoint for vendor proposals
- **Agent**: Ellis_Endpoints
- **Priority**: P0

## Objective
Create endpoint for vendors to send proposals on customer inquiries.

## Endpoint Specification

**POST /api/bookings/:id/proposal**

### Request Body
```typescript
{
  proposalAmount: number,        // Total price in dollars
  proposalDetails: {
    lineItems: Array<{
      name: string,
      quantity: number,
      unitPrice: number,
      total: number
    }>,
    inclusions: string[],        // What's included
    terms?: string               // Optional terms
  },
  expiresInDays?: number         // Default: 7
}
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "booking-uuid",
    "status": "PROPOSAL_SENT",
    "proposalAmount": 1500.00,
    "proposalExpiresAt": "2025-12-27T..."
  },
  "message": "Proposal sent successfully"
}
```

## Business Logic

1. **Validate Request**
   - Use proposalSchema from modules/booking/booking.validation.ts
   - Verify booking exists
   - Verify booking status is INQUIRY
   - Verify authenticated user is the vendor for this booking

2. **Calculate Fees**
   ```typescript
   const platformFeeRate = 0.10; // 10% total
   const customerFeeRate = 0.05; // 5% customer portion
   const vendorFeeRate = 0.05;   // 5% vendor portion

   platformFeeCustomer = proposalAmount * customerFeeRate;
   platformFeeVendor = proposalAmount * vendorFeeRate;
   platformFee = proposalAmount * platformFeeRate;
   vendorPayout = proposalAmount - platformFee;
   totalAmount = proposalAmount + platformFeeCustomer; // What customer pays
   ```

3. **Update Booking Record**
   ```prisma
   Booking.update({
     status: PROPOSAL_SENT,
     proposalAmount,
     proposalDetails,
     proposalSentAt: new Date(),
     proposalExpiresAt: new Date() + expiresInDays,
     platformFeeCustomer,
     platformFeeVendor,
     platformFee,
     vendorPayout,
     totalAmount
   })
   ```

4. **Create Proposal Message**
   - Create message in booking thread from vendor
   - Content: formatted proposal summary

5. **Trigger Notification**
   - Create Notification for customer
   - Type: PROPOSAL_SENT
   - Title: "New Proposal from [BusinessName]"
   - Link: "/customer/bookings/{bookingId}"

## Available Types/Schemas
From modules/booking/booking.validation.ts:
- `proposalSchema` - validates proposal input

From modules/booking/booking.types.ts:
- `ProposalData` - TypeScript type
- `ProposalDetails` - nested type

## Files to Create
- app/api/bookings/[id]/proposal/route.ts

## Acceptance Criteria
- [ ] Only vendors can send proposals
- [ ] Only INQUIRY status bookings accept proposals
- [ ] Proposal fields populated correctly
- [ ] Expiry date calculated correctly
- [ ] Customer receives notification
- [ ] Proposal message added to thread
- [ ] Platform fees calculated correctly
