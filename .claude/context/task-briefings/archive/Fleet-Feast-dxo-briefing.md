# Task Briefing: Fleet-Feast-dxo

**Generated**: 2025-12-05T03:45:00Z
**Agent**: Parker_Pages
**Task**: Food Truck Profile Pages
**Invocation**: 1

---

## Objective

Create the food truck profile page with photo gallery, menu display, availability calendar, reviews section, booking CTA, and similar trucks recommendations.

## Acceptance Criteria

1. **Truck Profile Page** (`/trucks/[id]`)
   - Hero with cover photo and truck name
   - Photo gallery (lightbox on click)
   - Menu section with categories and items
   - Availability calendar (monthly view)
   - Reviews section with pagination
   - "Book This Truck" CTA

2. **Photo Gallery**
   - Grid layout for thumbnails
   - Lightbox for full-size viewing
   - Swipe navigation on mobile

3. **Menu Display**
   - Categories (appetizers, mains, drinks, etc.)
   - Items with name, description, price
   - Dietary indicators (vegetarian, vegan, GF)

4. **Availability Calendar**
   - Monthly view with available dates highlighted
   - Blocked dates shown as unavailable
   - Click date to start booking

5. **Reviews Section**
   - Average rating display
   - Review cards with rating, content, date
   - Pagination (10 per page)
   - Filter by rating

6. **Similar Trucks**
   - Cards for 3-4 similar trucks
   - Based on cuisine type
   - Exclude current truck

## Technical Details

### File Structure
```
app/(public)/trucks/
├── [id]/
│   ├── page.tsx           # Main profile page
│   ├── layout.tsx         # With MainLayout
│   └── components/
│       ├── TruckHero.tsx
│       ├── PhotoGallery.tsx
│       ├── MenuSection.tsx
│       ├── AvailabilityCalendar.tsx
│       ├── ReviewsSection.tsx
│       └── SimilarTrucks.tsx
```

### API Integration
```typescript
// Fetch truck details
const fetchTruck = async (id: string) => {
  const res = await fetch(`/api/trucks/${id}`);
  return res.json();
};

// Fetch truck reviews
const fetchReviews = async (vendorId: string, page: number) => {
  const res = await fetch(`/api/reviews/vendor/${vendorId}?page=${page}&limit=10`);
  return res.json();
};

// Fetch similar trucks
const fetchSimilarTrucks = async (cuisineType: string, excludeId: string) => {
  const res = await fetch(`/api/trucks?cuisineType=${cuisineType}&limit=4&exclude=${excludeId}`);
  return res.json();
};
```

### Truck Hero Component
```typescript
interface TruckHeroProps {
  truck: {
    id: string;
    businessName: string;
    cuisineType: CuisineType;
    priceRange: PriceRange;
    averageRating: number;
    totalReviews: number;
    coverImageUrl?: string;
    tagline?: string;
  };
}

function TruckHero({ truck }: TruckHeroProps) {
  return (
    <div className="relative h-64 md:h-96">
      <Image
        src={truck.coverImageUrl || '/placeholder-truck.jpg'}
        alt={truck.businessName}
        fill
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60" />
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <Badge>{truck.cuisineType}</Badge>
        <h1 className="text-3xl font-bold">{truck.businessName}</h1>
        <div className="flex items-center gap-4 mt-2">
          <Rating value={truck.averageRating} />
          <span>({truck.totalReviews} reviews)</span>
          <span>{truck.priceRange}</span>
        </div>
      </div>
    </div>
  );
}
```

### Photo Gallery with Lightbox
```typescript
interface PhotoGalleryProps {
  photos: string[];
}

function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {photos.map((photo, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className="aspect-square relative overflow-hidden rounded-lg"
          >
            <Image src={photo} alt="" fill className="object-cover hover:scale-110 transition" />
          </button>
        ))}
      </div>

      {selectedIndex !== null && (
        <Lightbox
          photos={photos}
          currentIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onNext={() => setSelectedIndex((selectedIndex + 1) % photos.length)}
          onPrev={() => setSelectedIndex((selectedIndex - 1 + photos.length) % photos.length)}
        />
      )}
    </>
  );
}
```

### Availability Calendar
```typescript
interface AvailabilityCalendarProps {
  vendorId: string;
  availableDates: string[]; // ISO date strings
  blockedDates: string[];
  onDateSelect: (date: string) => void;
}

function AvailabilityCalendar({
  availableDates,
  blockedDates,
  onDateSelect,
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDayStatus = (date: Date): 'available' | 'blocked' | 'past' => {
    if (date < new Date()) return 'past';
    const dateStr = date.toISOString().split('T')[0];
    if (blockedDates.includes(dateStr)) return 'blocked';
    return 'available';
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          ← Previous
        </button>
        <h3 className="font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          Next →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm text-gray-500 py-2">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {getDaysInMonth(currentMonth).map((date) => {
          const status = getDayStatus(date);
          return (
            <button
              key={date.toISOString()}
              disabled={status !== 'available'}
              onClick={() => onDateSelect(date.toISOString().split('T')[0])}
              className={cn(
                'p-2 rounded text-center',
                status === 'available' && 'bg-green-100 hover:bg-green-200',
                status === 'blocked' && 'bg-gray-100 text-gray-400',
                status === 'past' && 'text-gray-300'
              )}
            >
              {format(date, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

### Reviews Section
```typescript
interface ReviewsSectionProps {
  vendorId: string;
  averageRating: number;
  totalReviews: number;
}

function ReviewsSection({ vendorId, averageRating, totalReviews }: ReviewsSectionProps) {
  const [page, setPage] = useState(1);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);

  const { data, isLoading } = useSWR(
    `/api/reviews/vendor/${vendorId}?page=${page}&rating=${ratingFilter || ''}`,
    fetcher
  );

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Reviews</h2>
          <div className="flex items-center gap-2">
            <Rating value={averageRating} />
            <span>{averageRating.toFixed(1)} ({totalReviews} reviews)</span>
          </div>
        </div>

        <select
          value={ratingFilter || ''}
          onChange={(e) => setRatingFilter(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">All ratings</option>
          {[5, 4, 3, 2, 1].map(r => (
            <option key={r} value={r}>{r} stars</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <div className="space-y-4">
            {data?.reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={data?.totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </section>
  );
}
```

## UI Components Available

From components/ui/:
- Button, Card, Badge, Rating, Spinner
- Tabs, Modal

From components/layout/:
- MainLayout

## Dependencies (Completed)

- Fleet-Feast-w6w: Food Truck Search API ✓
- Fleet-Feast-bj4: Review & Rating System ✓
- Fleet-Feast-bxt: UI Component Library ✓
- Fleet-Feast-5ub: Navigation & Layout System ✓

## PRD Reference

- **F4**: Food Truck Profiles
- **F6**: Availability Calendar
- **F10**: Review & Rating Display

## Gap Checklist

After completing the task, verify:
- [ ] Profile loads truck data correctly
- [ ] Photo gallery opens lightbox
- [ ] Menu displays with categories
- [ ] Calendar shows available/blocked dates
- [ ] Reviews section with pagination works
- [ ] Rating filter updates results
- [ ] Similar trucks shown correctly
- [ ] Booking CTA links to booking flow
- [ ] Mobile responsive design
- [ ] SEO metadata for truck page

---

*Briefing generated by MASTER Orchestrator*
