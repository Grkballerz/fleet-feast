# Briefing: Fleet-Feast-76i

Generated: 2025-12-16T17:35:00Z
Agent: Blake_Backend

## Task Details

**Objective**: Update the trucks service and types to include coverImageUrl in API responses.

**Priority**: 1 (High)

**Acceptance Criteria**:
- [ ] Add coverImageUrl to TruckSearchResult type
- [ ] Add coverImageUrl to TruckProfileWithDetails type
- [ ] Ensure searchTrucks function returns coverImageUrl
- [ ] Ensure getTruckProfile function returns coverImageUrl
- [ ] Verify API responses include the new field

## Technical Specification

### Files to Modify

1. **modules/trucks/trucks.types.ts**
   - Add coverImageUrl?: string to TruckSearchResult
   - Add coverImageUrl?: string to TruckProfileWithDetails

2. **modules/trucks/trucks.service.ts**
   - Update searchTrucks to select/return coverImageUrl from Vendor
   - Update getTruckProfile to include coverImageUrl

### Type Changes
```typescript
// In trucks.types.ts
export interface TruckSearchResult {
  // ... existing fields ...
  coverImageUrl?: string | null;
}

export interface TruckProfileWithDetails {
  // ... existing fields ...
  coverImageUrl?: string | null;
}
```

### Service Changes
Ensure Prisma queries include the coverImageUrl field when selecting vendor data.

## Dependencies Completed

- Fleet-Feast-3lk: coverImageUrl field added to Vendor model ✅

## Files to Modify

- modules/trucks/trucks.types.ts
- modules/trucks/trucks.service.ts

## Downstream Dependents

This task blocks:
- Fleet-Feast-dhq: Update FeaturedTrucks to fetch real vendors
