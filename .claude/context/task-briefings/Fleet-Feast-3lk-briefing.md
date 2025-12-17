# Briefing: Fleet-Feast-3lk

Generated: 2025-12-16T17:30:00Z
Agent: Dana_Database

## Task Details

**Objective**: Add a coverImageUrl field (nullable String) to the Vendor model in schema.prisma to store AI-generated food truck cover images.

**Priority**: 1 (High)

**Acceptance Criteria**:
- [ ] Add coverImageUrl field to Vendor model in prisma/schema.prisma
- [ ] Field should be nullable String type
- [ ] Field maps to cover_image_url in database (use @map)
- [ ] Run prisma migrate dev to create migration
- [ ] Verify migration succeeds without data loss

## Technical Specification

### Schema Change
```prisma
model Vendor {
  // ... existing fields ...
  coverImageUrl String? @map("cover_image_url")
  // ... rest of model ...
}
```

### Migration Steps
1. Add field to schema.prisma
2. Run: `npx prisma migrate dev --name add_vendor_cover_image_url`
3. Verify migration file created in prisma/migrations/
4. Confirm existing vendor data preserved

## Dependencies Completed

None - this is the first task in the chain.

## Files to Modify

- prisma/schema.prisma

## Downstream Dependents

This task blocks:
- Fleet-Feast-sh6: Generate AI images for food trucks
- Fleet-Feast-76i: Update trucks service to include coverImageUrl
- Fleet-Feast-0pq: Update seed data with coverImageUrl

## Gap Checklist

After completion, verify:
- [ ] Schema field correctly defined
- [ ] Migration created and applied
- [ ] Prisma client regenerated
- [ ] No breaking changes to existing queries
