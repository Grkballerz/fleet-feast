# Task 2.28: Customer Favorites & Loyalty

## Objective
Implement customer favorites and loyalty discount program features.

## Requirements (from PRD)
- F16: Loyalty Discount Program
  - Repeat customers get 5% discount on subsequent bookings
  - Platform absorbs cost (reduced commission)
- F20: Customer Favorites
  - Customers can save favorite trucks

## Acceptance Criteria
- [ ] POST /api/favorites - Add to favorites
- [ ] DELETE /api/favorites/[vendorId] - Remove from favorites
- [ ] GET /api/favorites - List favorites
- [ ] Loyalty discount calculation
- [ ] Repeat booking detection
- [ ] Discount application at checkout
- [ ] Commission adjustment for loyalty
- [ ] Favorites display on dashboard
- [ ] Quick book from favorites

## Deliverables
- [ ] app/api/favorites/route.ts
- [ ] app/api/favorites/[vendorId]/route.ts
- [ ] lib/loyalty.ts (loyalty discount logic)
- [ ] components/favorites/FavoriteButton.tsx
- [ ] app/customer/favorites/page.tsx

## Dependencies
- [ ] Task 2.11 - Booking Backend
- [ ] Task 2.13 - Payment Integration

## Assigned
Blake_Backend

## Priority
medium

## Files
- app/api/favorites/route.ts
- app/api/favorites/[vendorId]/route.ts
- lib/loyalty.ts
- components/favorites/FavoriteButton.tsx
- app/customer/favorites/page.tsx

## Status
[ ]
