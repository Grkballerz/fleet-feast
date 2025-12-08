# Task 2.7: Search & Discovery Backend

## Objective
Implement the food truck search API with filters, sorting, and PostgreSQL full-text search.

## Requirements (from PRD)
- F5: Search & Discovery
- Search filters:
  - Cuisine type
  - Price range
  - Event type
  - Guest capacity
  - Availability date
  - Rating
- Location-based results for NYC
- PostgreSQL full-text search

## Acceptance Criteria
- [ ] GET /api/search/trucks - Main search endpoint
- [ ] Filter by cuisine type (multi-select)
- [ ] Filter by price range (min/max)
- [ ] Filter by event type
- [ ] Filter by capacity (guest count)
- [ ] Filter by availability date
- [ ] Filter by minimum rating
- [ ] Sort by: rating, price, reviews count
- [ ] Full-text search on name, description, menu
- [ ] Pagination with cursor/offset
- [ ] Location filtering (NYC area)
- [ ] Response time < 1 second

## Deliverables
- [ ] app/api/search/trucks/route.ts
- [ ] lib/search.ts (search utility functions)
- [ ] Database indexes for search performance

## Dependencies
- [ ] Task 1.2 - Database Schema Design
- [ ] Task 2.5 - Food Truck Profile Backend

## Assigned
Blake_Backend

## Priority
high

## Files
- app/api/search/trucks/route.ts
- lib/search.ts
- prisma/migrations/ (search indexes)

## Status
[ ]
