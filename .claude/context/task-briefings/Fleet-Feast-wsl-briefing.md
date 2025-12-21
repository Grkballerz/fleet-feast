# Task Briefing: Fleet-Feast-wsl

## Task Details
- **ID**: Fleet-Feast-wsl
- **Title**: Integrate and verify complete inquiry-proposal-payment flow
- **Priority**: P0
- **Agent**: Jordan_Junction
- **Phase**: 4 (Post-Completion Verification)

## Objective
Final integration verification to ensure all components of the inquiry-proposal-payment flow work together end-to-end. This is the last verification task before Phase 4 completion.

## Completed Predecessor Tasks
- ✅ Fleet-Feast-azl4: Helcim integration verified and fixed
- ✅ All booking components created (InquiryForm, ProposalCard, ProposalBuilder)
- ✅ All API endpoints implemented (inquiries, proposals, accept, decline)
- ✅ 102 integration tests created
- ✅ 1050+ lines of E2E tests created

## Integration Checklist

### 1. Frontend-Backend Connection
- [ ] InquiryForm submits to POST /api/inquiries correctly
- [ ] ProposalBuilder submits to POST /api/bookings/:id/proposal
- [ ] ProposalCard accept calls POST /api/bookings/:id/accept
- [ ] ProposalCard decline calls POST /api/bookings/:id/decline
- [ ] Error responses display user-friendly messages

### 2. State Management
- [ ] Booking status updates reflect in UI after actions
- [ ] Loading states during API calls
- [ ] Error recovery (retry mechanisms where appropriate)

### 3. Payment Integration
- [ ] Accept redirects to payment with correct amount
- [ ] Payment page shows customer fee (5%) separately
- [ ] Successful payment updates booking to PAID
- [ ] Failed payment shows error, allows retry

### 4. Notification Flow
- [ ] Inquiry triggers vendor notification
- [ ] Proposal triggers customer notification
- [ ] Accept triggers vendor notification
- [ ] Notifications link to correct pages

### 5. Edge Cases
- [ ] Expired proposal cannot be accepted (400 error)
- [ ] Network failure shows appropriate message
- [ ] Session timeout handled gracefully

## Key Files to Verify Integration

### Customer Flow
- `app/customer/booking/BookingClient.tsx` - InquiryForm integration
- `app/customer/messages/[bookingId]/page.tsx` - ProposalCard display
- `app/customer/bookings/[id]/pay/page.tsx` - Payment page

### Vendor Flow
- `app/vendor/messages/[bookingId]/page.tsx` - ProposalBuilder integration
- `app/vendor/bookings/page.tsx` - Booking list with statuses

### API Endpoints
- `app/api/inquiries/route.ts` - POST inquiry creation
- `app/api/bookings/[id]/proposal/route.ts` - POST proposal
- `app/api/bookings/[id]/accept/route.ts` - POST accept
- `app/api/bookings/[id]/decline/route.ts` - POST decline
- `app/api/payments/route.ts` - Payment processing

### Components
- `components/booking/InquiryForm.tsx`
- `components/booking/ProposalCard.tsx`
- `components/booking/ProposalBuilder.tsx`
- `components/payment/HelcimPaymentForm.tsx`

## Verification Approach
1. Review each integration point in the code
2. Trace data flow from frontend to backend
3. Verify correct HTTP methods, URLs, and payloads
4. Check error handling at each step
5. Verify notification triggers in API handlers
6. Use Playwright MCP for visual verification if needed

## Acceptance Criteria
- [ ] All integration points verified working
- [ ] No console errors in browser during flows
- [ ] No unhandled API errors in server logs
- [ ] Mobile and desktop flows work correctly
- [ ] All tests pass

## Notes
This is the FINAL verification task. After completion, Phase 4 (Post-Completion) is complete and the Helcim migration/inquiry-proposal feature set is ready for production.
