# Task 2.15: In-App Messaging Backend

## Objective
Implement the in-app messaging system for booking-related communication with anti-circumvention filtering.

## Requirements (from PRD)
- F9: In-App Messaging
- All customer-vendor communication in-app
- NO phone numbers, emails, or external contact info
- Message history preserved
- F14: Anti-Circumvention Monitoring
- Message filtering for contact info patterns

## Acceptance Criteria
- [ ] POST /api/messages - Send message
- [ ] GET /api/messages/[bookingId] - Get conversation
- [ ] Message tied to booking
- [ ] Real-time updates (polling or WebSocket prep)
- [ ] Contact info pattern detection (phone, email, social)
- [ ] Flagged message handling
- [ ] Message timestamps
- [ ] Read status tracking
- [ ] Message pagination

## Deliverables
- [ ] app/api/messages/route.ts
- [ ] app/api/messages/[bookingId]/route.ts
- [ ] lib/messageFilter.ts (anti-circumvention)
- [ ] lib/patterns.ts (contact info regex patterns)

## Dependencies
- [ ] Task 1.2 - Database Schema Design
- [ ] Task 2.11 - Booking Request Backend

## Assigned
Blake_Backend

## Priority
high

## Files
- app/api/messages/route.ts
- app/api/messages/[bookingId]/route.ts
- lib/messageFilter.ts
- lib/patterns.ts

## Status
[ ]
