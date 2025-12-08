# Briefing: Fleet-Feast-280

**Generated**: 2025-12-07T20:45:00-05:00
**Agent**: Casey_Components
**Task**: Add slide-in animation for mobile filter drawer

---

## Task Details

**Objective**: Add smooth slide-in animation when mobile filter drawer opens/closes.

**Priority**: 4 (Nice-to-have)
**Type**: UX Enhancement

---

## Current Behavior

The mobile filter drawer appears/disappears without animation.

---

## Desired Behavior

Filter drawer should:
- Slide in from the right when opened
- Slide out to the right when closed
- Use smooth transition (~300ms)

---

## Implementation

**Suggested Tailwind Classes**:

For the drawer container:
```tsx
// Hidden state
className="translate-x-full"

// Visible state
className="translate-x-0"

// Transition
className="transition-transform duration-300 ease-in-out"
```

**File to Modify**:
- `app/(public)/search/components/FilterPanel.tsx` (or wherever the mobile filter drawer is)

---

## Example Implementation

```tsx
<div
  className={cn(
    "fixed inset-y-0 right-0 w-full max-w-sm bg-white neo-border-l neo-shadow-lg z-50",
    "transition-transform duration-300 ease-in-out",
    isOpen ? "translate-x-0" : "translate-x-full"
  )}
>
  {/* Filter content */}
</div>
```

---

## Acceptance Criteria

- [ ] Filter drawer slides in from right when opened
- [ ] Filter drawer slides out to right when closed
- [ ] Animation is smooth (~300ms)
- [ ] No layout shifts during animation
- [ ] Build succeeds
