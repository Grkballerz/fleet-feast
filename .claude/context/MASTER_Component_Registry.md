# MASTER Component Registry

Track all UI components, design tokens, and styling utilities for Fleet Feast.

---

## Design System Components

### Global Styles & Theme (Task 2.25)
**Status**: Complete
**Files**:
- `tailwind.config.ts` - Enhanced Tailwind configuration
- `app/globals.css` - Global styles with CSS custom properties
- `styles/theme.css` - Component-level tokens and theme utilities
- `styles/README.md` - Complete design system documentation

**Design Tokens**:
- Colors: Primary (#B91C1C), Success (#059669), Warning (#D97706), Error (#DC2626)
- Typography: Inter font, 9 size scales (12px-48px), 4 weights (400-700)
- Spacing: 4px base scale (0-256px)
- Border Radius: 4px-full (sm, md, lg, xl, 2xl, full)
- Shadows: 6 elevation levels (sm, default, md, lg, xl, 2xl)
- Animations: 10+ keyframe animations (fade, slide, scale, shimmer, pulse)

**Component Classes**:
- Typography: `.heading-1` through `.heading-4`, `.body-text`, `.small-text`, `.caption-text`
- Buttons: `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-destructive` with size variants
- Cards: `.card`, `.card-interactive`, `.card-compact`, `.card-spacious`
- Inputs: `.input`, `.textarea`, `.select`, `.label`, `.input-error`, `.error-message`
- Badges: `.badge-success`, `.badge-warning`, `.badge-error`, `.badge-neutral`, `.badge-primary`
- Containers: `.container-custom`, `.container-narrow`, `.container-wide`
- Loading: `.spinner`, `.skeleton`, `.skeleton-text`, `.skeleton-circle`
- Utilities: `.divider`, `.focus-ring`, `.truncate-2`, `.truncate-3`, `.gradient-primary`, `.glass`

**Accessibility Features**:
- Focus ring styles on all interactive elements
- Reduced motion support (@media prefers-reduced-motion)
- Screen reader utilities (`.sr-only`, `.sr-only-focusable`)
- Skip link (`.skip-link`)
- WCAG AA color contrast (4.5:1 minimum)

**Dark Mode Foundation**:
- CSS variables for light/dark themes
- `.dark` class support ready
- Component-specific dark mode overrides

**Dependencies**:
- `tailwindcss`: ^3.4.13
- `tailwindcss-animate`: ^1.0.7
- `@tailwindcss/container-queries`: ^0.1.1

**Used In**: All components, pages, and layouts

**Maintained By**: Sam_Styler

---

## Component Template

```markdown
### [Component Name] (Task X.X)
**Status**: [Pending | In Progress | Complete]
**Path**: `path/to/component.tsx`
**Description**: Brief description

**Props**:
- `propName` (type): Description

**Variants**: List variants

**Used In**: List pages/components

**Dependencies**: List dependencies
```

---

## Vendor Application Components (Task Fleet-Feast-qm9)
**Status**: Complete
**Agent**: Parker_Pages
**Date**: 2025-12-05

### Multi-Step Application Form
**Path**: `app/(vendor)/apply/`
**Description**: Complete vendor application flow with 5 steps, progress tracking, and auto-save functionality

**Components**:
- `ApplicationForm.tsx` - Parent component with state management and validation
- `ProgressIndicator.tsx` - Step indicator with mobile/desktop layouts
- `Step1BusinessInfo.tsx` - Business information form
- `Step2Documents.tsx` - Document upload with drag-and-drop
- `Step3Menu.tsx` - Menu item CRUD interface
- `Step4Availability.tsx` - Availability calendar and pricing model
- `Step5Preview.tsx` - Review and submit with terms acceptance

**Features**:
- 5-step multi-form with progress indicator
- Client-side validation per step
- Auto-save to localStorage
- Server-side draft persistence (PUT /api/vendor/profile)
- Drag-and-drop file upload
- Real-time file upload with progress
- Menu item CRUD with modal
- Interactive 90-day calendar
- Recurring availability patterns
- Complete application preview
- Terms acceptance checkbox
- Error handling and validation feedback

**Type Definitions**: `types/vendor-application.ts`
- ApplicationState, BusinessInfoData, DocumentData
- MenuItemData, AvailabilityData, ValidationErrors
- DocumentType, PricingModel, DietaryTag, AvailabilityPattern enums

**Pages**:
- `app/(vendor)/apply/page.tsx` - Main application page
- `app/(vendor)/apply/layout.tsx` - Layout with DashboardLayout
- `app/(vendor)/apply/success/page.tsx` - Success confirmation page

**API Integration**:
- POST `/api/vendor/apply` - Submit application
- POST `/api/vendor/documents` - Upload documents
- PUT `/api/vendor/profile` - Save draft
- GET `/api/vendor/profile` - Load existing data

**Dependencies**:
- DashboardLayout component
- UI components: Button, Input, Card, Alert, Spinner, Badge, Modal
- Next.js 14 App Router
- React hooks for state management

**Used In**: Vendor onboarding flow

**Maintained By**: Parker_Pages

---

*Last Updated: 2025-12-05*
