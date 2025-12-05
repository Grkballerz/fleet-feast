# Fleet Feast - Architecture Overview

**Last Updated**: 2025-12-04
**Audience**: Developers, technical stakeholders
**Status**: Production-ready design

---

## Quick Summary

Fleet Feast is a **Next.js 14 monolithic application** using the **App Router** pattern with **Server Components by default**. It's a marketplace platform connecting food trucks with corporate events, built with TypeScript, Prisma ORM, PostgreSQL, and Stripe Connect.

**Key Characteristics:**
- **Server-first architecture**: Maximize server components for performance
- **Type-safe end-to-end**: TypeScript + Prisma + Zod
- **Monolithic for MVP**: Single deployable unit, clear module boundaries
- **Edge-optimized**: Deployed on Vercel's global network
- **Payment escrow**: 7-day hold period with Stripe Connect

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [System Architecture](#system-architecture)
3. [Directory Structure](#directory-structure)
4. [Key Patterns](#key-patterns)
5. [Core Modules](#core-modules)
6. [Data Flow](#data-flow)
7. [Security](#security)
8. [Further Reading](#further-reading)

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14.2+ | React framework with App Router |
| **React** | 18.2+ | UI library |
| **TypeScript** | 5.6+ | Type safety |
| **Tailwind CSS** | 3.4+ | Utility-first styling |
| **Radix UI** | Various | Accessible component primitives |
| **React Hook Form** | 7.53+ | Form handling |
| **Zod** | 3.23+ | Runtime validation |
| **Zustand** | 4.5+ | Client-side state |
| **TanStack Query** | 5.56+ | Server state management |
| **Lucide React** | Latest | Icon library |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js API Routes** | 14.2+ | RESTful API layer |
| **Prisma** | 5.20+ | ORM and database client |
| **PostgreSQL** | 15+ | Primary database |
| **Redis** | 7+ | Caching and sessions |
| **NextAuth.js** | 5.0-beta | Authentication |
| **Stripe** | 17.0+ | Payment processing |
| **AWS SDK** | 2.x | S3 file storage |
| **bcryptjs** | 2.4+ | Password hashing |

### Infrastructure

| Service | Purpose |
|---------|---------|
| **Vercel** | Application hosting |
| **AWS RDS** | PostgreSQL hosting |
| **AWS ElastiCache** | Redis hosting |
| **AWS S3** | File storage |
| **AWS SES** | Email delivery |
| **Sentry** | Error tracking |

---

## System Architecture

### Layered Architecture

```
┌─────────────────────────────────────────────────┐
│         Presentation Layer                      │
│   (Server Components, Client Components)        │
│   - Pages, Layouts, UI Components               │
├─────────────────────────────────────────────────┤
│          Application Layer                      │
│      (API Routes, Server Actions)               │
│   - RESTful endpoints, mutations                │
├─────────────────────────────────────────────────┤
│          Business Logic Layer                   │
│    (Services, Validators, Utils)                │
│   - booking.service.ts, payment.service.ts      │
├─────────────────────────────────────────────────┤
│          Data Access Layer                      │
│         (Prisma Client, Redis)                  │
│   - Database queries, caching                   │
├─────────────────────────────────────────────────┤
│         Infrastructure Layer                    │
│   (PostgreSQL, Redis, S3, Stripe)               │
└─────────────────────────────────────────────────┘
```

### Request Flow

```
User Browser
    ↓
[Next.js Server Component] → Fetch data directly
    ↓
[Prisma ORM] → Query database
    ↓
[PostgreSQL] → Return data
    ↓
[Server Component] → Render HTML
    ↓
Send to Browser (with minimal JavaScript)

-- OR --

User Browser
    ↓
[Client Component] → User interaction (form, click)
    ↓
[API Route] → /api/bookings
    ↓
[Business Service] → booking.service.ts
    ↓
[Prisma + Database] → Persist data
    ↓
[API Response] → Return JSON
    ↓
[Client Component] → Update UI
```

---

## Directory Structure

### High-Level Organization

```
fleet-feast/
├── app/                    # Next.js App Router (pages + API routes)
├── components/             # Shared React components
├── lib/                    # Core utilities, services, config
├── prisma/                 # Database schema and migrations
├── public/                 # Static assets
├── docs/                   # Documentation (you are here!)
├── .claude/                # Agent configurations
└── tests/                  # Test files
```

### App Router Structure

```
app/
├── (auth)/                 # Route group: Authentication pages
│   ├── login/
│   └── register/
├── (marketing)/            # Route group: Public pages
│   ├── page.tsx            # Homepage
│   └── about/
├── (dashboard)/            # Route group: Protected dashboards
│   ├── customer/
│   ├── vendor/
│   └── admin/
├── vendors/                # Vendor listing and profiles
│   ├── page.tsx            # List all vendors
│   └── [id]/page.tsx       # Individual vendor profile
├── bookings/               # Booking management
│   ├── [id]/page.tsx       # Booking details
│   └── new/page.tsx        # Create booking
└── api/                    # API routes
    ├── auth/               # NextAuth endpoints
    ├── bookings/           # Booking CRUD
    ├── vendors/            # Vendor CRUD
    ├── payments/           # Payment processing
    ├── messages/           # In-app messaging
    └── webhooks/           # Stripe webhooks
```

### Component Organization

```
components/
├── ui/                     # Radix UI wrapper components
│   ├── button.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   └── select.tsx
├── features/               # Feature-specific components
│   ├── booking/
│   │   ├── BookingCard.tsx
│   │   ├── BookingForm.tsx
│   │   └── BookingStatus.tsx
│   └── vendor/
│       ├── VendorCard.tsx
│       └── VendorProfile.tsx
└── layout/                 # Layout components
    ├── Header.tsx
    ├── Footer.tsx
    └── Sidebar.tsx
```

### Library Organization

```
lib/
├── db/                     # Database clients
│   ├── prisma.ts           # Prisma singleton
│   └── redis.ts            # Redis client
├── auth/                   # Authentication
│   ├── config.ts           # NextAuth configuration
│   └── permissions.ts      # Authorization helpers
├── services/               # Business logic
│   ├── booking.service.ts
│   ├── payment.service.ts
│   ├── messaging.service.ts
│   └── search.service.ts
├── validators/             # Zod schemas
│   ├── booking.schema.ts
│   └── vendor.schema.ts
├── utils/                  # Helper functions
│   ├── date.ts
│   ├── currency.ts
│   └── errors.ts
└── constants/              # App constants
    └── routes.ts
```

---

## Key Patterns

### 1. Server Components by Default

**Principle**: Use Server Components unless you need client-side interactivity.

**Server Component** (default):
```tsx
// app/vendors/page.tsx
export default async function VendorsPage() {
  const vendors = await prisma.vendor.findMany(); // Direct DB query
  return <VendorList vendors={vendors} />;
}
```

**Client Component** (only when needed):
```tsx
// components/features/booking/BookingForm.tsx
'use client'

import { useState } from 'react';

export function BookingForm() {
  const [date, setDate] = useState(new Date());
  // Interactive form logic...
}
```

**When to use Client Components:**
- Forms with user input
- Interactive UI (modals, dropdowns)
- Browser APIs (localStorage, window)
- Event handlers (onClick, onChange)
- Custom hooks (useState, useEffect)

### 2. API Route Pattern

**Standard structure**:
```tsx
// app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

const schema = z.object({ /* validation */ });

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate
    const session = await getServerSession();
    if (!session) return unauthorized();

    // 2. Validate
    const data = schema.parse(await req.json());

    // 3. Authorize
    if (session.user.role !== 'customer') return forbidden();

    // 4. Business logic (delegate to service)
    const result = await bookingService.create(data);

    // 5. Return response
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    // 6. Error handling
    return handleError(error);
  }
}
```

### 3. Service Layer Pattern

**Extract business logic into services**:
```tsx
// lib/services/booking.service.ts
export class BookingService {
  async create(data: BookingRequest) {
    // Validate business rules
    const vendor = await this.validateVendor(data.vendorId);
    await this.checkAvailability(data.vendorId, data.eventDate);

    // Execute transaction
    return await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({ data });
      await tx.availability.update({ /* mark unavailable */ });
      return booking;
    });
  }
}
```

### 4. Error Handling

**Custom error classes**:
```tsx
// lib/utils/errors.ts
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends Error { /* ... */ }
export class ForbiddenError extends Error { /* ... */ }
```

**Global error boundary**:
```tsx
// app/error.tsx
'use client'

export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

---

## Core Modules

### 1. Authentication (NextAuth.js)

- **Provider**: Credentials (email/password)
- **Session**: JWT stored in HTTP-only cookies
- **Expiration**: 30 days
- **Roles**: CUSTOMER, VENDOR, ADMIN

**Configuration**: `lib/auth/config.ts`

### 2. Booking Engine

- **Flow**: Request-to-book (vendor must accept)
- **States**: PENDING → ACCEPTED → CONFIRMED → COMPLETED
- **Loyalty discount**: 5% for repeat customers
- **Service**: `lib/services/booking.service.ts`

### 3. Payment Processing (Stripe Connect)

- **Pattern**: Destination charges
- **Escrow**: 7-day hold after event
- **Platform fee**: 15% (normal) or 10% (loyalty)
- **Service**: `lib/services/payment.service.ts`

### 4. Messaging System

- **Type**: In-app only
- **Anti-circumvention**: Pattern detection for contact info
- **Flagging**: Automatic severity-based violations
- **Service**: `lib/services/messaging.service.ts`

### 5. Search & Discovery

- **Implementation**: PostgreSQL full-text search
- **Caching**: Redis (5-minute TTL)
- **Filters**: Cuisine, price, capacity, date, rating
- **Service**: `lib/services/search.service.ts`

### 6. File Storage (AWS S3)

- **Upload pattern**: Direct to S3 via presigned URLs
- **File types**: Documents (PDF), images (JPEG/PNG)
- **Storage**: Organized by user ID and file type

### 7. Admin Dashboard

- **Features**: Vendor approval, dispute resolution, analytics
- **Access**: ADMIN role only
- **Location**: `app/(dashboard)/admin/`

---

## Data Flow

### Key User Flows

#### 1. User Registration
```
User submits form
  → Validate with Zod
  → Hash password (bcrypt)
  → Create user in database
  → Send verification email
  → Auto-login with NextAuth
```

#### 2. Vendor Application
```
Vendor submits application
  → Upload documents to S3
  → Create vendor record (status: PENDING)
  → Admin reviews
  → Admin approves/rejects
  → If approved: Stripe Connect onboarding
```

#### 3. Booking Creation
```
Customer creates booking
  → Validate date/availability
  → Calculate pricing (base + loyalty discount)
  → Create Stripe PaymentIntent
  → Customer confirms payment
  → Vendor receives notification
  → Vendor accepts/declines
  → If accepted: Charge authorized
```

#### 4. Payment Escrow Flow
```
Event occurs
  → Booking status → COMPLETED
  → Start 7-day escrow period
  → Cron job checks daily
  → If no dispute: Release payment to vendor
  → If dispute: Hold until admin resolution
```

For detailed flow diagrams, see [architecture/DATA_FLOW.md](./architecture/DATA_FLOW.md).

---

## Security

### Multi-Layer Security

1. **Authentication**: NextAuth.js with JWT
2. **Authorization**: Role-based access control (RBAC)
3. **Input validation**: Zod schemas on all inputs
4. **SQL injection prevention**: Prisma parameterized queries
5. **XSS prevention**: React auto-escaping + CSP headers
6. **CSRF protection**: Next.js built-in (for Server Actions)
7. **Rate limiting**: Vercel edge + Redis-based custom limits
8. **Payment security**: PCI-DSS via Stripe (no card data stored)

### Anti-Circumvention

**Pattern detection**:
- Phone numbers
- Email addresses
- Social media handles
- Contact requests ("call me", "email me")

**Enforcement**:
- First violation: Warning
- Second violation: 7-day suspension
- Third violation: Permanent ban

---

## Further Reading

### For New Developers
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Local setup guide
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines
- **[../README.md](../README.md)** - Project overview

### Architecture Deep Dives
- **[architecture/ARCHITECTURE.md](./architecture/ARCHITECTURE.md)** - Complete system architecture (18 sections)
- **[architecture/DATA_FLOW.md](./architecture/DATA_FLOW.md)** - Detailed flow diagrams (8 flows)
- **[architecture/DECISIONS.md](./architecture/DECISIONS.md)** - Architecture Decision Records (10 ADRs)
- **[architecture/README.md](./architecture/README.md)** - Architecture docs navigation

### Database & API
- **[database/schema-design.md](./database/schema-design.md)** - Database schema
- **[database/erd-diagram.md](./database/erd-diagram.md)** - Entity relationship diagram
- **[api/api-design.md](./api/api-design.md)** - API conventions and endpoints
- **[API_Registry.md](./API_Registry.md)** - Complete API reference

### Standards & Patterns
- **[../.claude/docs/standards/coding-standards.md](../.claude/docs/standards/coding-standards.md)** - TypeScript, React, API standards
- **[../.claude/docs/standards/patterns.md](../.claude/docs/standards/patterns.md)** - Common patterns and best practices

### Operations
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment guide
- **Database migrations**: `prisma/migrations/`
- **Environment variables**: `.env.example`

---

## Architecture Principles

1. **Simplicity over complexity**: Monolithic architecture for MVP
2. **Type safety everywhere**: TypeScript + Prisma + Zod
3. **Server-first**: Maximize Server Components for performance
4. **Progressive enhancement**: Works without JavaScript where possible
5. **Fail fast**: Validate early, throw errors explicitly
6. **Database-centric**: PostgreSQL as primary data store
7. **Horizontal scalability**: Clear path from MVP to 100K users

---

## Technology Decisions

For detailed rationale behind each technology choice, see:
- **[architecture/DECISIONS.md](./architecture/DECISIONS.md)** - 10 Architecture Decision Records

**Key decisions**:
- **ADR-001**: Next.js App Router (vs Pages Router)
- **ADR-002**: Prisma ORM (vs TypeORM, Drizzle)
- **ADR-004**: Monolithic architecture (vs microservices)
- **ADR-006**: Stripe Connect (vs PayPal, direct integration)
- **ADR-010**: Vercel hosting (vs AWS, self-hosted)

---

**For questions or clarifications, see [CONTRIBUTING.md](./CONTRIBUTING.md) or reach out in #dev-help.**
