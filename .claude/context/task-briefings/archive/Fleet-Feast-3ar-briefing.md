# Briefing: Fleet-Feast-3ar

**Generated**: 2025-12-07T20:30:00-05:00
**Agent**: Casey_Components
**Task**: Small button touch targets below WCAG 44px minimum

---

## Task Details

**Objective**: Fix small button (btn-sm) touch targets to meet WCAG 2.1 44x44px minimum requirement.

**Priority**: 2 (Important)
**Type**: Bug fix / Accessibility
**Estimated Time**: 5-10 minutes

---

## Problem

WCAG 2.1 requires minimum 44x44px touch targets for interactive elements. The `btn-sm` variant currently uses `py-2` padding which results in approximately 40px height, falling short of the requirement.

---

## Solution

Update the Button component's small variant padding:

**Current**: `py-2` (~40px height)
**Fix**: `py-2.5` (~44px height)

---

## File to Modify

`components/ui/Button.tsx`

Find the size variant for `sm` and update the padding.

---

## Acceptance Criteria

- [ ] Small buttons (btn-sm) have minimum 44px height
- [ ] Change is backward compatible (no visual breaking changes)
- [ ] Build succeeds after change

---

## Testing

After making the change:
1. Visual check that small buttons are slightly taller
2. Verify no layout breaks on pages using small buttons
3. Run `npm run build` to verify no errors
