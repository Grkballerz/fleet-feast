# Task Briefing: Fleet-Feast-1y0

## Task Details
- **ID**: Fleet-Feast-1y0
- **Title**: Write E2E tests for complete inquiry-to-payment flow
- **Priority**: P1
- **Agent**: Quinn_QA
- **Phase**: 4 (Post-Completion Testing)

## Objective
Create end-to-end Playwright tests for the complete booking flow from inquiry submission through payment completion.

## E2E Test Scenarios

### Scenario 1: Happy Path - Complete Flow
```
1. Customer browses trucks at /trucks
2. Customer selects a truck, goes to booking page
3. Customer fills InquiryForm with valid data
4. Customer submits inquiry
5. Vendor logs in, sees inquiry in /vendor/bookings
6. Vendor opens messages, creates proposal with ProposalBuilder
7. Customer receives notification (check /customer/notifications)
8. Customer opens messages, sees ProposalCard
9. Customer accepts proposal
10. Customer redirected to payment page
11. Customer completes payment (Helcim test mode)
12. Both parties see PAID status in their booking lists
```

### Scenario 2: Customer Declines Proposal
```
1. Complete steps 1-8 from Scenario 1
2. Customer clicks "Decline" on ProposalCard
3. Customer enters decline reason
4. Booking status shows CUSTOMER_DECLINED
5. Vendor sees declined status in their bookings list
```

### Scenario 3: Vendor Declines Inquiry
```
1. Customer submits inquiry (steps 1-4 from Scenario 1)
2. Vendor logs in, views inquiry
3. Vendor declines with reason
4. Booking status shows VENDOR_DECLINED
5. Customer sees declined status in their bookings
```

### Scenario 4: Proposal Expires
```
1. Complete steps 1-7 from Scenario 1
2. (Skip time or use short expiry for test)
3. Customer tries to accept expired proposal
4. Error message shown about expired proposal
5. Customer cannot proceed to payment
```

### Scenario 5: Mobile Responsive
```
1. Set viewport to mobile (375x667)
2. Run Scenario 1 key steps
3. Verify InquiryForm works on mobile
4. Verify ProposalCard readable on mobile
5. Verify payment form works on mobile
```

## Test Structure

### File: `e2e/inquiry-proposal-flow.spec.ts`

```typescript
import { test, expect } from "@playwright/test";
import { createTestCustomer, createTestVendor } from "./fixtures/booking-fixtures";

test.describe("Inquiry to Payment Flow", () => {
  test("complete happy path", async ({ page }) => {
    // Test implementation
  });

  test("customer declines proposal", async ({ page }) => {
    // Test implementation
  });

  test("vendor declines inquiry", async ({ page }) => {
    // Test implementation
  });

  test("proposal expiration", async ({ page }) => {
    // Test implementation
  });

  test.describe("mobile responsive", () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test("mobile inquiry submission", async ({ page }) => {
      // Test implementation
    });
  });
});
```

### File: `e2e/fixtures/booking-fixtures.ts`

```typescript
export async function createTestCustomer(page: Page) {
  // Create or login test customer
}

export async function createTestVendor(page: Page) {
  // Create or login test vendor
}

export async function createTestInquiry(page: Page, vendorId: string) {
  // Submit test inquiry
}
```

## Playwright MCP Usage
Use the Playwright MCP tools for browser automation:
- `mcp__playwright__browser_navigate` - Navigate to pages
- `mcp__playwright__browser_snapshot` - Capture accessibility tree
- `mcp__playwright__browser_click` - Click elements
- `mcp__playwright__browser_type` - Type in inputs
- `mcp__playwright__browser_fill_form` - Fill multiple fields
- `mcp__playwright__browser_take_screenshot` - Visual verification

## Key Pages to Test
- `/trucks` - Truck listing
- `/trucks/[id]` - Truck detail + booking form
- `/customer/bookings` - Customer booking list
- `/customer/messages/[bookingId]` - Customer messages with ProposalCard
- `/customer/bookings/[id]/pay` - Payment page
- `/vendor/bookings` - Vendor booking list
- `/vendor/messages/[bookingId]` - Vendor messages with ProposalBuilder

## Test Data
- Use test database (configured in playwright.config.ts)
- Helcim test mode with test card numbers
- Create fixtures for reusable test users

## Files to Create
- `e2e/inquiry-proposal-flow.spec.ts` (NEW)
- `e2e/fixtures/booking-fixtures.ts` (NEW or update existing)

## Acceptance Criteria
- [ ] All 5 scenarios have passing tests
- [ ] Mobile tests pass on 375x667 viewport
- [ ] Screenshots captured for visual verification
- [ ] Tests can run in CI pipeline
- [ ] Tests are independent (can run in isolation)

## Notes
- Helcim test cards: Use standard test card numbers from Helcim docs
- Take screenshots at key steps for debugging
- Use page.waitForURL() for navigation assertions
- Use page.waitForSelector() for dynamic content
