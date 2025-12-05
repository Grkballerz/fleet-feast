# Fleet Feast System Architecture

**Version**: 1.0
**Last Updated**: 2025-12-04
**Status**: Initial Design
**Author**: Alex_Architect

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Patterns](#architecture-patterns)
4. [System Components](#system-components)
5. [Directory Structure](#directory-structure)
6. [API Layer Design](#api-layer-design)
7. [Database Architecture](#database-architecture)
8. [Authentication & Authorization](#authentication--authorization)
9. [Payment Processing](#payment-processing)
10. [Messaging System](#messaging-system)
11. [Caching Strategy](#caching-strategy)
12. [File Storage](#file-storage)
13. [Background Jobs](#background-jobs)
14. [Error Handling](#error-handling)
15. [Logging & Monitoring](#logging--monitoring)
16. [Security Architecture](#security-architecture)
17. [Performance Optimization](#performance-optimization)
18. [Deployment Strategy](#deployment-strategy)

---

## System Overview

Fleet Feast is a marketplace platform built as a **monolithic Next.js 14+ application** using the **App Router** pattern. The architecture prioritizes:

- **Simplicity**: Single deployable unit for faster iteration
- **Developer Experience**: Type-safe end-to-end with TypeScript
- **Performance**: Edge-optimized delivery via Vercel
- **Security**: Multi-layered protection for financial transactions
- **Scalability**: Database-first design with horizontal scaling path

### Core Architecture Principles

1. **Server-First**: Server Components by default, Client Components only when needed
2. **Type Safety**: Prisma schema as single source of truth for data types
3. **Progressive Enhancement**: Works without JavaScript where possible
4. **API-as-Backend**: Next.js API routes as the backend layer
5. **Database-Centric**: PostgreSQL as primary data store with Redis for caching

---

## Technology Stack

### Frontend Layer
| Technology | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| Next.js | 14.2+ | React framework | App Router, Server Components, built-in optimization |
| React | 18.2+ | UI library | Industry standard, large ecosystem |
| TypeScript | 5.6+ | Type system | Compile-time safety, better DX |
| Tailwind CSS | 3.4+ | Styling | Utility-first, design system consistency |
| Radix UI | Various | Primitives | Accessible, unstyled components |
| React Hook Form | 7.53+ | Form handling | Performance, validation |
| Zod | 3.23+ | Schema validation | Type inference, runtime safety |
| Zustand | 4.5+ | Client state | Lightweight, minimal boilerplate |
| TanStack Query | 5.56+ | Server state | Caching, synchronization, optimistic updates |

### Backend Layer
| Technology | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| Next.js API Routes | 14.2+ | API layer | Integrated with frontend, serverless-ready |
| Prisma | 5.20+ | ORM | Type-safe queries, migrations, excellent DX |
| PostgreSQL | 15+ | Primary database | ACID compliance, JSON support, full-text search |
| Redis | 7+ | Cache & sessions | Sub-millisecond reads, pub/sub for real-time |
| NextAuth.js | 5.0-beta | Authentication | JWT, session management, OAuth ready |
| Stripe | 17.0+ | Payments | Connect for marketplace, escrow support |
| AWS SDK | 2.1691+ | File storage | S3 for documents/images |

### Infrastructure
| Technology | Purpose | Justification |
|------------|---------|---------------|
| Vercel | Frontend hosting | Next.js optimization, edge network, zero-config |
| AWS RDS | PostgreSQL hosting | Managed service, automatic backups, scaling |
| AWS ElastiCache | Redis hosting | Managed Redis, multi-AZ availability |
| AWS S3 | File storage | Durable, scalable object storage |
| AWS SES | Email delivery | Cost-effective, high deliverability |
| Sentry | Error tracking | Real-time alerts, performance monitoring |

---

## Architecture Patterns

### 1. Layered Architecture

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│   (Server Components, Client Components)│
├─────────────────────────────────────────┤
│          Application Layer              │
│      (API Routes, Server Actions)       │
├─────────────────────────────────────────┤
│          Business Logic Layer           │
│    (Services, Validators, Utils)        │
├─────────────────────────────────────────┤
│          Data Access Layer              │
│         (Prisma Client, Redis)          │
├─────────────────────────────────────────┤
│         Infrastructure Layer            │
│   (PostgreSQL, Redis, S3, Stripe)       │
└─────────────────────────────────────────┘
```

### 2. Feature-Based Organization

Each feature module contains:
- **UI Components**: Server and Client Components
- **API Routes**: HTTP endpoints
- **Services**: Business logic
- **Validators**: Zod schemas
- **Types**: TypeScript interfaces
- **Tests**: Unit and integration tests

### 3. Server Component Default Pattern

```tsx
// Default: Server Component (async, data fetching)
export default async function VendorPage({ params }) {
  const vendor = await getVendor(params.id);
  return <VendorProfile vendor={vendor} />;
}

// Only when needed: Client Component
'use client'
export function BookingForm() {
  const [state, setState] = useState();
  // Interactive logic...
}
```

---

## System Components

### Core Components

#### 1. Authentication Service
- **Responsibility**: User authentication, session management, role-based access
- **Technology**: NextAuth.js v5
- **Data Store**: PostgreSQL (users), Redis (sessions)
- **Interfaces**: `/api/auth/*` endpoints

#### 2. Booking Engine
- **Responsibility**: Request-to-book flow, vendor acceptance, confirmation
- **Technology**: Server Actions + API routes
- **Data Store**: PostgreSQL (bookings)
- **Interfaces**: `/api/bookings`, Server Actions for mutations

#### 3. Payment Processor
- **Responsibility**: Escrow payments, fund release, refunds
- **Technology**: Stripe Connect
- **Data Store**: PostgreSQL (payments), Stripe (transactions)
- **Interfaces**: `/api/payments/*`, Stripe webhooks

#### 4. Messaging Service
- **Responsibility**: In-app messaging, anti-circumvention detection
- **Technology**: WebSocket (future) or polling (MVP)
- **Data Store**: PostgreSQL (messages), Redis (real-time)
- **Interfaces**: `/api/messages/*`

#### 5. Search & Discovery
- **Responsibility**: Vendor search, filtering, availability checks
- **Technology**: PostgreSQL full-text search + indexes
- **Data Store**: PostgreSQL (vendors, availability), Redis (cache)
- **Interfaces**: `/api/search`, `/api/vendors/*`

#### 6. Admin Dashboard
- **Responsibility**: Vendor approval, dispute resolution, analytics
- **Technology**: Server Components + API routes
- **Data Store**: PostgreSQL (all tables)
- **Interfaces**: `/api/admin/*`, `/admin/*` pages

#### 7. Notification Service
- **Responsibility**: Email and in-app notifications
- **Technology**: AWS SES + background jobs
- **Data Store**: PostgreSQL (notification queue), Redis (delivery status)
- **Interfaces**: Internal service, triggered by events

#### 8. File Upload Service
- **Responsibility**: Document uploads, image processing, secure URLs
- **Technology**: AWS S3 + presigned URLs
- **Data Store**: S3 (files), PostgreSQL (metadata)
- **Interfaces**: `/api/upload`

---

## Directory Structure

```
fleet-feast/
├── app/                           # Next.js App Router
│   ├── (auth)/                    # Auth route group
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx             # Auth-specific layout
│   ├── (marketing)/               # Public pages
│   │   ├── page.tsx               # Homepage
│   │   ├── about/
│   │   └── layout.tsx             # Marketing layout
│   ├── (dashboard)/               # Protected routes
│   │   ├── dashboard/
│   │   │   ├── customer/          # Customer dashboard
│   │   │   ├── vendor/            # Vendor dashboard
│   │   │   └── admin/             # Admin dashboard
│   │   └── layout.tsx             # Dashboard layout
│   ├── vendors/                   # Vendor pages
│   │   ├── [id]/
│   │   │   └── page.tsx           # Vendor profile
│   │   └── page.tsx               # Vendor listing
│   ├── bookings/
│   │   ├── [id]/
│   │   │   └── page.tsx           # Booking details
│   │   └── new/
│   │       └── page.tsx           # Create booking
│   ├── api/                       # API routes
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts       # NextAuth config
│   │   ├── bookings/
│   │   │   ├── route.ts           # GET, POST bookings
│   │   │   └── [id]/
│   │   │       └── route.ts       # GET, PATCH, DELETE booking
│   │   ├── vendors/
│   │   ├── payments/
│   │   ├── messages/
│   │   ├── admin/
│   │   └── webhooks/              # Stripe webhooks
│   ├── layout.tsx                 # Root layout
│   ├── error.tsx                  # Global error boundary
│   └── not-found.tsx              # 404 page
│
├── components/                    # Shared components
│   ├── ui/                        # Radix UI wrappers (Button, Dialog, etc.)
│   ├── forms/                     # Reusable form components
│   ├── layouts/                   # Layout components
│   └── features/                  # Feature-specific components
│       ├── bookings/
│       ├── vendors/
│       └── messaging/
│
├── lib/                           # Core utilities and configurations
│   ├── db/                        # Database utilities
│   │   ├── prisma.ts              # Prisma client singleton
│   │   └── redis.ts               # Redis client
│   ├── auth/                      # Auth utilities
│   │   ├── config.ts              # NextAuth configuration
│   │   ├── session.ts             # Session helpers
│   │   └── permissions.ts         # Role checks
│   ├── services/                  # Business logic services
│   │   ├── booking.service.ts
│   │   ├── payment.service.ts
│   │   ├── messaging.service.ts
│   │   ├── notification.service.ts
│   │   └── search.service.ts
│   ├── validators/                # Zod schemas
│   │   ├── booking.schema.ts
│   │   ├── vendor.schema.ts
│   │   └── user.schema.ts
│   ├── utils/                     # Utility functions
│   │   ├── date.ts
│   │   ├── currency.ts
│   │   └── errors.ts
│   ├── constants/                 # App constants
│   │   ├── routes.ts
│   │   └── config.ts
│   └── types/                     # TypeScript types
│       └── api.ts
│
├── prisma/
│   ├── schema.prisma              # Database schema
│   ├── migrations/                # Migration files
│   └── seed.ts                    # Seed data
│
├── public/                        # Static assets
│   ├── images/
│   └── icons/
│
├── jobs/                          # Background job definitions
│   ├── payment-release.job.ts
│   ├── notification.job.ts
│   └── cleanup.job.ts
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── docs/
│   └── architecture/              # This directory
│
├── .env.example
├── .env.local
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## API Layer Design

### REST API Conventions

#### Endpoint Structure
```
/api/{resource}/{id?}/{action?}
```

#### HTTP Methods
- `GET`: Retrieve resource(s)
- `POST`: Create resource
- `PATCH`: Partial update
- `DELETE`: Soft delete (most cases)
- `PUT`: Full replacement (rare)

### API Routes Organization

#### 1. Authentication (`/api/auth`)
```typescript
// Handled by NextAuth.js
POST   /api/auth/signin           // Email/password login
POST   /api/auth/signup           // User registration
POST   /api/auth/signout          // Logout
GET    /api/auth/session          // Get session
POST   /api/auth/reset-password   // Request reset
```

#### 2. Vendors (`/api/vendors`)
```typescript
GET    /api/vendors               // List vendors (search, filter)
POST   /api/vendors               // Apply as vendor (authenticated)
GET    /api/vendors/[id]          // Get vendor profile
PATCH  /api/vendors/[id]          // Update vendor (owner only)
DELETE /api/vendors/[id]          // Deactivate vendor

// Vendor-specific actions
PATCH  /api/vendors/[id]/approve  // Admin approve
PATCH  /api/vendors/[id]/reject   // Admin reject
GET    /api/vendors/[id]/availability
PATCH  /api/vendors/[id]/availability
```

#### 3. Bookings (`/api/bookings`)
```typescript
GET    /api/bookings              // List user's bookings
POST   /api/bookings              // Create booking request
GET    /api/bookings/[id]         // Get booking details
PATCH  /api/bookings/[id]         // Update booking
DELETE /api/bookings/[id]         // Cancel booking

// Booking actions
POST   /api/bookings/[id]/accept  // Vendor accepts
POST   /api/bookings/[id]/decline // Vendor declines
POST   /api/bookings/[id]/cancel  // Customer cancels
POST   /api/bookings/[id]/dispute // Raise dispute
```

#### 4. Payments (`/api/payments`)
```typescript
POST   /api/payments/create-intent     // Create Stripe PaymentIntent
POST   /api/payments/confirm           // Confirm payment
POST   /api/payments/refund            // Process refund (admin)
POST   /api/webhooks/stripe            // Stripe webhooks
```

#### 5. Messages (`/api/messages`)
```typescript
GET    /api/messages                   // List messages (by booking)
POST   /api/messages                   // Send message
GET    /api/messages/[id]              // Get message
DELETE /api/messages/[id]              // Delete message (soft)

// Admin actions
POST   /api/messages/[id]/flag        // Admin flag
GET    /api/messages/flagged          // List flagged messages
```

#### 6. Reviews (`/api/reviews`)
```typescript
GET    /api/reviews                   // List reviews (by vendor)
POST   /api/reviews                   // Create review
GET    /api/reviews/[id]              // Get review
PATCH  /api/reviews/[id]              // Update review
DELETE /api/reviews/[id]              // Delete review (soft)
```

#### 7. Admin (`/api/admin`)
```typescript
GET    /api/admin/vendors/pending     // Vendors awaiting approval
GET    /api/admin/disputes            // Active disputes
PATCH  /api/admin/disputes/[id]/resolve
GET    /api/admin/analytics           // Platform metrics
GET    /api/admin/violations          // Violation queue
```

### API Response Format

```typescript
// Success response
{
  success: true,
  data: { /* resource data */ },
  meta?: {
    page?: number,
    totalPages?: number,
    totalCount?: number
  }
}

// Error response
{
  success: false,
  error: {
    code: "VALIDATION_ERROR",
    message: "Invalid input",
    details?: [/* validation errors */]
  }
}
```

### Rate Limiting

```typescript
// lib/utils/rate-limit.ts
import { Redis } from 'ioredis';

const rateLimit = {
  auth: { requests: 5, window: 60 },      // 5 per minute
  api: { requests: 100, window: 60 },     // 100 per minute
  upload: { requests: 10, window: 60 },   // 10 per minute
};
```

---

## Database Architecture

### Connection Management

```typescript
// lib/db/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### Connection Pooling

- **Development**: Default pool (5 connections)
- **Production**:
  - Min connections: 5
  - Max connections: 20
  - Connection timeout: 60s
  - Query timeout: 30s

### Query Patterns

#### 1. Paginated Queries
```typescript
const vendors = await prisma.vendor.findMany({
  where: { status: 'APPROVED' },
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: 'desc' },
  include: {
    user: { select: { email: true } },
    menu: true,
  },
});

const total = await prisma.vendor.count({
  where: { status: 'APPROVED' },
});
```

#### 2. Transactions
```typescript
await prisma.$transaction(async (tx) => {
  const booking = await tx.booking.create({ data: bookingData });
  await tx.availability.update({
    where: { vendorId_date: { vendorId, date } },
    data: { isAvailable: false },
  });
  await tx.payment.create({ data: paymentData });
});
```

#### 3. Soft Deletes
```typescript
// Middleware for soft delete
prisma.$use(async (params, next) => {
  if (params.action === 'delete') {
    params.action = 'update';
    params.args['data'] = { deletedAt: new Date() };
  }
  if (params.action === 'findUnique' || params.action === 'findFirst') {
    params.args['where'] = { ...params.args.where, deletedAt: null };
  }
  return next(params);
});
```

### Indexing Strategy

See `prisma/schema.prisma` for index definitions:
- **User lookups**: `email`, `role + status`
- **Vendor search**: `cuisineType + status + approvedAt`, `location`
- **Bookings**: `customerId + createdAt`, `vendorId + eventDate`, `status`
- **Payments**: `status + capturedAt` (for cron jobs)
- **Messages**: `bookingId + createdAt`, `flagged + reviewedAt`

---

## Authentication & Authorization

### NextAuth.js Configuration

```typescript
// lib/auth/config.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { vendor: true },
        });

        if (!user || !(await bcrypt.compare(credentials.password, user.passwordHash))) {
          throw new Error('Invalid credentials');
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          vendorId: user.vendor?.id,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.vendorId = user.vendorId;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      session.user.vendorId = token.vendorId;
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
};
```

### Session Management

- **Strategy**: JWT (stateless)
- **Storage**: HTTP-only secure cookies
- **Expiration**: 30 days
- **Refresh**: Automatic on activity

### Authorization Patterns

```typescript
// lib/auth/permissions.ts
export function requireAuth(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) throw new UnauthorizedError();
  return session;
}

export function requireRole(req: Request, role: UserRole) {
  const session = requireAuth(req);
  if (session.user.role !== role) throw new ForbiddenError();
  return session;
}

export function requireVendor(req: Request, vendorId: string) {
  const session = requireAuth(req);
  if (session.user.vendorId !== vendorId && session.user.role !== 'ADMIN') {
    throw new ForbiddenError();
  }
  return session;
}
```

---

## Payment Processing

### Stripe Connect Flow

```
┌─────────────┐
│  Customer   │
└──────┬──────┘
       │ 1. Creates booking
       ▼
┌─────────────────┐
│  Platform       │
│  (Fleet Feast)  │
└──────┬──────────┘
       │ 2. Creates PaymentIntent
       │    (destination = Vendor's Stripe Account)
       ▼
┌─────────────────┐
│  Stripe         │
│  (Escrow)       │
└──────┬──────────┘
       │ 3. Event occurs
       │ 4. 7-day dispute window
       │ 5. Transfer to vendor (minus 15% commission)
       ▼
┌─────────────────┐
│  Vendor         │
│  Stripe Account │
└─────────────────┘
```

### Payment Service

```typescript
// lib/services/payment.service.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createBookingPayment(
  booking: Booking,
  vendor: Vendor
) {
  // Create PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(booking.totalAmount * 100), // Convert to cents
    currency: 'usd',
    metadata: {
      bookingId: booking.id,
      customerId: booking.customerId,
      vendorId: booking.vendorId,
    },
    transfer_data: {
      destination: vendor.stripeAccountId!,
    },
    application_fee_amount: Math.round(booking.platformFee * 100),
  });

  // Store payment record
  await prisma.payment.create({
    data: {
      bookingId: booking.id,
      stripePaymentIntentId: paymentIntent.id,
      amount: booking.totalAmount,
      status: 'AUTHORIZED',
      authorizedAt: new Date(),
    },
  });

  return paymentIntent;
}

export async function releasePayment(paymentId: string) {
  // After 7-day dispute window
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });

  // Capture the payment
  await stripe.paymentIntents.capture(payment.stripePaymentIntentId!);

  // Update payment status
  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: 'RELEASED',
      releasedAt: new Date(),
    },
  });
}
```

### Webhook Handling

```typescript
// app/api/webhooks/stripe/route.ts
export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature')!;
  const body = await req.text();

  const event = stripe.webhooks.constructEvent(
    body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET!
  );

  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object);
      break;
    case 'payment_intent.payment_failed':
      await handlePaymentFailure(event.data.object);
      break;
    case 'transfer.created':
      await handleTransferCreated(event.data.object);
      break;
  }

  return Response.json({ received: true });
}
```

---

## Messaging System

### Anti-Circumvention Detection

```typescript
// lib/services/messaging.service.ts
const CONTACT_PATTERNS = [
  /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,           // Phone numbers
  /\b[\w.-]+@[\w.-]+\.\w{2,}\b/gi,          // Emails
  /\b(?:call|text|email|whatsapp|dm)\s+me\b/gi, // Direct contact requests
  /\b(?:instagram|facebook|twitter|ig)\b/gi,    // Social media
];

export async function sendMessage(
  bookingId: string,
  senderId: string,
  content: string
) {
  let flagged = false;
  let flagReason = null;
  let flagSeverity: MessageSeverity = 'NONE';

  for (const pattern of CONTACT_PATTERNS) {
    if (pattern.test(content)) {
      flagged = true;
      flagReason = 'Contact information detected';
      flagSeverity = 'HIGH';
      break;
    }
  }

  const message = await prisma.message.create({
    data: {
      bookingId,
      senderId,
      content,
      flagged,
      flagReason,
      flagSeverity,
    },
  });

  if (flagged) {
    // Create violation record
    await prisma.violation.create({
      data: {
        userId: senderId,
        type: 'CONTACT_INFO_SHARING',
        description: flagReason!,
        severity: flagSeverity,
        relatedMessageId: message.id,
        relatedBookingId: bookingId,
      },
    });
  }

  return message;
}
```

---

## Caching Strategy

### Redis Configuration

```typescript
// lib/db/redis.ts
import Redis from 'ioredis';

export const redis = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
});

redis.on('error', (err) => {
  console.error('Redis error:', err);
});
```

### Cache Patterns

#### 1. Vendor Profiles (30 min TTL)
```typescript
const VENDOR_CACHE_TTL = 60 * 30; // 30 minutes

export async function getVendor(id: string) {
  const cacheKey = `vendor:${id}`;

  // Check cache
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // Query database
  const vendor = await prisma.vendor.findUnique({
    where: { id },
    include: { user: true, menu: true },
  });

  // Set cache
  await redis.setex(cacheKey, VENDOR_CACHE_TTL, JSON.stringify(vendor));

  return vendor;
}
```

#### 2. Search Results (5 min TTL)
```typescript
const SEARCH_CACHE_TTL = 60 * 5; // 5 minutes

export async function searchVendors(params: SearchParams) {
  const cacheKey = `search:${JSON.stringify(params)}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const results = await prisma.vendor.findMany({
    where: buildSearchQuery(params),
  });

  await redis.setex(cacheKey, SEARCH_CACHE_TTL, JSON.stringify(results));
  return results;
}
```

#### 3. Session Storage
```typescript
// NextAuth.js uses database by default
// For high-traffic, can switch to Redis sessions
```

### Cache Invalidation

```typescript
export async function invalidateVendorCache(vendorId: string) {
  await redis.del(`vendor:${vendorId}`);
  await redis.del('search:*'); // Invalidate all search results
}
```

---

## File Storage

### AWS S3 Configuration

```typescript
// lib/services/upload.service.ts
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export async function uploadFile(
  file: File,
  folder: 'documents' | 'images',
  userId: string
) {
  const key = `${folder}/${userId}/${Date.now()}-${file.name}`;

  await s3.upload({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    Body: file,
    ContentType: file.type,
  }).promise();

  return key;
}

export async function getSignedUrl(key: string) {
  return s3.getSignedUrl('getObject', {
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    Expires: 60 * 60, // 1 hour
  });
}
```

### Upload Flow

1. Client requests presigned URL from `/api/upload/presigned`
2. Client uploads directly to S3 using presigned URL
3. Client sends S3 key to `/api/upload/confirm`
4. Server stores metadata in PostgreSQL

---

## Background Jobs

### Cron Jobs (Vercel Cron)

```typescript
// app/api/cron/payment-release/route.ts
export async function GET(req: Request) {
  // Verify cron secret
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Find payments ready for release (7 days after event, no active dispute)
  const payments = await prisma.payment.findMany({
    where: {
      status: 'CAPTURED',
      capturedAt: {
        lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      booking: {
        dispute: null,
      },
    },
  });

  for (const payment of payments) {
    await releasePayment(payment.id);
  }

  return Response.json({ released: payments.length });
}
```

### Job Schedule

| Job | Frequency | Purpose |
|-----|-----------|---------|
| Payment Release | Daily 2am | Release escrow after 7-day window |
| Email Notifications | Every 5 min | Send queued notifications |
| Cache Cleanup | Hourly | Remove expired cache entries |
| Booking Reminders | Daily 9am | Send event reminders |

---

## Error Handling

### Custom Error Classes

```typescript
// lib/utils/errors.ts
export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500
  ) {
    super(message);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public details?: any) {
    super('VALIDATION_ERROR', message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super('UNAUTHORIZED', message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super('FORBIDDEN', message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super('NOT_FOUND', message, 404);
  }
}
```

### Global Error Handler

```typescript
// app/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Something went wrong!</h2>
        <button onClick={reset}>Try again</button>
      </div>
    </div>
  );
}
```

---

## Logging & Monitoring

### Sentry Integration

```typescript
// lib/monitoring/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event, hint) {
    // Filter out sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers?.Authorization;
    }
    return event;
  },
});
```

### Logging Levels

```typescript
// lib/utils/logger.ts
const LOG_LEVELS = ['debug', 'info', 'warn', 'error'] as const;

export const logger = {
  debug: (message: string, meta?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, meta);
    }
  },
  info: (message: string, meta?: any) => {
    console.info(`[INFO] ${message}`, meta);
  },
  warn: (message: string, meta?: any) => {
    console.warn(`[WARN] ${message}`, meta);
    Sentry.captureMessage(message, 'warning');
  },
  error: (error: Error, meta?: any) => {
    console.error('[ERROR]', error, meta);
    Sentry.captureException(error);
  },
};
```

---

## Security Architecture

### Input Validation

All API routes use Zod schemas:

```typescript
// lib/validators/booking.schema.ts
import { z } from 'zod';

export const createBookingSchema = z.object({
  vendorId: z.string().uuid(),
  eventDate: z.string().datetime(),
  eventTime: z.string().regex(/^\d{2}:\d{2}$/),
  location: z.string().min(10).max(500),
  guestCount: z.number().int().min(10).max(1000),
  eventType: z.enum(['CORPORATE', 'WEDDING', 'BIRTHDAY', 'FESTIVAL', 'PRIVATE_PARTY', 'OTHER']),
  specialRequests: z.string().max(2000).optional(),
});
```

### CSRF Protection

Next.js built-in CSRF protection for Server Actions.

### XSS Prevention

- React escapes all output by default
- CSP headers configured in `next.config.js`

### SQL Injection Prevention

Prisma uses parameterized queries automatically.

### Rate Limiting

Applied at Vercel edge level + Redis-based custom limits.

---

## Performance Optimization

### Server Component Optimization

- **Static Generation**: Marketing pages, vendor listings
- **Dynamic Rendering**: Dashboards, bookings
- **Streaming**: Large lists with `<Suspense>`

### Image Optimization

```typescript
import Image from 'next/image';

<Image
  src="/vendor-photo.jpg"
  width={400}
  height={300}
  alt="Vendor"
  loading="lazy"
  placeholder="blur"
/>
```

### Database Optimization

- Connection pooling
- Query result caching
- Selective field loading
- Cursor-based pagination for large datasets

---

## Deployment Strategy

### Vercel Deployment

```json
// vercel.json
{
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "DATABASE_URL": "@database-url",
    "REDIS_URL": "@redis-url",
    "STRIPE_SECRET_KEY": "@stripe-secret"
  },
  "crons": [
    {
      "path": "/api/cron/payment-release",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### Environment Variables

See `.env.example` for required variables:
- `DATABASE_URL`
- `REDIS_URL`
- `NEXTAUTH_SECRET`
- `STRIPE_SECRET_KEY`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_S3_BUCKET`
- `SENTRY_DSN`

### CI/CD Pipeline

1. **Development**: Push to `dev` branch → Auto-deploy to preview
2. **Staging**: PR to `main` → Deploy preview
3. **Production**: Merge to `main` → Deploy to production

---

## Scaling Considerations

### Current Architecture (0-10K users)
- Single Next.js instance on Vercel
- Single PostgreSQL RDS instance
- Single Redis ElastiCache instance

### Future Scaling (10K-100K users)
- Multiple Next.js instances (auto-scaled)
- PostgreSQL read replicas
- Redis cluster
- CDN for static assets

### Database Partitioning Strategy (100K+ users)
- Partition `bookings` by date
- Partition `messages` by booking
- Archive old data to S3

---

**Document Status**: Complete
**Review Date**: 2025-12-04
**Next Review**: 2026-01-04
