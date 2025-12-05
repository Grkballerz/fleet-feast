# Task Briefing: Fleet-Feast-pe7

**Generated**: 2025-12-05T12:20:00Z
**Agent**: Blake_Backend
**Task**: BLOCKER: Fix route group conflicts preventing production build
**Priority**: P0 (CRITICAL)
**Invocation**: 1

---

## Objective

Fix Next.js route group conflicts that prevent production build. Multiple route groups have pages resolving to identical URL paths.

## Current Conflicts

```
Cannot have two parallel pages that resolve to the same path:
1. /(admin)/page.tsx vs /(public)/page.tsx → both resolve to "/"
2. /(admin)/dashboard/page.tsx vs /(customer)/dashboard/page.tsx → both resolve to "/dashboard"
3. /(admin)/analytics/page.tsx vs /(vendor)/analytics/page.tsx → both resolve to "/analytics"
4. /(customer)/bookings/page.tsx vs /(vendor)/bookings/page.tsx → both resolve to "/bookings"
5. /(customer)/messages/page.tsx vs /(vendor)/messages/page.tsx → both resolve to "/messages"
```

## Existing Route Structure

```
app/
├── page.tsx                          # Root homepage
├── (auth)/                           # Auth routes - OK
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── ...
├── (public)/                         # Public routes
│   ├── page.tsx                      # CONFLICT with root
│   ├── about/page.tsx
│   ├── search/page.tsx
│   └── trucks/[id]/page.tsx
├── (admin)/                          # Admin routes
│   ├── page.tsx                      # CONFLICT with /(public)/page
│   ├── dashboard/page.tsx            # CONFLICT
│   ├── analytics/page.tsx            # CONFLICT
│   ├── vendors/page.tsx
│   ├── disputes/page.tsx
│   └── ...
├── (customer)/                       # Customer routes
│   ├── dashboard/page.tsx            # CONFLICT
│   ├── bookings/page.tsx             # CONFLICT
│   ├── messages/page.tsx             # CONFLICT
│   └── ...
├── (vendor)/                         # Vendor routes
│   ├── dashboard/page.tsx            # CONFLICT (with customer)
│   ├── bookings/page.tsx             # CONFLICT
│   ├── messages/page.tsx             # CONFLICT
│   ├── analytics/page.tsx            # CONFLICT (with admin)
│   └── ...
```

## Solution Strategy

**Option A (RECOMMENDED): Role-Prefixed Paths**

Move conflicting pages to role-specific URL paths:

```
BEFORE                          AFTER
/(admin)/dashboard/page.tsx     /admin/dashboard/page.tsx
/(customer)/dashboard/page.tsx  /customer/dashboard/page.tsx
/(vendor)/dashboard/page.tsx    /vendor/dashboard/page.tsx
```

**Implementation**:
1. Remove route groups for role-specific areas
2. Use explicit path segments: `/admin/`, `/customer/`, `/vendor/`
3. Keep `(public)` for truly public pages
4. Keep `(auth)` for authentication flows

**Option B: Single Page with Role-Based Views**

Use middleware + single page that renders different views:
- More complex, requires more refactoring
- Not recommended for this fix

## Recommended File Changes

### 1. Restructure Admin Routes
```
app/admin/                        # No parentheses = real URL segment
├── page.tsx                      # → /admin
├── dashboard/page.tsx            # → /admin/dashboard
├── analytics/page.tsx            # → /admin/analytics
├── vendors/page.tsx              # → /admin/vendors
├── disputes/page.tsx             # → /admin/disputes
├── violations/page.tsx           # → /admin/violations
└── users/page.tsx                # → /admin/users
```

### 2. Restructure Customer Routes
```
app/customer/                     # No parentheses
├── dashboard/page.tsx            # → /customer/dashboard
├── bookings/page.tsx             # → /customer/bookings
├── messages/page.tsx             # → /customer/messages
└── ...
```

### 3. Restructure Vendor Routes
```
app/vendor/                       # No parentheses
├── dashboard/page.tsx            # → /vendor/dashboard
├── bookings/page.tsx             # → /vendor/bookings
├── messages/page.tsx             # → /vendor/messages
├── analytics/page.tsx            # → /vendor/analytics
└── ...
```

### 4. Keep Public Routes (with fix)
```
app/(public)/                     # Keep as route group
├── about/page.tsx                # → /about
├── faq/page.tsx                  # → /faq
├── contact/page.tsx              # → /contact
├── search/page.tsx               # → /search
└── trucks/[id]/page.tsx          # → /trucks/[id]
```

Delete `app/(public)/page.tsx` - use `app/page.tsx` as homepage

### 5. Update Imports & Links

Search for and update all `Link` components and `router.push()` calls:
- `/dashboard` → `/admin/dashboard`, `/customer/dashboard`, or `/vendor/dashboard`
- `/analytics` → `/admin/analytics` or `/vendor/analytics`
- `/bookings` → `/customer/bookings` or `/vendor/bookings`

## Acceptance Criteria

- [ ] `npm run build` completes successfully
- [ ] No "parallel pages" error
- [ ] All admin routes accessible at `/admin/*`
- [ ] All customer routes accessible at `/customer/*`
- [ ] All vendor routes accessible at `/vendor/*`
- [ ] All internal links updated
- [ ] Middleware auth checks still work

## Files to Modify

**Move/Rename**:
- `app/(admin)/*` → `app/admin/*`
- `app/(customer)/*` → `app/customer/*`
- `app/(vendor)/*` → `app/vendor/*`

**Delete**:
- `app/(public)/page.tsx` (duplicate of root)
- `app/(admin)/page.tsx` (use dashboard as admin home)

**Update Links** (grep for these patterns):
- Components with `href="/dashboard"`
- Components with `href="/analytics"`
- Components with `href="/bookings"`
- Components with `href="/messages"`
- Navigation components
- Redirect logic

## Verification Steps

1. Run `npm run build` - must succeed
2. Run `npm run dev` and test all routes:
   - `/` - homepage
   - `/admin/dashboard` - admin dashboard
   - `/customer/dashboard` - customer dashboard
   - `/vendor/dashboard` - vendor dashboard
3. Test role-based redirects still work

---

*Briefing generated by MASTER Orchestrator*
