# Fleet Feast - Entity Relationship Diagram

Generated: 2025-12-03
Author: Dana_Database
Database: PostgreSQL 15+

---

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                     FLEET FEAST DATA MODEL                          │
│                                                                      │
│  Core Flow: User → Vendor → Booking → Payment → Review             │
│  Supporting: Messages, Availability, Violations, Disputes           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Core Entity Relationships

```
                                  ┌──────────────┐
                                  │     User     │
                                  │──────────────│
                                  │ id (PK)      │
                                  │ email        │
                                  │ passwordHash │
                                  │ role         │◄─── Enum: CUSTOMER, VENDOR, ADMIN
                                  │ status       │◄─── Enum: ACTIVE, SUSPENDED, BANNED
                                  │ createdAt    │
                                  │ deletedAt    │◄─── Soft delete
                                  └──────┬───────┘
                                         │
                     ┌───────────────────┼───────────────────┐
                     │ 1:1               │ 1:N               │ 1:N
                     ▼                   ▼                   ▼
            ┌────────────────┐  ┌────────────────┐  ┌────────────────┐
            │     Vendor     │  │    Booking     │  │   Violation    │
            │────────────────│  │  (as Customer) │  │────────────────│
            │ id (PK)        │  │────────────────│  │ id (PK)        │
            │ userId (FK)    │──┤ id (PK)        │  │ userId (FK)    │
            │ businessName   │  │ customerId(FK) │  │ type           │◄─── Enum: CONTACT_INFO_SHARING, etc.
            │ cuisineType    │  │ vendorId (FK)  │  │ severity       │
            │ capacityMin    │  │ eventDate      │  │ actionTaken    │
            │ capacityMax    │  │ eventTime      │  │ createdAt      │
            │ priceRange     │  │ guestCount     │  └────────────────┘
            │ status         │◄─┤ totalAmount    │
            │ stripeAccountId│  │ platformFee    │
            │ approvedAt     │  │ status         │◄─── Enum: PENDING, ACCEPTED, CONFIRMED, etc.
            └───────┬────────┘  │ createdAt      │
                    │           └───────┬────────┘
                    │ 1:N               │
                    │                   │ 1:1
                    ▼                   ▼
         ┌──────────────────┐  ┌────────────────┐
         │ VendorDocument   │  │    Payment     │
         │──────────────────│  │────────────────│
         │ id (PK)          │  │ id (PK)        │
         │ vendorId (FK)    │  │ bookingId (FK) │
         │ type             │◄─┤ stripePayment  │
         │ fileUrl          │  │   IntentId     │
         │ verified         │  │ amount         │
         │ verifiedAt       │  │ status         │◄─── Enum: PENDING, AUTHORIZED, CAPTURED, etc.
         └──────────────────┘  │ capturedAt     │
                               │ releasedAt     │◄─── Escrow release date
         ┌──────────────────┐  └────────────────┘
         │   VendorMenu     │
         │──────────────────│
         │ id (PK)          │
         │ vendorId (FK)    │
         │ items (JSON)     │◄─── Flexible menu structure
         │ pricingModel     │
         └──────────────────┘

         ┌──────────────────┐
         │  Availability    │
         │──────────────────│
         │ id (PK)          │
         │ vendorId (FK)    │
         │ date             │
         │ isAvailable      │
         │──────────────────│
         │ UNIQUE(vendorId, │
         │        date)     │
         └──────────────────┘
```

---

## Booking-Related Entities

```
                          ┌────────────────┐
                          │    Booking     │
                          │────────────────│
                          │ id (PK)        │
                          └───────┬────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          │ 1:N                   │ 1:1                   │ 1:1
          ▼                       ▼                       ▼
  ┌───────────────┐      ┌───────────────┐      ┌───────────────┐
  │    Message    │      │    Review     │      │    Dispute    │
  │───────────────│      │───────────────│      │───────────────│
  │ id (PK)       │      │ id (PK)       │      │ id (PK)       │
  │ bookingId(FK) │      │ bookingId(FK) │      │ bookingId(FK) │
  │ senderId (FK) │      │ reviewerId(FK)│      │ initiatorId(FK)│
  │ content       │      │ revieweeId(FK)│      │ reason        │
  │ flagged       │◄────┤ rating (1-5)  │      │ status        │
  │ flagSeverity  │      │ content       │      │ resolution    │
  │ createdAt     │      │ createdAt     │      │ resolvedAt    │
  └───────────────┘      └───────────────┘      └───────────────┘
      │                        │                       │
      │                        │                       │
      ▼                        ▼                       ▼
  Anti-circumvention   Customer/Vendor Reviews   Conflict Resolution
  Detection System     (Both directions)         Admin Moderation
```

---

## Detailed Entity Definitions

### User
**Primary Table**: `users`
- **Primary Key**: `id` (UUID)
- **Unique Constraints**: `email`
- **Role**: Polymorphic (CUSTOMER, VENDOR, ADMIN)
- **Relationships**:
  - 1:1 with Vendor (optional, only for VENDOR role)
  - 1:N with Bookings (as customer)
  - 1:N with Bookings (as vendor)
  - 1:N with Messages (as sender)
  - 1:N with Reviews (as reviewer)
  - 1:N with Reviews (as reviewee)
  - 1:N with Violations
  - 1:N with Disputes (as initiator)

### Vendor
**Primary Table**: `vendors`
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: `userId` → `users.id` (1:1, CASCADE)
- **Unique Constraints**: `userId`, `stripeAccountId`
- **Relationships**:
  - 1:1 with User
  - 1:N with VendorDocuments
  - 1:1 with VendorMenu
  - 1:N with Availability
  - 1:N with Bookings

### VendorDocument
**Primary Table**: `vendor_documents`
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: `vendorId` → `vendors.id` (CASCADE)
- **Document Types**: BUSINESS_LICENSE, HEALTH_PERMIT, INSURANCE, TAX_ID, etc.
- **Verification**: Admin approval workflow

### VendorMenu
**Primary Table**: `vendor_menus`
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: `vendorId` → `vendors.id` (1:1, CASCADE)
- **Unique Constraints**: `vendorId`
- **JSON Structure**: `items` field stores flexible menu data
  ```json
  {
    "items": [
      {
        "name": "Tacos al Pastor",
        "description": "Marinated pork with pineapple",
        "price": 12.99,
        "dietary_tags": ["gluten-free-option"]
      }
    ]
  }
  ```

### Availability
**Primary Table**: `availability`
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: `vendorId` → `vendors.id` (CASCADE)
- **Unique Constraints**: `(vendorId, date)`
- **Purpose**: Track vendor calendar availability

### Booking
**Primary Table**: `bookings`
- **Primary Key**: `id` (UUID)
- **Foreign Keys**:
  - `customerId` → `users.id` (RESTRICT)
  - `vendorId` → `users.id` (RESTRICT)
  - `vendorId` → `vendors.userId` (RESTRICT, for vendor profile data)
- **Status Flow**: PENDING → ACCEPTED → CONFIRMED → COMPLETED
- **Financial Fields**:
  - `totalAmount`: Total booking cost
  - `platformFee`: 15% default, 10% for loyalty
  - `vendorPayout`: totalAmount - platformFee
- **Critical Relationship**: 1:1 with Payment

### Payment
**Primary Table**: `payments`
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: `bookingId` → `bookings.id` (1:1, RESTRICT)
- **Unique Constraints**: `bookingId`, `stripePaymentIntentId`
- **Status Flow**: PENDING → AUTHORIZED → CAPTURED → RELEASED
- **Escrow Logic**:
  - `authorizedAt`: Funds held (vendor accepts booking)
  - `capturedAt`: Funds captured (event occurs)
  - `releasedAt`: Funds transferred to vendor (7 days after event)
- **ACID Compliance**: Critical for financial integrity

### Message
**Primary Table**: `messages`
- **Primary Key**: `id` (UUID)
- **Foreign Keys**:
  - `bookingId` → `bookings.id` (CASCADE)
  - `senderId` → `users.id` (RESTRICT)
- **Anti-Circumvention**:
  - `flagged`: Boolean flag for suspicious content
  - `flagSeverity`: NONE, LOW, MEDIUM, HIGH
  - Pattern detection for phone numbers, emails, contact requests
- **Context-Bound**: All messages belong to a booking

### Review
**Primary Table**: `reviews`
- **Primary Key**: `id` (UUID)
- **Foreign Keys**:
  - `bookingId` → `bookings.id` (1:1, CASCADE)
  - `reviewerId` → `users.id` (RESTRICT)
  - `revieweeId` → `users.id` (RESTRICT)
- **Unique Constraints**: `bookingId`
- **Bidirectional**: Customer reviews vendor, vendor reviews customer
- **Rating**: 1-5 stars (integer)

### Violation
**Primary Table**: `violations`
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: `userId` → `users.id` (CASCADE)
- **Types**: CONTACT_INFO_SHARING, CIRCUMVENTION_ATTEMPT, HARASSMENT, etc.
- **Severity**: Maps to MessageSeverity (NONE, LOW, MEDIUM, HIGH)
- **Penalty System**:
  - Track violation count over 90 days
  - Escalating penalties: warning → suspension → ban

### Dispute
**Primary Table**: `disputes`
- **Primary Key**: `id` (UUID)
- **Foreign Keys**:
  - `bookingId` → `bookings.id` (1:1, RESTRICT)
  - `initiatorId` → `users.id` (RESTRICT)
- **Unique Constraints**: `bookingId`
- **Status Flow**: OPEN → INVESTIGATING → RESOLVED_* or ESCALATED
- **7-Day Window**: Must be raised within 7 days after event

---

## Key Indexes

### High-Traffic Query Optimization

```sql
-- User lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_status ON users(role, status);
CREATE INDEX idx_users_deleted ON users(deletedAt);

-- Vendor search (critical path)
CREATE INDEX idx_vendor_search ON vendors(cuisine_type, status, approved_at);
CREATE INDEX idx_vendor_status ON vendors(status);
CREATE INDEX idx_vendor_stripe ON vendors(stripe_account_id);

-- Booking queries (customer/vendor dashboards)
CREATE INDEX idx_booking_customer ON bookings(customer_id, created_at DESC);
CREATE INDEX idx_booking_vendor ON bookings(vendor_id, event_date DESC);
CREATE INDEX idx_booking_status ON bookings(status);
CREATE INDEX idx_booking_event_date ON bookings(event_date);

-- Payment escrow release (daily cron job)
CREATE INDEX idx_payment_release ON payments(status, captured_at) WHERE status = 'CAPTURED';
CREATE INDEX idx_payment_booking ON payments(booking_id);
CREATE INDEX idx_payment_stripe ON payments(stripe_payment_intent_id);

-- Message retrieval (booking detail page)
CREATE INDEX idx_message_booking ON messages(booking_id, created_at ASC);
CREATE INDEX idx_message_sender ON messages(sender_id, created_at DESC);
CREATE INDEX idx_message_flagged ON messages(flagged, reviewed_at);

-- Review display (vendor profile, customer history)
CREATE INDEX idx_review_booking ON reviews(booking_id);
CREATE INDEX idx_review_reviewee ON reviews(reviewee_id, created_at DESC);
CREATE INDEX idx_review_rating ON reviews(rating);

-- Violation tracking (admin moderation)
CREATE INDEX idx_violation_user ON violations(user_id, created_at DESC);
CREATE INDEX idx_violation_type ON violations(type, resolved_at);

-- Dispute resolution (admin dashboard)
CREATE INDEX idx_dispute_booking ON disputes(booking_id);
CREATE INDEX idx_dispute_status ON disputes(status, created_at ASC);
CREATE INDEX idx_dispute_initiator ON disputes(initiator_id);

-- Availability calendar lookups
CREATE INDEX idx_availability_vendor_date ON availability(vendor_id, date);
CREATE INDEX idx_availability_date ON availability(date, is_available);
```

---

## Data Integrity Rules

### Foreign Key Constraints

| Child Table | Parent Table | Delete Rule | Rationale |
|------------|--------------|-------------|-----------|
| Vendor → User | users | CASCADE | Vendor can't exist without User |
| VendorDocument → Vendor | vendors | CASCADE | Documents belong to vendor |
| VendorMenu → Vendor | vendors | CASCADE | Menu belongs to vendor |
| Availability → Vendor | vendors | CASCADE | Availability belongs to vendor |
| Booking → User (customer) | users | RESTRICT | Preserve booking history even if user deleted |
| Booking → User (vendor) | users | RESTRICT | Preserve booking history even if user deleted |
| Payment → Booking | bookings | RESTRICT | Payment must be preserved for audit trail |
| Message → Booking | bookings | CASCADE | Messages belong to booking context |
| Message → User | users | RESTRICT | Preserve messages even if sender deleted |
| Review → Booking | bookings | CASCADE | Reviews belong to booking |
| Violation → User | users | CASCADE | Violations belong to user |
| Dispute → Booking | bookings | RESTRICT | Disputes must be preserved for legal reasons |

### Unique Constraints

- `users.email` - One email per user
- `vendors.userId` - One vendor profile per user
- `vendors.stripeAccountId` - One Stripe account per vendor
- `vendor_menus.vendorId` - One menu per vendor
- `availability(vendorId, date)` - One availability entry per vendor per date
- `payments.bookingId` - One payment per booking
- `payments.stripePaymentIntentId` - One Stripe PaymentIntent per payment
- `reviews.bookingId` - One review per booking
- `disputes.bookingId` - One dispute per booking

### Soft Delete Strategy

**Tables with Soft Delete** (nullable `deletedAt` timestamp):
- `users` - Data retention: 30 days after deletion request
- `vendors` - Data retention: 1 year after deactivation
- `vendor_documents` - Data retention: 1 year after vendor deactivation
- `messages` - Data retention: 3 years
- `reviews` - Data retention: While user accounts active

**Tables without Soft Delete** (hard delete or immutable):
- `bookings` - Immutable (7-year retention for tax/legal compliance)
- `payments` - Immutable (7-year retention for tax/legal compliance)
- `violations` - Immutable (5-year retention)
- `disputes` - Immutable (5-year retention)

---

## Enum Reference

### UserRole
- `CUSTOMER` - Regular platform user
- `VENDOR` - Food truck operator
- `ADMIN` - Platform administrator

### UserStatus
- `ACTIVE` - Normal state
- `SUSPENDED` - Temporary suspension (e.g., violation penalty)
- `BANNED` - Permanent ban
- `DELETED` - Soft deleted (grace period)

### VendorStatus
- `PENDING` - Application submitted, awaiting admin review
- `APPROVED` - Admin approved, can accept bookings
- `REJECTED` - Application rejected
- `SUSPENDED` - Temporarily suspended (e.g., violations, disputes)
- `DEACTIVATED` - Vendor chose to deactivate account

### BookingStatus
- `PENDING` - Customer submitted request, awaiting vendor response (48hr window)
- `ACCEPTED` - Vendor accepted, awaiting customer payment
- `PAYMENT_FAILED` - Payment authorization failed
- `CONFIRMED` - Payment authorized, booking confirmed
- `COMPLETED` - Event occurred, in 7-day dispute window
- `CANCELLED` - Cancelled by customer or vendor
- `DISPUTED` - Dispute raised during 7-day window
- `REFUNDED` - Payment refunded to customer

### PaymentStatus
- `PENDING` - Initial state
- `AUTHORIZED` - Stripe PaymentIntent created, funds held
- `CAPTURED` - Payment captured (event occurred)
- `RELEASED` - Funds transferred to vendor (7 days after event)
- `REFUNDED` - Payment refunded to customer
- `FAILED` - Payment failed

### CuisineType
- `AMERICAN`, `MEXICAN`, `ITALIAN`, `ASIAN`, `BBQ`, `SEAFOOD`, `VEGETARIAN`, `VEGAN`, `DESSERTS`, `COFFEE`, `OTHER`

### PriceRange
- `BUDGET` - $ (Under $15/person)
- `MODERATE` - $$ ($15-25/person)
- `PREMIUM` - $$$ ($25-40/person)
- `LUXURY` - $$$$ (Over $40/person)

### EventType
- `CORPORATE`, `WEDDING`, `BIRTHDAY`, `FESTIVAL`, `PRIVATE_PARTY`, `OTHER`

---

## Business Rules Encoded in Schema

1. **Platform Commission**: Stored in `bookings.platformFee` (calculated at creation)
   - Default: 15% of totalAmount
   - Loyalty discount: 10% for repeat bookings (5% reduction)

2. **Escrow 7-Day Hold**:
   - `payments.capturedAt` = event date
   - `payments.releasedAt` = capturedAt + 7 days (if no dispute)
   - Daily cron job queries: `WHERE status = 'CAPTURED' AND capturedAt < NOW() - INTERVAL '7 days'`

3. **Cancellation Policy** (calculated in application, not enforced in DB):
   - 7+ days before: Full refund (stored in `bookings.refundAmount`)
   - 3-6 days before: 50% refund
   - < 3 days: No refund

4. **Vendor Response Window**: 48 hours
   - Not enforced in DB schema
   - Application logic checks `createdAt` + 48 hours
   - Auto-decline if vendor doesn't respond

5. **Anti-Circumvention Violation Tracking**:
   - `messages.flagged` = true when patterns detected
   - Creates `violation` record with severity
   - Penalty calculation: Sum of severity scores over 90 days
     - Score ≥ 5: Warning
     - Score ≥ 10: 30-day suspension
     - 3rd suspension: Permanent ban

6. **Review Eligibility**:
   - Only after booking status = `COMPLETED`
   - One review per booking (enforced by UNIQUE constraint on `bookings.id`)
   - Both customer and vendor can review each other (different `revieweeId`)

---

## Data Retention Summary

| Entity | Retention Period | Implementation |
|--------|------------------|----------------|
| User Accounts | Until deletion + 30 days | Soft delete, cron job purges after 30 days |
| Booking Records | 7 years | Immutable, no deletion |
| Payment Records | 7 years | Immutable, no deletion |
| Messages | 3 years | Soft delete, cron job purges after 3 years |
| Reviews | Indefinite (while accounts active) | Soft delete when user deleted |
| Vendor Documents | Duration + 1 year | Soft delete, cron job purges after 1 year post-deactivation |
| Violations | 5 years | Immutable, no deletion |
| Disputes | 5 years | Immutable, no deletion |

---

## Notes for Downstream Tasks

### For Task 1.3 (API Design - Ellis_Endpoints):
- All foreign key relationships are `RESTRICT` for bookings/payments to preserve data integrity
- Enum types defined in schema should be used in API request/response validation
- Booking status transitions must follow: PENDING → ACCEPTED → CONFIRMED → COMPLETED
- Payment status transitions must follow: PENDING → AUTHORIZED → CAPTURED → RELEASED
- Message POST endpoint must implement anti-circumvention pattern detection

### For Task 2.2 (Backend Services - Blake_Backend):
- Use Prisma's transaction API for booking creation (atomic booking + payment creation)
- Implement optimistic locking for concurrent booking requests (same vendor, same date)
- Escrow release cron job query: `payments WHERE status = 'CAPTURED' AND capturedAt < NOW() - INTERVAL '7 days'`
- Anti-circumvention detection runs on every message POST (real-time)
- Behavioral pattern detection runs daily (cron job)

### For Task 4.1 (Testing - Quinn_QA):
- Test data retention policies (soft delete behavior)
- Test foreign key cascade behavior (vendor deletion cascades to documents, menu, availability)
- Test UNIQUE constraints (duplicate email, duplicate stripe account ID)
- Test booking + payment atomicity (transaction rollback on failure)
- Test escrow release logic (7-day calculation)

---

*Generated by Dana_Database*
*Version: 1.0*
*Date: 2025-12-03*
