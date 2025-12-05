# Fleet Feast - Design Patterns

**Version**: 1.0
**Last Updated**: 2025-12-03
**Status**: Active

---

## Table of Contents

1. [Frontend Patterns](#frontend-patterns)
2. [Backend Patterns](#backend-patterns)
3. [Database Patterns](#database-patterns)
4. [Authentication & Authorization Patterns](#authentication--authorization-patterns)
5. [Error Handling Patterns](#error-handling-patterns)
6. [State Management Patterns](#state-management-patterns)
7. [API Integration Patterns](#api-integration-patterns)
8. [Security Patterns](#security-patterns)
9. [Testing Patterns](#testing-patterns)
10. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)

---

## Frontend Patterns

### Pattern 1: Component Composition

**Intent**: Build complex UIs from small, focused components.

**When to Use**:
- Creating reusable UI elements
- Building feature-specific component hierarchies
- Implementing design system components

**Implementation**:

```typescript
// Base UI component (atomic)
// components/ui/card.tsx
import { cn } from "@/lib/utils/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn("rounded-lg border bg-white p-6 shadow-sm", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return (
    <div className={cn("mb-4 border-b pb-4", className)}>
      {children}
    </div>
  );
}

export function CardContent({ children, className }: CardProps) {
  return (
    <div className={cn("text-gray-700", className)}>
      {children}
    </div>
  );
}

// Feature component (molecular)
// components/features/booking/BookingCard.tsx
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Booking } from "@/types/models";

interface BookingCardProps {
  booking: Booking;
  onCancel?: (id: string) => void;
}

export function BookingCard({ booking, onCancel }: BookingCardProps) {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">{booking.vendor.businessName}</h3>
        <p className="text-sm text-gray-500">
          {new Date(booking.eventDate).toLocaleDateString()}
        </p>
      </CardHeader>
      <CardContent>
        <p>Guests: {booking.guestCount}</p>
        <p>Location: {booking.location}</p>
        {booking.status === "pending" && onCancel && (
          <Button
            variant="destructive"
            onClick={() => onCancel(booking.id)}
            className="mt-4"
          >
            Cancel Booking
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
```

**Benefits**:
- Reusability across features
- Easier testing of isolated components
- Consistent UI patterns

---

### Pattern 2: Controlled Form with React Hook Form + Zod

**Intent**: Handle form state and validation with type safety.

**When to Use**:
- All user input forms
- Forms requiring complex validation
- Multi-step forms

**Implementation**:

```typescript
// components/features/booking/BookingForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

// 1. Define schema
const bookingSchema = z.object({
  vendorId: z.string().uuid("Invalid vendor ID"),
  eventDate: z.coerce.date().min(new Date(), "Event must be in the future"),
  eventTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  guestCount: z.number()
    .int("Must be whole number")
    .positive("Must be at least 1")
    .max(10000, "Maximum 10,000 guests"),
  location: z.string().min(5, "Location must be at least 5 characters"),
  eventType: z.enum(["corporate", "private", "wedding", "festival"]),
  specialRequests: z.string().optional(),
});

// 2. Infer TypeScript type from schema
type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  vendorId: string;
  onSubmit: (data: BookingFormData) => Promise<void>;
}

export function BookingForm({ vendorId, onSubmit }: BookingFormProps) {
  // 3. Initialize form with resolver
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      vendorId,
    },
  });

  // 4. Submit handler
  const onFormSubmit = async (data: BookingFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Booking failed:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      {/* Event Date */}
      <div>
        <label htmlFor="eventDate" className="block text-sm font-medium">
          Event Date
        </label>
        <Input
          id="eventDate"
          type="date"
          {...register("eventDate")}
          aria-invalid={errors.eventDate ? "true" : "false"}
        />
        {errors.eventDate && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.eventDate.message}
          </p>
        )}
      </div>

      {/* Guest Count */}
      <div>
        <label htmlFor="guestCount" className="block text-sm font-medium">
          Guest Count
        </label>
        <Input
          id="guestCount"
          type="number"
          {...register("guestCount", { valueAsNumber: true })}
          aria-invalid={errors.guestCount ? "true" : "false"}
        />
        {errors.guestCount && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.guestCount.message}
          </p>
        )}
      </div>

      {/* Event Type */}
      <div>
        <label htmlFor="eventType" className="block text-sm font-medium">
          Event Type
        </label>
        <select
          id="eventType"
          {...register("eventType")}
          className="w-full rounded border p-2"
          aria-invalid={errors.eventType ? "true" : "false"}
        >
          <option value="">Select type...</option>
          <option value="corporate">Corporate Event</option>
          <option value="private">Private Party</option>
          <option value="wedding">Wedding</option>
          <option value="festival">Festival</option>
        </select>
        {errors.eventType && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.eventType.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Submitting..." : "Request Booking"}
      </Button>
    </form>
  );
}
```

**Benefits**:
- Type-safe form data
- Automatic validation
- Consistent error handling
- Accessible by default

---

### Pattern 3: Server Component Data Fetching

**Intent**: Fetch data on the server for optimal performance and SEO.

**When to Use**:
- Initial page data loading
- Data that doesn't require interactivity
- SEO-critical content

**Implementation**:

```typescript
// app/(dashboard)/bookings/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { BookingList } from "@/components/features/booking/BookingList";

// This is a Server Component by default in Next.js 14 App Router
export default async function BookingsPage() {
  // 1. Authenticate on server
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // 2. Fetch data on server
  const bookings = await prisma.booking.findMany({
    where: {
      customerId: session.user.id,
    },
    include: {
      vendor: {
        select: {
          businessName: true,
          cuisineType: true,
        },
      },
      payment: {
        select: {
          amount: true,
          status: true,
        },
      },
    },
    orderBy: {
      eventDate: "desc",
    },
  });

  // 3. Render with server-fetched data
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">My Bookings</h1>
      <BookingList bookings={bookings} />
    </div>
  );
}

// 4. Optional: configure caching
export const revalidate = 60; // Revalidate every 60 seconds
```

**Benefits**:
- No client-side loading states
- Better SEO
- Reduced client bundle size
- Server-side data security

---

### Pattern 4: Client Component with TanStack Query

**Intent**: Fetch and cache data in interactive client components.

**When to Use**:
- Data that changes frequently
- User-triggered data fetching
- Optimistic updates needed

**Implementation**:

```typescript
// components/features/vendor/VendorSearch.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { VendorCard } from "./VendorCard";
import { Spinner } from "@/components/ui/spinner";
import type { Vendor } from "@/types/models";

interface SearchParams {
  cuisine?: string;
  date?: string;
  minCapacity?: number;
}

async function searchVendors(params: SearchParams): Promise<Vendor[]> {
  const query = new URLSearchParams(
    Object.entries(params).filter(([_, v]) => v !== undefined) as [string, string][]
  );

  const response = await fetch(`/api/vendors?${query}`);

  if (!response.ok) {
    throw new Error("Failed to search vendors");
  }

  return response.json();
}

export function VendorSearch() {
  const [searchParams, setSearchParams] = useState<SearchParams>({});

  // TanStack Query manages caching, refetching, and state
  const {
    data: vendors,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["vendors", searchParams],
    queryFn: () => searchVendors(searchParams),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    enabled: true, // Auto-fetch on mount
  });

  const handleSearch = (cuisine: string) => {
    setSearchParams({ ...searchParams, cuisine });
  };

  if (error) {
    return (
      <div className="text-center text-red-600">
        Error loading vendors. Please try again.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search by cuisine..."
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <Spinner />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vendors?.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      )}
    </div>
  );
}
```

**Benefits**:
- Automatic caching
- Background refetching
- Loading and error states
- Optimistic updates support

---

## Backend Patterns

### Pattern 5: Service Layer

**Intent**: Separate business logic from API routes.

**When to Use**:
- Complex business logic
- Logic shared across multiple routes
- Logic requiring testing in isolation

**Implementation**:

```typescript
// services/bookingService.ts
import { prisma } from "@/lib/db/prisma";
import { BookingError } from "@/lib/errors";
import { notificationService } from "./notificationService";
import type { Booking, BookingStatus } from "@prisma/client";

interface CreateBookingInput {
  customerId: string;
  vendorId: string;
  eventDate: Date;
  eventTime: string;
  guestCount: number;
  location: string;
  eventType: string;
  specialRequests?: string;
}

export class BookingService {
  /**
   * Creates a new booking request.
   * Validates vendor availability and capacity.
   */
  async create(input: CreateBookingInput): Promise<Booking> {
    // 1. Validate vendor exists and is approved
    const vendor = await prisma.vendor.findUnique({
      where: { id: input.vendorId },
      select: {
        id: true,
        status: true,
        capacityMin: true,
        capacityMax: true,
      },
    });

    if (!vendor) {
      throw new BookingError("Vendor not found", 404);
    }

    if (vendor.status !== "approved") {
      throw new BookingError("Vendor is not accepting bookings", 400);
    }

    // 2. Validate capacity
    if (input.guestCount < vendor.capacityMin || input.guestCount > vendor.capacityMax) {
      throw new BookingError(
        `Vendor capacity is ${vendor.capacityMin}-${vendor.capacityMax} guests`,
        400
      );
    }

    // 3. Check vendor availability
    const availability = await prisma.availability.findFirst({
      where: {
        vendorId: input.vendorId,
        date: input.eventDate,
        isAvailable: true,
      },
    });

    if (!availability) {
      throw new BookingError("Vendor is not available on this date", 400);
    }

    // 4. Check for existing bookings on same date
    const existingBooking = await prisma.booking.findFirst({
      where: {
        vendorId: input.vendorId,
        eventDate: input.eventDate,
        status: {
          in: ["pending", "confirmed"],
        },
      },
    });

    if (existingBooking) {
      throw new BookingError("Vendor already has a booking on this date", 409);
    }

    // 5. Create booking
    const booking = await prisma.booking.create({
      data: {
        customerId: input.customerId,
        vendorId: input.vendorId,
        eventDate: input.eventDate,
        eventTime: input.eventTime,
        guestCount: input.guestCount,
        location: input.location,
        eventType: input.eventType,
        specialRequests: input.specialRequests,
        status: "pending",
      },
      include: {
        vendor: {
          select: {
            businessName: true,
            user: {
              select: { email: true },
            },
          },
        },
        customer: {
          select: { email: true },
        },
      },
    });

    // 6. Send notifications (non-blocking)
    notificationService.sendBookingRequest(booking).catch((error) => {
      console.error("Failed to send booking notification:", error);
    });

    return booking;
  }

  /**
   * Updates booking status with business rule validation.
   */
  async updateStatus(
    bookingId: string,
    status: BookingStatus,
    updatedBy: string
  ): Promise<Booking> {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        vendor: { select: { userId: true } },
      },
    });

    if (!booking) {
      throw new BookingError("Booking not found", 404);
    }

    // Validate state transition
    const validTransitions: Record<BookingStatus, BookingStatus[]> = {
      pending: ["confirmed", "declined", "cancelled"],
      confirmed: ["completed", "cancelled"],
      declined: [],
      cancelled: [],
      completed: [],
    };

    if (!validTransitions[booking.status].includes(status)) {
      throw new BookingError(
        `Cannot transition from ${booking.status} to ${status}`,
        400
      );
    }

    // Update booking
    return await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });
  }

  /**
   * Calculates refund amount based on cancellation policy.
   */
  calculateRefund(booking: Booking, cancelledAt: Date): number {
    const daysUntilEvent = Math.floor(
      (booking.eventDate.getTime() - cancelledAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilEvent >= 7) {
      return booking.totalAmount; // 100% refund
    } else if (daysUntilEvent >= 3) {
      return booking.totalAmount * 0.5; // 50% refund
    } else {
      return 0; // No refund
    }
  }
}

export const bookingService = new BookingService();
```

**Benefits**:
- Business logic isolated from HTTP layer
- Easier to test
- Reusable across different API routes
- Clear separation of concerns

---

### Pattern 6: API Route Error Handling

**Intent**: Standardized error handling across all API routes.

**When to Use**:
- All API routes
- Consistent error responses

**Implementation**:

```typescript
// lib/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BookingError extends AppError {
  constructor(message: string, statusCode: number = 400) {
    super(message, statusCode, "BOOKING_ERROR");
  }
}

export class PaymentError extends AppError {
  constructor(message: string, statusCode: number = 400) {
    super(message, statusCode, "PAYMENT_ERROR");
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401, "AUTHENTICATION_ERROR");
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, 403, "AUTHORIZATION_ERROR");
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public details?: unknown) {
    super(message, 400, "VALIDATION_ERROR");
  }
}

// lib/api/errorHandler.ts
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { AppError, ValidationError } from "@/lib/errors";

export function handleApiError(error: unknown): NextResponse {
  console.error("API Error:", error);

  // Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: error.errors,
      },
      { status: 400 }
    );
  }

  // Application errors
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        ...(error instanceof ValidationError && { details: error.details }),
      },
      { status: error.statusCode }
    );
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Resource already exists", code: "DUPLICATE_ERROR" },
        { status: 409 }
      );
    }
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Resource not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }
  }

  // Generic server error
  return NextResponse.json(
    { error: "Internal server error", code: "INTERNAL_ERROR" },
    { status: 500 }
  );
}

// Usage in API route
// app/api/bookings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { bookingService } from "@/services/bookingService";
import { handleApiError } from "@/lib/api/errorHandler";
import { BookingRequestSchema } from "@/lib/validation/booking";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new AuthenticationError();
    }

    const body = await req.json();
    const data = BookingRequestSchema.parse(body);

    const booking = await bookingService.create({
      ...data,
      customerId: session.user.id,
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
```

**Benefits**:
- Consistent error responses
- Proper HTTP status codes
- Centralized error logging
- Client-friendly error messages

---

### Pattern 7: Prisma Transaction Pattern

**Intent**: Ensure data consistency for multi-step database operations.

**When to Use**:
- Creating related entities (booking + payment)
- Operations requiring rollback on failure
- Financial transactions

**Implementation**:

```typescript
// services/paymentService.ts
import { prisma } from "@/lib/db/prisma";
import { stripe } from "@/lib/stripe";
import { PaymentError } from "@/lib/errors";

interface ProcessPaymentInput {
  bookingId: string;
  amount: number;
  customerId: string;
  vendorId: string;
  paymentMethodId: string;
}

export class PaymentService {
  async processBookingPayment(input: ProcessPaymentInput) {
    // Use transaction to ensure atomicity
    return await prisma.$transaction(async (tx) => {
      // 1. Create payment record in pending state
      const payment = await tx.payment.create({
        data: {
          bookingId: input.bookingId,
          amount: input.amount,
          status: "pending",
        },
      });

      try {
        // 2. Process payment with Stripe
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(input.amount * 100), // Convert to cents
          currency: "usd",
          payment_method: input.paymentMethodId,
          confirm: true,
          metadata: {
            bookingId: input.bookingId,
            paymentId: payment.id,
          },
        });

        // 3. Update payment record with Stripe ID
        const updatedPayment = await tx.payment.update({
          where: { id: payment.id },
          data: {
            stripePaymentId: paymentIntent.id,
            status: "captured",
            capturedAt: new Date(),
          },
        });

        // 4. Update booking status
        await tx.booking.update({
          where: { id: input.bookingId },
          data: { status: "confirmed" },
        });

        return updatedPayment;
      } catch (stripeError) {
        // 5. Mark payment as failed (transaction will rollback)
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: "failed" },
        });

        throw new PaymentError(
          stripeError instanceof Error
            ? stripeError.message
            : "Payment processing failed"
        );
      }
    });
  }
}

export const paymentService = new PaymentService();
```

**Benefits**:
- Data consistency guaranteed
- Automatic rollback on failure
- No orphaned records
- Clear error handling

---

## Database Patterns

### Pattern 8: Repository Pattern with Prisma

**Intent**: Abstract database queries for testability and flexibility.

**When to Use**:
- Complex query logic
- Multiple query variations for same entity
- Need to swap database implementations

**Implementation**:

```typescript
// lib/repositories/vendorRepository.ts
import { prisma } from "@/lib/db/prisma";
import type { Vendor, Prisma } from "@prisma/client";

export interface VendorSearchFilters {
  cuisineType?: string;
  priceRange?: string;
  minCapacity?: number;
  maxCapacity?: number;
  eventType?: string;
  availableOn?: Date;
  rating?: number;
}

export class VendorRepository {
  /**
   * Search vendors with complex filtering.
   */
  async search(filters: VendorSearchFilters, page = 1, pageSize = 20) {
    const where: Prisma.VendorWhereInput = {
      status: "approved", // Only show approved vendors
      ...(filters.cuisineType && { cuisineType: filters.cuisineType }),
      ...(filters.priceRange && { priceRange: filters.priceRange }),
      ...(filters.minCapacity && { capacityMax: { gte: filters.minCapacity } }),
      ...(filters.maxCapacity && { capacityMin: { lte: filters.maxCapacity } }),
    };

    // Add availability filter if date specified
    if (filters.availableOn) {
      where.availability = {
        some: {
          date: filters.availableOn,
          isAvailable: true,
        },
      };
    }

    // Add rating filter
    if (filters.rating) {
      where.averageRating = {
        gte: filters.rating,
      };
    }

    const [vendors, total] = await Promise.all([
      prisma.vendor.findMany({
        where,
        include: {
          _count: {
            select: {
              bookings: true,
              reviews: true,
            },
          },
        },
        orderBy: [
          { averageRating: "desc" },
          { createdAt: "desc" },
        ],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.vendor.count({ where }),
    ]);

    return {
      vendors,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * Get vendor with full profile data.
   */
  async findByIdWithProfile(vendorId: string) {
    return await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: {
        menu: true,
        reviews: {
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            reviewer: {
              select: {
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });
  }

  /**
   * Update vendor average rating (called after new review).
   */
  async updateAverageRating(vendorId: string) {
    const result = await prisma.review.aggregate({
      where: {
        revieweeId: vendorId,
      },
      _avg: {
        rating: true,
      },
    });

    if (result._avg.rating !== null) {
      await prisma.vendor.update({
        where: { id: vendorId },
        data: { averageRating: result._avg.rating },
      });
    }
  }
}

export const vendorRepository = new VendorRepository();
```

**Benefits**:
- Centralized query logic
- Easier to test and mock
- Reusable across services
- Database abstraction

---

## Authentication & Authorization Patterns

### Pattern 9: RBAC Middleware

**Intent**: Enforce role-based access control on API routes.

**When to Use**:
- Protected API routes
- Role-specific endpoints
- Admin-only operations

**Implementation**:

```typescript
// lib/auth/rbac.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { AuthenticationError, AuthorizationError } from "@/lib/errors";

export type UserRole = "customer" | "vendor" | "admin";

interface RBACOptions {
  allowedRoles: UserRole[];
}

/**
 * Higher-order function that wraps API route handlers with RBAC.
 */
export function withRBAC(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: RBACOptions
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // 1. Verify authentication
      const session = await getServerSession(authOptions);

      if (!session?.user) {
        throw new AuthenticationError();
      }

      // 2. Verify authorization
      if (!options.allowedRoles.includes(session.user.role as UserRole)) {
        throw new AuthorizationError(
          `Access denied. Required roles: ${options.allowedRoles.join(", ")}`
        );
      }

      // 3. Attach user to request for handler use
      (req as any).user = session.user;

      // 4. Call actual handler
      return await handler(req);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

// Usage
// app/api/admin/vendors/route.ts
import { withRBAC } from "@/lib/auth/rbac";

async function adminVendorsHandler(req: NextRequest) {
  // Only admins can reach this code
  const vendors = await prisma.vendor.findMany({
    where: { status: "pending" },
  });

  return NextResponse.json(vendors);
}

export const GET = withRBAC(adminVendorsHandler, {
  allowedRoles: ["admin"],
});

// app/api/bookings/route.ts
async function createBookingHandler(req: NextRequest) {
  // Only customers can reach this code
  const user = (req as any).user;
  const body = await req.json();

  const booking = await bookingService.create({
    ...body,
    customerId: user.id,
  });

  return NextResponse.json(booking, { status: 201 });
}

export const POST = withRBAC(createBookingHandler, {
  allowedRoles: ["customer"],
});
```

**Benefits**:
- Declarative access control
- Consistent auth checks
- Easy to audit permissions
- Reduces boilerplate

---

## State Management Patterns

### Pattern 10: Zustand Store

**Intent**: Manage client-side global state with minimal boilerplate.

**When to Use**:
- Auth state (user session)
- UI state (modals, sidebars)
- Shopping cart / multi-step forms
- Cross-component state

**Implementation**:

```typescript
// store/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  role: "customer" | "vendor" | "admin";
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: user !== null,
        }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "auth-storage", // localStorage key
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// store/bookingStore.ts
import { create } from "zustand";

interface BookingDraft {
  vendorId: string;
  eventDate?: Date;
  guestCount?: number;
  location?: string;
  eventType?: string;
}

interface BookingState {
  draft: BookingDraft | null;
  saveDraft: (draft: BookingDraft) => void;
  clearDraft: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  draft: null,

  saveDraft: (draft) => set({ draft }),

  clearDraft: () => set({ draft: null }),
}));

// Usage in component
// components/features/booking/BookingWizard.tsx
"use client";

import { useBookingStore } from "@/store/bookingStore";
import { Button } from "@/components/ui/button";

export function BookingWizard() {
  const { draft, saveDraft, clearDraft } = useBookingStore();

  const handleNext = () => {
    saveDraft({
      ...draft,
      guestCount: 50,
    });
  };

  return (
    <div>
      <p>Vendor: {draft?.vendorId}</p>
      <Button onClick={handleNext}>Next Step</Button>
    </div>
  );
}
```

**Benefits**:
- Simple API
- TypeScript support
- Persistence middleware
- No Provider wrappers needed

---

## Security Patterns

### Pattern 11: Anti-Circumvention Monitoring

**Intent**: Detect attempts to share contact information via in-app messaging.

**When to Use**:
- Message creation
- Profile updates
- Any user-generated content

**Implementation**:

```typescript
// lib/security/contentFilter.ts
export class ContentFilter {
  private static readonly PHONE_PATTERNS = [
    /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, // 555-555-5555
    /\b\(\d{3}\)\s*\d{3}[-.]?\d{4}\b/g, // (555) 555-5555
    /\b\d{10}\b/g, // 5555555555
  ];

  private static readonly EMAIL_PATTERN =
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;

  private static readonly SOCIAL_PATTERNS = [
    /(?:instagram|insta|ig)(?:\s*:|\s+)?\s*@?[\w.]+/gi,
    /(?:twitter|x)(?:\s*:|\s+)?\s*@?[\w.]+/gi,
    /(?:facebook|fb)(?:\s*:|\s+)?\s*@?[\w.]+/gi,
  ];

  /**
   * Scans content for contact information patterns.
   * Returns true if suspicious content detected.
   */
  static scanForContactInfo(content: string): {
    flagged: boolean;
    violations: string[];
  } {
    const violations: string[] = [];

    // Check for phone numbers
    for (const pattern of this.PHONE_PATTERNS) {
      if (pattern.test(content)) {
        violations.push("phone_number");
        break;
      }
    }

    // Check for emails
    if (this.EMAIL_PATTERN.test(content)) {
      violations.push("email");
    }

    // Check for social media handles
    for (const pattern of this.SOCIAL_PATTERNS) {
      if (pattern.test(content)) {
        violations.push("social_media");
        break;
      }
    }

    return {
      flagged: violations.length > 0,
      violations,
    };
  }

  /**
   * Redacts detected contact information from content.
   */
  static redactContactInfo(content: string): string {
    let redacted = content;

    // Redact phone numbers
    for (const pattern of this.PHONE_PATTERNS) {
      redacted = redacted.replace(pattern, "[REDACTED]");
    }

    // Redact emails
    redacted = redacted.replace(this.EMAIL_PATTERN, "[REDACTED]");

    // Redact social media
    for (const pattern of this.SOCIAL_PATTERNS) {
      redacted = redacted.replace(pattern, "[REDACTED]");
    }

    return redacted;
  }
}

// services/messageService.ts
import { prisma } from "@/lib/db/prisma";
import { ContentFilter } from "@/lib/security/contentFilter";
import { violationService } from "./violationService";

export class MessageService {
  async create(data: {
    bookingId: string;
    senderId: string;
    content: string;
  }) {
    // 1. Scan for contact info
    const scanResult = ContentFilter.scanForContactInfo(data.content);

    // 2. Create message (flagged if violations detected)
    const message = await prisma.message.create({
      data: {
        bookingId: data.bookingId,
        senderId: data.senderId,
        content: data.content,
        flagged: scanResult.flagged,
      },
    });

    // 3. If violations detected, create violation record
    if (scanResult.flagged) {
      await violationService.recordViolation({
        userId: data.senderId,
        type: "CONTACT_INFO_SHARING",
        description: `Attempted to share: ${scanResult.violations.join(", ")}`,
        evidence: {
          messageId: message.id,
          violations: scanResult.violations,
        },
      });

      // 4. Check violation count and potentially suspend user
      const violationCount = await prisma.violation.count({
        where: {
          userId: data.senderId,
          type: "CONTACT_INFO_SHARING",
        },
      });

      if (violationCount >= 3) {
        await this.suspendUser(data.senderId);
      }
    }

    return message;
  }

  private async suspendUser(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { status: "suspended" },
    });
  }
}

export const messageService = new MessageService();
```

**Benefits**:
- Automated monitoring
- Evidence collection
- Escalation path
- Deterrent effect

---

## Anti-Patterns to Avoid

### ❌ Anti-Pattern 1: Prop Drilling

**Bad**:
```typescript
// Passing props through many levels
function App() {
  const user = useUser();
  return <Layout user={user} />;
}

function Layout({ user }) {
  return <Sidebar user={user} />;
}

function Sidebar({ user }) {
  return <UserMenu user={user} />;
}
```

**Good**:
```typescript
// Use Zustand or React Context
function UserMenu() {
  const user = useAuthStore((state) => state.user);
  return <div>{user.email}</div>;
}
```

---

### ❌ Anti-Pattern 2: Business Logic in API Routes

**Bad**:
```typescript
// app/api/bookings/route.ts
export async function POST(req: NextRequest) {
  const body = await req.json();

  // ❌ Business logic mixed with HTTP handling
  const vendor = await prisma.vendor.findUnique({
    where: { id: body.vendorId },
  });

  if (!vendor) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.guestCount < vendor.capacityMin) {
    return NextResponse.json({ error: "Too few guests" }, { status: 400 });
  }

  // ... more business logic
}
```

**Good**:
```typescript
// app/api/bookings/route.ts
export async function POST(req: NextRequest) {
  const body = await req.json();
  const data = BookingRequestSchema.parse(body);

  // ✅ Delegate to service layer
  const booking = await bookingService.create(data);

  return NextResponse.json(booking, { status: 201 });
}
```

---

### ❌ Anti-Pattern 3: Using `any` Type

**Bad**:
```typescript
function processBooking(data: any) {
  // ❌ No type safety
  console.log(data.vendorId);
}
```

**Good**:
```typescript
interface BookingData {
  vendorId: string;
  eventDate: Date;
}

function processBooking(data: BookingData) {
  // ✅ Type-safe
  console.log(data.vendorId);
}
```

---

### ❌ Anti-Pattern 4: Not Handling Loading/Error States

**Bad**:
```typescript
function VendorList() {
  const { data } = useQuery({ queryKey: ["vendors"], queryFn: fetchVendors });

  // ❌ What if data is undefined or error occurred?
  return <div>{data.map(...)}</div>;
}
```

**Good**:
```typescript
function VendorList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["vendors"],
    queryFn: fetchVendors,
  });

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!data) return <EmptyState />;

  return <div>{data.map(...)}</div>;
}
```

---

### ❌ Anti-Pattern 5: Mutating State Directly

**Bad**:
```typescript
const [bookings, setBookings] = useState<Booking[]>([]);

// ❌ Direct mutation
bookings.push(newBooking);
setBookings(bookings);
```

**Good**:
```typescript
const [bookings, setBookings] = useState<Booking[]>([]);

// ✅ Immutable update
setBookings([...bookings, newBooking]);
```

---

**This is a living document. Update as new patterns emerge and are validated in production.**
