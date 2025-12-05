# Fleet Feast Design System

Complete styling guide for the Fleet Feast food truck marketplace platform.

## Table of Contents

- [Design Tokens](#design-tokens)
- [Color System](#color-system)
- [Typography](#typography)
- [Spacing](#spacing)
- [Components](#components)
- [Animations](#animations)
- [Accessibility](#accessibility)
- [Usage Examples](#usage-examples)

---

## Design Tokens

All design tokens are defined in:
- **Tailwind Config**: `tailwind.config.ts` - Tailwind utility classes
- **CSS Variables**: `app/globals.css` - Global CSS custom properties
- **Theme System**: `styles/theme.css` - Component-level tokens

---

## Color System

### Brand Colors (from PRD)

| Color | Hex | Usage | Tailwind Class |
|-------|-----|-------|----------------|
| Primary | `#B91C1C` | CTAs, headers, brand elements | `bg-primary`, `text-primary` |
| Primary Hover | `#991B1B` | Button hover states | `hover:bg-primary-hover` |
| Success | `#059669` | Confirmations, success states | `bg-success`, `text-success` |
| Warning | `#D97706` | Warnings, pending states | `bg-warning`, `text-warning` |
| Error | `#DC2626` | Errors, destructive actions | `bg-error`, `text-error` |

### Neutral Colors

| Color | Hex | Usage | Tailwind Class |
|-------|-----|-------|----------------|
| Text Primary | `#111827` | Headings, body text | `text-text-primary` |
| Text Secondary | `#6B7280` | Captions, secondary info | `text-text-secondary` |
| Background | `#F9FAFB` | Page backgrounds | `bg-background` |
| Card | `#FFFFFF` | Content cards | `bg-card` |
| Border | `#E5E7EB` | Card borders, dividers | `border-border` |

### Full Color Scales

Complete 50-900 scales available for:
- `primary-{50-900}` (Red scale)
- `success-{50-900}` (Emerald scale)
- `warning-{50-900}` (Amber scale)
- `error-{50-900}` (Red scale)
- `gray-{50-900}` (Gray scale)

---

## Typography

### Font Family

- **Primary**: Inter (loaded via `next/font`)
- **Fallback**: `system-ui`, `-apple-system`, `sans-serif`

### Font Sizes (from PRD)

| Name | Size | Line Height | Weight | Usage |
|------|------|-------------|--------|-------|
| `text-xs` | 12px | 1.0 | 400 | Captions, labels |
| `text-sm` | 14px | 1.25 | 400 | Small text, buttons |
| `text-base` | 16px | 1.5 | 400 | Body text |
| `text-lg` | 18px | 1.75 | 400 | Large body text |
| `text-xl` | 20px | 1.75 | 500 | Subheadings |
| `text-2xl` | 24px | 2.0 | 600 | H3 headings |
| `text-3xl` | 30px | 2.25 | 600 | H2 headings |
| `text-4xl` | 36px | 2.5 | 700 | H1 headings |
| `text-5xl` | 48px | 1.2 | 700 | Hero headings |

### Font Weights

| Name | Value | Tailwind Class |
|------|-------|----------------|
| Normal | 400 | `font-normal` |
| Medium | 500 | `font-medium` |
| Semibold | 600 | `font-semibold` |
| Bold | 700 | `font-bold` |

### Line Heights

| Name | Value | Tailwind Class |
|------|-------|----------------|
| Tight | 1.2 | `leading-tight` |
| Normal | 1.5 | `leading-normal` |
| Relaxed | 1.75 | `leading-relaxed` |

### Utility Classes

```html
<!-- Heading Classes -->
<h1 class="heading-1">Main Heading</h1>
<h2 class="heading-2">Section Heading</h2>
<h3 class="heading-3">Subsection Heading</h3>
<h4 class="heading-4">Card Heading</h4>

<!-- Text Classes -->
<p class="body-text">Regular body text</p>
<p class="body-text-secondary">Secondary body text</p>
<p class="small-text">Small descriptive text</p>
<p class="caption-text">Caption or label text</p>
```

---

## Spacing

Base scale: **4px** (0.25rem)

### Spacing Scale

| Name | Size | Pixels | Usage |
|------|------|--------|-------|
| `0` | 0 | 0px | No spacing |
| `1` | 0.25rem | 4px | Tiny gaps |
| `2` | 0.5rem | 8px | Small gaps |
| `3` | 0.75rem | 12px | Medium gaps |
| `4` | 1rem | 16px | Standard gaps |
| `5` | 1.25rem | 20px | Large gaps |
| `6` | 1.5rem | 24px | Section spacing |
| `8` | 2rem | 32px | Card padding |
| `10` | 2.5rem | 40px | Large spacing |
| `12` | 3rem | 48px | Section spacing |
| `16` | 4rem | 64px | Hero spacing |
| `20` | 5rem | 80px | Page spacing |
| `24` | 6rem | 96px | Large sections |

### Usage

```html
<!-- Padding -->
<div class="p-4">Standard padding (16px)</div>
<div class="px-6 py-3">Horizontal 24px, Vertical 12px</div>

<!-- Margin -->
<div class="mt-8">Top margin 32px</div>
<div class="mb-4">Bottom margin 16px</div>

<!-- Gap (Flexbox/Grid) -->
<div class="flex gap-4">Flex with 16px gap</div>
<div class="grid gap-6">Grid with 24px gap</div>
```

---

## Border Radius

| Name | Size | Pixels | Usage | Tailwind Class |
|------|------|--------|-------|----------------|
| `sm` | 0.25rem | 4px | Small elements | `rounded-sm` |
| Default | 0.5rem | 8px | Buttons, inputs | `rounded` or `rounded-md` |
| `lg` | 0.75rem | 12px | Cards | `rounded-lg` |
| `xl` | 1rem | 16px | Modals | `rounded-xl` |
| `2xl` | 1.5rem | 24px | Large cards | `rounded-2xl` |
| `full` | 9999px | Pill | Badges, avatars | `rounded-full` |

---

## Shadows

| Name | Usage | Tailwind Class |
|------|-------|----------------|
| `sm` | Subtle elevation | `shadow-sm` |
| Default | Standard cards | `shadow` |
| `md` | Hover states | `shadow-md` |
| `lg` | Dropdowns, popovers | `shadow-lg` |
| `xl` | Modals | `shadow-xl` |
| `2xl` | Hero sections | `shadow-2xl` |

---

## Components

### Buttons

```html
<!-- Primary Button -->
<button class="btn-primary">Book Now</button>

<!-- Secondary Button -->
<button class="btn-secondary">Learn More</button>

<!-- Ghost Button -->
<button class="btn-ghost">Cancel</button>

<!-- Destructive Button -->
<button class="btn-destructive">Delete</button>

<!-- Size Variants -->
<button class="btn-primary btn-sm">Small</button>
<button class="btn-primary">Default</button>
<button class="btn-primary btn-lg">Large</button>
```

### Cards

```html
<!-- Standard Card -->
<div class="card">
  <h3 class="heading-4 mb-2">Card Title</h3>
  <p class="body-text-secondary">Card content goes here.</p>
</div>

<!-- Interactive Card (clickable/hoverable) -->
<div class="card-interactive">
  <h3 class="heading-4 mb-2">Clickable Card</h3>
  <p class="body-text-secondary">Hover for effect.</p>
</div>

<!-- Size Variants -->
<div class="card-compact">Compact padding (16px)</div>
<div class="card">Standard padding (24px)</div>
<div class="card-spacious">Spacious padding (32px)</div>
```

### Form Inputs

```html
<!-- Text Input -->
<div>
  <label class="label">Email Address</label>
  <input type="email" class="input" placeholder="you@example.com" />
</div>

<!-- Textarea -->
<div>
  <label class="label">Description</label>
  <textarea class="textarea" placeholder="Enter details..."></textarea>
</div>

<!-- Select -->
<div>
  <label class="label">Choose Option</label>
  <select class="select">
    <option>Option 1</option>
    <option>Option 2</option>
  </select>
</div>

<!-- Input with Error -->
<div>
  <label class="label">Username</label>
  <input type="text" class="input input-error" />
  <p class="error-message">Username is required</p>
</div>
```

### Badges

```html
<span class="badge-success">Active</span>
<span class="badge-warning">Pending</span>
<span class="badge-error">Cancelled</span>
<span class="badge-neutral">Draft</span>
<span class="badge-primary">Featured</span>
```

### Containers

```html
<!-- Standard Container (max-width: 1280px) -->
<div class="container-custom">Content</div>

<!-- Narrow Container (max-width: 896px) -->
<div class="container-narrow">Narrow content</div>

<!-- Wide Container (max-width: 1600px) -->
<div class="container-wide">Wide content</div>
```

---

## Animations

### Built-in Animations

```html
<!-- Fade Animations -->
<div class="animate-fadeIn">Fades in from bottom</div>
<div class="animate-fadeOut">Fades out to bottom</div>

<!-- Slide Animations -->
<div class="animate-slideIn">Slides in from left</div>
<div class="animate-slideOut">Slides out to left</div>
<div class="animate-slide-up">Slides in from bottom</div>
<div class="animate-slide-down">Slides in from top</div>

<!-- Scale Animations -->
<div class="animate-scaleIn">Scales in (zoom effect)</div>
<div class="animate-scaleOut">Scales out</div>

<!-- Special Animations -->
<div class="animate-shimmer">Shimmer effect (loading)</div>
<div class="animate-pulse">Pulse effect</div>
<div class="animate-bounce-in">Bounce in</div>

<!-- Loading Spinner -->
<div class="spinner"></div>
<div class="spinner spinner-sm"></div>
<div class="spinner spinner-lg"></div>
```

### Transitions

```html
<!-- Transition Duration -->
<div class="transition-fast">100ms transition</div>
<div class="transition-normal">200ms transition (default)</div>
<div class="transition-slow">300ms transition</div>

<!-- Transition Properties -->
<div class="transition-all">All properties</div>
<div class="transition-colors">Colors only</div>
<div class="transition-transform">Transform only</div>
```

---

## Accessibility

### Focus Indicators

All interactive elements have visible focus rings:

```html
<!-- Automatic focus ring on all buttons/inputs -->
<button class="btn-primary">Has focus ring</button>

<!-- Manual focus ring utility -->
<div tabindex="0" class="focus-ring">Custom focusable element</div>
```

### Reduced Motion

The design system respects `prefers-reduced-motion`:

```css
/* Animations automatically reduced for users who prefer less motion */
@media (prefers-reduced-motion: reduce) {
  /* All animations become instant */
}
```

### Color Contrast

All color combinations meet WCAG AA standards:
- Text on white: 4.5:1 minimum
- Primary button text: 7:1 contrast
- Error text: 5:1 contrast

### Screen Reader Classes

```html
<!-- Hidden from visual but available to screen readers -->
<span class="sr-only">This is read by screen readers only</span>

<!-- Skip link for keyboard navigation -->
<a href="#main" class="skip-link">Skip to main content</a>
```

---

## Usage Examples

### Food Truck Card

```html
<div class="card-interactive">
  <img src="/truck.jpg" alt="Taco Truck" class="rounded-lg mb-4 w-full h-48 object-cover" />
  <h3 class="heading-4 mb-2">Taco Paradise</h3>
  <p class="small-text mb-3">Mexican • Street Food</p>
  <div class="flex items-center gap-2 mb-4">
    <span class="badge-success">Available</span>
    <span class="body-text-secondary">⭐ 4.8 (124 reviews)</span>
  </div>
  <button class="btn-primary w-full">View Menu</button>
</div>
```

### Search Form

```html
<div class="card">
  <h2 class="heading-3 mb-6">Find Your Food Truck</h2>
  <form class="space-y-4">
    <div>
      <label class="label">Cuisine Type</label>
      <select class="select">
        <option>All Cuisines</option>
        <option>Mexican</option>
        <option>Asian</option>
      </select>
    </div>
    <div>
      <label class="label">Event Date</label>
      <input type="date" class="input" />
    </div>
    <div>
      <label class="label">Guest Count</label>
      <input type="number" class="input" placeholder="50" />
    </div>
    <button type="submit" class="btn-primary w-full">Search Trucks</button>
  </form>
</div>
```

### Status Dashboard

```html
<div class="container-custom py-8">
  <h1 class="heading-1 mb-8">My Bookings</h1>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h3 class="heading-4">Upcoming Events</h3>
        <span class="badge-primary">3</span>
      </div>
      <p class="body-text-secondary">Next event in 2 days</p>
    </div>

    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h3 class="heading-4">Pending Requests</h3>
        <span class="badge-warning">1</span>
      </div>
      <p class="body-text-secondary">Awaiting vendor response</p>
    </div>

    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h3 class="heading-4">Completed</h3>
        <span class="badge-success">12</span>
      </div>
      <p class="body-text-secondary">All events successful</p>
    </div>
  </div>
</div>
```

---

## Responsive Design

### Breakpoints

| Breakpoint | Width | Tailwind Prefix |
|------------|-------|-----------------|
| Mobile | < 768px | (default) |
| Tablet | 768px+ | `md:` |
| Desktop | 1024px+ | `lg:` |
| Wide | 1280px+ | `xl:` |
| Ultra | 1536px+ | `2xl:` |

### Usage

```html
<!-- Responsive text sizes -->
<h1 class="text-3xl md:text-4xl lg:text-5xl">Responsive Heading</h1>

<!-- Responsive layout -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- Cards -->
</div>

<!-- Responsive padding -->
<div class="p-4 md:p-6 lg:p-8">Content</div>

<!-- Show/Hide by breakpoint -->
<div class="show-on-mobile md:hidden">Mobile only</div>
<div class="hidden md:block">Desktop only</div>
```

---

## Dark Mode (Future)

Foundation is ready for dark mode implementation:

```html
<!-- Add 'dark' class to html element to enable -->
<html class="dark">
  <!-- All components automatically adjust -->
</html>
```

CSS variables in `globals.css` include `.dark` variants for seamless theme switching.

---

## Best Practices

1. **Use Utility Classes**: Prefer Tailwind utilities over custom CSS
2. **Component Classes**: Use `.btn-primary`, `.card`, etc. for consistency
3. **Spacing Scale**: Always use spacing scale (4, 8, 12, 16, etc.)
4. **Color Semantic**: Use semantic colors (`primary`, `success`, `error`) not direct colors
5. **Responsive First**: Design mobile-first, enhance for larger screens
6. **Accessibility**: Always include focus states and ARIA labels
7. **Typography**: Use heading classes (`.heading-1`, etc.) for consistency

---

**Last Updated**: 2025-12-03
**Version**: 1.0
**Maintained By**: Sam_Styler (Fleet Feast Design System)
