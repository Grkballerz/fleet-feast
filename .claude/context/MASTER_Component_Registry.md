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

*Last Updated: 2025-12-03*
