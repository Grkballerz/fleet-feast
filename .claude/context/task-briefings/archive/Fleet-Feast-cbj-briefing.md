# Briefing: Fleet-Feast-cbj

Generated: 2025-12-15
Agent: Jordan_Junction

## Task Details

**ID**: Fleet-Feast-cbj
**Title**: Dashboard sidebar FOIC - customer nav flashes before vendor nav loads
**Priority**: P2 (High)
**Category**: bugfix

## Problem Description

On vendor dashboard pages, the sidebar initially shows customer navigation links before updating to vendor navigation. This is a hydration/SSR issue causing Flash of Incorrect Content (FOIC).

## Technical Analysis

The `Sidebar` component at `components/layout/Sidebar.tsx` receives `items` and `userRole` as props. The issue is likely that:

1. During SSR or initial hydration, the session hasn't loaded yet
2. Component renders with default/customer items
3. Once session loads (client-side), it re-renders with correct vendor items

## Current Sidebar Implementation

From `components/layout/Sidebar.tsx`:
```jsx
export const Sidebar: React.FC<SidebarProps> = ({
  items,
  userRole,
  className,
}) => {
  return (
    <aside className="...">
      {/* Logo */}
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4">
        <NavMenu items={items} userRole={userRole} mobile />
      </nav>
      {/* Footer */}
    </aside>
  );
};
```

The Sidebar is a client component ("use client") but the issue is the parent component passing wrong items initially.

## Root Cause Locations

Check these dashboard layouts:
- `app/vendor/layout.tsx` or similar
- `app/customer/layout.tsx`
- Any component that determines which nav items to pass to Sidebar

## Acceptance Criteria

1. No flash of incorrect navigation content on page load
2. Sidebar shows correct role-specific nav immediately (or loading state)
3. Works for vendor dashboard
4. Works for customer dashboard
5. Works for admin dashboard
6. No layout shift during hydration

## Recommended Solutions

**Option 1: Loading skeleton until session ready**
```jsx
const { data: session, status } = useSession();

if (status === "loading") {
  return <SidebarSkeleton />;
}
```

**Option 2: Server-side session check**
Use Next.js server components to get session before render

**Option 3: CSS transition to hide flash**
Start with opacity 0, fade in after hydration (less ideal but quick fix)

## Files to Investigate/Modify

1. Dashboard layout files:
   - `app/vendor/layout.tsx`
   - `app/customer/layout.tsx`
   - `app/admin/layout.tsx`

2. `components/layout/Sidebar.tsx` - may need loading state

3. Components using useSession that pass items to Sidebar

## Testing

1. Hard refresh vendor dashboard page
2. Watch for any flash of customer nav items
3. Check Network tab - note when session loads
4. Test on slow network (throttle to Slow 3G)
5. Repeat for customer and admin dashboards
6. Verify no flash and correct nav appears
