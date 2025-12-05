# Fleet Feast Data Flow Documentation

**Version**: 1.0
**Last Updated**: 2025-12-04
**Author**: Alex_Architect

---

## Table of Contents

1. [User Registration Flow](#user-registration-flow)
2. [Vendor Application Flow](#vendor-application-flow)
3. [Booking Request Flow](#booking-request-flow)
4. [Payment & Escrow Flow](#payment--escrow-flow)
5. [Messaging Flow](#messaging-flow)
6. [Review Flow](#review-flow)
7. [Dispute Flow](#dispute-flow)
8. [Search & Discovery Flow](#search--discovery-flow)

---

## User Registration Flow

### Customer Registration

```
┌──────────┐
│ Customer │
└─────┬────┘
      │ 1. Visits /register
      │ 2. Submits email + password
      ▼
┌─────────────────────────────────────────┐
│           Next.js App Router            │
│  app/(auth)/register/page.tsx           │
└─────┬───────────────────────────────────┘
      │ 3. Client-side validation (Zod)
      │ 4. POST /api/auth/signup
      ▼
┌─────────────────────────────────────────┐
│           API Route Handler             │
│  app/api/auth/signup/route.ts           │
└─────┬───────────────────────────────────┘
      │ 5. Validate schema
      │ 6. Check email not exists
      │ 7. Hash password (bcrypt)
      ▼
┌─────────────────────────────────────────┐
│              Prisma ORM                 │
└─────┬───────────────────────────────────┘
      │ 8. Create User record
      │    - email, passwordHash
      │    - role: CUSTOMER
      │    - status: ACTIVE
      ▼
┌─────────────────────────────────────────┐
│           PostgreSQL (RDS)              │
│  Table: users                           │
└─────┬───────────────────────────────────┘
      │ 9. User created
      ▼
┌─────────────────────────────────────────┐
│      Email Service (AWS SES)            │
└─────┬───────────────────────────────────┘
      │ 10. Send verification email
      ▼
┌──────────┐
│ Customer │ 11. Auto-login via NextAuth.js
└──────────┘
```

**Data Created**:
- `User` record (id, email, passwordHash, role=CUSTOMER, status=ACTIVE)

**External Services**:
- AWS SES (verification email)

---

## Vendor Application Flow

### Vendor Applies

```
┌──────────┐
│  Vendor  │
└─────┬────┘
      │ 1. Registers as customer first
      │ 2. Navigates to /vendors/apply
      │ 3. Fills application form
      │    - Business info
      │    - Cuisine type
      │    - Capacity
      │    - Documents (upload)
      ▼
┌─────────────────────────────────────────┐
│     Client Component (React)            │
│  VendorApplicationForm                  │
└─────┬───────────────────────────────────┘
      │ 4. Uploads documents to S3
      │    (via presigned URLs)
      ▼
┌─────────────────────────────────────────┐
│         AWS S3 (Direct Upload)          │
└─────┬───────────────────────────────────┘
      │ 5. Returns S3 keys
      ▼
┌─────────────────────────────────────────┐
│    POST /api/vendors                    │
└─────┬───────────────────────────────────┘
      │ 6. Validate schema
      │ 7. Update User role to VENDOR
      ▼
┌─────────────────────────────────────────┐
│              Prisma ORM                 │
└─────┬───────────────────────────────────┘
      │ 8. Transaction:
      │    - Update User.role = VENDOR
      │    - Create Vendor record (status=PENDING)
      │    - Create VendorDocument records
      ▼
┌─────────────────────────────────────────┐
│           PostgreSQL (RDS)              │
│  Tables: users, vendors, vendor_documents │
└─────┬───────────────────────────────────┘
      │ 9. Records created
      ▼
┌─────────────────────────────────────────┐
│      Notification Service               │
└─────┬───────────────────────────────────┘
      │ 10. Notify admin of new application
      ▼
┌──────────┐
│  Admin   │ 11. Reviews application
└──────────┘
```

**Data Created**:
- `User` updated (role=VENDOR)
- `Vendor` record (status=PENDING)
- `VendorDocument` records (type, fileUrl, verified=false)

**External Services**:
- AWS S3 (document storage)
- AWS SES (admin notification)

### Admin Approval

```
┌──────────┐
│  Admin   │
└─────┬────┘
      │ 1. Visits /admin/vendors/pending
      │ 2. Reviews documents
      │ 3. Clicks Approve/Reject
      ▼
┌─────────────────────────────────────────┐
│    PATCH /api/admin/vendors/[id]/approve │
└─────┬───────────────────────────────────┘
      │ 4. Verify admin role
      │ 5. Update vendor status
      ▼
┌─────────────────────────────────────────┐
│              Prisma ORM                 │
└─────┬───────────────────────────────────┘
      │ 6. Update Vendor:
      │    - status = APPROVED
      │    - approvedAt = now
      │    - approvedBy = admin.id
      │ 7. Update VendorDocuments:
      │    - verified = true
      ▼
┌─────────────────────────────────────────┐
│           PostgreSQL (RDS)              │
└─────┬───────────────────────────────────┘
      │ 8. Vendor approved
      ▼
┌─────────────────────────────────────────┐
│      Notification Service               │
└─────┬───────────────────────────────────┘
      │ 9. Email vendor (approval)
      ▼
┌──────────┐
│  Vendor  │ 10. Can now accept bookings
└──────────┘
```

**Data Updated**:
- `Vendor` (status=APPROVED, approvedAt, approvedBy)
- `VendorDocument` (verified=true)

---

## Booking Request Flow

### Customer Submits Booking Request

```
┌──────────┐
│ Customer │
└─────┬────┘
      │ 1. Searches vendors
      │ 2. Views vendor profile
      │ 3. Clicks "Request Booking"
      │ 4. Fills booking form
      │    - Event date/time
      │    - Location
      │    - Guest count
      ▼
┌─────────────────────────────────────────┐
│     POST /api/bookings                  │
└─────┬───────────────────────────────────┘
      │ 5. Validate schema
      │ 6. Check vendor availability
      │ 7. Calculate pricing
      ▼
┌─────────────────────────────────────────┐
│              Prisma ORM                 │
└─────┬───────────────────────────────────┘
      │ 8. Query:
      │    - Vendor profile (pricing)
      │    - Availability (date available?)
      │    - Booking history (loyalty check)
      │ 9. Calculate:
      │    - totalAmount
      │    - platformFee (15% or 10% loyalty)
      │    - vendorPayout
      │ 10. Create Booking:
      │     - status = PENDING
      │     - customerId, vendorId
      │     - eventDate, eventTime, location
      │     - guestCount, totalAmount
      ▼
┌─────────────────────────────────────────┐
│           PostgreSQL (RDS)              │
│  Table: bookings                        │
└─────┬───────────────────────────────────┘
      │ 11. Booking created
      ▼
┌─────────────────────────────────────────┐
│      Notification Service               │
└─────┬───────────────────────────────────┘
      │ 12. Email vendor (new request)
      │ 13. In-app notification
      ▼
┌──────────┐
│  Vendor  │ 14. Receives notification
└──────────┘
```

**Data Created**:
- `Booking` record (status=PENDING)

**Business Logic**:
- Loyalty discount: 5% off if customer has completed booking with same vendor
- Platform fee: 15% (normal) or 10% (loyalty)
- Vendor has 48 hours to respond

### Vendor Accepts Booking

```
┌──────────┐
│  Vendor  │
└─────┬────┘
      │ 1. Views booking request
      │ 2. Clicks "Accept"
      ▼
┌─────────────────────────────────────────┐
│    POST /api/bookings/[id]/accept       │
└─────┬───────────────────────────────────┘
      │ 3. Verify vendor owns booking
      │ 4. Check booking still PENDING
      │ 5. Check not past 48h window
      ▼
┌─────────────────────────────────────────┐
│              Prisma ORM                 │
└─────┬───────────────────────────────────┘
      │ 6. Update Booking:
      │    - status = ACCEPTED
      │    - acceptedAt = now
      │    - respondedAt = now
      ▼
┌─────────────────────────────────────────┐
│           PostgreSQL (RDS)              │
└─────┬───────────────────────────────────┘
      │ 7. Booking accepted
      ▼
┌─────────────────────────────────────────┐
│      Notification Service               │
└─────┬───────────────────────────────────┘
      │ 8. Email customer (booking accepted)
      │ 9. Prompt for payment
      ▼
┌──────────┐
│ Customer │ 10. Redirected to payment
└──────────┘
```

**Data Updated**:
- `Booking` (status=ACCEPTED, acceptedAt, respondedAt)

---

## Payment & Escrow Flow

### Customer Completes Payment

```
┌──────────┐
│ Customer │
└─────┬────┘
      │ 1. Clicks "Complete Payment"
      │ 2. Enters credit card
      ▼
┌─────────────────────────────────────────┐
│    Stripe.js (Client-side)              │
└─────┬───────────────────────────────────┘
      │ 3. Tokenize card (PCI-compliant)
      │ 4. Send token to server
      ▼
┌─────────────────────────────────────────┐
│    POST /api/payments/create-intent     │
└─────┬───────────────────────────────────┘
      │ 5. Fetch booking details
      │ 6. Get vendor Stripe account
      ▼
┌─────────────────────────────────────────┐
│         Stripe API (Server-side)        │
└─────┬───────────────────────────────────┘
      │ 7. Create PaymentIntent:
      │    - amount (totalAmount)
      │    - currency: usd
      │    - transfer_data.destination (vendor Stripe account)
      │    - application_fee_amount (platformFee)
      │    - capture_method: manual (for escrow)
      ▼
┌─────────────────────────────────────────┐
│              Stripe (Escrow)            │
└─────┬───────────────────────────────────┘
      │ 8. Authorize payment (funds held)
      │ 9. Return PaymentIntent ID
      ▼
┌─────────────────────────────────────────┐
│              Prisma ORM                 │
└─────┬───────────────────────────────────┘
      │ 10. Transaction:
      │     - Update Booking (status=CONFIRMED)
      │     - Create Payment record:
      │       - stripePaymentIntentId
      │       - amount, status=AUTHORIZED
      │       - authorizedAt
      ▼
┌─────────────────────────────────────────┐
│           PostgreSQL (RDS)              │
│  Tables: bookings, payments             │
└─────┬───────────────────────────────────┘
      │ 11. Payment authorized
      ▼
┌─────────────────────────────────────────┐
│      Notification Service               │
└─────┬───────────────────────────────────┘
      │ 12. Email both parties (booking confirmed)
      ▼
┌──────────┬──────────┐
│ Customer │  Vendor  │ 13. Booking confirmed
└──────────┴──────────┘
```

**Data Created**:
- `Payment` record (status=AUTHORIZED)

**Data Updated**:
- `Booking` (status=CONFIRMED)

**External Services**:
- Stripe Connect (PaymentIntent creation)

### Event Occurs & Payment Release

```
┌──────────┐
│  Event   │ Day 0: Event happens
└─────┬────┘
      │
      ▼
┌─────────────────────────────────────────┐
│    Booking status remains CONFIRMED     │
└─────────────────────────────────────────┘

      │ Day 0 (end of event)
      ▼
┌─────────────────────────────────────────┐
│    Manual trigger or customer marks     │
│    "Event Completed"                    │
└─────┬───────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────┐
│              Prisma ORM                 │
└─────┬───────────────────────────────────┘
      │ Update Booking:
      │  - status = COMPLETED
      ▼
┌─────────────────────────────────────────┐
│           PostgreSQL (RDS)              │
└─────┬───────────────────────────────────┘
      │ Booking marked COMPLETED
      │
      │ 7-day dispute window begins
      │
      ▼

┌──────────────────────────────────────────┐
│     Day 7 (Cron Job: Daily 2am)          │
│  /api/cron/payment-release               │
└─────┬────────────────────────────────────┘
      │ 1. Query payments:
      │    - status = AUTHORIZED
      │    - capturedAt < 7 days ago
      │    - booking.dispute = null
      ▼
┌─────────────────────────────────────────┐
│         Stripe API (Server-side)        │
└─────┬───────────────────────────────────┘
      │ 2. Capture PaymentIntent
      │    (Funds released from escrow)
      ▼
┌─────────────────────────────────────────┐
│              Stripe                     │
└─────┬───────────────────────────────────┘
      │ 3. Transfer to vendor Stripe account
      │    - Total amount minus platform fee
      ▼
┌─────────────────────────────────────────┐
│              Prisma ORM                 │
└─────┬───────────────────────────────────┘
      │ 4. Update Payment:
      │    - status = RELEASED
      │    - releasedAt = now
      │    - stripeTransferId
      ▼
┌─────────────────────────────────────────┐
│           PostgreSQL (RDS)              │
└─────┬───────────────────────────────────┘
      │ 5. Payment released
      ▼
┌─────────────────────────────────────────┐
│      Notification Service               │
└─────┬───────────────────────────────────┘
      │ 6. Email vendor (payment received)
      ▼
┌──────────┐
│  Vendor  │ 7. Funds in Stripe account
└──────────┘
```

**Data Updated**:
- `Booking` (status=COMPLETED)
- `Payment` (status=RELEASED, releasedAt, stripeTransferId)

**Cron Job**:
- Runs daily at 2am
- Releases payments after 7-day dispute window

---

## Messaging Flow

### Customer Sends Message

```
┌──────────┐
│ Customer │
└─────┬────┘
      │ 1. Opens booking chat
      │ 2. Types message
      │ 3. Clicks Send
      ▼
┌─────────────────────────────────────────┐
│    POST /api/messages                   │
└─────┬───────────────────────────────────┘
      │ 4. Validate:
      │    - User is part of booking
      │    - Message not empty
      ▼
┌─────────────────────────────────────────┐
│    Anti-Circumvention Service           │
│  lib/services/messaging.service.ts      │
└─────┬───────────────────────────────────┘
      │ 5. Scan content for:
      │    - Phone numbers (regex)
      │    - Email addresses (regex)
      │    - Social media handles
      │    - "Call me", "Text me" phrases
      ▼
┌─────────────────────────────────────────┐
│              Prisma ORM                 │
└─────┬───────────────────────────────────┘
      │ 6. Create Message:
      │    - bookingId, senderId
      │    - content
      │    - flagged (true if violation)
      │    - flagReason, flagSeverity
      │
      │ 7. If flagged: Create Violation record
      ▼
┌─────────────────────────────────────────┐
│           PostgreSQL (RDS)              │
│  Tables: messages, violations           │
└─────┬───────────────────────────────────┘
      │ 8. Message stored
      ▼
┌─────────────────────────────────────────┐
│      Notification Service               │
└─────┬───────────────────────────────────┘
      │ 9. If flagged:
      │    - Notify admin
      │    - Warn sender
      │ 10. Else:
      │     - Notify recipient
      ▼
┌──────────┐
│  Vendor  │ 11. Receives message
└──────────┘
```

**Data Created**:
- `Message` record (flagged if violation detected)
- `Violation` record (if contact info detected)

**Anti-Circumvention Logic**:
- Pattern matching for phone/email/social
- Severity scoring (LOW, MEDIUM, HIGH)
- Escalation path: Warning → Suspension → Ban

---

## Review Flow

### Customer Leaves Review

```
┌──────────┐
│ Customer │
└─────┬────┘
      │ 1. Booking status = COMPLETED
      │ 2. 7-day window passed
      │ 3. Clicks "Leave Review"
      │ 4. Fills form (rating 1-5, comment)
      ▼
┌─────────────────────────────────────────┐
│    POST /api/reviews                    │
└─────┬───────────────────────────────────┘
      │ 5. Validate:
      │    - Booking exists & completed
      │    - User is customer
      │    - No review exists yet
      │    - Rating 1-5
      ▼
┌─────────────────────────────────────────┐
│              Prisma ORM                 │
└─────┬───────────────────────────────────┘
      │ 6. Create Review:
      │    - bookingId
      │    - reviewerId (customer)
      │    - revieweeId (vendor)
      │    - rating, content
      ▼
┌─────────────────────────────────────────┐
│           PostgreSQL (RDS)              │
│  Table: reviews                         │
└─────┬───────────────────────────────────┘
      │ 7. Review created
      ▼
┌─────────────────────────────────────────┐
│      Cache Invalidation                 │
└─────┬───────────────────────────────────┘
      │ 8. Invalidate Redis cache:
      │    - vendor:{vendorId}
      │    - search:*
      ▼
┌─────────────────────────────────────────┐
│      Notification Service               │
└─────┬───────────────────────────────────┘
      │ 9. Email vendor (new review)
      ▼
┌──────────┐
│  Vendor  │ 10. Can see review on profile
└──────────┘
```

**Data Created**:
- `Review` record (rating, content)

**Cache Invalidation**:
- Vendor profile cache cleared
- Search results cache cleared

---

## Dispute Flow

### Customer Raises Dispute

```
┌──────────┐
│ Customer │
└─────┬────┘
      │ 1. Booking status = COMPLETED
      │ 2. Within 7-day window
      │ 3. Clicks "Raise Dispute"
      │ 4. Selects reason, uploads evidence
      ▼
┌─────────────────────────────────────────┐
│    POST /api/bookings/[id]/dispute      │
└─────┬───────────────────────────────────┘
      │ 5. Validate:
      │    - Booking exists & completed
      │    - Within dispute window
      │    - No existing dispute
      ▼
┌─────────────────────────────────────────┐
│              Prisma ORM                 │
└─────┬───────────────────────────────────┘
      │ 6. Transaction:
      │    - Create Dispute:
      │      - bookingId, initiatorId
      │      - reason, evidence (S3 URLs)
      │      - status = OPEN
      │    - Update Booking:
      │      - status = DISPUTED
      ▼
┌─────────────────────────────────────────┐
│           PostgreSQL (RDS)              │
│  Tables: disputes, bookings             │
└─────┬───────────────────────────────────┘
      │ 7. Dispute created
      ▼
┌─────────────────────────────────────────┐
│    Automated Dispute Resolution         │
│  lib/services/dispute.service.ts        │
└─────┬───────────────────────────────────┘
      │ 8. Check dispute reason:
      │
      │ IF reason = "VENDOR_NO_SHOW":
      │    - Full refund
      │    - $100 credit to customer
      │    - $500 penalty to vendor
      │    - status = RESOLVED_REFUND
      │
      │ ELSE IF reason = "LATE_ARRIVAL_30_60":
      │    - 10% partial refund
      │    - status = RESOLVED_REFUND
      │
      │ ELSE:
      │    - status = INVESTIGATING
      │    - Escalate to admin
      ▼
┌─────────────────────────────────────────┐
│              Prisma ORM                 │
└─────┬───────────────────────────────────┘
      │ 9. Update Dispute (resolution)
      │ 10. Update Payment (refund if needed)
      │ 11. Create Violation (if vendor fault)
      ▼
┌─────────────────────────────────────────┐
│           PostgreSQL (RDS)              │
└─────┬───────────────────────────────────┘
      │ 12. Dispute resolved or escalated
      ▼
┌─────────────────────────────────────────┐
│      Notification Service               │
└─────┬───────────────────────────────────┘
      │ 13. Email both parties (resolution)
      ▼
┌──────────┬──────────┐
│ Customer │  Vendor  │
└──────────┴──────────┘
```

**Data Created**:
- `Dispute` record (reason, evidence, status)
- `Violation` record (if vendor fault)

**Data Updated**:
- `Booking` (status=DISPUTED)
- `Payment` (refundedAt if refunded)

**Automated Rules**:
- Vendor no-show: Full refund + penalties
- Late arrival: Partial refund
- Other issues: Manual admin review

---

## Search & Discovery Flow

### Customer Searches Vendors

```
┌──────────┐
│ Customer │
└─────┬────┘
      │ 1. Enters search criteria:
      │    - Cuisine type
      │    - Date
      │    - Guest count
      │    - Price range
      ▼
┌─────────────────────────────────────────┐
│    GET /api/vendors?filters             │
└─────┬───────────────────────────────────┘
      │ 2. Build cache key from params
      ▼
┌─────────────────────────────────────────┐
│              Redis Cache                │
└─────┬───────────────────────────────────┘
      │ 3. Check cache
      │
      │ IF cache HIT:
      │    - Return cached results
      │
      │ IF cache MISS:
      ▼
┌─────────────────────────────────────────┐
│              Prisma ORM                 │
└─────┬───────────────────────────────────┘
      │ 4. Query vendors:
      │    WHERE status = APPROVED
      │    AND cuisineType = ?
      │    AND priceRange = ?
      │    AND capacityMin <= ?
      │    AND capacityMax >= ?
      │    AND EXISTS (
      │      SELECT 1 FROM availability
      │      WHERE vendorId = vendors.id
      │      AND date = ?
      │      AND isAvailable = true
      │    )
      │
      │ 5. Join menu, user for details
      │ 6. Calculate average rating
      ▼
┌─────────────────────────────────────────┐
│           PostgreSQL (RDS)              │
│  Tables: vendors, availability, reviews │
└─────┬───────────────────────────────────┘
      │ 7. Return results
      ▼
┌─────────────────────────────────────────┐
│              Redis Cache                │
└─────┬───────────────────────────────────┘
      │ 8. Store results (5min TTL)
      ▼
┌─────────────────────────────────────────┐
│           API Response                  │
└─────┬───────────────────────────────────┘
      │ 9. Return JSON:
      │    - vendors[]
      │    - meta { totalCount, page }
      ▼
┌──────────┐
│ Customer │ 10. Views vendor grid
└──────────┘
```

**Cache Strategy**:
- Search results cached for 5 minutes
- Vendor profiles cached for 30 minutes
- Cache invalidated on vendor updates

**Indexing**:
- Composite index on `cuisineType + status + approvedAt`
- Index on `availability.date + isAvailable`
- Full-text search on `businessName + description` (future)

---

## Summary

### Key Data Flows

1. **User Registration**: Simple create flow with email verification
2. **Vendor Application**: Multi-step approval with document verification
3. **Booking Request**: Request-to-book pattern with 48h acceptance window
4. **Payment & Escrow**: 7-day hold with automated release
5. **Messaging**: Real-time with anti-circumvention detection
6. **Reviews**: Post-booking only, tied to verified transactions
7. **Disputes**: Automated + manual resolution with refund logic
8. **Search**: Cached, indexed queries for performance

### External Service Dependencies

| Service | Flow | Purpose |
|---------|------|---------|
| Stripe | Payment | PaymentIntent creation, escrow, transfers |
| AWS S3 | Vendor Application, Disputes | Document/image storage |
| AWS SES | All flows | Transactional emails |
| Redis | Search, Auth | Caching, session storage |
| PostgreSQL | All flows | Primary data store |

### State Transitions

#### Booking States
```
PENDING → ACCEPTED → CONFIRMED → COMPLETED → [Review/Dispute]
  │         │           │
  ↓         ↓           ↓
CANCELLED CANCELLED  DISPUTED
```

#### Payment States
```
PENDING → AUTHORIZED → CAPTURED → RELEASED
            │            │
            ↓            ↓
         FAILED      REFUNDED
```

#### Dispute States
```
OPEN → INVESTIGATING → RESOLVED_REFUND
                    → RESOLVED_RELEASE
                    → ESCALATED → (admin) → CLOSED
```

---

**Document Status**: Complete
**Review Date**: 2025-12-04
**Next Review**: 2026-01-04
