# React Query Optimization Summary

## Task: Fleet-Feast-eab
**Objective**: Optimize React Query staleTime and cacheTime settings across all hooks

## What Was Done

### 1. Enhanced Query Keys Structure (lib/queries/index.ts)

Created a **hierarchical query key structure** for better cache invalidation:

```typescript
// Before (flat structure)
queryKeys.vendors  // Invalidates all vendor data
queryKeys.vendor(id)  // Only that vendor

// After (hierarchical structure)
queryKeys.vendors.all  // Root - invalidates ALL vendor queries
queryKeys.vendors.lists()  // All vendor lists
queryKeys.vendors.list(filters)  // Specific filtered list
queryKeys.vendors.details()  // All vendor details
queryKeys.vendors.detail(id)  // Specific vendor
queryKeys.vendors.search(filters)  // Search results
queryKeys.vendors.featured()  // Featured vendors
```

**Benefits**:
- Targeted invalidation: `invalidateQueries({ queryKey: queryKeys.vendors.all })` invalidates everything
- Granular control: `invalidateQueries({ queryKey: queryKeys.vendors.detail(id) })` only that vendor
- Backward compatible: Old keys still work during transition

### 2. Created Query Presets (lib/queries/index.ts)

Added **7 preset configurations** based on data change frequency:

| Preset | Stale Time | Use For | Example |
|--------|-----------|---------|---------|
| `realtime` | 0s | Live data, polling | Notifications, live bookings |
| `frequent` | 30s | Frequently changing | Bookings, messages |
| `search` | 2min | Search results | Truck search |
| `semiStatic` | 5min | Semi-static data | Vendor profiles, reviews |
| `static` | 30min | Rarely changes | Cuisine types, featured lists |
| `userSpecific` | 5min | User data | Profile, settings |
| `admin` | 1min | Admin data | Pending reviews, disputes |

### 3. Created Custom Hooks

#### hooks/useTrucks.ts
React Query hooks for truck/vendor data:

```typescript
// Search trucks with optimized caching
useTruckSearch(filters)  // 2min stale, search preset

// Featured trucks (static list)
useFeaturedTrucks()  // 15min stale, long cache

// Truck details
useTruck(id)  // 5min stale

// Availability (frequently changing)
useTruckAvailability(vendorId, date)  // 1min stale

// Mutations
useToggleFavorite()  // Invalidates vendor queries
```

#### hooks/useBookings.ts
React Query hooks for booking data:

```typescript
// All bookings
useBookings()  // 30s stale (frequent preset)

// Booking details
useBookingDetails(id)  // 1min stale

// Customer bookings
useCustomerBookings(customerId)  // 30s stale

// Vendor bookings
useVendorBookings(vendorId)  // 30s stale

// Mutations
useAcceptBooking()  // Invalidates all bookings + specific detail
useDeclineBooking()  // Invalidates all bookings + specific detail
```

#### hooks/useAdmin.ts
React Query hooks for admin data:

```typescript
// Pending vendor applications (urgent)
usePendingVendors()  // 1min stale

// All vendor applications
useAllVendors()  // 2min stale

// Application details
useVendorApplication(id)  // 2min stale

// Disputes (urgent)
useDisputes()  // 1min stale

// Violations
useViolations()  // 2min stale

// Mutations
useApproveVendor()  // Invalidates admin.vendors.all
useRejectVendor()  // Invalidates admin.vendors.all
```

### 4. Updated useBooking.ts (hooks/useBooking.ts)

Enhanced the existing booking submission hook:
- Uses hierarchical query keys (`queryKeys.bookings.all`)
- Invalidates vendor availability when booking is created
- More targeted cache invalidation

## Stale Time Recommendations

Based on data change frequency:

| Data Type | Stale Time | Rationale |
|-----------|-----------|-----------|
| Bookings, Notifications | 30s | Changes frequently, users expect fresh data |
| Search Results | 2min | Moderate caching, balance freshness vs performance |
| Vendor Profiles, Reviews | 5min | Don't change often, can cache longer |
| Featured Lists, Cuisine Types | 30min | Static data, aggressive caching |
| Availability | 1min | Changes with bookings, needs to be fresh |
| Admin Pending Items | 1min | Time-sensitive, needs to be current |

## Query Key Patterns

All keys follow hierarchical structure:

```typescript
// Vendors
["vendors"]  // Root
["vendors", "list", filters]  // Filtered list
["vendors", "detail", id]  // Single vendor
["vendors", "search", filters]  // Search results
["vendors", "featured"]  // Featured list

// Bookings
["bookings"]  // Root
["bookings", "list", filters]  // Filtered list
["bookings", "detail", id]  // Single booking
["bookings", "customer", customerId]  // Customer bookings
["bookings", "vendor", vendorId]  // Vendor bookings

// Admin
["admin", "vendors"]  // All admin vendors
["admin", "vendors", "pending"]  // Pending applications
["admin", "vendors", "detail", id]  // Specific application
```

## Mutation Invalidation Strategy

All mutations use targeted invalidation:

```typescript
// Example: Accept booking
useAcceptBooking({
  onSuccess: (_, bookingId) => {
    // Invalidate all bookings (hierarchical)
    queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });

    // Also specific booking
    queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(bookingId) });
  }
});
```

## Migration Path

1. **New code**: Use new hierarchical keys and custom hooks
2. **Existing code**: Can continue using old keys (backward compatible)
3. **Gradual migration**: Replace `useEffect` + `fetch` with custom hooks
4. **Benefits**: Better cache invalidation, consistent stale times, less code duplication

## Example: Before & After

### Before (Direct fetch in component)
```typescript
const [trucks, setTrucks] = useState([]);
const [isLoading, setIsLoading] = useState(false);

useEffect(() => {
  const fetchTrucks = async () => {
    setIsLoading(true);
    const response = await fetch('/api/trucks');
    const data = await response.json();
    setTrucks(data.data);
    setIsLoading(false);
  };
  fetchTrucks();
}, []);
```

### After (Using custom hook)
```typescript
const { data: trucks = [], isLoading } = useTruckSearch({
  // Automatic caching, refetching, error handling
});
```

## Performance Benefits

1. **Reduced API calls**: Queries cached for appropriate stale times
2. **Targeted invalidation**: Only refetch what changed
3. **Optimistic updates**: Mutations can update cache immediately
4. **Background refetching**: Stale data shown while fresh data loads
5. **Deduplication**: Multiple components using same query = 1 request

## Next Steps

1. **Migrate components**: Replace `useEffect` + `fetch` with custom hooks
2. **Add more hooks**: Reviews, messages, payments
3. **Implement optimistic updates**: For better UX on mutations
4. **Add loading states**: Use React Query's built-in states
5. **Error boundaries**: Leverage React Query error handling

## Files Created/Modified

### Created
- `hooks/useTrucks.ts` - Truck/vendor data hooks
- `hooks/useBookings.ts` - Booking data hooks
- `hooks/useAdmin.ts` - Admin data hooks
- `docs/REACT_QUERY_OPTIMIZATION_SUMMARY.md` - This file

### Modified
- `lib/queries/index.ts` - Enhanced query keys + presets
- `hooks/useBooking.ts` - Updated to use hierarchical keys

## Acceptance Criteria ✅

- [x] All queries have appropriate staleTime based on data type
- [x] Query keys follow consistent hierarchical pattern
- [x] Mutation invalidations are targeted (not invalidating entire cache)
- [x] TypeScript compilation ready (hooks are type-safe)
- [x] Backward compatibility maintained
- [x] Documentation provided
