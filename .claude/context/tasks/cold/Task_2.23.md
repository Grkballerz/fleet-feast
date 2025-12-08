# Task 2.23: Violation & Penalty System Backend

## Objective
Implement the anti-circumvention violation tracking and graduated penalty system.

## Requirements (from PRD)
- F14: Anti-Circumvention Monitoring
  - Flag suspicious patterns
  - Repeated same customer-vendor pairings without bookings
  - Contact info sharing attempts
- F15: Penalty System
  - 1st offense: Warning
  - 2nd offense: 30-day suspension
  - 3rd offense: Permanent ban

## Acceptance Criteria
- [ ] POST /api/violations - Create violation record
- [ ] GET /api/violations/user/[userId] - Get user violations
- [ ] PUT /api/violations/[id]/appeal - Submit appeal
- [ ] Automatic penalty application
- [ ] Suspension enforcement in auth middleware
- [ ] Pattern detection for suspicious activity
- [ ] Violation severity levels
- [ ] Appeal workflow
- [ ] Admin violation management

## Deliverables
- [ ] app/api/violations/route.ts
- [ ] app/api/violations/user/[userId]/route.ts
- [ ] app/api/violations/[id]/appeal/route.ts
- [ ] lib/violations.ts (violation logic)
- [ ] lib/patternDetection.ts (suspicious activity detection)

## Dependencies
- [ ] Task 1.2 - Database Schema Design
- [ ] Task 2.15 - Messaging Backend (for pattern detection)

## Assigned
Blake_Backend

## Priority
high

## Files
- app/api/violations/route.ts
- app/api/violations/user/[userId]/route.ts
- app/api/violations/[id]/appeal/route.ts
- lib/violations.ts
- lib/patternDetection.ts

## Status
[ ]
