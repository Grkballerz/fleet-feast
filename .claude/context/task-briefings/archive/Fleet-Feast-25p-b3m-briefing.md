# Briefing: Fleet-Feast-25p & Fleet-Feast-b3m (Combined)

**Generated**: 2025-12-07T20:30:00-05:00
**Agent**: Parker_Pages
**Tasks**:
- Fleet-Feast-25p: Add skip navigation link
- Fleet-Feast-b3m: Add main landmark to layouts

---

## Task 1: Skip Navigation Link (Fleet-Feast-25p)

**Objective**: Add a "Skip to main content" link for keyboard users to bypass navigation.

**WCAG Requirement**: 2.4.1 Bypass Blocks (Level A)

### Implementation

Add a visually hidden skip link at the very beginning of the page that becomes visible on focus:

```tsx
// Add to layout components (before Header)
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:border-3 focus:border-black focus:shadow-brutal focus:text-black focus:font-bold"
>
  Skip to main content
</a>
```

### Files to Modify

- `components/layout/Header.tsx` or the root layout files
- Alternatively: `app/layout.tsx` (main layout)

---

## Task 2: Main Landmark (Fleet-Feast-b3m)

**Objective**: Wrap page content in semantic `<main>` element for screen reader navigation.

**WCAG Requirement**: 4.1.2 Name, Role, Value (Level A)

### Implementation

Add `id="main-content"` to the main content wrapper:

```tsx
<main id="main-content" className="...existing classes...">
  {children}
</main>
```

### Files to Modify

Check these layout files and add `<main>` wrapper:
- `app/layout.tsx` - Root layout
- `components/layout/DashboardLayout.tsx` - Dashboard wrapper
- `components/layout/AdminLayout.tsx` - Admin wrapper
- `components/layout/AuthLayout.tsx` - Auth pages wrapper

---

## Combined Approach

The skip link and main landmark work together:
1. Skip link targets `#main-content`
2. Main element has `id="main-content"`

### Example Implementation

```tsx
// In root layout or header area
<>
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:border-3 focus:border-black focus:shadow-brutal"
  >
    Skip to main content
  </a>
  <Header />
  <main id="main-content">
    {children}
  </main>
  <Footer />
</>
```

---

## Acceptance Criteria

### Skip Link (25p)
- [ ] Hidden by default (sr-only)
- [ ] Visible when focused via keyboard (Tab)
- [ ] Styled with neo-brutalist design (bold border, shadow)
- [ ] Clicking/activating jumps to main content

### Main Landmark (b3m)
- [ ] `<main>` element wraps page content
- [ ] Has `id="main-content"` for skip link target
- [ ] Present in all layout variants

---

## Testing

1. Tab through page - skip link should appear first
2. Activate skip link - focus should jump to main content
3. Screen reader should announce "main" landmark
4. Run `npm run build` to verify no errors
