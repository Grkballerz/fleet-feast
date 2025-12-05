# Navigation & Layout System

## Overview

Fleet Feast's navigation and layout system provides a complete, responsive UI structure with role-based navigation, mobile-first design, and accessibility features.

## Architecture

### Component Hierarchy

```
Layout Components
├── MainLayout          # Public pages (home, search)
├── DashboardLayout     # Customer/Vendor dashboards
├── AuthLayout          # Login/Register pages
└── AdminLayout         # Admin-only pages

Supporting Components
├── Header              # Site header with navigation
├── Footer              # Site footer
├── Sidebar             # Desktop sidebar navigation
├── MobileNav           # Bottom mobile navigation
└── Breadcrumbs         # Navigation breadcrumbs

Navigation Components
├── NavLink             # Single navigation link with active state
├── NavMenu             # Group of navigation links
├── UserMenu            # User avatar/dropdown or login buttons
└── MobileDrawer        # Slide-out mobile menu
```

## Usage

### MainLayout

For public pages like home, search, and static content:

```tsx
import { MainLayout } from "@/components/layout";

export default function HomePage() {
  return (
    <MainLayout>
      <h1>Welcome to FleetFeast</h1>
      {/* Your page content */}
    </MainLayout>
  );
}
```

### DashboardLayout

For authenticated customer/vendor pages:

```tsx
import { DashboardLayout } from "@/components/layout";

export default function BookingsPage() {
  return (
    <DashboardLayout title="My Bookings" showBreadcrumbs>
      {/* Your dashboard content */}
    </DashboardLayout>
  );
}
```

### AuthLayout

For authentication pages (login, register, forgot password):

```tsx
import { AuthLayout } from "@/components/layout";

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your account"
    >
      <LoginForm />
    </AuthLayout>
  );
}
```

### AdminLayout

For admin-only pages (automatically redirects non-admins):

```tsx
import { AdminLayout } from "@/components/layout";

export default function PendingVendorsPage() {
  return (
    <AdminLayout
      title="Pending Vendors"
      showAdminBadge
    >
      {/* Admin content */}
    </AdminLayout>
  );
}
```

## Navigation Items

### Pre-defined Navigation Arrays

The system includes pre-defined navigation items for each role:

```tsx
// Customer navigation
import { customerNavItems } from "@/components/navigation";
// [Search Trucks, My Bookings, Messages, Favorites]

// Vendor navigation
import { vendorNavItems } from "@/components/navigation";
// [Dashboard, Bookings, Calendar, Messages, Profile]

// Admin navigation
import { adminNavItems } from "@/components/navigation";
// [Dashboard, Pending Vendors, Disputes, Users, Analytics]

// Public navigation
import { publicNavItems } from "@/components/navigation";
// [Home, Search, How It Works, For Vendors]
```

### Custom Navigation

You can also create custom navigation items:

```tsx
import { NavMenu, NavMenuItem } from "@/components/navigation";

const customNavItems: NavMenuItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  {
    label: "Admin Only",
    href: "/admin",
    roles: [UserRole.ADMIN] // Only shown to admins
  },
];

<NavMenu items={customNavItems} userRole={session?.user.role} />
```

## Responsive Behavior

### Breakpoints

- **Mobile**: < 1024px (lg)
  - Hamburger menu in header
  - Bottom mobile navigation bar
  - Slide-out drawer for menu

- **Desktop**: ≥ 1024px
  - Full navigation in header or sidebar
  - User menu in top-right
  - No mobile bottom bar

### Mobile Navigation

The mobile experience includes:

1. **Header**: Logo + Hamburger button
2. **Bottom Nav Bar**: Quick access to Home, Search, Messages, Menu
3. **Slide-out Drawer**: Full navigation menu

### Desktop Navigation

The desktop experience includes:

1. **Header**: Logo + Navigation links + Search + User menu
2. **Sidebar** (dashboards): Persistent left sidebar with navigation
3. **Breadcrumbs**: Contextual navigation path

## Role-Based Navigation

Navigation items automatically filter based on user role:

```tsx
// In NavMenu component
const filteredItems = items.filter(
  (item) => !item.roles || !userRole || item.roles.includes(userRole)
);
```

### User Menu Items by Role

**Guest (not logged in)**:
- Login button
- Sign Up button

**Customer**:
- My Dashboard
- My Bookings
- Messages
- Favorites
- Settings
- Logout

**Vendor**:
- Vendor Dashboard
- Bookings
- Calendar
- Profile
- Settings
- Logout

**Admin**:
- Admin Dashboard
- Pending Vendors
- Disputes
- Users
- Settings
- Logout

## Accessibility Features

All components include accessibility features:

### Keyboard Navigation
- Tab through navigation items
- Enter/Space to activate links
- Escape to close menus/drawers
- Arrow keys for dropdown navigation (future enhancement)

### ARIA Labels
- `aria-label` on buttons
- `aria-expanded` on toggles
- `aria-current="page"` on active links
- `role="menu"` and `role="menuitem"` on dropdowns

### Screen Reader Support
- Semantic HTML (`<nav>`, `<header>`, `<footer>`)
- Proper heading hierarchy
- Descriptive link text
- Alternative text for icons

### Focus Indicators
- Visible focus rings on all interactive elements
- High contrast focus styles
- Focus trap in mobile drawer

## Color System

Components use the Fleet Feast color palette:

```tsx
// Primary colors
bg-primary       // #B91C1C (red-700)
text-primary     // Brand red for links/accents
bg-primary-hover // #991B1B (red-800)

// Text colors
text-text-primary   // #111827 (gray-900)
text-text-secondary // #6B7280 (gray-500)

// Borders & backgrounds
border-border    // #E5E7EB (gray-200)
bg-background    // #F9FAFB (gray-50)
bg-secondary     // Light gray for hovers

// Semantic colors
bg-error         // Error/destructive actions
bg-success       // Success states
bg-warning       // Warning states
```

## Component Props

### MainLayout
- `children`: React.ReactNode (required)
- `showFooter`: boolean (default: true)
- `className`: string

### DashboardLayout
- `children`: React.ReactNode (required)
- `title`: string
- `showBreadcrumbs`: boolean (default: true)
- `className`: string

### AuthLayout
- `children`: React.ReactNode (required)
- `title`: string
- `subtitle`: string
- `className`: string

### AdminLayout
- `children`: React.ReactNode (required)
- `title`: string
- `showBreadcrumbs`: boolean (default: true)
- `showAdminBadge`: boolean (default: true)
- `className`: string

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Android)
- Graceful degradation for older browsers

## Performance

- Client-side components for interactivity
- Next.js Image optimization for logos/images
- Lazy loading for mobile drawer
- Minimal re-renders with proper React hooks

## Future Enhancements

- [ ] Add mega menu for complex navigation structures
- [ ] Implement notification badges on nav items
- [ ] Add keyboard shortcuts (Cmd+K for search)
- [ ] Support for sub-navigation/nested menus
- [ ] Dark mode support
- [ ] Animation improvements for mobile drawer
