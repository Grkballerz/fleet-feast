# Fleet Feast - Database Schema Design Document

**Version**: 1.0
**Date**: 2025-12-03
**Author**: Dana_Database
**Database**: PostgreSQL 15+
**ORM**: Prisma 5.x

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Database Technology Stack](#database-technology-stack)
3. [Schema Overview](#schema-overview)
4. [Entity Definitions](#entity-definitions)
5. [Relationship Design](#relationship-design)
6. [Indexing Strategy](#indexing-strategy)
7. [Data Integrity & Constraints](#data-integrity--constraints)
8. [Data Retention & Soft Deletes](#data-retention--soft-deletes)
9. [Performance Optimization](#performance-optimization)
10. [Escrow Payment Flow](#escrow-payment-flow)
11. [Anti-Circumvention Strategy](#anti-circumvention-strategy)
12. [Migration Strategy](#migration-strategy)
13. [Security Considerations](#security-considerations)
14. [Scalability Considerations](#scalability-considerations)

---

## Executive Summary

This document defines the complete database schema for Fleet Feast, a food truck marketplace platform. The schema is designed to support:

- **11 core entities** covering users, vendors, bookings, payments, messaging, reviews, and moderation
- **ACID-compliant transactions** for financial operations (booking + payment)
- **Escrow payment system** with 7-day hold and automated release
- **Anti-circumvention detection** with message flagging and violation tracking
- **Soft delete strategy** for data retention compliance
- **Comprehensive indexing** for high-traffic queries (vendor search, booking lookups, payment releases)

### Key Design Decisions

1. **Relational Database Choice**: PostgreSQL chosen for ACID compliance (critical for financial transactions)
2. **Polymorphic User Model**: Single `users` table with `role` enum (CUSTOMER, VENDOR, ADMIN)
3. **1:1 Vendor Extension**: Vendor profile extends User via 1:1 relationship
4. **1:1 Booking-Payment**: Every booking has exactly one payment record
5. **Context-Bound Messages**: All messages belong to a booking (no direct user-to-user messaging)
6. **Flexible Menu Structure**: JSON field for vendor menu items (semi-structured data)
7. **Soft Deletes**: Users, vendors, messages, reviews use `deletedAt` timestamp
8. **Immutable Financial Records**: Bookings and payments never deleted (7-year retention)

---

## Database Technology Stack

### Core Technologies

| Component | Technology | Rationale |
|-----------|------------|-----------|
| **Database** | PostgreSQL 15+ | ACID compliance, JSON support, full-text search, robust for financial transactions |
| **ORM** | Prisma 5.x | Type-safe queries, schema migration, excellent TypeScript support |
| **Hosting** | Neon (serverless) / Railway | Serverless scaling, connection pooling, automatic backups |
| **Connection Pooling** | Prisma Data Proxy / PgBouncer | Serverless function connection limits |
| **Cache** | Redis 7.x (Upstash) | Session storage, search result caching, rate limiting |

### PostgreSQL Features Utilized

- **Enums**: Type-safe status fields (UserRole, BookingStatus, PaymentStatus, etc.)
- **JSON/JSONB**: Flexible menu structure, dispute evidence
- **Full-Text Search**: Vendor search by cuisine, business name (v1)
- **Partial Indexes**: Optimize specific queries (e.g., flagged messages)
- **Transactions**: ACID guarantees for booking + payment creation
- **Cascade Deletes**: Automatic cleanup of related records

---

## Schema Overview

### Entity Count: 11 Tables

| Category | Tables |
|----------|--------|
| **Core** | User, Vendor, Booking, Payment |
| **Vendor Extensions** | VendorDocument, VendorMenu, Availability |
| **Communication** | Message |
| **Feedback** | Review |
| **Moderation** | Violation, Dispute |

### Total Enums: 11

1. `UserRole` (3 values)
2. `UserStatus` (4 values)
3. `VendorStatus` (5 values)
4. `DocumentType` (6 values)
5. `BookingStatus` (8 values)
6. `PaymentStatus` (6 values)
7. `MessageSeverity` (4 values)
8. `ViolationType` (6 values)
9. `DisputeStatus` (6 values)
10. `CuisineType` (11 values)
11. `PriceRange` (4 values)
12. `EventType` (6 values)

### Relationship Summary

- **1:1 Relationships**: User → Vendor, Booking → Payment, Booking → Review, Booking → Dispute
- **1:N Relationships**: Vendor → Documents, Vendor → Availability, Booking → Messages, User → Bookings, User → Violations
- **M:N Relationships**: None (all many-to-many resolved through join entities)

---

## Entity Definitions

### 1. User

**Table**: `users`
**Purpose**: Core authentication and authorization entity. Polymorphic design supports customers, vendors, and admins.

#### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `email` | String | UNIQUE, NOT NULL | User email (login) |
| `passwordHash` | String | NOT NULL | bcrypt hashed password |
| `role` | UserRole | NOT NULL, DEFAULT: CUSTOMER | CUSTOMER, VENDOR, ADMIN |
| `status` | UserStatus | NOT NULL, DEFAULT: ACTIVE | ACTIVE, SUSPENDED, BANNED, DELETED |
| `createdAt` | DateTime | NOT NULL, DEFAULT: now() | Account creation timestamp |
| `updatedAt` | DateTime | NOT NULL, AUTO | Last update timestamp |
| `deletedAt` | DateTime? | NULL | Soft delete timestamp |

#### Relationships

- **1:1** with Vendor (optional, only if role = VENDOR)
- **1:N** with Booking (as customer via `customerId`)
- **1:N** with Booking (as vendor via `vendorId`)
- **1:N** with Message (as sender via `senderId`)
- **1:N** with Review (as reviewer via `reviewerId`)
- **1:N** with Review (as reviewee via `revieweeId`)
- **1:N** with Violation (via `userId`)
- **1:N** with Dispute (as initiator via `initiatorId`)

#### Indexes

```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_status ON users(role, status);
CREATE INDEX idx_users_deleted ON users(deletedAt);
```

#### Business Rules

- **Email uniqueness**: Enforced at database level
- **Password security**: Hashed with bcrypt (cost factor 12) before storage
- **Soft delete**: `deletedAt` set when user requests deletion, actual purge after 30 days
- **Role immutability**: Once set to VENDOR, cannot revert to CUSTOMER (application logic)

---

### 2. Vendor

**Table**: `vendors`
**Purpose**: Extends User entity with food truck business details. 1:1 relationship with User.

#### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `userId` | UUID | FOREIGN KEY → users.id, UNIQUE | User account reference |
| `businessName` | String | NOT NULL | Legal business name |
| `cuisineType` | CuisineType | NOT NULL | MEXICAN, ITALIAN, BBQ, etc. |
| `description` | Text? | NULL | Business description (markdown) |
| `priceRange` | PriceRange | NOT NULL | BUDGET, MODERATE, PREMIUM, LUXURY |
| `capacityMin` | Int | NOT NULL | Minimum guest count |
| `capacityMax` | Int | NOT NULL | Maximum guest count |
| `serviceArea` | String? | NULL | e.g., "Manhattan, Brooklyn" |
| `location` | String? | NULL | Stored as "lat,lng" |
| `stripeAccountId` | String? | UNIQUE | Stripe Connect account ID |
| `stripeConnected` | Boolean | DEFAULT: false | Stripe onboarding completed |
| `status` | VendorStatus | DEFAULT: PENDING | PENDING, APPROVED, REJECTED, etc. |
| `approvedAt` | DateTime? | NULL | Admin approval timestamp |
| `approvedBy` | String? | NULL | Admin user ID |
| `rejectionReason` | Text? | NULL | Reason if rejected |
| `createdAt` | DateTime | NOT NULL, DEFAULT: now() | Application submission |
| `updatedAt` | DateTime | NOT NULL, AUTO | Last update |
| `deletedAt` | DateTime? | NULL | Soft delete timestamp |

#### Relationships

- **1:1** with User (via `userId`, CASCADE delete)
- **1:N** with VendorDocument (via `vendorId`, CASCADE delete)
- **1:1** with VendorMenu (via `vendorId`, CASCADE delete)
- **1:N** with Availability (via `vendorId`, CASCADE delete)
- **1:N** with Booking (via `vendorId`, RESTRICT delete)

#### Indexes

```sql
CREATE INDEX idx_vendor_user ON vendors(userId);
CREATE INDEX idx_vendor_search ON vendors(cuisineType, status, approvedAt);
CREATE INDEX idx_vendor_status ON vendors(status);
CREATE INDEX idx_vendor_stripe ON vendors(stripeAccountId);
```

#### Business Rules

- **Approval workflow**: status = PENDING → admin reviews → APPROVED or REJECTED
- **Stripe requirement**: `stripeConnected` must be true before accepting bookings
- **Capacity validation**: `capacityMin` < `capacityMax` (enforced in application)
- **Location format**: "latitude,longitude" (e.g., "40.7589,-73.9851")
- **Soft delete**: Cascade to documents, menu, availability; booking history preserved

---

### 3. VendorDocument

**Table**: `vendor_documents`
**Purpose**: Store vendor verification documents (business license, permits, insurance, etc.)

#### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `vendorId` | UUID | FOREIGN KEY → vendors.id | Parent vendor |
| `type` | DocumentType | NOT NULL | BUSINESS_LICENSE, HEALTH_PERMIT, etc. |
| `fileName` | String | NOT NULL | Original filename |
| `fileUrl` | String | NOT NULL | S3 key or URL |
| `fileSize` | Int? | NULL | File size in bytes |
| `verified` | Boolean | DEFAULT: false | Admin verified |
| `verifiedAt` | DateTime? | NULL | Verification timestamp |
| `verifiedBy` | String? | NULL | Admin user ID |
| `rejectionReason` | Text? | NULL | Reason if rejected |
| `createdAt` | DateTime | NOT NULL | Upload timestamp |
| `updatedAt` | DateTime | NOT NULL, AUTO | Last update |
| `deletedAt` | DateTime? | NULL | Soft delete |

#### Relationships

- **N:1** with Vendor (via `vendorId`, CASCADE delete)

#### Indexes

```sql
CREATE INDEX idx_vendor_doc_vendor ON vendor_documents(vendorId, type);
CREATE INDEX idx_vendor_doc_verified ON vendor_documents(verified);
```

#### Business Rules

- **Multiple documents per type**: Vendor can upload updated versions (keep history)
- **Verification required**: At least BUSINESS_LICENSE and HEALTH_PERMIT must be verified before approval
- **File storage**: S3 with presigned URLs (1-hour expiry for access)
- **Retention**: Kept for 1 year after vendor deactivation (compliance)

---

### 4. VendorMenu

**Table**: `vendor_menus`
**Purpose**: Store vendor menu items in flexible JSON structure

#### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `vendorId` | UUID | FOREIGN KEY → vendors.id, UNIQUE | Parent vendor (1:1) |
| `items` | JSON | NOT NULL | Array of menu items |
| `pricingModel` | String | NOT NULL | "per_person", "flat_rate", "custom" |
| `createdAt` | DateTime | NOT NULL | Menu creation |
| `updatedAt` | DateTime | NOT NULL, AUTO | Last update |

#### Relationships

- **1:1** with Vendor (via `vendorId`, CASCADE delete)

#### Indexes

```sql
CREATE INDEX idx_vendor_menu_vendor ON vendor_menus(vendorId);
```

#### JSON Structure Example

```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Tacos al Pastor",
      "description": "Marinated pork with pineapple, onion, cilantro",
      "price": 12.99,
      "category": "main",
      "dietary_tags": ["gluten-free-option", "dairy-free"],
      "image_url": "https://..."
    },
    {
      "id": "uuid",
      "name": "Churros",
      "description": "Fried dough pastry with cinnamon sugar",
      "price": 5.99,
      "category": "dessert",
      "dietary_tags": ["vegetarian"],
      "image_url": "https://..."
    }
  ]
}
```

#### Business Rules

- **Flexible structure**: JSON allows vendors to define custom menu items without schema changes
- **Pricing model**: Determines how booking `totalAmount` is calculated
  - `per_person`: price × guestCount
  - `flat_rate`: fixed price regardless of guest count
  - `custom`: vendor quotes based on request
- **Validation**: Application validates JSON structure before save

---

### 5. Availability

**Table**: `availability`
**Purpose**: Track vendor calendar availability (date-based)

#### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `vendorId` | UUID | FOREIGN KEY → vendors.id | Parent vendor |
| `date` | Date | NOT NULL | Availability date |
| `isAvailable` | Boolean | DEFAULT: true | Available or blocked |
| `notes` | Text? | NULL | Optional notes (e.g., "Only after 6pm") |
| `createdAt` | DateTime | NOT NULL | Record creation |
| `updatedAt` | DateTime | NOT NULL, AUTO | Last update |

#### Relationships

- **N:1** with Vendor (via `vendorId`, CASCADE delete)

#### Indexes

```sql
CREATE UNIQUE INDEX idx_availability_unique ON availability(vendorId, date);
CREATE INDEX idx_availability_date ON availability(date, isAvailable);
```

#### Business Rules

- **Unique constraint**: One availability record per vendor per date
- **Default behavior**: If no record exists for a date, vendor is available (opt-out model)
- **Booking check**: Before creating booking, verify `isAvailable = true` for `eventDate`
- **Auto-block**: When booking confirmed, can optionally set `isAvailable = false` for that date

---

### 6. Booking

**Table**: `bookings`
**Purpose**: Central entity for all booking requests, lifecycle tracking, and financial calculations

#### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `customerId` | UUID | FOREIGN KEY → users.id, RESTRICT | Customer making request |
| `vendorId` | UUID | FOREIGN KEY → users.id, RESTRICT | Vendor receiving request |
| `eventDate` | Date | NOT NULL | Event date |
| `eventTime` | String | NOT NULL | Event time (HH:MM format) |
| `eventType` | EventType | NOT NULL | CORPORATE, WEDDING, etc. |
| `location` | Text | NOT NULL | Full event address |
| `guestCount` | Int | NOT NULL | Number of guests |
| `specialRequests` | Text? | NULL | Customer notes/requests |
| `totalAmount` | Decimal(10,2) | NOT NULL | Total booking cost |
| `platformFee` | Decimal(10,2) | NOT NULL | 15% or 10% (loyalty) |
| `vendorPayout` | Decimal(10,2) | NOT NULL | totalAmount - platformFee |
| `status` | BookingStatus | DEFAULT: PENDING | Booking lifecycle status |
| `cancelledAt` | DateTime? | NULL | Cancellation timestamp |
| `cancelledBy` | String? | NULL | User ID who cancelled |
| `cancellationReason` | Text? | NULL | Reason for cancellation |
| `refundAmount` | Decimal(10,2)? | NULL | Refund amount (if cancelled) |
| `acceptedAt` | DateTime? | NULL | Vendor acceptance timestamp |
| `respondedAt` | DateTime? | NULL | Vendor response timestamp |
| `createdAt` | DateTime | NOT NULL | Request creation |
| `updatedAt` | DateTime | NOT NULL, AUTO | Last update |

#### Relationships

- **N:1** with User (as customer via `customerId`, RESTRICT delete)
- **N:1** with User (as vendor via `vendorId`, RESTRICT delete)
- **N:1** with Vendor (via `vendorId` → `vendors.userId`, RESTRICT delete)
- **1:1** with Payment (via `bookingId`, RESTRICT delete)
- **1:N** with Message (via `bookingId`, CASCADE delete)
- **1:1** with Review (via `bookingId`, CASCADE delete)
- **1:1** with Dispute (via `bookingId`, RESTRICT delete)

#### Indexes

```sql
CREATE INDEX idx_booking_customer ON bookings(customerId, createdAt DESC);
CREATE INDEX idx_booking_vendor ON bookings(vendorId, eventDate DESC);
CREATE INDEX idx_booking_status ON bookings(status);
CREATE INDEX idx_booking_event_date ON bookings(eventDate);
```

#### Status Flow

```
PENDING → ACCEPTED → CONFIRMED → COMPLETED
   ↓         ↓           ↓
CANCELLED  CANCELLED  CANCELLED
                    ↓
                DISPUTED → REFUNDED
```

#### Business Rules

1. **Financial Calculations** (set at creation, immutable):
   - `platformFee = totalAmount × 0.15` (default)
   - `platformFee = totalAmount × 0.10` (repeat customer discount)
   - `vendorPayout = totalAmount - platformFee`

2. **Vendor Response Window**: 48 hours from `createdAt`
   - If vendor doesn't respond, booking auto-declines (cron job)

3. **Cancellation Policy** (encoded in `refundAmount`):
   - 7+ days before event: `refundAmount = totalAmount` (100%)
   - 3-6 days before event: `refundAmount = totalAmount × 0.5` (50%)
   - < 3 days before event: `refundAmount = 0` (no refund)

4. **Status Transitions** (enforced in application):
   - PENDING → ACCEPTED (vendor accepts)
   - ACCEPTED → CONFIRMED (payment authorized)
   - CONFIRMED → COMPLETED (event date passed, no issues)
   - COMPLETED → DISPUTED (customer/vendor raises dispute within 7 days)
   - Any status → CANCELLED (with refund calculation)

5. **Immutability**: Booking records never deleted (7-year retention for tax compliance)

---

### 7. Payment

**Table**: `payments`
**Purpose**: Track Stripe payment lifecycle, escrow, and vendor payouts. 1:1 with Booking.

#### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `bookingId` | UUID | FOREIGN KEY → bookings.id, UNIQUE | Parent booking (1:1) |
| `stripePaymentIntentId` | String? | UNIQUE | Stripe PaymentIntent ID |
| `stripeTransferId` | String? | UNIQUE | Stripe Transfer ID (payout) |
| `amount` | Decimal(10,2) | NOT NULL | Total payment amount |
| `status` | PaymentStatus | DEFAULT: PENDING | Payment lifecycle status |
| `authorizedAt` | DateTime? | NULL | Funds authorized (held) |
| `capturedAt` | DateTime? | NULL | Funds captured (event occurred) |
| `releasedAt` | DateTime? | NULL | Funds released to vendor |
| `refundedAt` | DateTime? | NULL | Funds refunded to customer |
| `createdAt` | DateTime | NOT NULL | Payment record creation |
| `updatedAt` | DateTime | NOT NULL, AUTO | Last update |

#### Relationships

- **1:1** with Booking (via `bookingId`, RESTRICT delete)

#### Indexes

```sql
CREATE INDEX idx_payment_booking ON payments(bookingId);
CREATE INDEX idx_payment_status_captured ON payments(status, capturedAt);
CREATE INDEX idx_payment_stripe_intent ON payments(stripePaymentIntentId);
```

#### Status Flow

```
PENDING → AUTHORIZED → CAPTURED → RELEASED
   ↓          ↓            ↓
FAILED    REFUNDED     REFUNDED
```

#### Business Rules

1. **Stripe Connect Integration**:
   - `stripePaymentIntentId`: Created when booking status → CONFIRMED
   - Payment destination: Vendor's Stripe Connect account
   - Application fee: `booking.platformFee` (deducted automatically)

2. **Escrow Flow**:
   - **AUTHORIZED**: Vendor accepts booking → create PaymentIntent → funds held
   - **CAPTURED**: Event date passes → capture payment (funds still on platform)
   - **RELEASED**: 7 days after `capturedAt` → transfer to vendor (if no dispute)

3. **Daily Cron Job** (escrow release):
   ```sql
   SELECT * FROM payments
   WHERE status = 'CAPTURED'
     AND capturedAt < NOW() - INTERVAL '7 days'
     AND bookingId NOT IN (
       SELECT bookingId FROM disputes WHERE status IN ('OPEN', 'INVESTIGATING')
     )
   ```

4. **Refund Logic**:
   - If booking cancelled before event: refund via Stripe API
   - If dispute resolved in customer favor: refund from escrowed funds

5. **ACID Compliance**: Booking + Payment creation happens in transaction (atomic)

6. **Immutability**: Payment records never deleted (7-year retention for tax compliance)

---

### 8. Message

**Table**: `messages`
**Purpose**: In-app messaging between customers and vendors. Context-bound to bookings. Includes anti-circumvention detection.

#### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `bookingId` | UUID | FOREIGN KEY → bookings.id | Parent booking (context) |
| `senderId` | UUID | FOREIGN KEY → users.id | User who sent message |
| `content` | Text | NOT NULL | Message content |
| `flagged` | Boolean | DEFAULT: false | Suspicious content detected |
| `flagReason` | String? | NULL | Reason for flagging |
| `flagSeverity` | MessageSeverity | DEFAULT: NONE | NONE, LOW, MEDIUM, HIGH |
| `reviewedAt` | DateTime? | NULL | Admin review timestamp |
| `reviewedBy` | String? | NULL | Admin user ID |
| `createdAt` | DateTime | NOT NULL | Message sent timestamp |
| `updatedAt` | DateTime | NOT NULL, AUTO | Last update |
| `deletedAt` | DateTime? | NULL | Soft delete |

#### Relationships

- **N:1** with Booking (via `bookingId`, CASCADE delete)
- **N:1** with User (as sender via `senderId`, RESTRICT delete)

#### Indexes

```sql
CREATE INDEX idx_message_booking ON messages(bookingId, createdAt ASC);
CREATE INDEX idx_message_sender ON messages(senderId, createdAt DESC);
CREATE INDEX idx_message_flagged ON messages(flagged, reviewedAt);
```

#### Anti-Circumvention Rules

**Real-Time Pattern Detection** (runs on POST /api/messages):

```typescript
const BLOCKED_PATTERNS = [
  {
    regex: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,
    severity: 'HIGH',
    reason: 'Phone number detected'
  },
  {
    regex: /\b[\w._%+-]+@[\w.-]+\.[A-Z]{2,}\b/i,
    severity: 'HIGH',
    reason: 'Email address detected'
  },
  {
    regex: /\b(call|text|email|whatsapp)\s+(me|us|him|her)\b/i,
    severity: 'MEDIUM',
    reason: 'Contact request detected'
  },
  {
    regex: /\b(my|our|his|her)\s+(phone|cell|number|email)\b/i,
    severity: 'MEDIUM',
    reason: 'Contact info reference'
  },
  {
    regex: /\b(instagram|facebook|twitter|snapchat|tiktok)\b/i,
    severity: 'LOW',
    reason: 'Social media mention'
  }
];
```

**Actions on Pattern Match**:
1. Set `flagged = true`, `flagReason`, `flagSeverity`
2. Create `Violation` record for sender
3. Notify admin (if severity = HIGH)
4. Display warning to sender (message sent, but flagged)

**Behavioral Pattern Detection** (daily cron):
- High message volume (>20 messages) between customer-vendor with no bookings
- Flag for manual admin review

#### Business Rules

- **Context-bound**: All messages must belong to a booking (no direct user-to-user messaging)
- **Access control**: Only customer and vendor on booking can send/view messages
- **Retention**: 3-year retention, soft delete after that
- **Real-time filtering**: Anti-circumvention runs synchronously on every message POST

---

### 9. Review

**Table**: `reviews`
**Purpose**: Customer and vendor reviews after booking completion. Bidirectional (both parties review each other).

#### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `bookingId` | UUID | FOREIGN KEY → bookings.id, UNIQUE | Parent booking (1:1) |
| `reviewerId` | UUID | FOREIGN KEY → users.id | User writing review |
| `revieweeId` | UUID | FOREIGN KEY → users.id | User being reviewed |
| `rating` | Int | NOT NULL, CHECK: 1-5 | Star rating (1-5) |
| `content` | Text? | NULL | Review text (optional) |
| `flagged` | Boolean | DEFAULT: false | Inappropriate content |
| `hidden` | Boolean | DEFAULT: false | Hidden by admin |
| `createdAt` | DateTime | NOT NULL | Review creation |
| `updatedAt` | DateTime | NOT NULL, AUTO | Last update |
| `deletedAt` | DateTime? | NULL | Soft delete |

#### Relationships

- **1:1** with Booking (via `bookingId`, CASCADE delete)
- **N:1** with User (as reviewer via `reviewerId`, RESTRICT delete)
- **N:1** with User (as reviewee via `revieweeId`, RESTRICT delete)

#### Indexes

```sql
CREATE INDEX idx_review_booking ON reviews(bookingId);
CREATE INDEX idx_review_reviewee ON reviews(revieweeId, createdAt DESC);
CREATE INDEX idx_review_rating ON reviews(rating);
```

#### Business Rules

1. **Eligibility**: Only after booking status = COMPLETED
2. **Uniqueness**: One review per booking (UNIQUE constraint on `bookingId`)
3. **Bidirectional**:
   - Customer reviews vendor: `reviewerId = customerId`, `revieweeId = vendorId`
   - Vendor reviews customer: `reviewerId = vendorId`, `revieweeId = customerId`
4. **Rating calculation**: Vendor average rating calculated from all reviews where `revieweeId = vendorId`
5. **Moderation**: Admins can set `hidden = true` to remove from public view
6. **Retention**: Indefinite (while user accounts active), soft deleted when user deleted

---

### 10. Violation

**Table**: `violations`
**Purpose**: Track user violations (anti-circumvention, harassment, fraud) for penalty system.

#### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `userId` | UUID | FOREIGN KEY → users.id | User who violated |
| `type` | ViolationType | NOT NULL | CONTACT_INFO_SHARING, etc. |
| `description` | Text | NOT NULL | Violation details |
| `severity` | MessageSeverity | NOT NULL | NONE, LOW, MEDIUM, HIGH |
| `relatedMessageId` | String? | NULL | Message ID (if from flagged message) |
| `relatedBookingId` | String? | NULL | Booking ID (context) |
| `actionTaken` | String? | NULL | "warning", "suspension", "ban" |
| `actionDuration` | Int? | NULL | Days (for suspension) |
| `resolvedAt` | DateTime? | NULL | Resolution timestamp |
| `resolvedBy` | String? | NULL | Admin user ID |
| `notes` | Text? | NULL | Admin notes |
| `createdAt` | DateTime | NOT NULL | Violation timestamp |
| `updatedAt` | DateTime | NOT NULL, AUTO | Last update |

#### Relationships

- **N:1** with User (via `userId`, CASCADE delete)

#### Indexes

```sql
CREATE INDEX idx_violation_user ON violations(userId, createdAt DESC);
CREATE INDEX idx_violation_type ON violations(type, resolvedAt);
```

#### Penalty System

**Severity Scores**:
- LOW: 1 point
- MEDIUM: 3 points
- HIGH: 5 points

**Penalty Thresholds** (90-day rolling window):
1. **Score ≥ 5**: Warning email sent, flagged for review
2. **Score ≥ 10**: 30-day account suspension
3. **3rd suspension**: Permanent ban

**Calculation Query**:
```sql
SELECT SUM(
  CASE severity
    WHEN 'LOW' THEN 1
    WHEN 'MEDIUM' THEN 3
    WHEN 'HIGH' THEN 5
    ELSE 0
  END
) as total_score
FROM violations
WHERE userId = $1
  AND createdAt > NOW() - INTERVAL '90 days'
  AND resolvedAt IS NULL;
```

#### Business Rules

- **Automated creation**: Violations auto-created when messages flagged with severity > NONE
- **Manual creation**: Admins can manually create violations for other behaviors
- **Immutability**: Violations never deleted (5-year retention for audit trail)
- **Appeal process**: Admins can set `resolvedAt` to mark as resolved (e.g., after appeal)

---

### 11. Dispute

**Table**: `disputes`
**Purpose**: Handle post-event disputes between customers and vendors. Affects escrow release.

#### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `bookingId` | UUID | FOREIGN KEY → bookings.id, UNIQUE | Parent booking (1:1) |
| `initiatorId` | UUID | FOREIGN KEY → users.id | User who raised dispute |
| `reason` | Text | NOT NULL | Dispute reason/description |
| `evidence` | JSON? | NULL | Array of evidence file URLs |
| `status` | DisputeStatus | DEFAULT: OPEN | Dispute lifecycle status |
| `resolution` | Text? | NULL | Admin resolution notes |
| `resolvedAt` | DateTime? | NULL | Resolution timestamp |
| `resolvedBy` | String? | NULL | Admin user ID |
| `createdAt` | DateTime | NOT NULL | Dispute raised timestamp |
| `updatedAt` | DateTime | NOT NULL, AUTO | Last update |

#### Relationships

- **1:1** with Booking (via `bookingId`, RESTRICT delete)
- **N:1** with User (as initiator via `initiatorId`, RESTRICT delete)

#### Indexes

```sql
CREATE INDEX idx_dispute_booking ON disputes(bookingId);
CREATE INDEX idx_dispute_status ON disputes(status, createdAt ASC);
CREATE INDEX idx_dispute_initiator ON disputes(initiatorId);
```

#### Status Flow

```
OPEN → INVESTIGATING → RESOLVED_REFUND
                    → RESOLVED_RELEASE
                    → ESCALATED → RESOLVED_*
```

#### Business Rules

1. **7-Day Window**: Disputes must be raised within 7 days after event date
   - Enforced in application: `if (eventDate + 7 days < today) { reject }`

2. **Escrow Impact**: While dispute is OPEN or INVESTIGATING, payment remains CAPTURED (not released to vendor)

3. **Resolution Outcomes**:
   - **RESOLVED_REFUND**: Refund customer, payment status → REFUNDED
   - **RESOLVED_RELEASE**: Release to vendor, payment status → RELEASED
   - **ESCALATED**: Complex dispute, requires senior admin review

4. **Evidence Upload**: `evidence` JSON field stores array of S3 URLs
   ```json
   {
     "evidence": [
       "https://s3.amazonaws.com/fleet-feast/disputes/uuid/photo1.jpg",
       "https://s3.amazonaws.com/fleet-feast/disputes/uuid/photo2.jpg"
     ]
   }
   ```

5. **Immutability**: Dispute records never deleted (5-year retention for legal compliance)

---

## Relationship Design

### 1:1 Relationships

#### User → Vendor
- **Type**: Optional 1:1 (only for users with role = VENDOR)
- **Foreign Key**: `vendors.userId` → `users.id`
- **Delete Rule**: CASCADE (if user deleted, vendor profile deleted)
- **Rationale**: Vendor profile is an extension of user account

#### Booking → Payment
- **Type**: Required 1:1 (every booking has exactly one payment)
- **Foreign Key**: `payments.bookingId` → `bookings.id`
- **Delete Rule**: RESTRICT (payment must be preserved for audit)
- **Unique Constraint**: `payments.bookingId`
- **Rationale**: Financial record must be atomic with booking

#### Booking → Review
- **Type**: Optional 1:1 (not all bookings get reviewed)
- **Foreign Key**: `reviews.bookingId` → `bookings.id`
- **Delete Rule**: CASCADE (reviews belong to booking context)
- **Unique Constraint**: `reviews.bookingId`
- **Rationale**: One review per booking (can have separate customer→vendor and vendor→customer reviews via different `reviewerId/revieweeId` combinations)

#### Booking → Dispute
- **Type**: Optional 1:1 (not all bookings get disputed)
- **Foreign Key**: `disputes.bookingId` → `bookings.id`
- **Delete Rule**: RESTRICT (disputes must be preserved for legal)
- **Unique Constraint**: `disputes.bookingId`
- **Rationale**: One dispute per booking

### 1:N Relationships

#### Vendor → VendorDocument
- **Foreign Key**: `vendor_documents.vendorId` → `vendors.id`
- **Delete Rule**: CASCADE (documents belong to vendor)
- **Cardinality**: 0 to many (vendors upload multiple documents)

#### Vendor → Availability
- **Foreign Key**: `availability.vendorId` → `vendors.id`
- **Delete Rule**: CASCADE (availability belongs to vendor)
- **Cardinality**: 0 to many (one per date)
- **Unique Constraint**: `(vendorId, date)`

#### User → Booking (as customer)
- **Foreign Key**: `bookings.customerId` → `users.id`
- **Delete Rule**: RESTRICT (preserve booking history)
- **Cardinality**: 0 to many (customers can make multiple bookings)

#### User → Booking (as vendor)
- **Foreign Key**: `bookings.vendorId` → `users.id`
- **Delete Rule**: RESTRICT (preserve booking history)
- **Cardinality**: 0 to many (vendors can receive multiple bookings)

#### Booking → Message
- **Foreign Key**: `messages.bookingId` → `bookings.id`
- **Delete Rule**: CASCADE (messages belong to booking context)
- **Cardinality**: 0 to many (multiple messages per booking)

#### User → Violation
- **Foreign Key**: `violations.userId` → `users.id`
- **Delete Rule**: CASCADE (violations belong to user)
- **Cardinality**: 0 to many (users can have multiple violations)

---

## Indexing Strategy

### Index Types

1. **Primary Key Indexes**: Automatic B-tree indexes on all `id` fields
2. **Unique Indexes**: Automatic on UNIQUE constraints (email, stripeAccountId, etc.)
3. **Foreign Key Indexes**: Manual indexes on all foreign key columns
4. **Composite Indexes**: Multi-column indexes for common query patterns
5. **Partial Indexes**: Conditional indexes for specific queries (e.g., WHERE status = 'CAPTURED')

### Critical Indexes

#### Vendor Search (Homepage)
```sql
CREATE INDEX idx_vendor_search ON vendors(cuisineType, status, approvedAt);
```
**Query Pattern**:
```sql
SELECT * FROM vendors
WHERE cuisineType = 'MEXICAN'
  AND status = 'APPROVED'
ORDER BY approvedAt DESC;
```

#### Customer Dashboard (Booking List)
```sql
CREATE INDEX idx_booking_customer ON bookings(customerId, createdAt DESC);
```
**Query Pattern**:
```sql
SELECT * FROM bookings
WHERE customerId = $1
ORDER BY createdAt DESC
LIMIT 20;
```

#### Vendor Dashboard (Upcoming Events)
```sql
CREATE INDEX idx_booking_vendor ON bookings(vendorId, eventDate DESC);
```
**Query Pattern**:
```sql
SELECT * FROM bookings
WHERE vendorId = $1
  AND eventDate >= CURRENT_DATE
ORDER BY eventDate ASC;
```

#### Escrow Release (Daily Cron)
```sql
CREATE INDEX idx_payment_release ON payments(status, capturedAt)
WHERE status = 'CAPTURED';
```
**Query Pattern**:
```sql
SELECT * FROM payments
WHERE status = 'CAPTURED'
  AND capturedAt < NOW() - INTERVAL '7 days';
```
**Partial Index**: Only indexes rows where status = 'CAPTURED' (reduces index size)

#### Message Retrieval (Booking Detail Page)
```sql
CREATE INDEX idx_message_booking ON messages(bookingId, createdAt ASC);
```
**Query Pattern**:
```sql
SELECT * FROM messages
WHERE bookingId = $1
  AND deletedAt IS NULL
ORDER BY createdAt ASC;
```

#### Anti-Circumvention Review Queue
```sql
CREATE INDEX idx_message_flagged ON messages(flagged, reviewedAt);
```
**Query Pattern**:
```sql
SELECT * FROM messages
WHERE flagged = true
  AND reviewedAt IS NULL
ORDER BY createdAt ASC;
```

### Index Maintenance

- **Analyze statistics**: Run `ANALYZE` after bulk data loads
- **Reindex**: Run `REINDEX` monthly on high-write tables (messages, bookings)
- **Monitor usage**: Use `pg_stat_user_indexes` to identify unused indexes
- **Drop unused**: Remove indexes with `idx_scan = 0` after 6 months

---

## Data Integrity & Constraints

### Primary Keys
- **Type**: UUID (universally unique identifier)
- **Generation**: `@default(uuid())` in Prisma (server-side generation)
- **Benefits**: No auto-increment collisions, globally unique, secure (non-sequential)

### Foreign Keys

| Child Table | Parent Table | Column | Delete Rule | Rationale |
|------------|--------------|--------|-------------|-----------|
| vendors | users | userId | CASCADE | Vendor profile can't exist without user |
| vendor_documents | vendors | vendorId | CASCADE | Documents belong to vendor |
| vendor_menus | vendors | vendorId | CASCADE | Menu belongs to vendor |
| availability | vendors | vendorId | CASCADE | Availability belongs to vendor |
| bookings | users | customerId | RESTRICT | Preserve booking history |
| bookings | users | vendorId | RESTRICT | Preserve booking history |
| payments | bookings | bookingId | RESTRICT | Financial audit trail |
| messages | bookings | bookingId | CASCADE | Messages belong to booking |
| messages | users | senderId | RESTRICT | Preserve message history |
| reviews | bookings | bookingId | CASCADE | Reviews belong to booking |
| reviews | users | reviewerId | RESTRICT | Preserve review authorship |
| reviews | users | revieweeId | RESTRICT | Preserve review target |
| violations | users | userId | CASCADE | Violations belong to user |
| disputes | bookings | bookingId | RESTRICT | Legal record preservation |
| disputes | users | initiatorId | RESTRICT | Legal record preservation |

### Unique Constraints

- `users.email` - One email per account
- `vendors.userId` - One vendor profile per user
- `vendors.stripeAccountId` - One Stripe account per vendor
- `vendor_menus.vendorId` - One menu per vendor
- `availability(vendorId, date)` - One availability record per vendor per date
- `payments.bookingId` - One payment per booking
- `payments.stripePaymentIntentId` - One Stripe PaymentIntent per payment
- `reviews.bookingId` - One review per booking
- `disputes.bookingId` - One dispute per booking

### Check Constraints

**Booking**:
```sql
ALTER TABLE bookings ADD CONSTRAINT chk_booking_guest_count CHECK (guestCount >= 1 AND guestCount <= 10000);
ALTER TABLE bookings ADD CONSTRAINT chk_booking_amounts CHECK (totalAmount > 0 AND platformFee >= 0 AND vendorPayout >= 0);
```

**Vendor**:
```sql
ALTER TABLE vendors ADD CONSTRAINT chk_vendor_capacity CHECK (capacityMin > 0 AND capacityMax > capacityMin);
```

**Review**:
```sql
ALTER TABLE reviews ADD CONSTRAINT chk_review_rating CHECK (rating >= 1 AND rating <= 5);
```

---

## Data Retention & Soft Deletes

### Retention Policy Summary

| Entity | Retention Period | Method |
|--------|------------------|--------|
| User Accounts | Until deletion + 30 days | Soft delete (`deletedAt`) |
| Bookings | 7 years (immutable) | No deletion |
| Payments | 7 years (immutable) | No deletion |
| Messages | 3 years | Soft delete, then purge |
| Reviews | While accounts active | Soft delete with user |
| Vendor Documents | Vendor relationship + 1 year | Soft delete, then purge |
| Violations | 5 years (immutable) | No deletion |
| Disputes | 5 years (immutable) | No deletion |

### Soft Delete Implementation

**Tables with Soft Delete**:
- `users` (deletedAt)
- `vendors` (deletedAt)
- `vendor_documents` (deletedAt)
- `messages` (deletedAt)
- `reviews` (deletedAt)

**Prisma Query Patterns**:
```typescript
// Exclude soft-deleted records by default
const activeUsers = await prisma.user.findMany({
  where: { deletedAt: null }
});

// Soft delete (set deletedAt)
await prisma.user.update({
  where: { id: userId },
  data: { deletedAt: new Date() }
});

// Hard delete (purge after retention period)
await prisma.user.deleteMany({
  where: {
    deletedAt: { lte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
  }
});
```

### Cron Jobs for Data Retention

#### Daily: Purge Expired Soft Deletes
```sql
-- Users (30 days after deletedAt)
DELETE FROM users
WHERE deletedAt IS NOT NULL
  AND deletedAt < NOW() - INTERVAL '30 days';

-- Messages (3 years after deletedAt)
DELETE FROM messages
WHERE deletedAt IS NOT NULL
  AND deletedAt < NOW() - INTERVAL '3 years';

-- Vendor Documents (1 year after deletedAt)
DELETE FROM vendor_documents
WHERE deletedAt IS NOT NULL
  AND deletedAt < NOW() - INTERVAL '1 year';
```

#### Yearly: Archive Old Financial Records
```sql
-- Archive bookings older than 7 years to cold storage
-- (Implementation depends on archive strategy - S3, separate DB, etc.)
```

---

## Performance Optimization

### Query Optimization Strategies

#### 1. Avoid N+1 Queries
**Bad** (N+1):
```typescript
const bookings = await prisma.booking.findMany();
for (const booking of bookings) {
  booking.vendor = await prisma.vendor.findUnique({ where: { id: booking.vendorId } });
}
```

**Good** (Single Query):
```typescript
const bookings = await prisma.booking.findMany({
  include: {
    vendor: true,
    customer: true,
    payment: true
  }
});
```

#### 2. Select Only Needed Fields
**Bad** (Over-fetching):
```typescript
const users = await prisma.user.findMany(); // Fetches all fields including passwordHash
```

**Good** (Selective):
```typescript
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    role: true,
    createdAt: true
  }
});
```

#### 3. Pagination
**Cursor-Based** (for infinite scroll):
```typescript
const bookings = await prisma.booking.findMany({
  take: 20,
  skip: 1, // Skip the cursor
  cursor: { id: lastBookingId },
  orderBy: { createdAt: 'desc' }
});
```

**Offset-Based** (for page numbers):
```typescript
const page = 2;
const pageSize = 20;
const bookings = await prisma.booking.findMany({
  take: pageSize,
  skip: (page - 1) * pageSize,
  orderBy: { createdAt: 'desc' }
});
```

#### 4. Aggregations
**Count with Filtering**:
```typescript
const totalBookings = await prisma.booking.count({
  where: {
    vendorId: vendorId,
    status: 'COMPLETED'
  }
});
```

**Average Rating**:
```typescript
const avgRating = await prisma.review.aggregate({
  where: { revieweeId: vendorId },
  _avg: { rating: true }
});
```

### Connection Pooling

**Prisma Data Proxy** (for serverless):
```env
DATABASE_URL="prisma://aws-us-east-1.prisma-data.com/?api_key=xxx"
```

**PgBouncer** (for traditional hosting):
```
# pgbouncer.ini
[databases]
fleet_feast = host=postgres.example.com port=5432 dbname=fleet_feast

[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
```

### Database Caching (Redis)

**Vendor Profile Caching**:
```typescript
async function getVendor(id: string): Promise<Vendor> {
  const cached = await redis.get(`vendor:${id}`);
  if (cached) return JSON.parse(cached);

  const vendor = await prisma.vendor.findUnique({ where: { id } });
  await redis.setex(`vendor:${id}`, 300, JSON.stringify(vendor)); // 5min TTL
  return vendor;
}
```

**Search Results Caching**:
```typescript
const cacheKey = `search:${JSON.stringify(searchParams)}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const results = await prisma.vendor.findMany({ where: searchParams });
await redis.setex(cacheKey, 300, JSON.stringify(results)); // 5min TTL
return results;
```

---

## Escrow Payment Flow

### State Machine

```
PENDING (Initial)
   ↓
AUTHORIZED (Funds held by Stripe)
   ↓
CAPTURED (Event occurred, funds captured)
   ↓ (7 days + no dispute)
RELEASED (Transferred to vendor)
```

### Implementation Steps

#### 1. Booking Creation
```typescript
// Transaction: Atomic booking + payment creation
await prisma.$transaction(async (tx) => {
  const booking = await tx.booking.create({
    data: {
      customerId, vendorId, eventDate, eventTime, location,
      guestCount, totalAmount, platformFee, vendorPayout,
      status: 'PENDING'
    }
  });

  const payment = await tx.payment.create({
    data: {
      bookingId: booking.id,
      amount: booking.totalAmount,
      status: 'PENDING'
    }
  });

  return { booking, payment };
});
```

#### 2. Vendor Accepts (PENDING → ACCEPTED)
```typescript
await prisma.booking.update({
  where: { id: bookingId },
  data: {
    status: 'ACCEPTED',
    acceptedAt: new Date()
  }
});
// Customer now has 24 hours to complete payment
```

#### 3. Payment Authorization (ACCEPTED → CONFIRMED)
```typescript
// Create Stripe PaymentIntent
const paymentIntent = await stripe.paymentIntents.create({
  amount: booking.totalAmount * 100, // Convert to cents
  currency: 'usd',
  application_fee_amount: booking.platformFee * 100,
  transfer_data: {
    destination: vendor.stripeAccountId
  },
  capture_method: 'manual' // CRITICAL: Don't auto-capture
});

// Update payment record
await prisma.payment.update({
  where: { bookingId },
  data: {
    stripePaymentIntentId: paymentIntent.id,
    status: 'AUTHORIZED',
    authorizedAt: new Date()
  }
});

// Update booking
await prisma.booking.update({
  where: { id: bookingId },
  data: { status: 'CONFIRMED' }
});
```

#### 4. Event Occurs (CONFIRMED → COMPLETED)
```typescript
// Daily cron job: Check for events that occurred
const completedBookings = await prisma.booking.updateMany({
  where: {
    status: 'CONFIRMED',
    eventDate: { lt: new Date() }
  },
  data: {
    status: 'COMPLETED'
  }
});

// Capture payments for completed bookings
for (const booking of completedBookings) {
  const payment = await prisma.payment.findUnique({ where: { bookingId: booking.id } });

  await stripe.paymentIntents.capture(payment.stripePaymentIntentId);

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: 'CAPTURED',
      capturedAt: new Date()
    }
  });
}
```

#### 5. Escrow Release (CAPTURED → RELEASED)
```typescript
// Daily cron job: Release payments after 7-day hold
const paymentsToRelease = await prisma.payment.findMany({
  where: {
    status: 'CAPTURED',
    capturedAt: { lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
  },
  include: {
    booking: {
      include: { dispute: true }
      }
  }
});

for (const payment of paymentsToRelease) {
  // Skip if active dispute
  if (payment.booking.dispute && ['OPEN', 'INVESTIGATING'].includes(payment.booking.dispute.status)) {
    continue;
  }

  // Stripe automatically transfers to vendor account (set up in PaymentIntent)
  // Just update our records
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: 'RELEASED',
      releasedAt: new Date()
    }
  });
}
```

### Error Handling

**Payment Authorization Failed**:
```typescript
await prisma.booking.update({
  where: { id: bookingId },
  data: { status: 'PAYMENT_FAILED' }
});
// Notify customer via email
```

**Dispute Raised**:
```typescript
// Payment stays CAPTURED until dispute resolved
// Admin resolves dispute:
if (resolutionOutcome === 'REFUND') {
  await stripe.refunds.create({ payment_intent: payment.stripePaymentIntentId });
  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: 'REFUNDED', refundedAt: new Date() }
  });
} else if (resolutionOutcome === 'RELEASE') {
  // Proceed with normal escrow release
}
```

---

## Anti-Circumvention Strategy

### Multi-Layer Detection System

#### Layer 1: Real-Time Content Filtering
**Trigger**: Every message POST
**Implementation**: Synchronous regex pattern matching

```typescript
const BLOCKED_PATTERNS = [
  { regex: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, severity: 'HIGH', reason: 'Phone number' },
  { regex: /\b[\w._%+-]+@[\w.-]+\.[A-Z]{2,}\b/i, severity: 'HIGH', reason: 'Email address' },
  { regex: /\b(call|text|email|whatsapp)\s+(me|us)\b/i, severity: 'MEDIUM', reason: 'Contact request' },
  { regex: /\b(instagram|facebook|twitter)\b/i, severity: 'LOW', reason: 'Social media' }
];

async function processMessage(content: string, senderId: string, bookingId: string): Promise<MessageResult> {
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.regex.test(content)) {
      // Flag message
      const message = await prisma.message.create({
        data: {
          bookingId, senderId, content,
          flagged: true,
          flagReason: pattern.reason,
          flagSeverity: pattern.severity
        }
      });

      // Create violation
      await prisma.violation.create({
        data: {
          userId: senderId,
          type: 'CONTACT_INFO_SHARING',
          severity: pattern.severity,
          description: `Message flagged: ${pattern.reason}`,
          relatedMessageId: message.id,
          relatedBookingId: bookingId
        }
      });

      // Check penalty threshold
      await applyPenalty(senderId);

      return { blocked: true, message, reason: pattern.reason };
    }
  }

  // No patterns matched, create normal message
  const message = await prisma.message.create({
    data: { bookingId, senderId, content }
  });

  return { blocked: false, message };
}
```

#### Layer 2: Behavioral Pattern Detection
**Trigger**: Daily cron job
**Implementation**: SQL query for suspicious patterns

```sql
-- Pattern 1: High message volume, no bookings
SELECT
  m.senderId as customer_id,
  b.vendorId as vendor_id,
  COUNT(m.id) as message_count,
  COUNT(DISTINCT b.id) as booking_count
FROM messages m
JOIN bookings b ON b.id = m.bookingId
WHERE m.createdAt > NOW() - INTERVAL '30 days'
GROUP BY m.senderId, b.vendorId
HAVING COUNT(m.id) > 20
  AND COUNT(DISTINCT CASE WHEN b.status IN ('CONFIRMED', 'COMPLETED') THEN b.id END) = 0;
```

```typescript
// Cron job implementation
async function detectCircumventionPatterns() {
  const suspiciousPairs = await prisma.$queryRaw`
    SELECT
      m.sender_id,
      b.vendor_id,
      COUNT(m.id)::int as message_count
    FROM messages m
    JOIN bookings b ON b.id = m.booking_id
    WHERE m.created_at > NOW() - INTERVAL '30 days'
    GROUP BY m.sender_id, b.vendor_id
    HAVING COUNT(m.id) > 20
      AND COUNT(DISTINCT CASE WHEN b.status IN ('CONFIRMED', 'COMPLETED') THEN b.id END) = 0
  `;

  for (const pair of suspiciousPairs) {
    // Create violation for manual review
    await prisma.violation.create({
      data: {
        userId: pair.sender_id,
        type: 'CIRCUMVENTION_ATTEMPT',
        severity: 'MEDIUM',
        description: `High message volume (${pair.message_count} messages) with vendor ${pair.vendor_id}, no confirmed bookings`
      }
    });

    // Notify admin
    await notifyAdmin('circumvention-risk', pair);
  }
}
```

#### Layer 3: Loyalty Incentives (Preventive)
**Implementation**: Database schema supports repeat booking discounts

```typescript
// Check if repeat booking
const previousBookings = await prisma.booking.count({
  where: {
    customerId,
    vendorId,
    status: 'COMPLETED'
  }
});

const platformFeeRate = previousBookings > 0 ? 0.10 : 0.15; // 10% vs 15%
const platformFee = totalAmount * platformFeeRate;
const vendorPayout = totalAmount - platformFee;

await prisma.booking.create({
  data: {
    customerId, vendorId, totalAmount,
    platformFee,
    vendorPayout,
    // ... other fields
  }
});
```

### Penalty Application

```typescript
async function applyPenalty(userId: string) {
  // Calculate total violation score (90-day window)
  const violations = await prisma.violation.findMany({
    where: {
      userId,
      createdAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
      resolvedAt: null
    }
  });

  const totalScore = violations.reduce((sum, v) => {
    const scores = { NONE: 0, LOW: 1, MEDIUM: 3, HIGH: 5 };
    return sum + (scores[v.severity] || 0);
  }, 0);

  if (totalScore >= 10) {
    // 30-day suspension
    await prisma.user.update({
      where: { id: userId },
      data: { status: 'SUSPENDED' }
    });

    await prisma.violation.create({
      data: {
        userId,
        type: 'CIRCUMVENTION_ATTEMPT',
        severity: 'HIGH',
        description: 'Account suspended: 90-day violation score >= 10',
        actionTaken: 'suspension',
        actionDuration: 30
      }
    });

    // Check if 3rd suspension (permanent ban)
    const suspensionCount = await prisma.violation.count({
      where: {
        userId,
        actionTaken: 'suspension',
        createdAt: { gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
      }
    });

    if (suspensionCount >= 3) {
      await prisma.user.update({
        where: { id: userId },
        data: { status: 'BANNED' }
      });
    }

  } else if (totalScore >= 5) {
    // Warning
    await sendWarningEmail(userId);
  }
}
```

---

## Migration Strategy

### Development Workflow
```bash
# 1. Make schema changes in prisma/schema.prisma

# 2. Create migration
npx prisma migrate dev --name add_loyalty_discount

# 3. Prisma auto-generates:
#    - SQL migration file (prisma/migrations/XXX_add_loyalty_discount/migration.sql)
#    - Updates Prisma Client types
#    - Applies to local database

# 4. Commit migration file to git
git add prisma/migrations/
git commit -m "Add loyalty discount fields to bookings"
```

### Staging Deployment
```bash
# Apply migrations (no new migrations created)
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### Production Deployment
```bash
# Pre-deployment checklist:
# 1. Backup database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Review migration SQL
cat prisma/migrations/*/migration.sql

# 3. Test rollback plan (write rollback.sql manually)

# 4. Apply migration
npx prisma migrate deploy

# 5. Monitor for errors (Sentry, logs)

# 6. If errors: rollback
psql $DATABASE_URL < rollback.sql
```

### Zero-Downtime Migration Pattern

**Example: Add new column with default value**
```sql
-- Step 1: Add column (nullable, with default)
ALTER TABLE bookings ADD COLUMN loyalty_discount DECIMAL(10,2) DEFAULT 0;

-- Step 2: Backfill data (gradual, batched)
UPDATE bookings SET loyalty_discount = 0 WHERE loyalty_discount IS NULL;

-- Step 3: Add NOT NULL constraint
ALTER TABLE bookings ALTER COLUMN loyalty_discount SET NOT NULL;
```

**Example: Rename column**
```sql
-- Step 1: Add new column
ALTER TABLE vendors ADD COLUMN business_name VARCHAR(255);

-- Step 2: Dual-write (application writes to both columns)
-- Deploy application code that writes to both old and new columns

-- Step 3: Backfill data
UPDATE vendors SET business_name = name WHERE business_name IS NULL;

-- Step 4: Switch reads to new column
-- Deploy application code that reads from new column

-- Step 5: Drop old column
ALTER TABLE vendors DROP COLUMN name;
```

---

## Security Considerations

### Password Security
- **Hashing**: bcrypt with cost factor 12
- **Salting**: Automatic per-password salt
- **Storage**: `passwordHash` field, never plaintext
- **Validation**: Enforce minimum 8 characters, complexity requirements (application layer)

### SQL Injection Prevention
- **Prisma ORM**: Parameterized queries by default
- **Raw Queries**: Use `$queryRaw` with tagged templates
  ```typescript
  // SAFE
  await prisma.$queryRaw`SELECT * FROM users WHERE email = ${email}`;

  // UNSAFE (never do this)
  await prisma.$queryRawUnsafe(`SELECT * FROM users WHERE email = '${email}'`);
  ```

### PII Data Protection
**Encrypted at Rest**:
- PostgreSQL database encrypted (provider-managed AES-256)
- S3 buckets encrypted (AES-256)

**Encrypted in Transit**:
- TLS 1.3 for all connections
- Database connection string includes `sslmode=require`

**Access Control**:
- Row-level security (RLS) for multi-tenant queries (if needed in future)
- API endpoints validate user permissions before queries
- Admin dashboard separate from customer/vendor views

### Audit Trail
**Immutable Records**:
- Bookings, payments, violations, disputes never deleted
- All status changes logged with timestamps
- `updatedAt` timestamp tracks all modifications

**Query Logging** (for sensitive operations):
```typescript
await prisma.booking.update({
  where: { id: bookingId },
  data: { status: 'CANCELLED', cancelledBy: userId }
});

await auditLog.create({
  userId,
  action: 'BOOKING_CANCELLED',
  resourceType: 'booking',
  resourceId: bookingId,
  timestamp: new Date()
});
```

---

## Scalability Considerations

### Current Scale (0-10K users)
- **Single PostgreSQL instance** (Neon serverless)
- **Prisma connection pooling** (Prisma Data Proxy)
- **Redis caching** (Upstash serverless)

### Future Scale (10K-100K users)

#### Read Replicas
```
PRIMARY (writes) ──┐
                   ├─→ REPLICA 1 (reads: reports, analytics)
                   ├─→ REPLICA 2 (reads: search, vendor profiles)
                   └─→ REPLICA 3 (reads: customer dashboards)
```

**Prisma Configuration**:
```typescript
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL // Primary
    }
  }
});

const prismaReplica = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_REPLICA_URL // Read replica
    }
  }
});

// Write queries use prisma, read queries use prismaReplica
```

#### Sharding (if needed at 100K+ users)
**Shard Key**: `userId` (hash-based sharding)
- Shard 1: Users with `userId` hash % 4 = 0
- Shard 2: Users with `userId` hash % 4 = 1
- Shard 3: Users with `userId` hash % 4 = 2
- Shard 4: Users with `userId` hash % 4 = 3

**Trade-offs**:
- **Pros**: Horizontal scaling, reduced query load per shard
- **Cons**: Cross-shard queries complex, schema changes harder
- **When**: Only if single-instance PostgreSQL can't handle load (unlikely until 100K+ users)

#### Search Extraction (at 10K+ vendors)
- **Migrate to Elasticsearch** for vendor search
- **Keep PostgreSQL** for transactional data
- **Sync strategy**: Change Data Capture (CDC) from PostgreSQL to Elasticsearch

---

## Summary

This database schema provides a robust, scalable foundation for Fleet Feast's food truck marketplace. Key highlights:

✅ **11 core entities** covering all PRD requirements
✅ **ACID-compliant transactions** for financial operations
✅ **Comprehensive indexing** for high-traffic queries
✅ **Soft delete strategy** for data retention compliance
✅ **Escrow payment system** with 7-day automated release
✅ **Anti-circumvention detection** with multi-layer filtering
✅ **Immutable financial records** (7-year retention)
✅ **Scalable architecture** (connection pooling, caching, future read replicas)

**Next Steps**:
- Task 1.3 (Ellis_Endpoints): API design using these entities and enums
- Task 2.2 (Blake_Backend): Business logic implementation using Prisma
- Task 4.1 (Quinn_QA): Database testing (integrity, transactions, soft deletes)

---

*Document created by Dana_Database*
*Version: 1.0*
*Date: 2025-12-03*
