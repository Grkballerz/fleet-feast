# Briefing: Fleet-Feast-dhq

Generated: 2025-12-16T17:50:00Z
Agent: Parker_Pages

## Task Details

**Objective**: Update FeaturedTrucks.tsx to fetch real vendors from the /api/trucks API instead of using hardcoded mock data.

**Priority**: 1 (High)

**Acceptance Criteria**:
- [ ] Remove hardcoded mock truck data
- [ ] Fetch featured trucks from /api/trucks API
- [ ] Display coverImageUrl from API response as truck images
- [ ] Ensure truck IDs link correctly to truck detail pages
- [ ] Handle loading and error states appropriately

## Technical Specification

### Current State
FeaturedTrucks.tsx currently uses hardcoded mock data with placeholder images.

### Target State
Fetch real vendor data from API with AI-generated cover images.

### API Endpoint
```
GET /api/trucks?limit=5
```

Response includes:
```typescript
{
  id: string;
  businessName: string;
  description: string;
  cuisineType: string;
  rating: number;
  coverImageUrl: string | null;  // NEW - use this for truck image
  // ... other fields
}
```

### Implementation Options

1. **Server Component (Recommended)**
   - Fetch data server-side for SEO
   - No loading state needed on initial render

2. **Client Component with SWR/fetch**
   - Use React hooks for data fetching
   - Show loading skeleton while fetching

### Image Display
Use the coverImageUrl field from API response:
```tsx
<Image
  src={truck.coverImageUrl || '/images/placeholder-truck.jpg'}
  alt={truck.businessName}
  // ...
/>
```

### Link to Detail Pages
```tsx
<Link href={`/trucks/${truck.id}`}>
  {/* truck card */}
</Link>
```

## Dependencies Completed

- Fleet-Feast-3lk: coverImageUrl field added to Vendor model ✅
- Fleet-Feast-sh6: AI images generated ✅
- Fleet-Feast-76i: trucks service returns coverImageUrl ✅
- Fleet-Feast-0pq: seed data has coverImageUrl for 5 vendors ✅

## Files to Modify

- app/(public)/components/FeaturedTrucks.tsx

## Available Vendor Data

The following 5 vendors have coverImageUrl populated:
1. Tacos Loco NYC - /images/generated/tacos-loco-truck.webp
2. BBQ Masters - /images/generated/bbq-masters-truck.webp
3. Asian Fusion Express - /images/generated/asian-fusion-truck.webp
4. Italian Delight Truck - /images/generated/italian-delight-truck.webp
5. Seafood Shack on Wheels - /images/generated/seafood-shack-truck.webp

## This is the FINAL task in the chain!

Once complete, the homepage will display real featured trucks with AI-generated images.
