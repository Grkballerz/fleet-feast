# Briefing: Fleet-Feast-2za & Fleet-Feast-s2t (Combined)

**Generated**: 2025-12-07T20:45:00-05:00
**Agent**: Sam_Styler
**Tasks**:
- Fleet-Feast-2za: Add horizontal scroll indicators
- Fleet-Feast-s2t: Optimize for mobile landscape orientation

---

## Task 1: Horizontal Scroll Indicators (Fleet-Feast-2za)

**Objective**: Add visual indicators (shadows/gradients) when content is horizontally scrollable.

**Priority**: 4 (Nice-to-have)

### Implementation

Use CSS mask-image to create fade-out edges on scrollable containers:

```css
/* Add to globals.css or as utility class */
.scroll-indicator {
  mask-image: linear-gradient(
    to right,
    transparent,
    black 10%,
    black 90%,
    transparent
  );
  -webkit-mask-image: linear-gradient(
    to right,
    transparent,
    black 10%,
    black 90%,
    transparent
  );
}

/* Or shadow-based approach */
.scroll-shadow-left {
  box-shadow: inset 10px 0 8px -8px rgba(0,0,0,0.15);
}
.scroll-shadow-right {
  box-shadow: inset -10px 0 8px -8px rgba(0,0,0,0.15);
}
```

### Files to Update
- `app/globals.css` - Add utility classes

### Where to Apply
- Horizontal scrolling containers (carousels, tables on mobile)
- Featured trucks section
- Any overflow-x-auto elements

---

## Task 2: Landscape Optimization (Fleet-Feast-s2t)

**Objective**: Optimize pages for mobile landscape orientation.

**Priority**: 4 (Nice-to-have)

### Key Areas to Check

1. **Forms** - Ensure forms don't require excessive scrolling in landscape
2. **Dashboards** - Stats cards should reflow nicely
3. **Modals** - Should not exceed viewport height
4. **Headers** - Should not take too much vertical space

### Implementation

Add landscape-specific styles:

```css
/* Add to globals.css */
@media (orientation: landscape) and (max-height: 500px) {
  /* Reduce header height on landscape mobile */
  .header-compact {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }

  /* Reduce modal max-height */
  .modal-landscape {
    max-height: 90vh;
  }

  /* Compact form spacing */
  .form-landscape {
    gap: 0.5rem;
  }
}
```

### Files to Update
- `app/globals.css` - Add landscape media queries

---

## Acceptance Criteria

### Scroll Indicators (2za)
- [ ] Scroll indicator utility classes added
- [ ] Works on horizontal scrollable containers
- [ ] Subtle visual effect (not distracting)

### Landscape (s2t)
- [ ] Forms usable in landscape without excessive scroll
- [ ] Modals fit in landscape viewport
- [ ] Headers don't dominate the screen
- [ ] Build succeeds

---

## Notes

These are polish tasks. Focus on:
1. Adding the CSS utilities to globals.css
2. Testing on key pages
3. Keeping changes minimal and non-breaking
