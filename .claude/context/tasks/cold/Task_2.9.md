# Task 2.9: Availability Calendar Backend

## Objective
Implement the vendor availability calendar system for managing bookable dates.

## Requirements (from PRD)
- F6: Availability Calendar
- Vendors manage their availability calendar
- Customers see real-time availability when searching
- Block dates, set recurring availability

## Acceptance Criteria
- [ ] GET /api/vendors/[id]/availability - Get availability for date range
- [ ] PUT /api/vendors/[id]/availability - Update availability
- [ ] POST /api/vendors/[id]/availability/block - Block specific dates
- [ ] DELETE /api/vendors/[id]/availability/block/[id] - Unblock date
- [ ] Recurring availability patterns support
- [ ] Automatic blocking when booking confirmed
- [ ] Conflict detection
- [ ] Date range queries optimized

## Deliverables
- [ ] app/api/vendors/[id]/availability/route.ts
- [ ] app/api/vendors/[id]/availability/block/route.ts
- [ ] lib/availability.ts (availability logic)

## Dependencies
- [ ] Task 1.2 - Database Schema Design
- [ ] Task 2.5 - Food Truck Profile Backend

## Assigned
Blake_Backend

## Priority
high

## Files
- app/api/vendors/[id]/availability/route.ts
- app/api/vendors/[id]/availability/block/route.ts
- lib/availability.ts

## Status
[ ]
