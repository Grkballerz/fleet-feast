# Fleet Feast Architecture Documentation - Summary

**Created**: 2025-12-04
**Author**: Alex_Architect (Task: Fleet-Feast-1kw)
**Status**: Complete

---

## Overview

This document summarizes the complete system architecture design for Fleet Feast, a food truck marketplace platform. The architecture supports all 22 functional requirements (F1-F22) from the PRD with a focus on security, scalability, and developer experience.

---

## Deliverables Completed

### 1. Core Documentation Files

| File | Size | Purpose | Key Sections |
|------|------|---------|--------------|
| **ARCHITECTURE.md** | 34 KB | Comprehensive system architecture | 18 major sections covering stack, patterns, components, API design, database, auth, payments, caching, files, jobs, errors, logging, security, performance, deployment |
| **DATA_FLOW.md** | 36 KB | Detailed flow diagrams | 8 complete flows: registration, vendor application, booking, payment/escrow, messaging, reviews, disputes, search |
| **DECISIONS.md** | 25 KB | Architecture Decision Records | 10 ADRs covering all major technology and pattern decisions |
| **README.md** | 16 KB | Navigation and usage guide | Quick start, document index, common use cases, ADR template |

### 2. Key Architectural Decisions (ADRs)

| ADR | Decision | Rationale |
|-----|----------|-----------|
| **ADR-001** | Next.js App Router | Server Components, better performance, future-proof |
| **ADR-002** | Prisma ORM | Type safety, excellent DX, schema-first approach |
| **ADR-003** | NextAuth.js v5 | Integrated auth, JWT sessions, easy OAuth expansion |
| **ADR-004** | Monolithic Architecture | Faster development, lower costs, easier testing for MVP |
| **ADR-005** | PostgreSQL Full-Text Search | Zero extra infrastructure, good enough for 1000 vendors |
| **ADR-006** | Stripe Connect | Marketplace payments, built-in escrow, compliance |
| **ADR-007** | Manual Payment Capture | 7-day escrow window for disputes |
| **ADR-008** | Server Components Default | Performance, SEO, smaller bundles |
| **ADR-009** | Soft Deletes | Data recovery, compliance, audit trail |
| **ADR-010** | Vercel Hosting | Zero-config, edge network, Next.js optimization |

### 3. Technology Stack Finalized

#### Frontend
- **Framework**: Next.js 14.2+ (App Router)
- **UI Library**: React 18.2+
- **Type System**: TypeScript 5.6+
- **Styling**: Tailwind CSS 3.4+
- **Components**: Radix UI (accessible primitives)
- **Forms**: React Hook Form 7.53+ + Zod 3.23+
- **State**: Zustand 4.5+ (client) + TanStack Query 5.56+ (server)

#### Backend
- **API Layer**: Next.js API Routes
- **ORM**: Prisma 5.20+
- **Database**: PostgreSQL 15+
- **Cache**: Redis 7+
- **Auth**: NextAuth.js v5
- **Payments**: Stripe 17.0+ (Connect)
- **File Storage**: AWS S3
- **Email**: AWS SES

#### Infrastructure
- **Hosting**: Vercel (frontend + API)
- **Database**: AWS RDS (PostgreSQL)
- **Cache**: AWS ElastiCache (Redis)
- **Storage**: AWS S3
- **Monitoring**: Sentry

---

## System Architecture Summary

### Layered Architecture

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│   (Server Components, Client Components)│ ← React, Tailwind
├─────────────────────────────────────────┤
│          Application Layer              │
│      (API Routes, Server Actions)       │ ← Next.js API Routes
├─────────────────────────────────────────┤
│          Business Logic Layer           │
│    (Services, Validators, Utils)        │ ← TypeScript Services
├─────────────────────────────────────────┤
│          Data Access Layer              │
│         (Prisma Client, Redis)          │ ← Prisma ORM
├─────────────────────────────────────────┤
│         Infrastructure Layer            │
│   (PostgreSQL, Redis, S3, Stripe)       │ ← AWS + Stripe
└─────────────────────────────────────────┘
```

### Directory Structure

```
fleet-feast/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Route group: login, register
│   ├── (marketing)/              # Route group: homepage, about
│   ├── (dashboard)/              # Route group: dashboards
│   │   ├── customer/
│   │   ├── vendor/
│   │   └── admin/
│   ├── vendors/                  # Vendor profiles, search
│   ├── bookings/                 # Booking pages
│   └── api/                      # API routes
│       ├── auth/                 # NextAuth endpoints
│       ├── bookings/             # Booking CRUD
│       ├── vendors/              # Vendor CRUD
│       ├── payments/             # Payment processing
│       ├── messages/             # Messaging
│       └── webhooks/             # Stripe webhooks
│
├── components/                   # Shared components
│   ├── ui/                       # Radix UI wrappers
│   ├── forms/                    # Reusable forms
│   └── features/                 # Feature-specific
│
├── lib/                          # Core utilities
│   ├── db/                       # Prisma, Redis clients
│   ├── auth/                     # Auth config, helpers
│   ├── services/                 # Business logic
│   │   ├── booking.service.ts
│   │   ├── payment.service.ts
│   │   ├── messaging.service.ts
│   │   └── search.service.ts
│   ├── validators/               # Zod schemas
│   └── utils/                    # Helpers
│
├── prisma/                       # Database
│   ├── schema.prisma             # Schema (already exists)
│   ├── migrations/
│   └── seed.ts
│
└── jobs/                         # Background jobs
    ├── payment-release.job.ts    # 7-day escrow release
    └── notification.job.ts       # Email queue
```

---

## Core Flows Documented

### 1. User Registration
- Email/password with bcrypt
- Email verification via AWS SES
- Auto-login via NextAuth.js
- Role: CUSTOMER by default

### 2. Vendor Application
- Self-service application form
- Document upload to S3 (direct upload with presigned URLs)
- Admin approval workflow
- Stripe Connect onboarding
- Status: PENDING → APPROVED/REJECTED

### 3. Booking Request Flow
- Request-to-book pattern (not instant booking)
- 48-hour vendor response window
- Loyalty discount detection (5% for repeat customers)
- Platform fee: 15% (normal) or 10% (loyalty)
- States: PENDING → ACCEPTED → CONFIRMED → COMPLETED

### 4. Payment & Escrow
- Stripe PaymentIntent with manual capture
- Destination charge to vendor Stripe account
- 7-day escrow hold after event
- Automated release via cron job
- States: PENDING → AUTHORIZED → CAPTURED → RELEASED

### 5. Messaging with Anti-Circumvention
- In-app messaging only (no external contact)
- Pattern detection for phone/email/social media
- Automated flagging (severity: LOW, MEDIUM, HIGH)
- Violation tracking (warning → suspension → ban)

### 6. Review System
- Post-booking only (verified transactions)
- 1-5 star rating + text review
- Both parties can review each other
- Moderation flags for inappropriate content

### 7. Dispute Resolution
- 7-day window after event completion
- Automated resolution for common issues:
  - Vendor no-show: Full refund + $500 penalty
  - Late arrival 30-60min: 10% refund
  - Late arrival 60+min: 25% refund
- Manual admin review for complex disputes

### 8. Search & Discovery
- PostgreSQL full-text search (MVP)
- Filters: cuisine, price, capacity, date, rating
- Redis cache (5min TTL)
- Indexed queries for performance

---

## Security Architecture

### Authentication
- NextAuth.js with JWT tokens
- HTTP-only secure cookies
- 30-day session expiration
- bcrypt password hashing (cost factor: 10)

### Authorization
- Role-based access control (CUSTOMER, VENDOR, ADMIN)
- Server-side validation on all endpoints
- Vendor-specific resource checks

### Data Protection
- TLS 1.3 in transit
- AES-256 at rest (RDS encryption)
- Soft deletes for audit trail
- 7-year retention for financial records

### Payment Security
- PCI-DSS compliance via Stripe
- No card data stored in database
- Webhook signature verification
- Idempotency keys for duplicate prevention

### Anti-Circumvention
- Regex pattern detection for contact info
- Severity-based violation escalation
- Automated account suspension
- Manual admin review for appeals

---

## Performance Targets

| Metric | Target | Implementation |
|--------|--------|----------------|
| Page Load (LCP) | < 2.5s | Server Components, edge caching |
| API Response (p95) | < 500ms | Redis cache, indexed queries |
| Search Results | < 1s | PostgreSQL FTS + Redis cache |
| Concurrent Users | 1,000 (initial) | Connection pooling, edge functions |
| Database Queries | < 100ms (p95) | Indexes, query optimization |
| Uptime | 99.5% | Vercel SLA, RDS multi-AZ |

---

## Scalability Path

### Phase 1: MVP (0-1K users)
- Single Next.js instance on Vercel
- Single RDS instance (db.t3.medium)
- Single ElastiCache instance (cache.t3.micro)
- **Costs**: ~$50-100/month

### Phase 2: Growth (1K-10K users)
- Auto-scaled Vercel functions
- RDS instance upgrade (db.t3.large)
- ElastiCache upgrade (cache.t3.small)
- **Costs**: ~$200-500/month

### Phase 3: Scale (10K-100K users)
- PostgreSQL read replicas
- Redis cluster
- CDN for static assets
- ElasticSearch for search (migrate from PostgreSQL FTS)
- **Costs**: ~$1,000-2,000/month

---

## Integration Points

### External Services

| Service | Purpose | Integration |
|---------|---------|-------------|
| **Stripe** | Payments, escrow, payouts | Stripe Connect API + webhooks |
| **AWS S3** | Document/image storage | Direct upload via presigned URLs |
| **AWS SES** | Transactional emails | SMTP or API |
| **Sentry** | Error tracking | SDK integration |
| **Vercel** | Hosting, cron jobs | Git-based deployment |

### Webhook Handlers

| Webhook | Path | Purpose |
|---------|------|---------|
| Stripe | `/api/webhooks/stripe` | Payment events, transfer status |

### Cron Jobs

| Job | Schedule | Path |
|-----|----------|------|
| Payment Release | Daily 2am | `/api/cron/payment-release` |
| Email Queue | Every 5min | `/api/cron/notifications` |
| Cache Cleanup | Hourly | `/api/cron/cache-cleanup` |

---

## Database Design Highlights

### Core Tables
- **users**: Authentication, roles, status
- **vendors**: Business profiles, approval status
- **vendor_documents**: License, permits, insurance
- **vendor_menus**: Menu items (JSON)
- **availability**: Vendor calendar
- **bookings**: Reservations, status, financials
- **payments**: Stripe transactions, escrow state
- **messages**: In-app communication, flags
- **reviews**: Ratings, verified only
- **disputes**: Resolution workflow
- **violations**: Anti-circumvention tracking

### Key Indexes
- Composite: `cuisineType + status + approvedAt` (vendor search)
- Composite: `vendorId + date` (availability lookup)
- Composite: `bookingId + createdAt` (message threads)
- Single: `stripePaymentIntentId`, `email`, `status`

### Constraints
- Foreign keys with `onDelete: Cascade` or `Restrict`
- Unique constraints: email, stripe IDs
- Soft deletes via `deletedAt` timestamp

---

## Deployment Strategy

### Environments
- **Development**: Local (localhost:3000)
- **Staging**: Vercel preview (every PR)
- **Production**: Vercel production (main branch)

### CI/CD Pipeline
1. Git push to branch
2. Vercel auto-builds preview
3. PR review + tests
4. Merge to main
5. Vercel auto-deploys to production

### Environment Variables
```
DATABASE_URL              # PostgreSQL connection string
REDIS_URL                 # Redis connection string
NEXTAUTH_SECRET           # JWT signing secret
NEXTAUTH_URL              # Base URL
STRIPE_SECRET_KEY         # Stripe API key
STRIPE_WEBHOOK_SECRET     # Webhook signature verification
AWS_ACCESS_KEY_ID         # S3 access
AWS_SECRET_ACCESS_KEY     # S3 secret
AWS_S3_BUCKET             # Bucket name
AWS_REGION                # us-east-1
AWS_SES_*                 # Email credentials
SENTRY_DSN                # Error tracking
```

### Database Migrations
```bash
# Generate migration
npx prisma migrate dev --name add_feature

# Deploy to production
npx prisma migrate deploy
```

---

## Monitoring & Observability

### Error Tracking
- **Sentry** for frontend + backend errors
- Automatic source map upload
- Performance monitoring
- Custom breadcrumbs for debugging

### Logging
- Console logs in development
- Structured JSON logs in production
- Log levels: DEBUG, INFO, WARN, ERROR
- Context: user ID, request ID, timestamp

### Metrics
- Vercel Analytics: Page views, performance
- Stripe Dashboard: Payment metrics, disputes
- RDS CloudWatch: Database performance
- ElastiCache CloudWatch: Cache hit rate

### Alerts
- Sentry: Error rate spikes
- Vercel: Deployment failures
- RDS: High CPU, low storage
- Custom: Payment failures, dispute rate

---

## Outstanding Questions / Future Considerations

### Addressed in Design
✅ Tech stack selection (Next.js, Prisma, PostgreSQL, Redis, Stripe)
✅ Directory structure
✅ API design patterns
✅ Authentication flow
✅ Payment escrow implementation
✅ Anti-circumvention strategy
✅ Caching strategy
✅ Error handling
✅ Deployment strategy

### Deferred to Later Phases
⏭️ Real-time messaging (using polling for MVP)
⏭️ Elasticsearch migration (at 1000+ vendors)
⏭️ Mobile apps (web-first approach)
⏭️ Multi-city expansion (NYC only for MVP)
⏭️ Advanced analytics (basic metrics for MVP)
⏭️ A/B testing framework
⏭️ CDN optimization (Vercel handles this)

### Recommendations for Next Tasks
1. **Dana_Database** should review database schema alignment with architecture
2. **Ellis_Endpoints** should implement API routes based on documented structure
3. **Blake_Backend** should create service classes in `lib/services/`
4. **Petra_Patterns** should establish coding patterns for Server vs Client Components
5. **Devon_DevOps** should set up environment variables in Vercel

---

## Success Criteria Met

✅ **System Architecture Designed**: Complete high-level design with 18 major sections
✅ **Tech Stack Justified**: All technology choices documented with ADRs
✅ **Directory Structure Defined**: Clear organizational pattern established
✅ **API Design Completed**: REST conventions, endpoint structure, response formats
✅ **Data Flow Documented**: 8 complete flows with state transitions
✅ **Security Architecture**: Multi-layered approach documented
✅ **Performance Strategy**: Caching, indexing, optimization plans
✅ **Deployment Plan**: CI/CD, environments, migration strategy
✅ **Scalability Path**: Clear phases from MVP to 100K users
✅ **Integration Design**: External services, webhooks, cron jobs

---

## Files Created

| File | Path | Purpose |
|------|------|---------|
| ARCHITECTURE.md | `docs/architecture/ARCHITECTURE.md` | Complete system architecture (34 KB) |
| DATA_FLOW.md | `docs/architecture/DATA_FLOW.md` | Detailed flow diagrams (36 KB) |
| DECISIONS.md | `docs/architecture/DECISIONS.md` | 10 Architecture Decision Records (25 KB) |
| README.md | `docs/architecture/README.md` | Navigation guide (16 KB) |
| SUMMARY.md | `docs/architecture/SUMMARY.md` | This document (current) |

**Total Documentation**: ~115 KB of comprehensive architecture documentation

---

## Handoff Notes

### For Petra_Patterns
- Review ADR-008 (Server Components default)
- Establish patterns for form handling, modals, dialogs
- Create example components in `components/ui/`

### For Blake_Backend
- Implement services in `lib/services/` based on architecture
- Follow error handling patterns from ARCHITECTURE.md
- Use Prisma patterns documented in ADR-002

### For Ellis_Endpoints
- Implement API routes in `app/api/` per documented structure
- Follow REST conventions from ARCHITECTURE.md
- Use Zod validators from `lib/validators/`

### For Dana_Database
- Verify Prisma schema aligns with architecture
- Add indexes documented in ARCHITECTURE.md
- Implement soft delete middleware

### For Jordan_Junction
- Review integration architecture section
- Implement Stripe webhook handlers
- Set up AWS S3 presigned URL generation

### For Devon_DevOps
- Set up Vercel environment variables
- Configure RDS and ElastiCache
- Implement cron jobs via Vercel

---

**Architecture Design Complete** ✅
**Ready for Implementation** ✅
**Documentation Status**: Production-Ready

---

*Generated by: Alex_Architect*
*Task: Fleet-Feast-1kw - System Architecture Design*
*Date: 2025-12-04*
