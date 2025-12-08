# Task 2.11: Booking Request Backend

## Objective
Implement the request-to-book flow where customers submit booking requests and vendors accept/decline.

## Requirements (from PRD)
- F7: Request-to-Book Flow
- Customers submit booking requests with event details:
  - Date, time, location
  - Guest count
  - Event type
  - Special requests
- Vendors accept/decline within 48 hours
- Automatic expiration if no response

## Acceptance Criteria
- [ ] POST /api/bookings - Create booking request
- [ ] GET /api/bookings - List bookings (customer/vendor)
- [ ] GET /api/bookings/[id] - Get booking details
- [ ] PUT /api/bookings/[id]/accept - Vendor accepts
- [ ] PUT /api/bookings/[id]/decline - Vendor declines
- [ ] Booking status enum (pending, accepted, declined, confirmed, completed, cancelled)
- [ ] 48-hour auto-expiration job
- [ ] Email notifications on request/accept/decline
- [ ] Availability conflict check
- [ ] Price calculation based on guest count

## Deliverables
- [ ] app/api/bookings/route.ts
- [ ] app/api/bookings/[id]/route.ts
- [ ] app/api/bookings/[id]/accept/route.ts
- [ ] app/api/bookings/[id]/decline/route.ts
- [ ] lib/booking.ts (booking logic)

## Dependencies
- [ ] Task 1.2 - Database Schema Design
- [ ] Task 2.9 - Availability Calendar Backend

## Assigned
Blake_Backend

## Priority
high

## Files
- app/api/bookings/route.ts
- app/api/bookings/[id]/route.ts
- app/api/bookings/[id]/accept/route.ts
- app/api/bookings/[id]/decline/route.ts
- lib/booking.ts

## Status
[ ]
