# Briefing: Fleet-Feast-4pk

Generated: 2025-12-15
Agent: Parker_Pages

## Task Details

**ID**: Fleet-Feast-4pk
**Title**: Missing /unauthorized page shows 404 instead of proper error message
**Priority**: P1 (Critical)
**Category**: bugfix

## Problem Description

When non-authorized users access protected routes (like /admin), they get redirected to `/unauthorized` which returns a 404 page instead of a proper unauthorized message. The `/unauthorized` page doesn't exist.

## Current Behavior

1. User logs in as CUSTOMER
2. User manually navigates to `/admin/dashboard`
3. Middleware redirects to `/unauthorized` (line 54 of middleware.ts)
4. User sees 404 page

## Expected Behavior

1. User should see a styled "Unauthorized" page
2. Page explains they don't have permission
3. Provides link back to their appropriate dashboard or home

## Reference: Middleware Redirect Code

From `middleware.ts:49-65`:
```javascript
// Admin routes
if (pathname.startsWith("/admin") && role !== "ADMIN") {
  return NextResponse.redirect(new URL("/unauthorized", request.url));
}

// Vendor routes
if (pathname.startsWith("/vendor") && !pathname.startsWith("/vendor/apply") && role !== "VENDOR") {
  return NextResponse.redirect(new URL("/unauthorized", request.url));
}

// Customer routes
if (pathname.startsWith("/customer") && role !== "CUSTOMER") {
  return NextResponse.redirect(new URL("/unauthorized", request.url));
}
```

## Acceptance Criteria

1. Create `/unauthorized` page at `app/unauthorized/page.tsx`
2. Page matches neo-brutalist design system
3. Shows clear "Access Denied" or "Unauthorized" message
4. Includes explanation text
5. Has button/link to go back home or to appropriate dashboard
6. Works for all user roles (including logged-out users)

## Design Guidelines

Follow existing neo-brutalist glassmorphism design:
- Use `neo-glass-brutal` or similar glass effect
- Use `neo-heading` for titles
- Use `neo-btn-primary` or `neo-btn-secondary` for buttons
- Match color scheme: primary red (#B91C1C), white backgrounds
- Include appropriate icon (lock, shield, or similar)

## Reference: Similar Page Structure

Look at `app/(auth)/login/page.tsx` and `app/(auth)/register/page.tsx` for styling patterns.

## Files to Create

- `app/unauthorized/page.tsx`

## Testing

1. Log in as CUSTOMER
2. Navigate to `/admin` - should see unauthorized page
3. Log in as VENDOR
4. Navigate to `/admin` - should see unauthorized page
5. Navigate to `/customer` - should see unauthorized page
6. Test "Go Home" or "Go Back" button works
