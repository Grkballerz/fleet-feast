# Fleet Feast - Coding Standards

**Version**: 1.0
**Last Updated**: 2025-12-03
**Status**: Active

---

## Table of Contents

1. [General Principles](#general-principles)
2. [TypeScript Standards](#typescript-standards)
3. [File Organization](#file-organization)
4. [Naming Conventions](#naming-conventions)
5. [React/Next.js Standards](#reactnextjs-standards)
6. [API Standards](#api-standards)
7. [Database Standards](#database-standards)
8. [Testing Standards](#testing-standards)
9. [Security Standards](#security-standards)
10. [Performance Standards](#performance-standards)
11. [Documentation Standards](#documentation-standards)
12. [Git Standards](#git-standards)

---

## General Principles

### Code Quality Tenets

1. **Readability First**: Code is read more than written. Optimize for clarity.
2. **Type Safety**: Leverage TypeScript's type system fully. Avoid `any`.
3. **Single Responsibility**: Functions/components should do ONE thing well.
4. **DRY (Don't Repeat Yourself)**: Extract common logic into reusable utilities.
5. **KISS (Keep It Simple)**: Avoid premature optimization and over-engineering.
6. **Fail Fast**: Validate early, throw errors explicitly, handle gracefully.
7. **Immutability**: Prefer immutable data structures and pure functions.
8. **Testability**: Write code that's easy to test in isolation.

### Code Review Checklist

Before submitting code for review, ensure:

- [ ] All TypeScript errors resolved (`npm run type-check`)
- [ ] ESLint passes with no warnings (`npm run lint`)
- [ ] Code formatted with Prettier (`npm run format`)
- [ ] All imports are absolute paths (using `@/` alias)
- [ ] No `console.log` statements (use `console.warn/error` if needed)
- [ ] No unused variables (prefixed with `_` if intentionally unused)
- [ ] All functions have JSDoc comments for complex logic
- [ ] Security best practices followed (see Security Standards)

---

## TypeScript Standards

### Type Definitions

**DO**: Define explicit types for all public APIs

```typescript
// Good
interface BookingRequest {
  vendorId: string;
  eventDate: Date;
  guestCount: number;
  location: string;
}

async function createBooking(data: BookingRequest): Promise<Booking> {
  // implementation
}
```

**DON'T**: Use `any` or implicit types

```typescript
// Bad
async function createBooking(data: any) {
  // implementation
}
```

### Type Inference

**DO**: Let TypeScript infer simple types

```typescript
// Good - type inferred as string
const vendorName = "Joe's Tacos";

// Good - type inferred as number[]
const ratings = [4, 5, 3, 5];
```

**DON'T**: Over-specify obvious types

```typescript
// Bad - redundant type annotation
const vendorName: string = "Joe's Tacos";
```

### Null Handling

**DO**: Use optional chaining and nullish coalescing

```typescript
// Good
const capacity = vendor?.capacity ?? 100;
const email = user?.email?.toLowerCase();
```

**DON'T**: Use loose equality or manual null checks

```typescript
// Bad
const capacity = vendor && vendor.capacity ? vendor.capacity : 100;
```

### Enums vs Union Types

**DO**: Use string literal unions for simple cases

```typescript
// Good
type UserRole = "customer" | "vendor" | "admin";
type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";
```

**DO**: Use enums for values that need reverse mapping or namespacing

```typescript
// Good
enum ViolationType {
  ContactInfoSharing = "CONTACT_INFO_SHARING",
  OffPlatformTransaction = "OFF_PLATFORM_TRANSACTION",
  FakeReview = "FAKE_REVIEW"
}
```

### Type Guards

**DO**: Use type guards for runtime validation

```typescript
// Good
function isVendor(user: User): user is Vendor {
  return user.role === "vendor";
}

if (isVendor(user)) {
  // TypeScript knows user is Vendor here
  console.log(user.businessName);
}
```

### Zod for Runtime Validation

**DO**: Use Zod schemas for all external inputs (API, forms, env vars)

```typescript
// Good
import { z } from "zod";

const BookingRequestSchema = z.object({
  vendorId: z.string().uuid(),
  eventDate: z.coerce.date().min(new Date()),
  guestCount: z.number().int().positive().max(10000),
  location: z.string().min(5),
  eventType: z.enum(["corporate", "private", "wedding", "festival"]),
});

type BookingRequest = z.infer<typeof BookingRequestSchema>;
```

---

## File Organization

### Project Structure

```
src/
├── app/                          # Next.js 14 App Router
│   ├── (auth)/                   # Route groups
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── bookings/
│   │   └── profile/
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   ├── bookings/
│   │   └── vendors/
│   ├── layout.tsx
│   └── page.tsx
├── components/                   # React components
│   ├── ui/                       # Shadcn/Radix primitives
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   └── input.tsx
│   ├── features/                 # Feature-specific components
│   │   ├── booking/
│   │   │   ├── BookingCard.tsx
│   │   │   ├── BookingForm.tsx
│   │   │   └── BookingStatus.tsx
│   │   └── vendor/
│   │       ├── VendorCard.tsx
│   │       └── VendorProfile.tsx
│   └── layout/                   # Layout components
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── Sidebar.tsx
├── lib/                          # Shared utilities
│   ├── api/                      # API client utilities
│   │   ├── client.ts
│   │   └── endpoints.ts
│   ├── db/                       # Database utilities
│   │   └── prisma.ts
│   ├── utils/                    # Helper functions
│   │   ├── cn.ts                 # classname merger
│   │   ├── format.ts             # formatters
│   │   └── validation.ts         # validators
│   ├── auth.ts                   # NextAuth config
│   └── constants.ts              # App constants
├── hooks/                        # Custom React hooks
│   ├── useBooking.ts
│   ├── useAuth.ts
│   └── useVendor.ts
├── store/                        # Zustand state management
│   ├── authStore.ts
│   ├── bookingStore.ts
│   └── uiStore.ts
├── types/                        # TypeScript type definitions
│   ├── api.ts
│   ├── models.ts
│   └── index.ts
├── services/                     # Business logic layer
│   ├── bookingService.ts
│   ├── vendorService.ts
│   ├── paymentService.ts
│   └── notificationService.ts
└── middleware.ts                 # Next.js middleware
```

### File Naming Conventions

| File Type | Convention | Example |
|-----------|------------|---------|
| React Components | PascalCase | `BookingCard.tsx` |
| Utilities | camelCase | `formatDate.ts` |
| Hooks | camelCase with `use` prefix | `useBooking.ts` |
| Constants | UPPER_SNAKE_CASE | `API_ROUTES.ts` |
| Types | PascalCase | `BookingTypes.ts` |
| API Routes | lowercase kebab | `booking-request.ts` |
| Test Files | Same as source + `.test` | `BookingCard.test.tsx` |

### Import Organization

**DO**: Group imports by origin, sort alphabetically within groups

```typescript
// Good
// 1. External dependencies
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// 2. Internal absolute imports
import { Button } from "@/components/ui/button";
import { useBooking } from "@/hooks/useBooking";
import { BookingRequest } from "@/types/models";

// 3. Relative imports (avoid if possible)
import { formatDate } from "../utils/format";

// 4. Type-only imports (separated)
import type { Booking } from "@/types/models";
```

### Barrel Exports

**DO**: Use index files for clean imports

```typescript
// components/features/booking/index.ts
export { BookingCard } from "./BookingCard";
export { BookingForm } from "./BookingForm";
export { BookingStatus } from "./BookingStatus";

// Usage
import { BookingCard, BookingForm } from "@/components/features/booking";
```

---

## Naming Conventions

### Variables & Functions

| Type | Convention | Example |
|------|------------|---------|
| Variables | camelCase | `const bookingCount = 5;` |
| Constants | UPPER_SNAKE_CASE | `const MAX_GUESTS = 10000;` |
| Functions | camelCase | `function createBooking() {}` |
| Classes | PascalCase | `class BookingService {}` |
| Interfaces | PascalCase | `interface Booking {}` |
| Type Aliases | PascalCase | `type BookingStatus = ...` |
| Enums | PascalCase | `enum UserRole {}` |
| React Components | PascalCase | `function BookingCard() {}` |
| React Hooks | camelCase with `use` | `function useBooking() {}` |

### Boolean Naming

**DO**: Use `is`, `has`, `should`, `can` prefixes

```typescript
// Good
const isLoading = false;
const hasPermission = true;
const shouldShowModal = false;
const canEdit = true;
```

**DON'T**: Use ambiguous names

```typescript
// Bad
const loading = false;
const permission = true;
```

### Event Handlers

**DO**: Use `handle` prefix for handlers

```typescript
// Good
function handleSubmit(e: FormEvent) {}
function handleBookingClick(id: string) {}
```

**DO**: Use `on` prefix for props

```typescript
// Good
interface Props {
  onSubmit: (data: BookingRequest) => void;
  onClick: () => void;
}
```

### Database Entity Naming

**DO**: Use singular, descriptive names

```typescript
// Good - Prisma schema
model User {}
model Booking {}
model VendorDocument {}
```

**DON'T**: Use plurals or abbreviations

```typescript
// Bad
model Users {}
model Bkng {}
```

---

## React/Next.js Standards

### Component Structure

**DO**: Follow consistent component structure

```typescript
// Good
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Booking } from "@/types/models";

// 1. Type definitions
interface BookingCardProps {
  booking: Booking;
  onCancel?: (id: string) => void;
}

// 2. Component definition
export function BookingCard({ booking, onCancel }: BookingCardProps) {
  // 3. Hooks
  const [isExpanded, setIsExpanded] = useState(false);

  // 4. Derived state
  const canCancel = booking.status === "pending";

  // 5. Event handlers
  const handleCancelClick = () => {
    if (onCancel) {
      onCancel(booking.id);
    }
  };

  // 6. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### Server vs Client Components

**DO**: Use Server Components by default (Next.js 14)

```typescript
// Good - Server Component (no "use client")
// app/bookings/page.tsx
import { BookingList } from "@/components/features/booking";

export default async function BookingsPage() {
  const bookings = await fetchBookings();

  return <BookingList bookings={bookings} />;
}
```

**DO**: Use Client Components only when needed

```typescript
// Good - Client Component (uses interactivity)
// components/features/booking/BookingForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

export function BookingForm() {
  // Interactive form logic
}
```

**When to use Client Components:**
- State management (`useState`, `useReducer`)
- Event handlers (`onClick`, `onChange`)
- Browser APIs (`localStorage`, `window`)
- Custom hooks (`useBooking`, `useAuth`)
- Third-party libraries requiring browser APIs

### Prop Destructuring

**DO**: Destructure props in function signature

```typescript
// Good
function BookingCard({ booking, onCancel }: BookingCardProps) {
  return <div>{booking.id}</div>;
}
```

**DON'T**: Access props via `props` object

```typescript
// Bad
function BookingCard(props: BookingCardProps) {
  return <div>{props.booking.id}</div>;
}
```

### Conditional Rendering

**DO**: Use ternary for simple conditions

```typescript
// Good
{isLoading ? <Spinner /> : <Content />}
```

**DO**: Use `&&` for rendering or null

```typescript
// Good
{error && <ErrorMessage error={error} />}
```

**DO**: Use early returns for complex conditions

```typescript
// Good
if (isLoading) return <Spinner />;
if (error) return <ErrorMessage error={error} />;
return <Content />;
```

### Children Prop

**DO**: Use explicit `children` type

```typescript
// Good
interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
}
```

---

## API Standards

### API Route Structure

**DO**: Follow RESTful conventions

```
POST   /api/bookings              # Create booking
GET    /api/bookings/:id          # Get single booking
GET    /api/bookings              # List bookings
PATCH  /api/bookings/:id          # Update booking
DELETE /api/bookings/:id          # Cancel booking

GET    /api/vendors               # Search vendors
GET    /api/vendors/:id           # Get vendor profile
POST   /api/vendors               # Create vendor (application)
```

### API Route Implementation

**DO**: Use standard error handling wrapper

```typescript
// Good
// app/api/bookings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const BookingRequestSchema = z.object({
  vendorId: z.string().uuid(),
  eventDate: z.coerce.date(),
  guestCount: z.number().int().positive(),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Parse and validate input
    const body = await req.json();
    const data = BookingRequestSchema.parse(body);

    // 3. Authorize
    if (session.user.role !== "customer") {
      return NextResponse.json(
        { error: "Forbidden - customers only" },
        { status: 403 }
      );
    }

    // 4. Business logic (delegated to service)
    const booking = await bookingService.create({
      ...data,
      customerId: session.user.id,
    });

    // 5. Return success
    return NextResponse.json(booking, { status: 201 });

  } catch (error) {
    // 6. Error handling
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof BookingError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error("Booking creation failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### Error Response Format

**DO**: Return consistent error structure

```typescript
// Good
{
  "error": "Human-readable message",
  "code": "VENDOR_NOT_FOUND",  // optional
  "details": {}                 // optional, for validation errors
}
```

### Success Response Format

**DO**: Return the entity or entities directly

```typescript
// Good - Single entity
{
  "id": "uuid",
  "status": "pending",
  "createdAt": "2025-12-03T10:00:00Z"
}

// Good - List with metadata
{
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

---

## Database Standards

### Prisma Best Practices

**DO**: Use Prisma Client singleton

```typescript
// lib/db/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

### Transaction Pattern

**DO**: Use transactions for multi-step operations

```typescript
// Good
async function createBookingWithPayment(data: BookingWithPayment) {
  return await prisma.$transaction(async (tx) => {
    // 1. Create booking
    const booking = await tx.booking.create({
      data: {
        customerId: data.customerId,
        vendorId: data.vendorId,
        eventDate: data.eventDate,
      },
    });

    // 2. Create payment
    const payment = await tx.payment.create({
      data: {
        bookingId: booking.id,
        amount: data.totalAmount,
        status: "pending",
      },
    });

    return { booking, payment };
  });
}
```

### Query Optimization

**DO**: Select only needed fields

```typescript
// Good
const vendor = await prisma.vendor.findUnique({
  where: { id },
  select: {
    id: true,
    businessName: true,
    cuisineType: true,
    _count: {
      select: { bookings: true }
    },
  },
});
```

**DO**: Use `include` for relations you need

```typescript
// Good
const booking = await prisma.booking.findUnique({
  where: { id },
  include: {
    vendor: {
      select: {
        businessName: true,
        cuisineType: true,
      },
    },
    payment: true,
  },
});
```

---

## Testing Standards

### Test File Organization

**DO**: Colocate test files with source

```
components/
├── features/
│   └── booking/
│       ├── BookingCard.tsx
│       ├── BookingCard.test.tsx
│       ├── BookingForm.tsx
│       └── BookingForm.test.tsx
```

### Test Naming

**DO**: Use descriptive `describe` and `it` blocks

```typescript
// Good
describe("BookingCard", () => {
  describe("when booking is pending", () => {
    it("should display cancel button", () => {
      // test
    });

    it("should call onCancel when cancel button clicked", () => {
      // test
    });
  });

  describe("when booking is completed", () => {
    it("should hide cancel button", () => {
      // test
    });
  });
});
```

---

## Security Standards

### Input Validation

**DO**: Validate ALL external inputs with Zod

```typescript
// Good
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const result = schema.safeParse(data);
if (!result.success) {
  throw new ValidationError(result.error);
}
```

### Authentication

**DO**: Use NextAuth.js session verification

```typescript
// Good
const session = await getServerSession(authOptions);
if (!session?.user) {
  return unauthorized();
}
```

### Authorization

**DO**: Check permissions explicitly

```typescript
// Good
if (session.user.role !== "admin") {
  return forbidden();
}

// Good - resource ownership
const booking = await prisma.booking.findUnique({ where: { id } });
if (booking.customerId !== session.user.id) {
  return forbidden();
}
```

### SQL Injection Prevention

**DO**: Use Prisma (parameterized queries) - NEVER raw SQL

```typescript
// Good
const users = await prisma.user.findMany({
  where: {
    email: {
      contains: searchTerm,
    },
  },
});

// Bad - SQL injection risk
const users = await prisma.$queryRawUnsafe(
  `SELECT * FROM users WHERE email LIKE '%${searchTerm}%'`
);
```

### XSS Prevention

**DO**: Sanitize user-generated content before rendering

```typescript
// Good
import DOMPurify from "isomorphic-dompurify";

const sanitizedContent = DOMPurify.sanitize(userContent);
```

### Secrets Management

**DO**: Use environment variables, NEVER commit secrets

```typescript
// Good
const stripeKey = process.env.STRIPE_SECRET_KEY;

// Bad
const stripeKey = "sk_live_..."; // NEVER DO THIS
```

---

## Performance Standards

### React Query (TanStack Query)

**DO**: Use for all data fetching in client components

```typescript
// Good
"use client";

import { useQuery } from "@tanstack/react-query";

export function VendorList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["vendors"],
    queryFn: () => fetch("/api/vendors").then(res => res.json()),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) return <Spinner />;
  if (error) return <Error />;

  return <div>{/* render */}</div>;
}
```

### Image Optimization

**DO**: Use Next.js Image component

```typescript
// Good
import Image from "next/image";

<Image
  src={vendor.imageUrl}
  alt={vendor.businessName}
  width={400}
  height={300}
  priority={false}
/>
```

### Code Splitting

**DO**: Use dynamic imports for large components

```typescript
// Good
import dynamic from "next/dynamic";

const VendorMap = dynamic(() => import("@/components/features/VendorMap"), {
  loading: () => <Spinner />,
  ssr: false,
});
```

---

## Documentation Standards

### JSDoc Comments

**DO**: Document complex functions

```typescript
/**
 * Creates a booking and processes payment in a single transaction.
 *
 * @param data - Booking and payment details
 * @returns Created booking with payment confirmation
 * @throws {BookingError} If vendor is unavailable
 * @throws {PaymentError} If payment processing fails
 */
async function createBookingWithPayment(data: BookingWithPayment): Promise<BookingResult> {
  // implementation
}
```

### Component Documentation

**DO**: Document component props and usage

```typescript
/**
 * Displays a food truck vendor profile card.
 *
 * @example
 * ```tsx
 * <VendorCard
 *   vendor={vendor}
 *   onBook={(id) => router.push(`/book/${id}`)}
 * />
 * ```
 */
interface VendorCardProps {
  /** Vendor entity with profile data */
  vendor: Vendor;
  /** Callback when user clicks book button */
  onBook?: (vendorId: string) => void;
}
```

---

## Git Standards

### Commit Messages

**DO**: Use conventional commit format

```
feat: add booking cancellation flow
fix: resolve duplicate payment processing
docs: update API documentation for vendors
refactor: extract booking logic into service
test: add integration tests for payment flow
chore: update dependencies
```

### Branch Naming

**DO**: Use descriptive branch names

```
feature/booking-cancellation
fix/payment-duplicate-charge
refactor/vendor-service-extraction
test/integration-payment-flow
```

---

**This is a living document. Update as patterns emerge and evolve.**
