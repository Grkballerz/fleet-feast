# Briefing: Fleet-Feast-0pq

Generated: 2025-12-16T17:45:00Z
Agent: Dana_Database

## Task Details

**Objective**: Update prisma/seed.ts to set coverImageUrl for the first 5 approved vendors using the generated AI images.

**Priority**: 1 (High)

**Acceptance Criteria**:
- [ ] Update seed.ts with coverImageUrl for 5 vendors
- [ ] Use correct image paths from public/images/generated/
- [ ] Re-run seed to update database
- [ ] Verify vendors have coverImageUrl populated

## Vendor Image Mappings

Update these 5 vendors in prisma/seed.ts:

| Vendor Name | coverImageUrl Path |
|-------------|-------------------|
| Tacos Loco | /images/generated/tacos-loco-truck.webp |
| BBQ Masters | /images/generated/bbq-masters-truck.webp |
| Asian Fusion Express | /images/generated/asian-fusion-truck.webp |
| Italian Delight | /images/generated/italian-delight-truck.webp |
| Seafood Shack | /images/generated/seafood-shack-truck.webp |

## Technical Specification

### In prisma/seed.ts

Find the vendor creation/update section and add coverImageUrl:

```typescript
// Example for Tacos Loco vendor
{
  // ... existing vendor fields ...
  coverImageUrl: '/images/generated/tacos-loco-truck.webp',
}
```

### Re-seed Command
```bash
npx prisma db seed
```

## Dependencies Completed

- Fleet-Feast-3lk: coverImageUrl field added to Vendor model ✅
- Fleet-Feast-sh6: AI images generated in public/images/generated/ ✅

## Files to Modify

- prisma/seed.ts

## Downstream Dependents

This task blocks:
- Fleet-Feast-dhq: Update FeaturedTrucks to fetch real vendors from API
