# Task 2.17: Review & Rating System Backend

## Objective
Implement the review and rating system for post-event feedback tied to verified bookings.

## Requirements (from PRD)
- F10: Review & Rating System
- Post-event reviews: 1-5 star rating + written review
- Both customers and vendors can review each other
- Reviews tied to verified bookings only

## Acceptance Criteria
- [ ] POST /api/reviews - Submit review
- [ ] GET /api/reviews/[vendorId] - Get vendor reviews
- [ ] GET /api/reviews/user/[userId] - Get user reviews
- [ ] Only allow reviews after event completion
- [ ] One review per booking per party
- [ ] Rating aggregation calculation
- [ ] Review moderation flags
- [ ] Review response capability
- [ ] Pagination support

## Deliverables
- [ ] app/api/reviews/route.ts
- [ ] app/api/reviews/[vendorId]/route.ts
- [ ] app/api/reviews/user/[userId]/route.ts
- [ ] lib/reviews.ts (review logic)

## Dependencies
- [ ] Task 1.2 - Database Schema Design
- [ ] Task 2.11 - Booking Request Backend

## Assigned
Blake_Backend

## Priority
high

## Files
- app/api/reviews/route.ts
- app/api/reviews/[vendorId]/route.ts
- app/api/reviews/user/[userId]/route.ts
- lib/reviews.ts

## Status
[ ]
