# Fleet Feast Architecture Documentation

**Version**: 1.0
**Last Updated**: 2025-12-04
**Maintainer**: Alex_Architect

---

## Overview

This directory contains the complete architectural documentation for Fleet Feast, a food truck marketplace platform built with Next.js 14+, PostgreSQL, and Stripe Connect.

## Quick Start

**New to the project?** Start here:
1. Read [ARCHITECTURE.md](./ARCHITECTURE.md) for system overview
2. Review [DECISIONS.md](./DECISIONS.md) for key architectural choices
3. Study [DATA_FLOW.md](./DATA_FLOW.md) for understanding request flows

**Working on a feature?**
- Check [ARCHITECTURE.md](./ARCHITECTURE.md) → Directory Structure to find where code should go
- Review [DATA_FLOW.md](./DATA_FLOW.md) for your specific flow (booking, payment, etc.)

**Making an architectural decision?**
- Review existing [ADRs in DECISIONS.md](./DECISIONS.md)
- Document your decision using the ADR template at the end of this README

---

## Document Index

### [ARCHITECTURE.md](./ARCHITECTURE.md)
**Comprehensive system architecture document**

Contains:
- Technology stack with justifications
- System components and responsibilities
- Directory structure (where to put code)
- API layer design (endpoint conventions)
- Database architecture (connections, pooling, patterns)
- Authentication flow (NextAuth.js)
- Payment processing (Stripe Connect escrow)
- Messaging system (anti-circumvention detection)
- Caching strategy (Redis patterns)
- File storage (AWS S3)
- Background jobs (Vercel cron)
- Error handling patterns
- Logging & monitoring (Sentry)
- Security architecture
- Performance optimization
- Deployment strategy

**Use this when**:
- Starting a new feature
- Understanding where code should live
- Learning how the system works
- Onboarding new developers

---

### [DATA_FLOW.md](./DATA_FLOW.md)
**Detailed data flow diagrams and state transitions**

Contains:
- User registration flow (customer)
- Vendor application flow (with approval)
- Booking request flow (request-to-book pattern)
- Payment & escrow flow (7-day hold)
- Messaging flow (with anti-circumvention)
- Review flow (post-booking)
- Dispute flow (automated + manual resolution)
- Search & discovery flow (cached queries)
- State transition diagrams

**Use this when**:
- Implementing a user flow
- Debugging data inconsistencies
- Understanding state transitions
- Planning API endpoints

---

### [DECISIONS.md](./DECISIONS.md)
**Architecture Decision Records (ADRs)**

Contains:
- ADR-001: Next.js App Router over Pages Router
- ADR-002: Prisma ORM for Database Access
- ADR-003: NextAuth.js for Authentication
- ADR-004: Monolithic Architecture over Microservices
- ADR-005: PostgreSQL Full-Text Search over Elasticsearch
- ADR-006: Stripe Connect for Marketplace Payments
- ADR-007: Manual Payment Capture for Escrow
- ADR-008: Server Components as Default
- ADR-009: Soft Deletes over Hard Deletes
- ADR-010: Vercel for Hosting

**Use this when**:
- Wondering "why did we choose X?"
- Making a new architectural decision
- Evaluating alternatives to current approach

---

## Key Architectural Principles

### 1. Server-First
- Server Components by default
- Client Components only when interactivity is required
- Minimize client-side JavaScript

### 2. Type Safety
- Prisma schema as single source of truth
- End-to-end TypeScript from DB to UI
- Zod schemas for API validation

### 3. Database-Centric
- PostgreSQL as primary data store
- Redis for caching only
- All critical data in relational database

### 4. Security-First
- Input validation on all endpoints
- Soft deletes for audit trail
- Anti-circumvention for messaging
- PCI compliance via Stripe

### 5. Performance-Optimized
- Edge delivery via Vercel
- Cached search results (5min)
- Cached vendor profiles (30min)
- Database connection pooling

---

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 14+ App Router | React framework with SSR |
| **UI Components** | Radix UI + Tailwind | Accessible, styled components |
| **Forms** | React Hook Form + Zod | Type-safe validation |
| **State Management** | Zustand + TanStack Query | Client + server state |
| **Backend** | Next.js API Routes | Serverless API endpoints |
| **ORM** | Prisma 5.20+ | Type-safe database access |
| **Database** | PostgreSQL 15+ | Primary data store |
| **Cache** | Redis 7+ | Session + search cache |
| **Auth** | NextAuth.js v5 | JWT authentication |
| **Payments** | Stripe Connect | Marketplace payments |
| **File Storage** | AWS S3 | Documents + images |
| **Email** | AWS SES | Transactional emails |
| **Hosting** | Vercel | Edge deployment |
| **Monitoring** | Sentry | Error tracking |

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
│  (Browser: React Server Components + Client Components)    │
└────────┬────────────────────────────────────────────────────┘
         │
         │ HTTPS
         ▼
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL EDGE NETWORK                      │
│              (CDN, SSL, DDoS Protection)                    │
└────────┬────────────────────────────────────────────────────┘
         │
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                   NEXT.JS APPLICATION                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │        App Router (Server Components)                 │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │        API Routes (REST Endpoints)                    │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │        Business Logic (Services)                      │  │
│  │  - BookingService, PaymentService, MessagingService   │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │        Data Access Layer (Prisma ORM)                 │  │
│  └───────────────────────────────────────────────────────┘  │
└────┬───────────────────────┬──────────────────┬─────────────┘
     │                       │                  │
     │                       │                  │
     ▼                       ▼                  ▼
┌─────────────┐    ┌─────────────────┐    ┌──────────────┐
│ PostgreSQL  │    │      Redis      │    │  AWS S3      │
│   (RDS)     │    │  (ElastiCache)  │    │ (Files)      │
│             │    │                 │    │              │
│ - users     │    │ - sessions      │    │ - documents  │
│ - vendors   │    │ - search cache  │    │ - images     │
│ - bookings  │    │ - vendor cache  │    │              │
│ - payments  │    │                 │    │              │
└─────────────┘    └─────────────────┘    └──────────────┘

     │
     │ (External Services)
     ▼
┌─────────────┬─────────────────┬─────────────────┐
│   Stripe    │    AWS SES      │     Sentry      │
│  (Connect)  │   (Emails)      │   (Errors)      │
└─────────────┴─────────────────┴─────────────────┘
```

---

## Directory Structure Overview

```
fleet-feast/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth pages (login, register)
│   ├── (marketing)/              # Public pages (homepage, about)
│   ├── (dashboard)/              # Protected dashboards
│   ├── vendors/                  # Vendor-related pages
│   ├── bookings/                 # Booking pages
│   └── api/                      # API routes
│       ├── auth/                 # NextAuth
│       ├── bookings/             # Booking CRUD
│       ├── vendors/              # Vendor CRUD
│       ├── payments/             # Payment processing
│       ├── messages/             # Messaging
│       ├── admin/                # Admin endpoints
│       └── webhooks/             # External webhooks
│
├── components/                   # Shared React components
│   ├── ui/                       # Radix UI wrappers
│   ├── forms/                    # Reusable forms
│   └── features/                 # Feature-specific components
│
├── lib/                          # Core utilities
│   ├── db/                       # Database clients (Prisma, Redis)
│   ├── auth/                     # Auth utilities
│   ├── services/                 # Business logic services
│   ├── validators/               # Zod schemas
│   └── utils/                    # Helper functions
│
├── prisma/                       # Database schema & migrations
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── jobs/                         # Background job definitions
│   ├── payment-release.job.ts
│   └── notification.job.ts
│
└── docs/
    └── architecture/             # THIS DIRECTORY
        ├── ARCHITECTURE.md
        ├── DATA_FLOW.md
        ├── DECISIONS.md
        └── README.md (you are here)
```

---

## Common Use Cases

### Adding a New Feature

1. **Understand requirements** → Read PRD in `.claude/context/MASTER_PRD.md`
2. **Check architecture** → Review [ARCHITECTURE.md](./ARCHITECTURE.md) directory structure
3. **Review data flow** → Check [DATA_FLOW.md](./DATA_FLOW.md) for similar flows
4. **Create components**:
   - Add API route: `app/api/{feature}/route.ts`
   - Add service: `lib/services/{feature}.service.ts`
   - Add validator: `lib/validators/{feature}.schema.ts`
   - Add UI: `app/{feature}/page.tsx`
5. **Update database** → Modify `prisma/schema.prisma`, run migration
6. **Test** → Write unit tests, integration tests
7. **Document** → Update API Registry, add JSDoc comments

### Debugging a Flow

1. **Identify flow** → Find in [DATA_FLOW.md](./DATA_FLOW.md)
2. **Check state transitions** → Review current state vs expected state
3. **Trace data**:
   - API request → Check `app/api/{endpoint}/route.ts`
   - Service logic → Check `lib/services/{service}.service.ts`
   - Database query → Check Prisma logs (set `log: ['query']`)
4. **Check external services**:
   - Stripe → Dashboard for payment status
   - Redis → Use Redis CLI to inspect cache
   - S3 → Check file exists in bucket

### Making an Architectural Decision

1. **Review existing ADRs** → Check [DECISIONS.md](./DECISIONS.md)
2. **Research alternatives** → Document pros/cons
3. **Discuss with team** → Get input from other agents/developers
4. **Document decision** → Add new ADR to [DECISIONS.md](./DECISIONS.md)
5. **Update architecture docs** → Modify [ARCHITECTURE.md](./ARCHITECTURE.md) if needed

---

## ADR Template

When adding a new Architecture Decision Record, use this template:

```markdown
## ADR-XXX: [Decision Title]

**Status**: [Proposed | Accepted | Rejected | Superseded]
**Date**: YYYY-MM-DD
**Decision Makers**: [Names]

### Context

[Describe the problem/question that needs a decision. Include relevant constraints, requirements, and background.]

### Decision

[State the decision clearly. "We will use X for Y."]

### Rationale

**Pros of [Decision]**:
1. [Benefit 1]
2. [Benefit 2]
...

**Cons**:
1. [Drawback 1]
2. [Drawback 2]
...

**Alternatives Considered**:
- **[Alternative 1]**: [Why rejected]
- **[Alternative 2]**: [Why rejected]

### Consequences

**Positive**:
- [Good outcome 1]
- [Good outcome 2]

**Negative**:
- [Challenge 1]
- [Challenge 2]

**Mitigation**:
- [How to address negative consequences]

### Implementation Notes

[Code examples, configuration details, or migration path]
```

---

## Updating This Documentation

### When to Update

Update these docs when:
- Making architectural changes (new tech, new pattern)
- Adding major features (new data flow)
- Changing deployment strategy
- Switching external services (Stripe → PayPal)

### How to Update

1. **Edit the relevant file** (ARCHITECTURE.md, DATA_FLOW.md, or DECISIONS.md)
2. **Update "Last Updated" date** at the top of the file
3. **Add ADR if architectural decision** → Add to DECISIONS.md
4. **Run through PR process** → Have another agent review
5. **Announce changes** → Post to message board for visibility

### Review Schedule

- **Quarterly Review**: Every 3 months, review all ADRs for accuracy
- **Post-Launch Review**: After major feature launches
- **Annual Review**: Comprehensive architecture review

---

## Related Documentation

| Document | Location | Purpose |
|----------|----------|---------|
| **PRD** | `.claude/context/MASTER_PRD.md` | Product requirements |
| **Database Schema** | `prisma/schema.prisma` | Database structure |
| **API Registry** | `docs/API_Registry.md` | API endpoint catalog |
| **Schema Registry** | `docs/Schema_Registry.md` | Data models |
| **Deployment Guide** | `docs/DEPLOYMENT.md` | Deployment instructions |

---

## Questions or Feedback?

- **For architectural questions**: Consult Alex_Architect agent
- **For implementation questions**: Check specific agent's skill documentation
- **For PRD questions**: Review `.claude/context/MASTER_PRD.md`

---

**Document Status**: Complete
**Maintained By**: Alex_Architect
**Last Review**: 2025-12-04
**Next Review**: 2025-03-04
