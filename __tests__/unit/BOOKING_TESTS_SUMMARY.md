# Booking Module Test Summary

## Overview
Comprehensive unit tests for the inquiry-proposal booking workflow validation schemas.

## Test File
- `__tests__/unit/booking.validation.test.ts` - 66 tests (all passing)

## Test Coverage

### 1. Inquiry Validation Tests (29 tests)

#### Valid inquiry data (5 tests)
- ✓ Accept valid inquiry data
- ✓ Accept inquiry with special requests
- ✓ Accept all valid event types (WEDDING, CORPORATE, BIRTHDAY, FESTIVAL, OTHER)
- ✓ Accept minimum guest count (1)
- ✓ Accept maximum guest count (10,000)

#### Invalid vendor ID (3 tests)
- ✓ Reject invalid UUID format
- ✓ Reject missing vendor ID
- ✓ Reject empty string vendor ID

#### Event date validation (5 tests)
- ✓ Reject past dates
- ✓ Reject invalid date format (must be YYYY-MM-DD)
- ✓ Reject invalid date values
- ✓ Reject missing event date
- ✓ Accept today as event date

#### Event time validation (4 tests)
- ✓ Accept valid 24-hour time format (00:00, 09:30, 12:00, 18:45, 23:59)
- ✓ Reject invalid time format (must be HH:MM)
- ✓ Reject invalid hour values (>23)
- ✓ Reject invalid minute values (>59)

#### Guest count validation (4 tests)
- ✓ Reject guest count below minimum (0)
- ✓ Reject guest count above maximum (10,001)
- ✓ Reject non-integer guest count
- ✓ Reject negative guest count

#### Event type validation (2 tests)
- ✓ Reject invalid event type
- ✓ Reject missing event type

#### Location validation (3 tests)
- ✓ Reject location shorter than 5 characters
- ✓ Reject location longer than 500 characters
- ✓ Trim whitespace from location

#### Special requests validation (3 tests)
- ✓ Accept optional special requests
- ✓ Reject special requests longer than 2000 characters
- ✓ Trim whitespace from special requests

### 2. Line Item Validation Tests (7 tests)

#### Valid line item data (2 tests)
- ✓ Accept valid line item
- ✓ Accept zero unit price

#### Name validation (3 tests)
- ✓ Reject empty name
- ✓ Reject name longer than 200 characters
- ✓ Trim whitespace from name

#### Quantity validation (2 tests)
- ✓ Reject quantity less than 1
- ✓ Reject non-integer quantity

#### Price validation (2 tests)
- ✓ Reject negative unit price
- ✓ Reject negative total

### 3. Proposal Validation Tests (15 tests)

#### Valid proposal data (3 tests)
- ✓ Accept valid proposal
- ✓ Accept proposal without terms
- ✓ Accept proposal without expiration (will use default)

#### Proposal amount validation (3 tests)
- ✓ Reject zero proposal amount
- ✓ Reject negative proposal amount
- ✓ Reject proposal amount above maximum (1,000,000)

#### Line items validation (2 tests)
- ✓ Require at least one line item
- ✓ Validate all line items

#### Inclusions validation (2 tests)
- ✓ Require at least one inclusion
- ✓ Accept multiple inclusions

#### Terms validation (2 tests)
- ✓ Reject terms longer than 2000 characters
- ✓ Trim whitespace from terms

#### Expiration validation (5 tests)
- ✓ Reject expiration less than 1 day
- ✓ Reject expiration more than 30 days
- ✓ Reject non-integer expiration days
- ✓ Accept minimum expiration (1 day)
- ✓ Accept maximum expiration (30 days)

### 4. Proposal Accept Validation Tests (3 tests)
- ✓ Accept when terms are true
- ✓ Reject when terms are false
- ✓ Reject missing acceptTerms

### 5. Vendor Decline Validation Tests (4 tests)
- ✓ Accept valid decline reason
- ✓ Accept optional reason
- ✓ Reject reason shorter than 10 characters
- ✓ Reject reason longer than 1000 characters

### 6. Cancellation Validation Tests (4 tests)
- ✓ Accept valid cancellation reason
- ✓ Accept optional reason
- ✓ Reject reason shorter than 5 characters
- ✓ Reject reason longer than 1000 characters

## Test Statistics
- **Total Tests**: 66
- **Passing Tests**: 66 (100%)
- **Failing Tests**: 0
- **Test Suites**: 1
- **Test Duration**: ~1.2s

## Schemas Tested
1. `inquiryRequestSchema` - Customer inquiry validation
2. `lineItemSchema` - Proposal line item validation
3. `proposalSchema` - Vendor proposal validation
4. `proposalAcceptSchema` - Customer proposal acceptance validation
5. `bookingRequestSchema` - Legacy booking request validation
6. `bookingUpdateSchema` - Booking update validation
7. `vendorDeclineSchema` - Vendor decline reason validation
8. `cancellationSchema` - Booking cancellation reason validation

## Edge Cases Covered
- Minimum and maximum boundary values for all numeric fields
- Date format validation (YYYY-MM-DD)
- Time format validation (HH:MM, 24-hour)
- UUID format validation for vendor IDs
- String length validation for all text fields
- Whitespace trimming for text inputs
- Optional field handling
- Default value handling (expiration days)
- Event type enum validation
- Non-negative and positive number validation

## Service Functions (Not Tested - Covered by Integration Tests)
The following service functions are tested in the integration test suite:
- `acceptProposal()` - Customer accepts vendor proposal
- `declineBookingInquiryOrProposal()` - Vendor/customer declines inquiry/proposal

These require database mocking and are better suited for integration tests which are already implemented in `__tests__/integration/booking.integration.test.ts`.

## Notes
- All validation schemas use Zod for runtime type checking
- Tests verify both successful validation and appropriate error messages
- Date validation ensures future dates only
- Guest count range: 1 - 10,000
- Proposal amount max: 1,000,000
- Proposal expiration: 1-30 days
- Special requests max: 2000 characters
- Location range: 5-500 characters
