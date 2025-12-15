# Briefing: Fleet-Feast-mz4

Generated: 2025-12-15
Agent: Casey_Components

## Task Details

**ID**: Fleet-Feast-mz4
**Title**: Mobile menu missing public navigation links for authenticated users
**Priority**: P2 (High)
**Category**: bugfix

## Problem Description

When authenticated users (vendors/customers) open the mobile menu, only role-specific navigation is shown. Public links (Home, Search, How It Works, For Vendors) are missing, limiting navigation options.

## Current Behavior

From `components/layout/Header.tsx:38-53`:
```javascript
const getNavItems = () => {
  if (!session) {
    return publicNavItems;
  }

  switch (session.user.role) {
    case UserRole.CUSTOMER:
      return customerNavItems;  // Only customer-specific items
    case UserRole.VENDOR:
      return vendorNavItems;    // Only vendor-specific items
    case UserRole.ADMIN:
      return adminNavItems;     // Only admin-specific items
    default:
      return publicNavItems;
  }
};
```

When logged in, users ONLY see their role-specific nav items and lose access to public navigation like:
- Home
- Search (find food trucks)
- How It Works
- For Vendors (apply link)

## Expected Behavior

Mobile menu should show:
1. Public navigation links (always visible)
2. Role-specific navigation links (when authenticated)
3. Clear visual separation between public and role sections

## Acceptance Criteria

1. Authenticated users see public nav items in mobile menu
2. Public items appear in addition to (not instead of) role items
3. Clear visual grouping/separation between public and role sections
4. Works for CUSTOMER, VENDOR, and ADMIN roles
5. Desktop navigation behavior unchanged (if different)

## Recommended Approach

Option 1: Combine nav arrays for mobile
```javascript
const getNavItems = () => {
  if (!session) {
    return publicNavItems;
  }

  // For mobile, include public items + role items
  const roleItems = getRoleItems(session.user.role);
  return [...publicNavItems, ...roleItems];
};
```

Option 2: Pass both arrays to NavMenu for mobile display with separator

## Files to Modify

- `components/layout/Header.tsx` (getNavItems function, lines 38-53)
- Possibly `components/navigation/NavMenu.tsx` if grouping logic needed

## Related Components

- `components/navigation/MobileDrawer.tsx` - renders the drawer
- `components/navigation/NavMenu.tsx` - renders navigation items

## Testing

1. Log in as CUSTOMER on mobile viewport
2. Open mobile menu - verify Home, Search visible
3. Log in as VENDOR on mobile viewport
4. Open mobile menu - verify Home, Search visible
5. Verify role-specific items still appear
6. Check visual separation is clear
7. Test all nav links work correctly
