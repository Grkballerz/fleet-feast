# CSS Utilities Guide - Fleet Feast

## Scroll Indicators

Visual indicators for scrollable content areas.

### Mask-Based Indicators (Fade-out edges)

Use when you want content to visually fade at the edges:

```tsx
// Horizontal scroll with fade
<div className="overflow-x-auto scroll-indicator">
  {/* scrollable content */}
</div>

// Vertical scroll with fade
<div className="overflow-y-auto scroll-indicator-vertical">
  {/* scrollable content */}
</div>
```

### Shadow-Based Indicators (Subtle shadows)

Use for more subtle indication of scrollable areas:

```tsx
// Left shadow only
<div className="overflow-x-auto scroll-shadow-left">
  {/* scrollable content */}
</div>

// Right shadow only
<div className="overflow-x-auto scroll-shadow-right">
  {/* scrollable content */}
</div>

// Both sides
<div className="overflow-x-auto scroll-shadow-both">
  {/* scrollable content */}
</div>

// Top shadow
<div className="overflow-y-auto scroll-shadow-top">
  {/* scrollable content */}
</div>

// Bottom shadow
<div className="overflow-y-auto scroll-shadow-bottom">
  {/* scrollable content */}
</div>
```

### Use Cases

- Featured trucks carousel
- Menu items horizontal scroll
- Table on mobile devices
- Long lists with vertical scroll
- Any `overflow-x-auto` or `overflow-y-auto` container

---

## Landscape Optimization

Optimizes UI for mobile landscape orientation (limited vertical space).

### Mobile Landscape (max-height: 500px)

Utilities available:

```tsx
// Compact header
<header className="header-compact">
  {/* reduced padding */}
</header>

// Modal that fits landscape viewport
<div className="modal-landscape">
  {/* max-height: 90vh with scroll */}
</div>

// Compact form spacing
<form className="form-landscape">
  {/* reduced gaps and padding */}
</form>

// Compact card
<div className="card-landscape">
  {/* reduced padding */}
</div>

// Reduced section spacing
<section className="section-landscape">
  {/* reduced vertical margins */}
</section>

// Compact dashboard stats
<div className="stats-landscape">
  {/* reduced padding */}
</div>

// Compact buttons
<button className="btn-landscape">
  {/* reduced vertical padding */}
</button>
```

### Tablet Landscape (height: 500px - 800px)

Additional utilities for tablets in landscape:

```tsx
// Tablet modal sizing
<div className="modal-landscape-tablet">
  {/* max-height: 85vh */}
</div>

// Tablet section spacing
<section className="section-landscape-tablet">
  {/* slightly reduced margins */}
</section>
```

### When to Use

These classes are automatically applied via media queries when:
- Device is in landscape orientation
- Viewport height is limited (< 500px for mobile, 500-800px for tablets)

You don't need to add/remove classes manually - just apply them and the media queries handle the rest.

### Best Practices

1. **Headers/Navbars**: Always use `header-compact` to maximize content area
2. **Modals/Dialogs**: Use `modal-landscape` to prevent off-screen content
3. **Forms**: Apply `form-landscape` to multi-field forms
4. **Dashboard Cards**: Use `stats-landscape` for stat/metric cards
5. **Buttons in Toolbars**: Apply `btn-landscape` to toolbar buttons

---

## Browser Support

- **Scroll Indicators (Mask)**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **Scroll Indicators (Shadow)**: All browsers including IE11
- **Landscape Media Queries**: All modern browsers

For maximum compatibility, use shadow-based scroll indicators.

---

## Performance Notes

- Mask-based indicators use GPU acceleration (performant)
- Shadow-based indicators are lightweight CSS
- Landscape media queries have zero overhead (CSS-only)
- All utilities are in `@layer utilities` for proper Tailwind integration
