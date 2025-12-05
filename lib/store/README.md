# Fleet Feast - State Management Guide

Complete guide to state management architecture for Fleet Feast using Zustand and TanStack Query.

## Architecture Overview

Fleet Feast uses a **hybrid state management approach**:

1. **Zustand** - Client state (lightweight, no boilerplate)
2. **TanStack Query** - Server state (caching, refetching, optimistic updates)
3. **NextAuth** - Authentication session (server-side + JWT cookies)

### State Classification

| Type | Solution | Persistence | Examples |
|------|----------|-------------|----------|
| **Client State** | Zustand | localStorage | Auth user, booking draft, UI state |
| **Server State** | TanStack Query | Cache (memory) | Vendors, bookings, payments |
| **Session State** | NextAuth | HTTP-only cookie | JWT token, session data |
| **URL State** | Next.js router | URL params | Search filters, pagination |

---

## Zustand Stores

### 1. Auth Store (`lib/store/auth.ts`)

Manages authentication state with localStorage persistence.

```typescript
import { useAuthStore } from "@/lib/store";

// In component
const { user, isAuthenticated, setUser, clearUser, isAdmin } = useAuthStore();

// Set user after login
setUser({
  id: "123",
  email: "user@example.com",
  name: "John Doe",
  role: UserRole.CUSTOMER,
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Role checks
if (isAdmin()) {
  // Admin-only logic
}
```

**State:**
- `user: User | null` - Current user object
- `isAuthenticated: boolean` - Auth status
- `isLoading: boolean` - Loading state during hydration

**Actions:**
- `setUser(user)` - Set authenticated user
- `clearUser()` - Clear user on logout
- `updateUser(updates)` - Update specific user fields

**Helpers:**
- `isAdmin()` - Check if user is admin
- `isVendor()` - Check if user is vendor
- `isCustomer()` - Check if user is customer
- `hasRole(role)` - Check specific role

**Persistence:** localStorage key `fleet-feast-auth`

---

### 2. Booking Store (`lib/store/booking.ts`)

Manages booking draft during multi-step booking flow.

```typescript
import { useBookingStore } from "@/lib/store";

// In component
const { draftBooking, setVendor, setEventDetails, nextStep, clearDraft } = useBookingStore();

// Step 1: Select vendor
setVendor("vendor-123", "Tacos Loco", 2500); // $25.00 per person

// Step 2: Event details
setEventDetails({
  eventDate: "2024-12-15",
  eventLocation: "123 Main St, New York, NY",
  guestCount: 50,
  specialRequests: "Please arrive by 5 PM",
});

// Navigate
nextStep(); // Move to payment step

// Clear after submission
clearDraft();
```

**State:**
- `draftBooking: DraftBooking` - Current booking draft
  - `vendorId`, `vendorName`, `pricePerPerson` (Step 1)
  - `eventDate`, `eventLocation`, `guestCount`, `specialRequests` (Step 2)
  - `totalAmount`, `platformFee` (Step 3)
  - `currentStep: 1 | 2 | 3`

**Actions:**
- `setVendor(id, name, price)` - Set vendor (Step 1)
- `setEventDetails(details)` - Set event details (Step 2)
- `setPayment(amount, fee)` - Set payment (Step 3)
- `setStep(step)` - Jump to specific step
- `nextStep()` - Move to next step
- `previousStep()` - Move to previous step
- `clearDraft()` - Clear all booking data

**Helpers:**
- `isStepComplete(step)` - Check if step has required data
- `getTotalAmount()` - Calculate total (price × guests)

**Persistence:** localStorage key `fleet-feast-booking` (excludes payment info)

---

### 3. UI Store (`lib/store/ui.ts`)

Manages ephemeral UI state (toasts, modals, sidebar). NOT persisted.

```typescript
import { useUIStore } from "@/lib/store";

// Toasts
const { toasts, addToast, removeToast, clearToasts } = useUIStore();

const toastId = addToast({
  type: "success",
  title: "Booking confirmed!",
  message: "Your booking has been submitted.",
  duration: 5000, // Auto-dismiss after 5s
});

// Manually remove
removeToast(toastId);

// Modals
const { openModal, closeModal, isModalOpen } = useUIStore();

openModal("confirm-booking-modal");
if (isModalOpen("confirm-booking-modal")) {
  // Modal is open
}
closeModal("confirm-booking-modal");

// Sidebar (mobile)
const { isSidebarOpen, toggleSidebar, openSidebar, closeSidebar } = useUIStore();
```

**State:**
- `toasts: Toast[]` - Active toasts
- `openModals: Set<string>` - Open modal IDs
- `isSidebarOpen: boolean` - Sidebar state (mobile)

**Actions:**
- `addToast(toast)` - Add toast (auto-dismiss after duration)
- `removeToast(id)` - Remove specific toast
- `clearToasts()` - Clear all toasts
- `openModal(id)` - Open modal by ID
- `closeModal(id)` - Close modal by ID
- `isModalOpen(id)` - Check if modal is open
- `toggleSidebar()`, `openSidebar()`, `closeSidebar()`

**Persistence:** None (ephemeral)

---

### 4. Search Store (`lib/store/search.ts`)

Manages vendor search filters with URL sync for shareable searches.

```typescript
import { useSearchStore } from "@/lib/store";
import { CuisineType } from "@/types";

// In component
const { filters, setFilter, setFilters, clearFilters, getURLSearchParams } = useSearchStore();

// Set single filter
setFilter("cuisineType", [CuisineType.MEXICAN, CuisineType.BBQ]);
setFilter("minPrice", 1000); // $10.00
setFilter("maxPrice", 5000); // $50.00
setFilter("minGuests", 20);
setFilter("maxGuests", 100);

// Set multiple filters
setFilters({
  eventDate: "2024-12-15",
  location: "New York, NY",
});

// Clear all filters
clearFilters();

// URL sync (for shareable search)
const params = getURLSearchParams();
router.push(`/search?${params.toString()}`);

// Load from URL
const urlParams = new URLSearchParams(window.location.search);
loadFromURLSearchParams(urlParams);
```

**State:**
- `filters: VendorSearchFilters` - Current search filters
- `activeFiltersCount: number` - Count of active filters

**Actions:**
- `setFilter(key, value)` - Set single filter
- `setFilters(filters)` - Set multiple filters
- `clearFilters()` - Clear all filters
- `clearFilter(key)` - Clear specific filter

**Helpers:**
- `hasActiveFilters()` - Check if any filters active
- `getURLSearchParams()` - Export filters to URL params
- `loadFromURLSearchParams(params)` - Load filters from URL

**Persistence:** localStorage key `fleet-feast-search`

---

## Custom React Hooks

### useAuth Hook (`hooks/useAuth.ts`)

Combines NextAuth session with Zustand auth store.

```typescript
import { useAuth } from "@/hooks/useAuth";

function MyComponent() {
  const { user, isAuthenticated, isLoading, login, logout, isAdmin } = useAuth();

  const handleLogin = async () => {
    try {
      await login("user@example.com", "password123");
      // Redirects to dashboard
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleLogout = async () => {
    await logout();
    // Clears user from store
  };

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please log in</div>;

  return <div>Welcome, {user?.name}!</div>;
}
```

**Returns:**
- `user: User | null` - Current user
- `isAuthenticated: boolean` - Auth status
- `isLoading: boolean` - Loading state
- `login(email, password)` - Login function
- `logout()` - Logout function
- `register(data)` - Register + auto-login
- `isAdmin`, `isVendor`, `isCustomer` - Role helpers
- `hasRole(role)` - Check specific role

**Features:**
- Syncs NextAuth session with Zustand store
- Provides login/logout/register functions
- Auto-updates store on session changes

---

### useBooking Hook (`hooks/useBooking.ts`)

Manages booking draft and submission.

```typescript
import { useBooking } from "@/hooks/useBooking";

function BookingFlow() {
  const {
    draftBooking,
    setVendor,
    setEventDetails,
    submitBooking,
    isSubmitting,
    clearDraft,
  } = useBooking();

  const handleSubmit = async (paymentMethodId: string) => {
    try {
      const booking = await submitBooking(paymentMethodId);
      // Success - redirects to booking details
      // Draft automatically cleared
      // Bookings query invalidated
    } catch (error) {
      // Error toast shown automatically
    }
  };

  return (
    <div>
      <h1>Step {draftBooking.currentStep} of 3</h1>
      {/* Booking form */}
    </div>
  );
}
```

**Returns:**
- `draftBooking: DraftBooking` - Current draft state
- `setVendor(id, name, price)` - Set vendor
- `setEventDetails(details)` - Set event details
- `setPayment(amount, fee)` - Set payment
- `nextStep()`, `previousStep()`, `setStep(step)` - Navigation
- `clearDraft()` - Clear draft
- `isStepComplete(step)` - Validation
- `getTotalAmount()` - Calculate total
- `submitBooking(paymentMethodId)` - Submit booking
- `isSubmitting: boolean` - Loading state

**Features:**
- TanStack Query mutation for submission
- Auto-invalidates bookings query on success
- Auto-clears draft on success
- Shows toast notifications
- Redirects to booking details

---

### useToast Hook (`hooks/useToast.ts`)

Show toast notifications.

```typescript
import { useToast } from "@/hooks/useToast";

function MyComponent() {
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  const handleAction = async () => {
    try {
      await someAction();
      showSuccess("Success!", "Action completed successfully.");
    } catch (error) {
      showError("Error", error.message);
    }
  };

  return <button onClick={handleAction}>Do Action</button>;
}
```

**Returns:**
- `showSuccess(title, message?)` - Show success toast
- `showError(title, message?)` - Show error toast
- `showWarning(title, message?)` - Show warning toast
- `showInfo(title, message?)` - Show info toast
- `showToast(type, title, message?, duration?)` - Generic toast
- `removeToast(id)` - Manually remove toast
- `clearToasts()` - Clear all toasts
- `toasts: Toast[]` - Active toasts array

**Features:**
- Auto-dismiss after duration (default 5s, errors 7s)
- Returns toast ID for manual removal
- Queue management (multiple toasts)

---

## TanStack Query Configuration

### Query Client Setup (`lib/queries/index.ts`)

```typescript
import { createQueryClient, queryKeys, queryPresets } from "@/lib/queries";

// In Providers component
const queryClient = createQueryClient();

// Query keys
import { useQuery } from "@tanstack/react-query";

const { data: vendor } = useQuery({
  queryKey: queryKeys.vendor("vendor-123"),
  queryFn: () => fetchVendor("vendor-123"),
});
```

**Default Options:**
- `staleTime: 5 minutes` - Data fresh for 5 minutes
- `gcTime: 10 minutes` - Inactive data cached for 10 minutes
- `retry: 2 times` - Retry 5xx errors (not 4xx)
- `retryDelay: exponential backoff` - 1s, 2s, 4s...
- `refetchOnWindowFocus: false` - Don't refetch on focus
- `refetchOnMount: true` - Refetch stale data on mount

**Query Keys:**
All query keys exported as constants:
- `queryKeys.vendors` - All vendors
- `queryKeys.vendor(id)` - Single vendor
- `queryKeys.vendorSearch(filters)` - Search results
- `queryKeys.bookings` - All bookings
- `queryKeys.booking(id)` - Single booking
- etc.

**Query Presets:**
- `queryPresets.realtime` - Poll every 5s, refetch on focus
- `queryPresets.static` - Cache for 1 hour, no refetch
- `queryPresets.search` - Cache for 2 minutes
- `queryPresets.userSpecific` - Cache 5 min, refetch on mount

---

## Usage Patterns

### Pattern 1: Fetch Vendor List

```typescript
import { useQuery } from "@tanstack/react-query";
import { queryKeys, queryPresets } from "@/lib/queries";

function VendorList() {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.vendors,
    queryFn: async () => {
      const res = await fetch("/api/vendors");
      if (!res.ok) throw new Error("Failed to fetch vendors");
      return res.json();
    },
    ...queryPresets.search, // Use search preset (2min cache)
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data.map((vendor) => (
        <VendorCard key={vendor.id} vendor={vendor} />
      ))}
    </div>
  );
}
```

---

### Pattern 2: Search with Filters

```typescript
import { useQuery } from "@tanstack/react-query";
import { useSearchStore } from "@/lib/store";
import { queryKeys } from "@/lib/queries";

function VendorSearch() {
  const { filters, setFilter, clearFilters } = useSearchStore();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.vendorSearch(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.cuisineType) params.set("cuisine", filters.cuisineType.join(","));
      if (filters.minPrice) params.set("minPrice", filters.minPrice.toString());
      // ... other filters

      const res = await fetch(`/api/vendors/search?${params}`);
      return res.json();
    },
    enabled: Object.keys(filters).length > 0, // Only run if filters set
  });

  return (
    <div>
      <FilterBar onFilterChange={setFilter} onClear={clearFilters} />
      {isLoading ? <Spinner /> : <VendorGrid vendors={data} />}
    </div>
  );
}
```

---

### Pattern 3: Create Booking with Optimistic Update

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import { useToast } from "@/hooks/useToast";

function BookingForm() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  const mutation = useMutation({
    mutationFn: async (bookingData) => {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });
      if (!res.ok) throw new Error("Booking failed");
      return res.json();
    },
    onSuccess: (newBooking) => {
      // Invalidate bookings query to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings });

      // Or optimistically update cache
      queryClient.setQueryData(queryKeys.bookings, (old) => [...old, newBooking]);

      showSuccess("Booking created!", "Your booking has been confirmed.");
    },
    onError: (error) => {
      showError("Booking failed", error.message);
    },
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(formData); }}>
      {/* Form fields */}
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Submitting..." : "Book Now"}
      </button>
    </form>
  );
}
```

---

### Pattern 4: Multi-Step Booking Flow

```typescript
import { useBooking } from "@/hooks/useBooking";
import { useRouter } from "next/navigation";

function BookingWizard() {
  const router = useRouter();
  const {
    draftBooking,
    setVendor,
    setEventDetails,
    nextStep,
    previousStep,
    isStepComplete,
    submitBooking,
    isSubmitting,
  } = useBooking();

  // Step 1: Vendor selection
  if (draftBooking.currentStep === 1) {
    return (
      <VendorSelector
        onSelect={(vendor) => {
          setVendor(vendor.id, vendor.businessName, vendor.pricePerPerson);
          nextStep();
        }}
      />
    );
  }

  // Step 2: Event details
  if (draftBooking.currentStep === 2) {
    return (
      <EventDetailsForm
        onSubmit={(details) => {
          setEventDetails(details);
          nextStep();
        }}
        onBack={previousStep}
      />
    );
  }

  // Step 3: Payment
  if (draftBooking.currentStep === 3) {
    return (
      <PaymentForm
        amount={draftBooking.totalAmount}
        onSubmit={async (paymentMethodId) => {
          await submitBooking(paymentMethodId);
          // Auto-redirects to booking details on success
        }}
        onBack={previousStep}
        isSubmitting={isSubmitting}
      />
    );
  }
}
```

---

## Best Practices

### 1. State Placement

**Use Zustand when:**
- State is client-side only (UI state, drafts)
- State needs localStorage persistence
- State is global and used across many components

**Use TanStack Query when:**
- Fetching data from API
- Need caching and refetching
- Need optimistic updates
- Data is server-side

**Use URL state when:**
- Filters should be shareable (search params)
- Pagination state
- Tab selection

---

### 2. Query Key Consistency

Always use `queryKeys` constants:

```typescript
// Good
queryKey: queryKeys.vendor(id)

// Bad
queryKey: ["vendor", id]
```

---

### 3. Error Handling

Always handle errors in mutations:

```typescript
const mutation = useMutation({
  mutationFn: createBooking,
  onSuccess: (data) => {
    showSuccess("Success!");
  },
  onError: (error) => {
    showError("Error", error.message);
  },
});
```

---

### 4. Loading States

Always show loading states:

```typescript
if (query.isLoading) return <Spinner />;
if (query.error) return <ErrorMessage error={query.error} />;
return <Content data={query.data} />;
```

---

### 5. Invalidation vs Refetch

```typescript
// Invalidate - marks as stale, refetches if component mounted
queryClient.invalidateQueries({ queryKey: queryKeys.bookings });

// Refetch - forces immediate refetch
queryClient.refetchQueries({ queryKey: queryKeys.bookings });

// Set data - optimistically update cache
queryClient.setQueryData(queryKeys.bookings, newData);
```

---

## Testing

### Testing Zustand Stores

```typescript
import { renderHook, act } from "@testing-library/react";
import { useAuthStore } from "@/lib/store";

test("auth store setUser", () => {
  const { result } = renderHook(() => useAuthStore());

  act(() => {
    result.current.setUser({
      id: "123",
      email: "test@example.com",
      name: "Test User",
      role: UserRole.CUSTOMER,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  expect(result.current.isAuthenticated).toBe(true);
  expect(result.current.user?.email).toBe("test@example.com");
});
```

---

### Testing TanStack Query

```typescript
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

test("fetch vendors", async () => {
  const { result } = renderHook(() => useQuery({ queryKey: ["vendors"], queryFn: fetchVendors }), {
    wrapper: createWrapper(),
  });

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toHaveLength(10);
});
```

---

## Troubleshooting

### Issue: Store not persisting
- Check localStorage key name matches
- Verify `partialize` function in persist config
- Clear localStorage and test again

### Issue: Query not refetching
- Check `staleTime` - data may still be fresh
- Use `refetchOnMount: true` if needed
- Manually invalidate with `queryClient.invalidateQueries`

### Issue: Optimistic update not working
- Verify query key matches exactly
- Use `setQueryData` with correct data shape
- Consider `onMutate` callback for complex updates

---

## Migration from v3 to v4

If upgrading from MASTER_WIZARD v3:

1. Replace Redux with Zustand
2. Replace SWR with TanStack Query
3. Update import paths
4. Update hook names (useAppDispatch → useAuthStore)
5. Update query keys to use constants

---

**Fleet Feast State Management v1.0**
For questions, see Architecture Docs or contact Jordan_Junction
