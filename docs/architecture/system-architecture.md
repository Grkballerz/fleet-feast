# Fleet Feast - System Architecture Document
Version: 1.0
Date: 2025-12-03
Author: Alex_Architect

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Technology Stack Decisions](#technology-stack-decisions)
4. [Architecture Patterns](#architecture-patterns)
5. [Component Architecture](#component-architecture)
6. [Data Architecture](#data-architecture)
7. [Integration Architecture](#integration-architecture)
8. [Security Architecture](#security-architecture)
9. [Scalability Strategy](#scalability-strategy)
10. [Deployment Architecture](#deployment-architecture)
11. [Monitoring & Observability](#monitoring--observability)
12. [Trade-offs & Decision Log](#trade-offs--decision-log)

---

## Executive Summary

Fleet Feast is a food truck marketplace platform built on a modern, scalable web architecture. The system employs a **monorepo monolithic Next.js architecture** for initial simplicity, with clear modular boundaries that enable future microservices decomposition if needed.

**Key Architectural Principles:**
- **Monorepo First**: Single codebase with clear domain separation
- **API-First Design**: REST APIs with OpenAPI documentation
- **Security by Default**: RBAC, encryption, anti-circumvention monitoring
- **Progressive Enhancement**: Web-first, mobile-responsive, PWA-capable
- **Observability**: Comprehensive logging, monitoring, error tracking

---

## Architecture Overview

### High-Level Architecture Pattern
**Pattern:** Modular Monolith with API Routes
**Deployment:** Serverless-first (Vercel Edge + Functions)

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (Browser)                    │
│  Next.js 14+ Pages (SSR/SSG) + React Components + TailwindCSS│
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS/TLS 1.3
┌────────────────────────▼────────────────────────────────────┐
│              APPLICATION LAYER (Next.js API Routes)          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Auth    │  │ Booking  │  │ Payment  │  │ Messaging│   │
│  │ Service  │  │ Service  │  │ Service  │  │ Service  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Vendor  │  │  Search  │  │  Review  │  │  Admin   │   │
│  │ Service  │  │ Service  │  │ Service  │  │ Service  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    DATA LAYER                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │    Redis     │  │  File Store  │      │
│  │  (Primary)   │  │  (Cache/     │  │  (S3/Cloud-  │      │
│  │              │  │   Sessions)  │  │   inary)     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                  EXTERNAL SERVICES                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │Stripe Connect│  │ SendGrid/SES │  │ Google Maps  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack Decisions

### Frontend Technology Stack

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Framework** | Next.js 14+ (App Router) | SSR/SSG for SEO, file-based routing, API routes co-location, Vercel optimization, React Server Components for performance |
| **Language** | TypeScript 5.x | Type safety, better DX, reduced runtime errors, excellent IDE support |
| **UI Library** | React 18+ | Industry standard, rich ecosystem, concurrent features, Next.js native support |
| **Styling** | Tailwind CSS 3.x | Utility-first CSS, rapid prototyping, consistent design system, excellent purge for small bundle sizes |
| **Component Library** | Headless UI + Radix UI | Accessible primitives, unstyled components, full control over styling |
| **Form Management** | React Hook Form | Performant, minimal re-renders, TypeScript support, easy validation |
| **Validation** | Zod | TypeScript-first schema validation, reusable schemas for client/server |
| **State Management** | Zustand (global) + React Context (local) | Lightweight, minimal boilerplate, no Provider hell, easy to test |
| **Data Fetching** | TanStack Query (React Query) | Cache management, optimistic updates, automatic refetching, DevTools |
| **Date/Time** | date-fns | Lightweight, tree-shakeable, immutable, timezone support |
| **Icons** | Lucide React | Consistent, customizable, tree-shakeable, actively maintained |

**Decision Rationale: Next.js Monorepo**
- **Why Monolith vs Microservices?** Start simple. Microservices add operational complexity (deployment, monitoring, debugging) that isn't justified at <10K users. Clear module boundaries enable future extraction.
- **Why Next.js vs Separate Frontend/Backend?** Co-location reduces context switching, API routes simplify deployment, Vercel's edge network optimizes globally, shared TypeScript types between frontend/backend.
- **Why App Router vs Pages Router?** React Server Components reduce client JS bundle, nested layouts improve UX, better streaming SSR, modern pattern for new projects.

### Backend Technology Stack

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Runtime** | Node.js 20.x LTS | JavaScript everywhere, async I/O, rich ecosystem, Vercel native support |
| **API Framework** | Next.js API Routes | Serverless-ready, co-located with frontend, built-in middleware, automatic code splitting |
| **API Style** | REST (with OpenAPI docs) | Simple, cacheable, well-understood, gradual GraphQL migration path if needed |
| **Authentication** | NextAuth.js v5 | Next.js native, supports JWT + DB sessions, social auth ready, CSRF built-in |
| **ORM** | Prisma 5.x | Type-safe queries, schema migration, excellent TypeScript support, admin UI |
| **Cache Layer** | Redis (Upstash/Railway) | Session storage, search result caching, rate limiting, pub/sub for future features |
| **Background Jobs** | Vercel Cron + Inngest | Scheduled tasks (escrow releases, reminder emails), reliable retries, observability |
| **Email** | SendGrid (primary) / AWS SES (fallback) | Reliable delivery, transactional templates, analytics, easy SMTP fallback |
| **File Upload** | AWS S3 (primary) / Cloudinary (fallback) | Scalable storage, signed URLs, image optimization (Cloudinary), cost-effective (S3) |

**Decision Rationale: API Routes vs Express**
- **Pros of API Routes:** Serverless-native, auto code-splitting, Vercel middleware, co-located with pages, zero config deployment
- **Cons of API Routes:** Less mature ecosystem than Express, harder to test in isolation
- **Decision:** Use API Routes. Simplicity and deployment benefits outweigh ecosystem size. Can extract to Express microservices later if needed.

### Database Stack

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Primary Database** | PostgreSQL 15+ | ACID compliance, JSON support, full-text search, excellent Prisma support, robust for financial transactions |
| **Connection Pooling** | Prisma Data Proxy / PgBouncer | Serverless function connection limits, efficient resource usage |
| **Hosting** | Neon (serverless Postgres) / Railway | Serverless scaling, connection pooling built-in, cost-effective, automatic backups |
| **Cache** | Redis 7.x (Upstash) | Serverless Redis, low latency, pay-per-request, session storage |
| **Search (v1)** | PostgreSQL Full-Text Search | Built-in, no extra infrastructure, sufficient for <10K vendors, supports trigram fuzzy search |
| **Search (v2)** | Elasticsearch (future) | Advanced search, faceted filtering, typo tolerance, relevance tuning when scale demands |

**Decision Rationale: PostgreSQL vs MongoDB**
- **Why Relational?** Financial transactions require ACID guarantees. Booking/payment flow has complex relationships (user ↔ booking ↔ payment ↔ vendor). Strong consistency critical for escrow.
- **Why Postgres Specifically?** JSON columns for flexible data (menu items, event details), full-text search built-in, mature transaction support, excellent tooling.

### Infrastructure & DevOps

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Frontend Hosting** | Vercel | Automatic deployments, edge caching, serverless functions, built-in analytics, preview environments |
| **Database Hosting** | Neon / Railway | Serverless Postgres, auto-scaling, generous free tier, easy setup |
| **File Storage** | AWS S3 (images) | Scalable, cost-effective, CDN-ready, signed URLs for security |
| **CDN** | Vercel Edge Network / CloudFront | Global distribution, automatic, minimal config |
| **Error Tracking** | Sentry | Real-time alerts, stack traces, release tracking, session replay |
| **Analytics** | Vercel Analytics / Plausible | Privacy-friendly, Core Web Vitals, simple integration |
| **Monitoring** | Vercel Observability + Better Stack | Logs, metrics, uptime monitoring, incident management |
| **CI/CD** | GitHub Actions + Vercel | Automated testing, preview deployments, staging environments |

---

## Architecture Patterns

### Domain-Driven Design (DDD) Modules

Fleet Feast is organized into **7 core domains**, each with clear boundaries:

```
src/
├── modules/
│   ├── auth/              # Authentication & Authorization
│   ├── booking/           # Booking request/acceptance flow
│   ├── payment/           # Escrow payments & payouts
│   ├── messaging/         # In-app messaging + anti-circumvention
│   ├── vendor/            # Vendor profiles, applications, documents
│   ├── review/            # Rating & review system
│   └── admin/             # Admin dashboard & moderation
├── shared/
│   ├── database/          # Prisma client, migrations
│   ├── utils/             # Shared utilities
│   ├── types/             # Shared TypeScript types
│   └── config/            # Configuration management
└── app/                   # Next.js app directory (pages + API routes)
```

**Module Boundaries:**
- Each module has its own `/api`, `/lib`, `/components`, `/types`
- **Inter-module communication** happens via well-defined service interfaces
- **No direct database access** from other modules (encapsulation)
- **Shared entities** (User, Booking) have adapter patterns to prevent coupling

### API Design Pattern: RESTful with RPC-style Actions

**Base Pattern:** Resource-oriented REST
```
GET    /api/vendors               # List vendors
GET    /api/vendors/:id           # Get vendor details
POST   /api/vendors               # Create vendor (admin only)
PATCH  /api/vendors/:id           # Update vendor
DELETE /api/vendors/:id           # Delete vendor (soft-delete)
```

**RPC-style for Complex Actions:**
```
POST   /api/bookings/:id/accept   # Vendor accepts booking
POST   /api/bookings/:id/cancel   # Cancel booking
POST   /api/payments/:id/release  # Release escrow (cron job)
POST   /api/messages/:id/flag     # Flag message for review
```

**Rationale:** Pure REST awkward for state transitions (accept, cancel). RPC-style actions clearer and more intent-revealing.

### Authentication & Authorization Pattern

**Pattern:** JWT Tokens with Session Fallback

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ POST /api/auth/login (email, password)
       ▼
┌─────────────────────────────────────┐
│  NextAuth.js                        │
│  - Verify password (bcrypt)         │
│  - Generate JWT token               │
│  - Set HTTP-only secure cookie      │
│  - Store session in Redis           │
└──────┬──────────────────────────────┘
       │ Response: { user, session }
       ▼
┌─────────────┐
│   Client    │ Stores user in state, cookie auto-sent
└──────┬──────┘
       │ All subsequent requests include cookie
       ▼
┌─────────────────────────────────────┐
│  Middleware (middleware.ts)         │
│  - Extract JWT from cookie          │
│  - Verify signature                 │
│  - Check Redis session              │
│  - Attach user to request context   │
└──────┬──────────────────────────────┘
       │ Protected API routes
       ▼
```

**RBAC (Role-Based Access Control):**
```typescript
enum UserRole {
  CUSTOMER = 'customer',
  VENDOR = 'vendor',
  ADMIN = 'admin'
}

// Middleware checks role before allowing access
// Example: Only vendors can accept bookings
// Example: Only admins can approve vendor applications
```

### Payment Flow Pattern: Escrow with State Machine

**States:** `PENDING` → `AUTHORIZED` → `CAPTURED` → `RELEASED` → `PAID`

```
Customer submits booking request
         ↓
Vendor accepts (48hr window)
         ↓
POST /api/payments/authorize
  - Create Stripe PaymentIntent
  - Store payment_id in DB (status: AUTHORIZED)
  - DO NOT capture yet
         ↓
Event occurs (event_date)
         ↓
7-day dispute window begins
         ↓
Daily cron job checks:
  IF (event_date + 7 days < today) AND (no active dispute)
    POST /api/payments/release
      - Stripe: Capture payment
      - Calculate platform_fee (15%)
      - Stripe: Transfer to vendor Stripe Connect account
      - Update payment status: RELEASED
      - Update booking status: COMPLETED
         ↓
Vendor receives payout (minus 15%)
```

**Dispute Handling:**
- If dispute raised within 7 days → Payment stays CAPTURED
- Platform investigates → Resolves as REFUND or RELEASE
- Automated rules handle common cases (no-show, late arrival)

### Anti-Circumvention Pattern: Multi-Layer Detection

**Layer 1: Message Content Filtering (Real-Time)**
```typescript
// Runs on POST /api/messages
const BLOCKED_PATTERNS = [
  /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,        // Phone: 555-123-4567
  /\b[\w._%+-]+@[\w.-]+\.[A-Z]{2,}\b/i,   // Email: user@example.com
  /\b(call|text|email)\s+(me|us)\b/i,     // "call me", "text us"
  /\b(my|our)\s+(phone|cell|number)\b/i,  // "my phone"
];

if (BLOCKED_PATTERNS.some(pattern => pattern.test(message.content))) {
  // Auto-flag message
  // Notify admin
  // Warning to user
}
```

**Layer 2: Behavioral Pattern Detection (Daily Cron)**
```typescript
// Runs nightly: Analyze customer-vendor interaction patterns
SELECT customer_id, vendor_id, COUNT(*) as message_count
FROM messages
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY customer_id, vendor_id
HAVING message_count > 10
  AND NOT EXISTS (
    SELECT 1 FROM bookings
    WHERE customer_id = messages.customer_id
    AND vendor_id = messages.vendor_id
  )
// Flag for manual review: "High message volume, no bookings"
```

**Layer 3: Loyalty Incentives (Preventive)**
- 5% discount on repeat bookings with same vendor
- Platform absorbs cost (reduces commission from 15% → 10%)
- Makes on-platform rebooking more attractive than circumvention

---

## Component Architecture

See `component-diagram.md` for visual representation. Key components:

### Frontend Components (React)

```
app/
├── (public)/              # Public pages (no auth required)
│   ├── page.tsx           # Homepage
│   ├── search/            # Vendor search & browse
│   ├── vendors/[id]/      # Public vendor profile
│   └── about/             # Static pages
├── (auth)/                # Auth pages
│   ├── login/
│   ├── register/
│   └── reset-password/
├── (customer)/            # Customer-only pages
│   ├── dashboard/
│   ├── bookings/
│   └── messages/
├── (vendor)/              # Vendor-only pages
│   ├── dashboard/
│   ├── bookings/
│   ├── calendar/
│   └── profile/
└── (admin)/               # Admin-only pages
    ├── dashboard/
    ├── vendors/
    ├── disputes/
    └── analytics/
```

### Backend Services (API Routes)

```
app/api/
├── auth/
│   ├── [...nextauth]/route.ts    # NextAuth.js handlers
│   └── verify-email/route.ts
├── bookings/
│   ├── route.ts                  # GET (list), POST (create)
│   ├── [id]/route.ts             # GET, PATCH, DELETE
│   ├── [id]/accept/route.ts      # POST (vendor accepts)
│   └── [id]/cancel/route.ts      # POST (cancel with refund logic)
├── payments/
│   ├── authorize/route.ts        # Create PaymentIntent
│   ├── release/route.ts          # Release escrow (cron)
│   └── webhook/route.ts          # Stripe webhooks
├── vendors/
│   ├── route.ts                  # GET (search), POST (apply)
│   ├── [id]/route.ts             # GET, PATCH
│   ├── [id]/documents/route.ts   # Upload verification docs
│   └── [id]/approve/route.ts     # Admin approval
├── messages/
│   ├── route.ts                  # GET (list), POST (send)
│   └── [id]/flag/route.ts        # Flag for review
└── reviews/
    ├── route.ts                  # GET (list), POST (create)
    └── [id]/route.ts             # GET, PATCH, DELETE
```

### Service Layer (Business Logic)

Each domain has a service layer that encapsulates business logic:

```typescript
// src/modules/booking/booking.service.ts
export class BookingService {
  async createBooking(data: CreateBookingInput): Promise<Booking>
  async acceptBooking(bookingId: string, vendorId: string): Promise<Booking>
  async cancelBooking(bookingId: string, reason: string): Promise<CancellationResult>
  async checkCancellationPolicy(booking: Booking): Promise<RefundAmount>
}
```

**Service Layer Benefits:**
- **Testable:** Unit test business logic without HTTP concerns
- **Reusable:** Same logic for API routes, cron jobs, admin actions
- **Clear boundaries:** Services call database, don't expose Prisma details

---

## Data Architecture

### Database Schema Overview

**Core Entities:** 9 primary tables with well-defined relationships

```
┌──────────┐       ┌──────────┐       ┌──────────┐
│   User   │───────│  Vendor  │───────│VendorDoc │
│          │  1:1  │          │  1:N  │          │
└────┬─────┘       └────┬─────┘       └──────────┘
     │                  │
     │ 1:N              │ 1:N
     ▼                  ▼
┌──────────┐       ┌──────────┐       ┌──────────┐
│ Booking  │───────│ Payment  │       │Availability│
│          │  1:1  │          │       │          │
└────┬─────┘       └──────────┘       └──────────┘
     │
     │ 1:N
     ▼
┌──────────┐       ┌──────────┐       ┌──────────┐
│ Message  │       │  Review  │       │ Dispute  │
│          │       │          │       │          │
└──────────┘       └──────────┘       └──────────┘
```

**Schema Highlights:**
- **User table:** Polymorphic (customer/vendor/admin via `role` enum)
- **Vendor table:** Extends User with business details (1:1 relationship)
- **Booking table:** Central to platform, tracks entire lifecycle
- **Payment table:** 1:1 with Booking, tracks Stripe PaymentIntent lifecycle
- **Message table:** Belongs to Booking (all messages context-bound)

### Indexing Strategy

**High-Traffic Queries (Index Targets):**
```sql
-- Vendor search by cuisine, location, availability
CREATE INDEX idx_vendor_search ON vendors(cuisine_type, status, approved_at);
CREATE INDEX idx_vendor_location ON vendors USING GIST(location);

-- Booking lookups by customer/vendor
CREATE INDEX idx_booking_customer ON bookings(customer_id, created_at DESC);
CREATE INDEX idx_booking_vendor ON bookings(vendor_id, event_date DESC);

-- Payment escrow release (daily cron)
CREATE INDEX idx_payment_release ON payments(status, created_at)
  WHERE status = 'CAPTURED';

-- Message retrieval by booking
CREATE INDEX idx_message_booking ON messages(booking_id, created_at ASC);

-- Anti-circumvention pattern detection
CREATE INDEX idx_message_pattern ON messages(sender_id, created_at DESC)
  WHERE flagged = true;
```

### Caching Strategy

**Redis Cache Layers:**
1. **Session Storage** (TTL: 30 days)
   - NextAuth.js sessions
   - User authentication state
2. **Search Results** (TTL: 5 minutes)
   - Vendor search results (cache key: query params hash)
   - Frequently accessed vendor profiles
3. **Rate Limiting** (TTL: 1 hour)
   - API rate limit counters per user/IP
4. **Feature Flags** (TTL: 1 hour)
   - Config values, A/B test flags

**Cache Invalidation:**
- **Write-through:** Update DB, invalidate cache key immediately
- **Example:** Vendor updates profile → Invalidate `vendor:{id}` cache key

### Data Migration Strategy

**Prisma Migrations Workflow:**
```bash
# Development
npx prisma migrate dev --name add_loyalty_discount

# Staging (preview)
npx prisma migrate deploy

# Production (with backup)
pg_dump production_db > backup.sql
npx prisma migrate deploy
```

**Zero-Downtime Migrations:**
- **Additive changes first:** Add nullable column, backfill data, add constraint
- **Deprecate gracefully:** Mark old column deprecated, dual-write, remove after validation
- **Rollback plan:** Every migration has documented rollback SQL

---

## Integration Architecture

### Stripe Connect Integration (Marketplace Payments)

**Setup Flow:**
```
Vendor applies on platform
         ↓
Admin approves vendor
         ↓
POST /api/vendors/:id/stripe/onboard
  - Create Stripe Connect Account (type: standard)
  - Generate onboarding link
  - Send to vendor email
         ↓
Vendor completes Stripe onboarding
         ↓
Stripe webhook: account.updated
  - Mark vendor as stripe_connected = true
  - Enable booking acceptance
```

**Payment Flow:**
```
Customer books vendor
         ↓
POST /api/payments/authorize
  - Create PaymentIntent (amount: $1000, application_fee: $150)
  - Transfer destination: vendor Stripe Connect account
  - Capture method: manual (escrow)
         ↓
Customer confirms payment (Stripe Elements)
         ↓
Stripe webhook: payment_intent.succeeded
  - Update payment status: AUTHORIZED
  - DO NOT transfer yet (escrow period)
         ↓
Event occurs + 7 day dispute window
         ↓
POST /api/payments/release (cron job)
  - Capture PaymentIntent
  - Stripe auto-transfers to vendor account (minus 15% fee)
  - Update payment status: RELEASED
```

**Stripe Webhook Events:**
```typescript
app/api/payments/webhook/route.ts

switch (event.type) {
  case 'payment_intent.succeeded':
    // Update payment status to AUTHORIZED
  case 'payment_intent.payment_failed':
    // Mark booking as PAYMENT_FAILED, notify customer
  case 'transfer.created':
    // Vendor payout initiated
  case 'account.updated':
    // Vendor completed onboarding
  case 'charge.dispute.created':
    // Customer disputed charge, hold funds
}
```

### Email Integration (SendGrid)

**Transactional Emails:**
```typescript
// src/modules/email/email.service.ts
export class EmailService {
  async sendBookingConfirmation(booking: Booking): Promise<void>
  async sendBookingAcceptance(booking: Booking): Promise<void>
  async sendPaymentReceipt(payment: Payment): Promise<void>
  async sendReviewReminder(booking: Booking): Promise<void>
  async sendVendorApproval(vendor: Vendor): Promise<void>
}
```

**Email Templates (SendGrid Dynamic Templates):**
- `booking-confirmation` (customer)
- `booking-request` (vendor)
- `booking-accepted` (customer)
- `payment-receipt` (customer)
- `payout-notification` (vendor)
- `review-reminder` (customer + vendor)
- `vendor-approved` (vendor)
- `dispute-opened` (customer + vendor)

**Fallback Strategy:**
- **Primary:** SendGrid API
- **Fallback:** AWS SES SMTP
- **Circuit Breaker:** If SendGrid fails 3 times in 5 minutes, switch to SES

### File Storage Integration (AWS S3)

**Upload Flow (Presigned URLs):**
```
Client requests upload
         ↓
POST /api/upload/presigned-url
  - Validate file type (jpg, png, pdf)
  - Validate file size (< 5MB images, < 10MB docs)
  - Generate S3 presigned PUT URL (expires in 5 minutes)
  - Return { uploadUrl, fileKey }
         ↓
Client uploads directly to S3 using presigned URL
         ↓
Client confirms upload
         ↓
POST /api/vendors/:id/documents
  - Save fileKey in database
  - Link to vendor record
```

**S3 Bucket Structure:**
```
fleet-feast-production/
├── vendor-profiles/
│   ├── {vendor_id}/
│   │   ├── logo.jpg
│   │   ├── truck-photo-1.jpg
│   │   └── truck-photo-2.jpg
├── vendor-documents/
│   ├── {vendor_id}/
│   │   ├── business-license.pdf
│   │   ├── health-permit.pdf
│   │   └── insurance.pdf
└── booking-attachments/
    ├── {booking_id}/
    │   └── event-photo.jpg
```

**Access Control:**
- **Public read:** Vendor profile photos (CloudFront CDN)
- **Private:** Vendor documents (signed URLs, admin-only)
- **Expiring URLs:** Document access links expire in 1 hour

### Google Maps API Integration

**Use Cases:**
1. **Address Autocomplete** (vendor onboarding, booking creation)
2. **Location Validation** (ensure NYC metro area)
3. **Distance Calculation** (future: travel fees)

**Implementation:**
```typescript
// Client-side: Google Places Autocomplete
<PlacesAutocomplete
  onSelect={(place) => {
    // Validate: place.address_components includes "New York, NY"
    // Store: { address, lat, lng, formatted_address }
  }}
/>

// Server-side validation
POST /api/bookings
  - Verify address via Google Geocoding API
  - Confirm within NYC bounds (40.4774° N, -74.2591° W to 40.9176° N, -73.7004° W)
  - Store lat/lng for future distance calculations
```

---

## Security Architecture

### Authentication Security

**Password Security:**
- **Hashing:** bcrypt with cost factor 12
- **Salting:** Automatic per-password salt
- **Storage:** Never store plaintext, only hash

**Session Security:**
- **JWT Tokens:** HS256 signed, 7-day expiry
- **HTTP-Only Cookies:** Prevent XSS access
- **Secure Flag:** HTTPS-only transmission
- **SameSite:** Strict (prevent CSRF)
- **Session Storage:** Redis with 30-day TTL

**Rate Limiting:**
```typescript
// Login attempts: 5 per 15 minutes per email
// API calls: 100 per minute per user
// Search: 20 per minute per IP (unauthenticated)
```

### Authorization Security (RBAC)

**Role Hierarchy:**
```
ADMIN (superuser)
  ├─ Can access all resources
  ├─ Approve/reject vendors
  ├─ View all bookings
  ├─ Resolve disputes
  └─ Access analytics

VENDOR
  ├─ View own profile
  ├─ Accept/decline booking requests
  ├─ View own bookings
  ├─ Send messages (booking context only)
  └─ View own payouts

CUSTOMER
  ├─ Search vendors
  ├─ Create bookings
  ├─ View own bookings
  ├─ Send messages (booking context only)
  └─ Leave reviews (verified bookings only)
```

**Middleware Enforcement:**
```typescript
// middleware.ts
export async function middleware(req: NextRequest) {
  const session = await getSession(req);

  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.redirect('/unauthorized');
    }
  }

  if (req.nextUrl.pathname.startsWith('/vendor')) {
    if (session?.user?.role !== 'VENDOR') {
      return NextResponse.redirect('/unauthorized');
    }
  }

  // API route protection similar
}
```

### Data Security

**Encryption at Rest:**
- **Database:** PostgreSQL with AES-256 encryption (provider-managed)
- **Sensitive Fields:** Additional application-level encryption for:
  - SSN/Tax IDs (vendor documents)
  - Bank account numbers (Stripe handles, not stored)

**Encryption in Transit:**
- **TLS 1.3:** All HTTP traffic
- **HSTS:** Force HTTPS (max-age: 1 year)
- **Certificate Pinning:** (future) for mobile apps

**PCI DSS Compliance:**
- **Credit Cards:** Never touch our servers (Stripe Checkout/Elements)
- **Stripe Connect:** Handles all card data, PCI compliant
- **No Storage:** We never store card numbers, CVVs, etc.

### Input Validation & XSS Prevention

**Server-Side Validation (Zod):**
```typescript
// All API inputs validated with Zod schemas
const BookingSchema = z.object({
  vendorId: z.string().uuid(),
  eventDate: z.string().datetime(),
  guestCount: z.number().min(10).max(1000),
  location: z.string().min(10).max(500),
  // ...
});

// Validation happens before business logic
const validatedData = BookingSchema.parse(req.body);
```

**XSS Prevention:**
- **Content Security Policy (CSP):**
  ```
  Content-Security-Policy:
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com;
    img-src 'self' data: https:;
    connect-src 'self' https://api.stripe.com;
  ```
- **Output Encoding:** React auto-escapes by default
- **Sanitization:** DOMPurify for user-generated HTML (reviews)

**SQL Injection Prevention:**
- **Prisma ORM:** Parameterized queries by default
- **Never:** String concatenation in SQL
- **Raw Queries:** Use Prisma's `$queryRaw` with tagged templates

### Anti-Circumvention Security

**Message Content Filtering:**
```typescript
// Real-time filtering on POST /api/messages
const BLOCKED_PATTERNS = [
  { regex: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, severity: 'HIGH' },       // Phone
  { regex: /\b[\w._%+-]+@[\w.-]+\.[A-Z]{2,}\b/i, severity: 'HIGH' }, // Email
  { regex: /\b(call|text|email|whatsapp)\b/i, severity: 'MEDIUM' },  // Contact verbs
  { regex: /\b(instagram|facebook|twitter)\b/i, severity: 'LOW' },   // Social handles
];

// Violation handling
function processMessage(content: string): MessageResult {
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.regex.test(content)) {
      await createViolation(userId, pattern.severity);
      await notifyAdmin(userId, content, pattern);
      return { blocked: true, reason: 'Contact info detected' };
    }
  }
  return { blocked: false };
}
```

**Behavioral Detection (Cron):**
```typescript
// Daily cron: Detect suspicious patterns
async function detectCircumventionPatterns() {
  // Pattern 1: High message volume, no bookings
  const suspiciousPairs = await prisma.$queryRaw`
    SELECT m.sender_id, m.recipient_id, COUNT(*) as msg_count
    FROM messages m
    WHERE m.created_at > NOW() - INTERVAL '30 days'
    GROUP BY m.sender_id, m.recipient_id
    HAVING COUNT(*) > 20
      AND NOT EXISTS (
        SELECT 1 FROM bookings b
        WHERE (b.customer_id = m.sender_id AND b.vendor_id = m.recipient_id)
           OR (b.customer_id = m.recipient_id AND b.vendor_id = m.sender_id)
      )
  `;

  // Flag for manual review
  for (const pair of suspiciousPairs) {
    await createAdminAlert('circumvention-risk', pair);
  }
}
```

**Penalty System:**
```typescript
// Escalating penalties
enum ViolationSeverity {
  LOW = 1,    // Social media mention
  MEDIUM = 3, // Contact verb usage
  HIGH = 5,   // Phone/email in message
}

async function applyPenalty(userId: string, severity: ViolationSeverity) {
  const violationCount = await getViolationCount(userId, 90); // 90 days

  if (violationCount + severity >= 10) {
    await suspendUser(userId, 30); // 30-day suspension
  } else if (violationCount + severity >= 5) {
    await warnUser(userId);
  }

  // 3rd suspension = permanent ban
  const suspensionCount = await getSuspensionCount(userId);
  if (suspensionCount >= 3) {
    await banUser(userId);
  }
}
```

---

## Scalability Strategy

### Current Scale (Launch → Year 1)

**Target Metrics:**
- **Users:** 1,000 active users (500 customers, 100 vendors)
- **Bookings:** 500 bookings over 6 months (~3/day)
- **Traffic:** ~10K requests/day (~100K requests/month)

**Architecture Decisions for Current Scale:**
- **Monolith:** Sufficient, low operational overhead
- **Vercel Serverless:** Auto-scales to traffic, pay-per-invoke
- **Neon Postgres:** Serverless, scales to zero, auto-resumes
- **Redis (Upstash):** Serverless, pay-per-request

**Cost Estimate:**
- Vercel: ~$20/month (Pro plan)
- Neon: ~$25/month (Launch tier)
- Upstash: ~$10/month
- AWS S3: ~$5/month
- SendGrid: Free (up to 40K emails/month)
- **Total: ~$60/month**

### Future Scale (Year 2+)

**Target Metrics:**
- **Users:** 10,000 active users (5K customers, 1K vendors)
- **Bookings:** 5,000 bookings/month (~160/day)
- **Traffic:** ~100K requests/day (~3M requests/month)

**Scaling Bottlenecks & Solutions:**

| Bottleneck | Solution | Trigger |
|------------|----------|---------|
| **Database Connections** | Connection pooling (PgBouncer), read replicas | > 500 concurrent connections |
| **Search Performance** | Migrate to Elasticsearch, faceted filters | > 5K vendors, search > 1s |
| **File Storage Costs** | CloudFront CDN, image optimization | > 50K images |
| **Background Jobs** | Dedicated job queue (Inngest/BullMQ) | > 1K jobs/day |
| **API Response Times** | Redis caching (aggressive), query optimization | p95 > 500ms |
| **Concurrent Bookings** | Optimistic locking, queue-based booking | > 100 bookings/hour |

### Horizontal Scaling Plan

**Phase 1: Optimize Monolith** (0-10K users)
- Add database indexes
- Implement aggressive caching (Redis)
- Use CDN for static assets
- Optimize N+1 queries (Prisma select/include)

**Phase 2: Vertical Scaling** (10K-50K users)
- Upgrade Neon Postgres tier (more CPU/RAM)
- Add read replicas for reporting queries
- Increase Vercel function memory/timeout

**Phase 3: Microservices Extraction** (50K+ users)
- Extract payment service (separate deployment)
- Extract search service (Elasticsearch cluster)
- Extract messaging service (WebSocket server)
- Keep monolith for CRUD operations

**Phase 4: Multi-Region** (100K+ users, multi-city expansion)
- Deploy frontend to multiple edge locations (Vercel automatic)
- Multi-region database (CockroachDB or PlanetScale)
- Geo-based routing for APIs

### Performance Optimization Techniques

**Frontend Optimizations:**
- **Code Splitting:** Next.js automatic route-based splitting
- **Image Optimization:** Next.js Image component (WebP, lazy loading)
- **Bundle Size:** Tree-shaking, dynamic imports for heavy components
- **Caching:** Aggressive `stale-while-revalidate` for vendor profiles

**Backend Optimizations:**
- **Database Query Optimization:**
  ```typescript
  // Bad: N+1 query
  const bookings = await prisma.booking.findMany();
  for (const booking of bookings) {
    booking.vendor = await prisma.vendor.findUnique({ where: { id: booking.vendorId } });
  }

  // Good: Single query with include
  const bookings = await prisma.booking.findMany({
    include: { vendor: true, customer: true }
  });
  ```

- **Redis Caching Strategy:**
  ```typescript
  async function getVendor(id: string): Promise<Vendor> {
    const cached = await redis.get(`vendor:${id}`);
    if (cached) return JSON.parse(cached);

    const vendor = await prisma.vendor.findUnique({ where: { id } });
    await redis.setex(`vendor:${id}`, 300, JSON.stringify(vendor)); // 5min TTL
    return vendor;
  }
  ```

- **Pagination:** Cursor-based for infinite scroll, offset-based for page numbers
- **Rate Limiting:** Prevent abuse, ensure fair resource allocation

---

## Deployment Architecture

### Environment Strategy

| Environment | Purpose | URL | Deployment |
|-------------|---------|-----|------------|
| **Development** | Local dev | localhost:3000 | Manual (npm run dev) |
| **Preview** | PR previews | pr-123.vercel.app | Automatic (GitHub PR) |
| **Staging** | Pre-production | staging.fleetfeast.com | Automatic (merge to `develop`) |
| **Production** | Live app | fleetfeast.com | Manual approval (merge to `main`) |

### CI/CD Pipeline (GitHub Actions)

**On Pull Request:**
```yaml
name: PR Checks
on: [pull_request]
jobs:
  test:
    - Lint (ESLint, Prettier)
    - Type check (TypeScript)
    - Unit tests (Vitest)
    - Integration tests (Playwright)
    - Build (Next.js)
  deploy-preview:
    - Deploy to Vercel preview URL
    - Comment PR with preview link
```

**On Merge to Develop (Staging):**
```yaml
name: Staging Deploy
on:
  push:
    branches: [develop]
jobs:
  deploy:
    - Run migrations (Prisma)
    - Deploy to staging.fleetfeast.com
    - Run E2E smoke tests
    - Notify Slack
```

**On Merge to Main (Production):**
```yaml
name: Production Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    - Require manual approval
    - Backup production database
    - Run migrations (with rollback plan)
    - Deploy to production
    - Run E2E smoke tests
    - Monitor error rate (Sentry)
    - Notify Slack
```

### Database Migration Strategy

**Development:**
```bash
# Create migration
npx prisma migrate dev --name add_loyalty_discount

# Auto-generates:
# - SQL migration file
# - Updates Prisma Client
# - Applies to dev database
```

**Staging:**
```bash
# Apply migrations (no new migrations created)
npx prisma migrate deploy
```

**Production:**
```bash
# Pre-deployment checklist:
# 1. Backup database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# 2. Review migration SQL
cat prisma/migrations/*/migration.sql

# 3. Test rollback plan
# 4. Apply migration
npx prisma migrate deploy

# 5. Monitor for errors (Sentry, logs)
# 6. If errors: rollback
psql $DATABASE_URL < rollback.sql
```

### Infrastructure as Code

**Vercel Configuration (vercel.json):**
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "env": {
    "DATABASE_URL": "@database-url",
    "REDIS_URL": "@redis-url",
    "STRIPE_SECRET_KEY": "@stripe-secret",
    "SENDGRID_API_KEY": "@sendgrid-api"
  },
  "regions": ["iad1"],
  "functions": {
    "app/api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

**Database Setup (Railway/Neon):**
```bash
# Railway CLI
railway up
railway add postgresql
railway variables set DATABASE_URL=$RAILWAY_POSTGRES_URL

# Or Neon (serverless)
neon projects create fleet-feast-production
neon databases create fleet-feast --project-id=<id>
```

---

## Monitoring & Observability

### Error Tracking (Sentry)

**Setup:**
```typescript
// src/lib/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% of transactions
  beforeSend(event, hint) {
    // Scrub sensitive data
    if (event.request?.data) {
      delete event.request.data.password;
      delete event.request.data.cardNumber;
    }
    return event;
  },
});
```

**Alerting:**
- **Critical Errors:** Slack alert immediately (payment failures, auth errors)
- **High Volume:** Alert if error rate > 1% of requests
- **New Errors:** Alert on first occurrence of new error type

### Performance Monitoring

**Metrics Tracked:**
- **Core Web Vitals:** LCP, FID, CLS (Vercel Analytics)
- **API Response Times:** p50, p95, p99 (custom logging)
- **Database Query Times:** Prisma slow query logging
- **Cache Hit Rate:** Redis cache hits vs misses

**Alerting Thresholds:**
- LCP > 2.5s on > 10% of page loads
- API p95 > 500ms sustained for 5 minutes
- Database p95 > 100ms sustained for 5 minutes
- Cache hit rate < 70%

### Application Logging

**Log Levels:**
```typescript
import { logger } from '@/lib/logger';

// Development: All levels
// Production: INFO, WARN, ERROR only

logger.debug('Detailed debugging info');
logger.info('Normal operation', { userId, action: 'booking_created' });
logger.warn('Potential issue', { issue: 'low_cache_hit_rate' });
logger.error('Error occurred', { error, context });
```

**Structured Logging:**
```json
{
  "timestamp": "2025-12-03T15:23:45Z",
  "level": "INFO",
  "message": "Booking created",
  "context": {
    "userId": "uuid",
    "bookingId": "uuid",
    "vendorId": "uuid",
    "amount": 1000
  }
}
```

**Log Aggregation:** Better Stack (Logtail) or Vercel Logs

### Uptime Monitoring

**Monitoring Tool:** UptimeRobot or Better Uptime

**Endpoints Monitored:**
- `GET /` (homepage, every 1 min)
- `GET /api/health` (health check, every 1 min)
- `POST /api/auth/login` (synthetic login, every 5 min)

**Alerting:**
- Downtime > 2 minutes → Slack alert
- Response time > 5s → Slack warning
- SSL certificate expiring < 30 days → Email alert

### Incident Response

**Incident Severity Levels:**

| Level | Definition | Response Time | Examples |
|-------|------------|---------------|----------|
| **P0 - Critical** | Complete outage | 15 minutes | Site down, payment failures |
| **P1 - High** | Major functionality impaired | 1 hour | Booking creation broken, slow performance |
| **P2 - Medium** | Partial functionality impaired | 4 hours | Search broken, email delays |
| **P3 - Low** | Minor issue | 24 hours | UI bug, typo |

**On-Call Rotation:**
- 1-week rotations
- Primary + Secondary on-call
- Slack alerts → PagerDuty → Phone call escalation

**Post-Incident Review:**
- Document what happened, why, resolution
- Identify root cause, prevention measures
- Update runbooks

---

## Trade-offs & Decision Log

### Decision 1: Monolith vs Microservices

**Decision:** Start with Modular Monolith

**Rationale:**
- **Pros:** Simpler deployment, easier debugging, faster initial development, lower operational overhead
- **Cons:** Harder to scale individual services, potential tight coupling
- **Context:** At <10K users, operational simplicity more valuable than independent scaling

**Revisit Trigger:** When any module (e.g., search, payments) requires independent scaling or has distinct scaling characteristics

---

### Decision 2: Next.js API Routes vs Separate Backend

**Decision:** Next.js API Routes (co-located backend)

**Rationale:**
- **Pros:** Shared TypeScript types, simpler deployment (single app), Vercel optimization, reduced context switching
- **Cons:** Less flexibility than Express, harder to test API logic in isolation
- **Context:** Team productivity and deployment simplicity outweigh ecosystem size

**Revisit Trigger:** When API complexity demands advanced middleware/plugin ecosystem, or team splits into frontend/backend specializations

---

### Decision 3: PostgreSQL Full-Text Search vs Elasticsearch

**Decision:** PostgreSQL (v1), Elasticsearch (v2)

**Rationale:**
- **Pros:** No additional infrastructure, simpler ops, sufficient for <1K vendors, trigram fuzzy search adequate
- **Cons:** Less advanced relevance tuning, limited faceted filtering, slower at scale
- **Context:** Reduce moving parts at launch. Vendor count unlikely to exceed 1K in first year.

**Revisit Trigger:** When vendor count > 5K OR search becomes performance bottleneck (>1s response times)

---

### Decision 4: JWT vs Session-Based Auth

**Decision:** JWT with Redis Session Storage (hybrid)

**Rationale:**
- **Pros:** Stateless (JWT), but revocable (Redis), serverless-friendly, supports distributed systems
- **Cons:** More complex than pure sessions, requires Redis infrastructure
- **Context:** Serverless functions can't maintain in-memory sessions. Redis provides revocation without DB lookups on every request.

**Revisit Trigger:** If Redis becomes cost prohibitive or session revocation not needed

---

### Decision 5: Stripe Connect Standard vs Express

**Decision:** Stripe Connect Standard Accounts

**Rationale:**
- **Pros:** Vendors manage own Stripe dashboard, easier tax compliance (1099 to vendors), lower platform liability
- **Cons:** More onboarding friction (vendors complete Stripe KYC), less control over UX
- **Context:** Legal compliance and reduced liability outweigh UX friction. Vendors are businesses, can handle KYC.

**Revisit Trigger:** If vendor onboarding friction causes significant drop-off (>30% abandonment)

---

### Decision 6: Vercel vs AWS/GCP

**Decision:** Vercel (frontend + API routes) + Neon (database)

**Rationale:**
- **Pros:** Zero-config deployment, automatic preview environments, edge network, Next.js-native, excellent DX
- **Cons:** More expensive at high scale, vendor lock-in, less infrastructure control
- **Context:** Speed to market and developer productivity prioritized. Cost acceptable until 100K+ users.

**Revisit Trigger:** When monthly Vercel costs > $500 OR need infrastructure features Vercel doesn't support

---

### Decision 7: REST vs GraphQL

**Decision:** REST API

**Rationale:**
- **Pros:** Simpler, cacheable (HTTP caching), well-understood, less client complexity
- **Cons:** Potential over-fetching/under-fetching, multiple round trips for related data
- **Context:** API surface area not large enough to justify GraphQL complexity. Can add GraphQL layer later if needed.

**Revisit Trigger:** When client-side data fetching complexity becomes unmanageable OR mobile app demands custom queries

---

### Decision 8: Real-Time vs Async Messaging

**Decision:** Async Messaging (v1), Real-Time (v2)

**Rationale:**
- **Pros:** Simpler infrastructure, no WebSocket servers, sufficient for booking coordination (not time-critical)
- **Cons:** No instant notifications, users must refresh to see new messages
- **Context:** Booking coordination doesn't require instant replies. Email notifications bridge gap.

**Revisit Trigger:** When user feedback indicates real-time messaging is critical to UX OR competition offers it

---

## Conclusion

This architecture document establishes the technical foundation for Fleet Feast's food truck marketplace. The design prioritizes:

1. **Simplicity:** Monolithic architecture reduces operational complexity
2. **Scalability:** Clear module boundaries enable future decomposition
3. **Security:** Multi-layer protection for payments, data, and anti-circumvention
4. **Speed:** Serverless deployment, edge caching, optimized queries
5. **Reliability:** Comprehensive monitoring, error tracking, incident response

**Next Steps:**
- **Data Architecture:** Dana_Database designs database schema (Task 1.2)
- **API Design:** Ellis_Endpoints defines API contracts (Task 1.3)
- **Frontend Architecture:** Parker_Pages establishes page structure (Task 2.1)

---

*Document maintained by: Alex_Architect*
*Last updated: 2025-12-03*
*Version: 1.0*
