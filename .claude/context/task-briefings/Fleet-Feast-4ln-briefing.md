# Task Briefing: Fleet-Feast-4ln

## Task Details
- **ID**: Fleet-Feast-4ln
- **Title**: Write integration tests for inquiry-proposal API endpoints
- **Priority**: P1
- **Agent**: Taylor_Tester
- **Phase**: 4 (Post-Completion Testing)

## Objective
Create comprehensive integration tests for all new and modified API endpoints related to the inquiry-proposal booking flow.

## Endpoints to Test

### 1. POST /api/inquiries
Test file: `__tests__/api/inquiries.test.ts`

**Test Cases:**
- Authenticated customer can create inquiry
- Unauthenticated request returns 401
- Invalid vendor ID returns 400
- Missing required fields return 400 with field-specific errors
- Past date returns 400 validation error
- Guest count outside vendor capacity returns 400
- Valid inquiry creates booking with INQUIRY status

### 2. POST /api/bookings/:id/proposal
Test file: `__tests__/api/bookings-proposal.test.ts`

**Test Cases:**
- Vendor can send proposal on their inquiry
- Non-vendor user returns 403
- Wrong vendor (not owner) returns 403
- Non-INQUIRY status returns 400
- Empty line items returns 400
- Line item with zero price returns 400
- Valid proposal updates booking to PROPOSAL_SENT
- Fee split calculated correctly (5% customer, 5% vendor)
- Proposal fields saved correctly

### 3. POST /api/bookings/:id/accept
Test file: `__tests__/api/bookings-accept.test.ts`

**Test Cases:**
- Customer can accept valid proposal
- Non-customer returns 403
- Expired proposal returns 400
- Already accepted proposal returns 400
- Non-PROPOSAL_SENT status returns 400
- Accept updates status to ACCEPTED
- platformFeeCustomer and platformFeeVendor stored

### 4. POST /api/bookings/:id/decline
Test file: `__tests__/api/bookings-decline.test.ts`

**Test Cases:**
- Customer can decline proposal (PROPOSAL_SENT → CUSTOMER_DECLINED)
- Vendor can decline inquiry (INQUIRY → VENDOR_DECLINED)
- Wrong status returns 400
- Decline reason optional but stored if provided

## Existing Test Patterns

Reference existing tests:
- `__tests__/unit/booking.validation.test.ts` - 66 tests for Zod schemas
- `__tests__/unit/helcim.test.ts` - 38 tests for Helcim client

## Test Setup Requirements

### Prisma Test Client
```typescript
import { prisma } from "@/lib/prisma";

beforeEach(async () => {
  // Clean test data
  await prisma.booking.deleteMany({ where: { /* test filter */ } });
});

afterAll(async () => {
  await prisma.$disconnect();
});
```

### Mock Auth Session
```typescript
import { getServerSession } from "next-auth";
jest.mock("next-auth");

const mockSession = {
  user: { id: "test-user-id", email: "test@example.com", role: "CUSTOMER" }
};
(getServerSession as jest.Mock).mockResolvedValue(mockSession);
```

### Test Fixtures
Create reusable fixtures in `__tests__/fixtures/`:
- Test users (customer, vendor, admin)
- Test food trucks with capacity ranges
- Test bookings in various states

## Files to Create
- `__tests__/api/inquiries.test.ts`
- `__tests__/api/bookings-proposal.test.ts`
- `__tests__/api/bookings-accept.test.ts`
- `__tests__/api/bookings-decline.test.ts`
- `__tests__/fixtures/booking-fixtures.ts` (if not exists)

## Acceptance Criteria
- [ ] All 4 endpoint test files created
- [ ] Auth/authz properly tested for each endpoint
- [ ] Error responses validated (status codes and messages)
- [ ] Database state verified after mutations
- [ ] Tests pass with `npm test`

## Notes
- Use existing validation schemas from `modules/booking/booking.validation.ts`
- Reference booking types from `modules/booking/booking.types.ts`
- Mock notifications to avoid side effects
