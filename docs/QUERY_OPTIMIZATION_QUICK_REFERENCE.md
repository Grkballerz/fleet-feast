# React Query Optimization - Quick Reference

## Stale Time Cheat Sheet

Use these guidelines when deciding stale times:

```typescript
// Real-time data (0-30 seconds)
staleTime: 0 // Notifications, live updates
staleTime: 30 * 1000 // Bookings, messages

// Frequently changing (1-2 minutes)
staleTime: 1 * 60 * 1000 // Availability, admin pending items
staleTime: 2 * 60 * 1000 // Search results

// Semi-static (5-15 minutes)
staleTime: 5 * 60 * 1000 // Vendor profiles, reviews, user settings
staleTime: 10 * 60 * 1000 // Menu items

// Static (30-60 minutes)
staleTime: 30 * 60 * 1000 // Featured lists, cuisine types
staleTime: 60 * 60 * 1000 // Service areas, static content
```

## Available Presets

```typescript
import { queryPresets } from '@/lib/queries';

// Use in your queries
useQuery({
  queryKey: [...],
  queryFn: ...,
  ...queryPresets.realtime,  // 0s stale, polls every 5s
  ...queryPresets.frequent,  // 30s stale
  ...queryPresets.search,    // 2min stale
  ...queryPresets.semiStatic, // 5min stale
  ...queryPresets.static,    // 30min stale
  ...queryPresets.userSpecific, // 5min stale
  ...queryPresets.admin,     // 1min stale, refetch on focus
});
```

## Query Key Patterns

### Hierarchical Structure

```typescript
// Trucks/Vendors
queryKeys.vendors.all  // Invalidates ALL vendor queries
queryKeys.vendors.lists()  // All lists
queryKeys.vendors.list(filters)  // Specific list
queryKeys.vendors.search(filters)  // Search results
queryKeys.vendors.featured()  // Featured trucks
queryKeys.vendors.detail(id)  // Single vendor
queryKeys.vendors.availability(id)  // Vendor availability

// Bookings
queryKeys.bookings.all  // Invalidates ALL booking queries
queryKeys.bookings.lists()  // All lists
queryKeys.bookings.list(filters)  // Specific list
queryKeys.bookings.detail(id)  // Single booking
queryKeys.bookings.customer(customerId)  // Customer bookings
queryKeys.bookings.vendor(vendorId)  // Vendor bookings

// Admin
queryKeys.admin.vendors.all  // All admin vendor queries
queryKeys.admin.vendors.pending()  // Pending applications
queryKeys.admin.vendors.detail(id)  // Specific application
queryKeys.admin.disputes.all  // All dispute queries
queryKeys.admin.violations.all  // All violation queries
```

## Custom Hooks Usage

### Trucks/Vendors

```typescript
import {
  useTruckSearch,
  useFeaturedTrucks,
  useTruck,
  useTruckAvailability,
  useToggleFavorite
} from '@/hooks/useTrucks';

// Search trucks
const { data, isLoading, error } = useTruckSearch({
  query: "tacos",
  cuisineType: ["MEXICAN"],
  page: 1,
  limit: 20
});

// Featured trucks
const { data: featured } = useFeaturedTrucks();

// Single truck
const { data: truck } = useTruck(truckId);

// Availability
const { data: availability } = useTruckAvailability(vendorId, date);

// Toggle favorite (mutation)
const toggleFavorite = useToggleFavorite();
toggleFavorite.mutate(vendorId);
```

### Bookings

```typescript
import {
  useBookings,
  useBookingDetails,
  useCustomerBookings,
  useVendorBookings,
  useAcceptBooking,
  useDeclineBooking
} from '@/hooks/useBookings';

// All bookings
const { data: bookings } = useBookings();

// Single booking
const { data: booking } = useBookingDetails(bookingId);

// Customer bookings
const { data: customerBookings } = useCustomerBookings(customerId);

// Accept booking (mutation)
const acceptBooking = useAcceptBooking();
acceptBooking.mutate(bookingId);

// Decline booking (mutation)
const declineBooking = useDeclineBooking();
declineBooking.mutate({ bookingId, reason: "..." });
```

### Admin

```typescript
import {
  usePendingVendors,
  useAllVendors,
  useVendorApplication,
  useApproveVendor,
  useRejectVendor,
  useDisputes,
  useViolations
} from '@/hooks/useAdmin';

// Pending applications
const { data: pending } = usePendingVendors();

// Application details
const { data: application } = useVendorApplication(applicationId);

// Approve (mutation)
const approve = useApproveVendor();
approve.mutate(applicationId);

// Reject (mutation)
const reject = useRejectVendor();
reject.mutate({ id: applicationId, reason: "..." });
```

## Cache Invalidation Patterns

### After Mutations

```typescript
// Invalidate all related queries
queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });

// Invalidate specific query
queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) });

// Invalidate multiple related caches
queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
queryClient.invalidateQueries({ queryKey: queryKeys.vendors.availability(vendorId) });
```

### Optimistic Updates (Advanced)

```typescript
const mutation = useMutation({
  mutationFn: updateBooking,
  onMutate: async (newBooking) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: queryKeys.bookings.all });

    // Snapshot previous value
    const previous = queryClient.getQueryData(queryKeys.bookings.detail(id));

    // Optimistically update
    queryClient.setQueryData(queryKeys.bookings.detail(id), newBooking);

    return { previous };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(queryKeys.bookings.detail(id), context?.previous);
  },
  onSettled: () => {
    // Refetch after error or success
    queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
  },
});
```

## Common Patterns

### Loading States

```typescript
const { data, isLoading, isError, error } = useQuery(...);

if (isLoading) return <Spinner />;
if (isError) return <Alert variant="error">{error.message}</Alert>;

return <div>{data.map(...)}</div>;
```

### Dependent Queries

```typescript
// Only fetch truck details after search is complete
const { data: searchResults } = useTruckSearch(filters);
const { data: truckDetails } = useTruck(
  searchResults?.[0]?.id || "",
  { enabled: !!searchResults?.[0]?.id }  // Only run if ID exists
);
```

### Pagination

```typescript
const [page, setPage] = useState(1);

const { data, isPreviousData } = useTruckSearch(
  { page, limit: 20 },
  { keepPreviousData: true }  // Keep old data while fetching new page
);
```

## Migration Checklist

When converting a component to use React Query:

- [ ] Identify all `fetch` calls in `useEffect`
- [ ] Find or create appropriate custom hook
- [ ] Replace `useState` for data, loading, error with hook
- [ ] Remove `useEffect` for data fetching
- [ ] Use appropriate stale time based on data type
- [ ] Update mutations to use `useMutation` and invalidate cache
- [ ] Handle loading and error states with hook values
- [ ] Test cache invalidation works correctly

## Debugging

### React Query DevTools

```typescript
// In app/providers.tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  {children}
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

### Check Cache State

```typescript
// Get current cache data
const data = queryClient.getQueryData(queryKeys.bookings.detail(id));

// Check if query is stale
const state = queryClient.getQueryState(queryKeys.bookings.detail(id));
console.log('Is stale?', state?.isInvalidated);
```

## Performance Tips

1. **Use hierarchical keys**: Easier to invalidate related data
2. **Don't over-invalidate**: Only invalidate what changed
3. **Use `staleTime` wisely**: Longer for static data, shorter for dynamic
4. **Enable background refetching**: For semi-static data
5. **Use `keepPreviousData`**: For pagination/filtering
6. **Implement optimistic updates**: For immediate UI feedback
7. **Leverage `gcTime`**: Clean up unused cache after time period

## Common Mistakes to Avoid

❌ **Don't invalidate the entire cache**
```typescript
queryClient.invalidateQueries(); // Invalidates EVERYTHING
```

✅ **Invalidate specific keys**
```typescript
queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
```

❌ **Don't use stale time = 0 for everything**
```typescript
staleTime: 0  // Forces refetch every time
```

✅ **Use appropriate stale times**
```typescript
staleTime: 5 * 60 * 1000  // 5 minutes for semi-static data
```

❌ **Don't forget to enable conditional queries**
```typescript
useQuery({ queryKey: [...], queryFn: ... });  // Runs even without ID
```

✅ **Use enabled option**
```typescript
useQuery({
  queryKey: [...],
  queryFn: ...,
  enabled: !!id  // Only run if ID exists
});
```
