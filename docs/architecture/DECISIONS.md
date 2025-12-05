# Architecture Decision Records (ADRs)

**Project**: Fleet Feast
**Author**: Alex_Architect
**Last Updated**: 2025-12-04

---

## Table of Contents

- [ADR-001: Next.js App Router over Pages Router](#adr-001-nextjs-app-router-over-pages-router)
- [ADR-002: Prisma ORM for Database Access](#adr-002-prisma-orm-for-database-access)
- [ADR-003: NextAuth.js for Authentication](#adr-003-nextauthjs-for-authentication)
- [ADR-004: Monolithic Architecture over Microservices](#adr-004-monolithic-architecture-over-microservices)
- [ADR-005: PostgreSQL Full-Text Search over Elasticsearch](#adr-005-postgresql-full-text-search-over-elasticsearch)
- [ADR-006: Stripe Connect for Marketplace Payments](#adr-006-stripe-connect-for-marketplace-payments)
- [ADR-007: Manual Payment Capture for Escrow](#adr-007-manual-payment-capture-for-escrow)
- [ADR-008: Server Components as Default](#adr-008-server-components-as-default)
- [ADR-009: Soft Deletes over Hard Deletes](#adr-009-soft-deletes-over-hard-deletes)
- [ADR-010: Vercel for Hosting](#adr-010-vercel-for-hosting)

---

## ADR-001: Next.js App Router over Pages Router

**Status**: Accepted
**Date**: 2025-12-04
**Decision Makers**: Alex_Architect

### Context

Next.js 13+ introduced the App Router, a new routing paradigm that coexists with the older Pages Router. We need to choose which routing system to use for Fleet Feast.

### Decision

We will use the **App Router** for all routing in Fleet Feast.

### Rationale

**Pros of App Router**:
1. **Server Components by Default**: Reduces JavaScript bundle size, improves performance
2. **Streaming & Suspense**: Better UX with progressive loading
3. **Nested Layouts**: Shared layouts without prop drilling
4. **Route Groups**: Organize routes without affecting URL structure (e.g., `(auth)`, `(dashboard)`)
5. **Server Actions**: Simplified data mutations without API routes
6. **Future-Proof**: Next.js team's recommended approach going forward
7. **Improved Type Safety**: Better TypeScript inference for route params

**Cons**:
1. **Learning Curve**: Newer paradigm, less Stack Overflow answers
2. **Ecosystem Maturity**: Some libraries not optimized for Server Components yet
3. **Migration Path**: Harder to find examples of similar patterns

**Pages Router Alternatives Considered**:
- Easier learning curve for developers familiar with React
- More mature ecosystem
- But: Doesn't leverage React 18+ features, worse performance

### Consequences

**Positive**:
- Better performance out of the box (less client-side JS)
- Cleaner separation of Server vs Client Components
- Built-in support for streaming and suspense
- Easier to implement route-specific layouts (auth layout, dashboard layout)

**Negative**:
- Team needs to learn Server Component patterns
- Need to be explicit about 'use client' for interactive components
- Some third-party libraries may not work in Server Components

**Mitigation**:
- Create clear documentation on when to use Server vs Client Components
- Establish patterns for common scenarios (forms, modals, etc.)
- Use Client Components for interactive UI, Server Components for data fetching

### Implementation Notes

```
app/
├── (auth)/           # Route group for authentication pages
│   └── layout.tsx    # Auth-specific layout
├── (marketing)/      # Route group for public pages
│   └── layout.tsx    # Marketing layout
├── (dashboard)/      # Route group for protected pages
│   └── layout.tsx    # Dashboard layout
└── layout.tsx        # Root layout
```

---

## ADR-002: Prisma ORM for Database Access

**Status**: Accepted
**Date**: 2025-12-04
**Decision Makers**: Alex_Architect

### Context

We need a database access layer for interacting with PostgreSQL. Options include raw SQL, query builders (Knex), and ORMs (Prisma, TypeORM, Drizzle).

### Decision

We will use **Prisma ORM** for all database interactions.

### Rationale

**Pros of Prisma**:
1. **Type Safety**: Auto-generated types from schema match database exactly
2. **Developer Experience**: Excellent autocomplete, error messages
3. **Schema-First**: Single source of truth (`schema.prisma`)
4. **Migration System**: Built-in migration generation and management
5. **Query Performance**: Optimized query generation, connection pooling
6. **Ecosystem**: Well-documented, active community, Next.js integration
7. **Prisma Studio**: Built-in GUI for database inspection

**Cons**:
1. **Abstraction Cost**: Limited ability to write complex raw SQL
2. **Bundle Size**: Adds ~1MB to server bundle (negligible for Next.js)
3. **Learning Curve**: Prisma-specific query syntax

**Alternatives Considered**:
- **Raw SQL (pg)**: Maximum control, but no type safety, manual migrations
- **Knex.js**: More flexible than Prisma, but no auto-generated types
- **TypeORM**: Similar to Prisma, but decorator-based syntax, worse DX
- **Drizzle**: Lighter weight, but less mature ecosystem

### Consequences

**Positive**:
- End-to-end type safety from database to frontend
- Fast development with autocomplete and error checking
- Easy database schema changes with migrations
- Reduced SQL injection risk (parameterized queries)

**Negative**:
- Complex queries may require raw SQL escape hatch
- Potential performance cost for very complex joins (rare in our use case)

**Mitigation**:
- Use `prisma.$queryRaw` for complex queries when needed
- Benchmark performance for critical paths (search, booking creation)
- Use Prisma's query optimization features (select, include)

### Implementation Notes

```typescript
// lib/db/prisma.ts - Singleton pattern for Next.js
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

---

## ADR-003: NextAuth.js for Authentication

**Status**: Accepted
**Date**: 2025-12-04
**Decision Makers**: Alex_Architect

### Context

Fleet Feast requires authentication for customers, vendors, and admins. We need a secure, maintainable auth system that supports email/password login and future OAuth providers.

### Decision

We will use **NextAuth.js v5** (next-auth@beta) for authentication and session management.

### Rationale

**Pros of NextAuth.js**:
1. **Next.js Integration**: Built specifically for Next.js, works seamlessly with App Router
2. **Provider Support**: Easy to add OAuth (Google, Facebook) in the future
3. **Session Management**: Built-in JWT or database sessions
4. **Security**: CSRF protection, secure cookies, bcrypt hashing
5. **Prisma Adapter**: First-class Prisma integration
6. **Role-Based Access**: Easy to extend for CUSTOMER, VENDOR, ADMIN roles
7. **Community**: Large ecosystem, well-documented

**Cons**:
1. **v5 Beta**: Still in beta (as of Dec 2024), some instability risk
2. **Magic Link Overhead**: Email-based login requires email service
3. **Customization Limits**: Some auth flows harder to customize

**Alternatives Considered**:
- **Clerk**: Great DX, but expensive ($25/mo for 1000 MAU)
- **Auth0**: Enterprise-grade, but overkill for MVP, expensive
- **Custom JWT**: Full control, but security risk, time-consuming
- **Lucia**: Lightweight, but less mature ecosystem

### Consequences

**Positive**:
- Secure authentication out of the box
- Easy to add social login later (Google, Apple)
- Role-based access with minimal code
- Works well with Prisma User model

**Negative**:
- v5 beta may have breaking changes before stable release
- Customizing auth flows (e.g., two-factor) requires workarounds

**Mitigation**:
- Pin to specific v5 beta version, test thoroughly before upgrading
- Monitor NextAuth.js GitHub for breaking changes
- Implement custom auth flows outside NextAuth if needed

### Implementation Notes

```typescript
// lib/auth/config.ts
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
};
```

---

## ADR-004: Monolithic Architecture over Microservices

**Status**: Accepted
**Date**: 2025-12-04
**Decision Makers**: Alex_Architect

### Context

Fleet Feast could be built as a single application or split into multiple microservices (e.g., user service, booking service, payment service).

### Decision

We will use a **monolithic Next.js application** with modular organization (feature-based folders).

### Rationale

**Pros of Monolithic**:
1. **Simplicity**: Single codebase, single deployment
2. **Faster Development**: No need for inter-service communication, API contracts
3. **Easier Testing**: End-to-end tests in single process
4. **Lower Costs**: Single server, single database, single Redis instance
5. **Better DX**: All code in one repo, shared types, atomic refactoring
6. **Performance**: No network overhead between services

**Cons**:
1. **Scaling Limits**: Can't scale individual services independently
2. **Deployment Risk**: Single failure point (mitigated by Vercel's reliability)
3. **Team Coordination**: Larger teams may have merge conflicts

**Microservices Alternatives Considered**:
- Better for large teams (10+ engineers)
- Allows independent scaling (but we don't need that for 1-10K users)
- Adds complexity: API gateways, service discovery, distributed tracing

### Consequences

**Positive**:
- Faster time to market (no microservice overhead)
- Lower operational complexity
- Easier debugging and error tracking
- Shared database transactions (critical for bookings + payments)

**Negative**:
- Harder to scale to millions of users (but not a problem for MVP)
- Single failure point (but Vercel has 99.9% uptime SLA)

**Mitigation**:
- Organize code in feature-based modules for future extraction if needed
- Use service classes to encapsulate business logic (easier to extract later)
- Monitor performance and scale vertically first (bigger database, more Redis)

### Future Migration Path

If we reach 100K+ users:
1. Extract payment service (most critical, stateless)
2. Extract messaging service (real-time, CPU-intensive)
3. Keep core booking/vendor logic in monolith

---

## ADR-005: PostgreSQL Full-Text Search over Elasticsearch

**Status**: Accepted
**Date**: 2025-12-04
**Decision Makers**: Alex_Architect

### Context

We need search functionality for vendors (by name, cuisine, description). Options include PostgreSQL full-text search, Elasticsearch, Algolia, or Typesense.

### Decision

We will use **PostgreSQL full-text search** for MVP, with Elasticsearch as a future upgrade path.

### Rationale

**Pros of PostgreSQL FTS**:
1. **Zero Extra Infrastructure**: Runs on existing PostgreSQL instance
2. **Good Enough for MVP**: Handles 100-1000 vendors easily
3. **Low Cost**: No additional service fees
4. **Simpler Architecture**: No data syncing between Postgres and search engine
5. **Strong Enough**: Supports stemming, ranking, phrase search
6. **Fast for Small Datasets**: <1 second for 1000 vendors

**Cons**:
1. **Scaling Limits**: Struggles with millions of documents
2. **Limited Features**: No fuzzy search, typo tolerance by default
3. **Performance**: Slower than dedicated search engines for large datasets

**Alternatives Considered**:
- **Elasticsearch**: Best search features, but requires separate infrastructure, $50-200/mo
- **Algolia**: Great DX, but expensive ($1/1000 searches), vendor lock-in
- **Typesense**: Good middle ground, but requires separate server
- **MeiliSearch**: Open-source, but requires separate server

### Consequences

**Positive**:
- Immediate implementation, no new service to manage
- Lower costs for MVP
- Simpler architecture, fewer moving parts
- Search index automatically stays in sync with database

**Negative**:
- May need to migrate to Elasticsearch at scale (1000+ vendors)
- Limited typo tolerance (can be added with pg_trgm extension)

**Mitigation**:
- Use PostgreSQL `ts_vector` for full-text search
- Add `pg_trgm` extension for fuzzy matching if needed
- Monitor search performance, plan Elasticsearch migration at 1000+ vendors

### Implementation Notes

```sql
-- Add full-text search columns to vendors table
ALTER TABLE vendors ADD COLUMN search_vector tsvector;

-- Update search vector on insert/update
CREATE TRIGGER vendors_search_update
BEFORE INSERT OR UPDATE ON vendors
FOR EACH ROW EXECUTE FUNCTION
  tsvector_update_trigger(search_vector, 'pg_catalog.english', business_name, description);

-- Create GIN index for fast search
CREATE INDEX vendors_search_idx ON vendors USING GIN(search_vector);

-- Search query
SELECT * FROM vendors
WHERE search_vector @@ to_tsquery('english', 'mexican & truck');
```

---

## ADR-006: Stripe Connect for Marketplace Payments

**Status**: Accepted
**Date**: 2025-12-04
**Decision Makers**: Alex_Architect

### Context

Fleet Feast is a marketplace platform that takes 15% commission. We need a payment processor that supports:
- Holding funds in escrow
- Splitting payments (platform fee + vendor payout)
- Handling disputes and refunds

### Decision

We will use **Stripe Connect** with **destination charges**.

### Rationale

**Pros of Stripe Connect**:
1. **Marketplace-Native**: Built specifically for platforms like Fleet Feast
2. **Escrow Support**: Can hold funds and release after 7 days
3. **Split Payments**: Automatic commission deduction
4. **Strong API**: Excellent developer experience, webhooks, comprehensive docs
5. **Compliance**: Handles PCI-DSS, KYC for vendors
6. **Dispute Management**: Built-in chargeback handling
7. **Payout Scheduling**: Vendors get paid on flexible schedules

**Cons**:
1. **Fees**: 2.9% + $0.30 per transaction + 0.5% for Connect
2. **Complexity**: Requires managing vendor Stripe accounts
3. **Vendor Onboarding**: Vendors must complete Stripe Connect onboarding

**Alternatives Considered**:
- **PayPal for Marketplaces**: Higher fees (3.5%), worse DX
- **Braintree**: Lower fees, but worse documentation
- **Square**: Not designed for marketplaces
- **Manual Escrow**: Too complex, compliance risk

### Consequences

**Positive**:
- Secure, compliant payment handling
- Automatic tax collection (future feature)
- No need to build custom escrow system
- Vendor payouts handled by Stripe

**Negative**:
- 3.4% total fees (2.9% base + 0.5% Connect) on each transaction
- Vendors must complete Stripe onboarding (friction)

**Mitigation**:
- Pass some fees to customers (include in booking price)
- Streamline vendor onboarding with Stripe Connect Express

### Implementation Notes

```typescript
// Create PaymentIntent with destination charge
const paymentIntent = await stripe.paymentIntents.create({
  amount: Math.round(booking.totalAmount * 100), // Convert to cents
  currency: 'usd',
  metadata: { bookingId: booking.id },
  transfer_data: {
    destination: vendor.stripeAccountId, // Vendor's Stripe Connect account
  },
  application_fee_amount: Math.round(booking.platformFee * 100), // 15% commission
  capture_method: 'manual', // For escrow (capture after 7 days)
});
```

---

## ADR-007: Manual Payment Capture for Escrow

**Status**: Accepted
**Date**: 2025-12-04
**Decision Makers**: Alex_Architect

### Context

Fleet Feast needs to hold payments for 7 days after an event to allow for disputes. Stripe offers two payment capture methods: automatic (immediate) and manual (delayed).

### Decision

We will use **manual capture** for all bookings to implement the 7-day escrow window.

### Rationale

**Pros of Manual Capture**:
1. **Escrow Implementation**: Allows holding funds for 7 days
2. **Dispute Window**: Protects customers from vendor no-shows, quality issues
3. **Refund Flexibility**: Easier to refund if disputes arise
4. **Trust Building**: Customers feel protected, vendors know funds are secured

**Cons**:
1. **Complexity**: Requires background job to capture payments
2. **Risk Window**: Stripe holds authorized funds for max 7 days (exactly our window)
3. **Cash Flow Impact**: Vendors wait 7 days for payment

**Automatic Capture Alternatives**:
- Simpler implementation
- But: No escrow, harder to refund, customer trust issues

### Consequences

**Positive**:
- Strong customer protection (7-day dispute window)
- Reduces fraud and platform liability
- Aligns with marketplace best practices

**Negative**:
- Vendors may prefer faster payouts
- Requires cron job to capture payments
- Risk of expired authorization if event delayed

**Mitigation**:
- Clearly communicate payout timeline to vendors during onboarding
- Implement daily cron job to capture payments after 7-day window
- Monitor for authorization expiration edge cases

### Implementation Notes

```typescript
// When booking is created
const paymentIntent = await stripe.paymentIntents.create({
  amount: totalAmount,
  capture_method: 'manual', // Don't capture immediately
});

// 7 days after event completion (cron job)
await stripe.paymentIntents.capture(paymentIntent.id);
```

---

## ADR-008: Server Components as Default

**Status**: Accepted
**Date**: 2025-12-04
**Decision Makers**: Alex_Architect

### Context

Next.js 13+ App Router supports both Server Components (default) and Client Components ('use client'). We need to establish a pattern for when to use each.

### Decision

We will use **Server Components by default** and only use Client Components when interactivity is required.

### Rationale

**Pros of Server Components**:
1. **Performance**: Zero JavaScript sent to client by default
2. **SEO**: Rendered HTML, better for search engines
3. **Data Fetching**: Direct database access without API routes
4. **Security**: Sensitive logic stays on server
5. **Bundle Size**: Smaller client-side bundles

**Cons**:
1. **Interactivity Limits**: Can't use useState, useEffect, event handlers
2. **Learning Curve**: New mental model for React developers

**Client Component Use Cases**:
- Forms with client-side validation
- Interactive UI (dropdowns, modals, toasts)
- Browser APIs (localStorage, geolocation)
- Third-party libraries that use hooks

### Consequences

**Positive**:
- Faster page loads (less JavaScript)
- Better Core Web Vitals scores
- Easier to reason about data fetching

**Negative**:
- Need to be explicit about 'use client' boundaries
- Some libraries may not work in Server Components

**Mitigation**:
- Create clear guidelines: "Use Server Components unless you need interactivity"
- Build reusable Client Component wrappers (e.g., `<ClientModal>`)

### Implementation Notes

```tsx
// DEFAULT: Server Component (async, data fetching)
export default async function VendorPage({ params }) {
  const vendor = await prisma.vendor.findUnique({ where: { id: params.id } });
  return <VendorProfile vendor={vendor} />;
}

// ONLY WHEN NEEDED: Client Component
'use client'
export function BookingForm() {
  const [guests, setGuests] = useState(10);
  return <input value={guests} onChange={e => setGuests(e.target.value)} />;
}
```

---

## ADR-009: Soft Deletes over Hard Deletes

**Status**: Accepted
**Date**: 2025-12-04
**Decision Makers**: Alex_Architect

### Context

When users delete accounts, bookings are cancelled, or content is removed, we need to decide whether to permanently delete records (hard delete) or mark them as deleted (soft delete).

### Decision

We will use **soft deletes** for all user-facing entities (users, bookings, messages, reviews) with a `deletedAt` timestamp.

### Rationale

**Pros of Soft Deletes**:
1. **Data Recovery**: Can restore accidentally deleted data
2. **Audit Trail**: Maintain historical records for compliance
3. **Referential Integrity**: Avoid cascading deletes breaking relationships
4. **Legal Compliance**: Required for 7-year financial record retention (bookings, payments)
5. **Analytics**: Preserve data for reporting (e.g., "cancelled bookings last month")

**Cons**:
1. **Query Complexity**: Must filter `deletedAt IS NULL` on every query
2. **Database Size**: Deleted records still occupy space
3. **Data Leakage Risk**: Deleted data still in database

**Hard Delete Alternatives**:
- Simpler queries
- Smaller database
- But: Permanent data loss, no recovery, compliance issues

### Consequences

**Positive**:
- Compliance with data retention laws
- Ability to recover from user mistakes
- Better audit trail for disputes

**Negative**:
- Slightly more complex queries
- Need periodic cleanup job for very old soft-deleted records

**Mitigation**:
- Use Prisma middleware to automatically filter soft-deleted records
- Implement annual cleanup job to permanently delete records >7 years old
- Encrypt soft-deleted records containing PII

### Implementation Notes

```typescript
// Add deletedAt to all models
model User {
  id        String    @id @default(uuid())
  email     String    @unique
  deletedAt DateTime? @map("deleted_at")
}

// Prisma middleware to auto-filter soft deletes
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

---

## ADR-010: Vercel for Hosting

**Status**: Accepted
**Date**: 2025-12-04
**Decision Makers**: Alex_Architect

### Context

Fleet Feast needs a hosting platform for the Next.js application. Options include Vercel, AWS (ECS/Lambda), Google Cloud Run, or self-hosted VPS.

### Decision

We will use **Vercel** for hosting the Next.js application.

### Rationale

**Pros of Vercel**:
1. **Next.js Optimization**: Built by Next.js creators, best performance
2. **Zero Config**: Deploy with `git push`, no infrastructure management
3. **Edge Network**: Global CDN, fast page loads worldwide
4. **Automatic Scaling**: Handles traffic spikes without configuration
5. **Preview Deployments**: Every PR gets a unique URL for testing
6. **Cron Jobs**: Built-in support for background tasks
7. **Free Tier**: Generous limits for MVP ($0-20/month expected)

**Cons**:
1. **Vendor Lock-In**: Harder to migrate away from Vercel later
2. **Cost at Scale**: Can get expensive at high traffic (>100K users)
3. **Less Control**: Can't customize underlying infrastructure

**Alternatives Considered**:
- **AWS ECS/Fargate**: More control, but complex setup, higher ops burden
- **AWS Lambda**: Serverless, but cold starts, harder debugging
- **Google Cloud Run**: Similar to Vercel, but worse Next.js integration
- **Self-Hosted VPS**: Full control, but requires DevOps expertise

### Consequences

**Positive**:
- Fastest time to production deployment
- Excellent developer experience
- Automatic SSL, CDN, DDoS protection
- Easy rollback and preview environments

**Negative**:
- Costs may increase at scale (mitigate by monitoring)
- Less control over caching, edge logic

**Mitigation**:
- Monitor Vercel usage and costs monthly
- Plan migration to AWS if costs exceed $500/month
- Use Vercel Analytics to understand usage patterns

### Implementation Notes

```json
// vercel.json
{
  "framework": "nextjs",
  "regions": ["iad1"], // US East (closest to NYC users)
  "env": {
    "DATABASE_URL": "@database-url",
    "REDIS_URL": "@redis-url"
  },
  "crons": [
    {
      "path": "/api/cron/payment-release",
      "schedule": "0 2 * * *" // Daily at 2am
    }
  ]
}
```

---

## Summary of Key Decisions

| ADR | Decision | Impact |
|-----|----------|--------|
| 001 | App Router | Better performance, future-proof |
| 002 | Prisma ORM | Type safety, DX |
| 003 | NextAuth.js | Secure auth, easy OAuth |
| 004 | Monolith | Faster development, lower costs |
| 005 | PostgreSQL FTS | Simple search for MVP |
| 006 | Stripe Connect | Marketplace payments, escrow |
| 007 | Manual Capture | 7-day escrow window |
| 008 | Server Components | Performance, SEO |
| 009 | Soft Deletes | Data recovery, compliance |
| 010 | Vercel | Fast deployment, zero-config |

---

**Document Status**: Complete
**Review Date**: 2025-12-04
**Next Review**: 2026-01-04
