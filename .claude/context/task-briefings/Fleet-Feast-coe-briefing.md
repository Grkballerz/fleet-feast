# Task Briefing: Fleet-Feast-coe

## Task Details
- **ID**: Fleet-Feast-coe
- **Title**: Update booking types and validation for inquiry-proposal flow
- **Agent**: Blake_Backend
- **Priority**: P0

## Objective
Update TypeScript types and Zod validation schemas for the new inquiry-proposal booking flow.

## Existing Files to Update

### modules/booking/booking.types.ts
Current types:
- BookingRequestData
- BookingUpdateData
- VendorResponseData
- CancellationData
- BookingDetails
- BookingListItem
- RefundCalculation

### modules/booking/booking.validation.ts
Current schemas:
- bookingRequestSchema
- bookingUpdateSchema
- vendorDeclineSchema
- cancellationSchema
- bookingIdSchema

## New Types Required

### InquiryRequestData
```typescript
interface InquiryRequestData {
  vendorId: string;
  eventDate: string; // YYYY-MM-DD
  eventTime: string; // HH:MM
  eventType: EventType;
  location: string;
  guestCount: number;
  specialRequests?: string;
}
```

### ProposalData
```typescript
interface ProposalData {
  proposalAmount: number;
  proposalDetails: {
    lineItems: Array<{
      name: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }>;
    inclusions: string[];
    terms?: string;
  };
  expiresInDays?: number; // default: 7
}
```

### ProposalAcceptData
```typescript
interface ProposalAcceptData {
  acceptTerms: boolean;
}
```

### Update BookingDetails
Add:
- proposalAmount: number | null;
- proposalDetails: ProposalDetails | null;
- proposalSentAt: Date | null;
- proposalExpiresAt: Date | null;
- platformFeeCustomer: number | null;
- platformFeeVendor: number | null;

### Update BookingListItem
Add:
- proposalAmount?: number;
- proposalExpiresAt?: Date;

## New Validation Schemas Required

### inquiryRequestSchema
- vendorId: uuid required
- eventDate: YYYY-MM-DD format, future date
- eventTime: HH:MM format
- eventType: EventType enum
- location: string 5-500 chars
- guestCount: int 1-10000
- specialRequests: string optional max 2000

### proposalSchema
- proposalAmount: positive number, max 1,000,000
- proposalDetails: object with lineItems array, inclusions array
- expiresInDays: optional int 1-30, default 7

### proposalAcceptSchema
- acceptTerms: boolean must be true

## Acceptance Criteria
- [ ] InquiryRequestData type exported
- [ ] ProposalData type exported
- [ ] ProposalAcceptData type exported
- [ ] BookingDetails updated with proposal fields
- [ ] BookingListItem updated with proposal fields
- [ ] inquiryRequestSchema validates correctly
- [ ] proposalSchema validates correctly
- [ ] proposalAcceptSchema validates correctly
- [ ] All types match Prisma generated types

## Files to Modify
- modules/booking/booking.types.ts
- modules/booking/booking.validation.ts
