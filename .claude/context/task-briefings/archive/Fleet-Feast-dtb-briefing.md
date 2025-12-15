# Briefing: Fleet-Feast-dtb

Generated: 2025-12-15
Agent: Blake_Backend

## Task Details

**ID**: Fleet-Feast-dtb
**Title**: Homepage images don't load unless user is logged in
**Priority**: P1 (Critical)
**Category**: bugfix

## Problem Description

Homepage images (food truck photos, hero image) don't load for unauthenticated users. Images only appear after logging in. This is likely an auth middleware issue blocking public image assets.

## Root Cause Analysis

The middleware at `middleware.ts:74-84` has this matcher config:
```javascript
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
```

The issue is that static images served from `/images/generated/*.webp` (e.g., `/images/generated/hero-bg.webp`) are NOT excluded because:
1. The `public` exclusion expects literal "public" in the URL
2. But `public/` folder maps to `/` in Next.js, so images are at `/images/...` not `/public/images/...`
3. These paths don't match any explicit public route in `publicRoutes` array (line 14)

## Image Paths Being Blocked

From `app/(public)/components/HeroSection.tsx`:
- `/images/generated/hero-bg.webp`

From `app/(public)/components/FeaturedTrucks.tsx`:
- `/images/generated/truck-mexican.webp`
- `/images/generated/truck-american.webp`
- `/images/generated/truck-italian.webp`
- `/images/generated/truck-korean.webp`

## Acceptance Criteria

1. All homepage images load for unauthenticated (logged out) users
2. Hero background image displays properly
3. Featured truck images display properly
4. No regression for authenticated users
5. Security remains intact (protected routes still require auth)

## Recommended Fix

Update `middleware.ts` to exclude static image paths. Options:

**Option 1 (Recommended)**: Add image path patterns to the matcher exclusion:
```javascript
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|public).*)",
  ],
};
```

**Option 2**: Add image paths to publicRoutes check in the middleware function:
```javascript
if (
  pathname.startsWith("/images") ||
  // ... existing checks
) {
  return NextResponse.next();
}
```

## Files to Modify

- `middleware.ts` (lines 14-28 or 74-84)

## Testing

1. Log out of the application
2. Visit homepage at `/`
3. Verify hero background image loads
4. Verify all 4 featured truck images load
5. Check browser Network tab for 200 status on image requests
6. Log in and verify images still work

## PRD Reference

- F4: Food Truck Profiles - requires public profiles with photos
- F5: Search & Discovery - public search with truck images
