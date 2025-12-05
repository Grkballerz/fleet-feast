# Food Truck Profile Pages

## Overview

This directory contains the complete implementation of the food truck profile page at `/trucks/[id]`.

## File Structure

```
app/(public)/trucks/[id]/
├── components/
│   ├── TruckHero.tsx              # Hero section with cover image and truck info
│   ├── PhotoGallery.tsx           # Photo grid with lightbox functionality
│   ├── MenuSection.tsx            # Menu display with categories and dietary tags
│   ├── AvailabilityCalendar.tsx   # Monthly calendar showing available/blocked dates
│   ├── ReviewsSection.tsx         # Reviews with pagination and rating filter
│   ├── SimilarTrucks.tsx          # Recommended similar trucks by cuisine
│   └── index.ts                   # Component exports
├── page.tsx                        # Main profile page (Server Component)
├── layout.tsx                      # Page layout with MainLayout
└── README.md                       # This file
```

## Components

### TruckHero
- **Purpose**: Hero section displaying truck name, cover image, rating, and cuisine type
- **Features**:
  - Responsive cover image with gradient overlay
  - Cuisine type badge
  - Average rating with review count
  - Price range indicator
  - Optional description

### PhotoGallery
- **Purpose**: Display truck photos in a grid with full-screen lightbox
- **Features**:
  - Responsive grid (2 cols mobile, 3 cols tablet, 4 cols desktop)
  - Lightbox with keyboard navigation (ESC, arrows)
  - Touch-friendly swipe navigation
  - Image counter
  - Hover effects

### MenuSection
- **Purpose**: Display menu items with prices and dietary indicators
- **Features**:
  - Menu items with name, description, price
  - Dietary tag badges (vegan, vegetarian, gluten-free, spicy, etc.)
  - Pricing model indicator (per person, flat rate, custom)
  - Category support (future enhancement)
  - Item count display

### AvailabilityCalendar
- **Purpose**: Monthly calendar showing truck availability
- **Features**:
  - Monthly navigation (prev/next)
  - Visual indicators for available, blocked, and past dates
  - Click to select date for booking
  - Tooltip support for date notes
  - Accessibility-friendly
  - Legend for date statuses

### ReviewsSection
- **Purpose**: Display customer reviews with pagination and filtering
- **Features**:
  - Rating filter (1-5 stars or all)
  - Pagination (10 reviews per page)
  - Average rating display
  - Rating breakdown histogram
  - User avatars (initials)
  - Relative timestamps
  - Client-side data fetching with SWR
  - Loading and error states

### SimilarTrucks
- **Purpose**: Recommend similar trucks by cuisine type
- **Features**:
  - 3-4 truck recommendations
  - Excludes current truck
  - Truck cards with image, name, rating, price
  - Links to other truck profiles
  - Client-side data fetching with SWR
  - Responsive grid layout

## Data Fetching

### Server-Side (page.tsx)
- Fetches truck profile data at build/request time
- Generates SEO metadata dynamically
- Passes data to client components as props

### Client-Side (Components)
- **ReviewsSection**: Uses SWR to fetch paginated reviews
- **SimilarTrucks**: Uses SWR to fetch similar trucks
- Automatic caching and revalidation

## API Endpoints Used

| Endpoint | Purpose | Component |
|----------|---------|-----------|
| `GET /api/trucks/[id]` | Fetch truck profile with menu and availability | page.tsx |
| `GET /api/reviews/vendor/[vendorId]` | Fetch paginated reviews with filters | ReviewsSection |
| `GET /api/trucks?cuisineType=X&exclude=Y` | Fetch similar trucks | SimilarTrucks |

## SEO Features

- **Dynamic Metadata**: Title, description, Open Graph, Twitter Card
- **Structured Data**: Ready for schema.org markup (future enhancement)
- **Image Optimization**: Next.js Image component with proper sizing
- **Semantic HTML**: Proper heading hierarchy and ARIA labels

## Mobile Responsiveness

All components are fully responsive with breakpoints:
- **Mobile**: < 768px (sm)
- **Tablet**: 768px - 1024px (md)
- **Desktop**: 1024px+ (lg, xl)

### Mobile-Specific Features
- Sticky booking CTA button on mobile
- Collapsible sections for better mobile UX
- Touch-friendly interactions (swipe in lightbox, calendar)
- Optimized image loading with responsive sizes

## Accessibility

- Keyboard navigation support
- ARIA labels and roles
- Focus states on interactive elements
- Color contrast compliance
- Screen reader friendly

## Future Enhancements

1. **Photos**: Add dedicated photo upload and management
2. **Menu Categories**: Support structured menu with categories
3. **Booking Integration**: Direct booking from calendar
4. **Wishlist**: Add to favorites functionality
5. **Share**: Social sharing buttons
6. **Print**: Print-friendly menu view
7. **360° Photos**: Virtual tour support
8. **Video**: Promotional video embedding

## Dependencies

- **next**: 14.x (Server Components, Image optimization)
- **react**: 18.x
- **swr**: Client-side data fetching and caching
- **lucide-react**: Icons
- **tailwindcss**: Styling
- **@prisma/client**: Database types

## Usage Example

```tsx
// Navigate to a truck profile
<Link href="/trucks/[truck-id]">View Truck</Link>

// Dynamic route in Next.js automatically handles [id] parameter
// Example: /trucks/abc-123-def
```

## Notes

- All dates use ISO 8601 format (YYYY-MM-DD)
- Prices displayed as formatted currency
- Images fallback to placeholder if not available
- Error states handled gracefully throughout

---

**Created by**: Parker_Pages (Fleet Feast Agent)
**Task**: Fleet-Feast-dxo - Food Truck Profile Pages
**Date**: 2025-12-05
