# Briefing: Fleet-Feast-sh6

Generated: 2025-12-16T17:35:00Z
Agent: Casey_Components

## Task Details

**Objective**: Generate 10 AI images using fal.ai for the 5 featured food trucks on the homepage.

**Priority**: 1 (High)

**Acceptance Criteria**:
- [ ] Generate 5 food truck exterior images (one per truck)
- [ ] Generate 5 signature food dish images (one per truck)
- [ ] Save all images to public/images/generated/ as webp files
- [ ] Use descriptive filenames matching truck themes

## Food Trucks to Generate Images For

1. **Tacos Loco** (Mexican)
   - Exterior: Colorful Mexican-themed food truck with vibrant decorations
   - Food: Authentic street tacos with fresh toppings

2. **BBQ Masters** (BBQ/Smokehouse)
   - Exterior: Rustic BBQ smoker truck with wood-fired aesthetic
   - Food: Smoked brisket platter with sides

3. **Asian Fusion Express** (Asian Fusion)
   - Exterior: Modern Asian-inspired food truck with sleek design
   - Food: Fusion bowl with diverse Asian flavors

4. **Italian Delight** (Italian/Pizza)
   - Exterior: Classic Italian-themed truck with pizza oven visible
   - Food: Wood-fired pizza fresh from the oven

5. **Seafood Shack** (Seafood)
   - Exterior: Coastal-themed food truck with nautical elements
   - Food: Fresh lobster rolls or seafood platter

## Technical Requirements

### fal.ai Integration
Use the mcp__mcp-fal__generate tool with appropriate model (flux or similar).

### File Naming Convention
```
public/images/generated/
├── tacos-loco-truck.webp
├── tacos-loco-food.webp
├── bbq-masters-truck.webp
├── bbq-masters-food.webp
├── asian-fusion-truck.webp
├── asian-fusion-food.webp
├── italian-delight-truck.webp
├── italian-delight-food.webp
├── seafood-shack-truck.webp
└── seafood-shack-food.webp
```

### Image Specifications
- Format: WebP (or convert to webp)
- Resolution: High quality for web display
- Style: Professional, appetizing, vibrant colors

## Dependencies Completed

- Fleet-Feast-3lk: coverImageUrl field added to Vendor model ✅

## Files to Create

- public/images/generated/*.webp (10 images)

## Downstream Dependents

This task blocks:
- Fleet-Feast-0pq: Update seed data with coverImageUrl paths
