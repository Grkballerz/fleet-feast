# Fleet Feast Schema Registry

**Last Updated**: 2024-12-04
**Database**: PostgreSQL 15+
**ORM**: Prisma 5.20.0
**Migration**: `20241204201100_init`

## Overview

Fleet Feast uses a PostgreSQL database with 11 core entities organized into 5 functional domains:

1. **User Management** - Authentication, roles, vendor profiles
2. **Booking System** - Availability, bookings, payments
3. **Communication** - Messaging, reviews
4. **Moderation** - Violations, disputes
5. **Supporting Data** - Enums, lookup tables

## Entity Relationship Diagram

```
Users (1:1) Vendors
  │              │
  │              ├─ (1:N) VendorDocuments
  │              ├─ (1:1) VendorMenus
  │              └─ (1:N) Availability
  │
  ├─ (1:N) Bookings ─┬─ (1:1) Payments
  │                  ├─ (1:N) Messages
  │                  ├─ (1:1) Reviews
  │                  └─ (1:1) Disputes
  │
  ├─ (1:N) Reviews (as reviewer/reviewee)
  ├─ (1:N) Messages (as sender)
  └─ (1:N) Violations
```

## Tables

### 1. users

**Purpose**: Core authentication and user management

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique user identifier |
| email | VARCHAR | UNIQUE, NOT NULL | User email (login) |
| password_hash | VARCHAR | NOT NULL | Bcrypt hashed password |
| role | UserRole | DEFAULT 'CUSTOMER' | CUSTOMER, VENDOR, ADMIN |
| status | UserStatus | DEFAULT 'ACTIVE' | ACTIVE, SUSPENDED, BANNED, DELETED |
| created_at | TIMESTAMP | DEFAULT NOW() | Account creation |
| updated_at | TIMESTAMP | AUTO UPDATE | Last update |
| deleted_at | TIMESTAMP | NULL | Soft delete timestamp |

**Indexes**:
- `idx_users_email` (email)
- `idx_users_role_status` (role, status)
- `idx_users_deleted_at` (deleted_at)

**Relations**:
- 1:1 with `vendors` (vendor profile)
- 1:N with `bookings` as customer
- 1:N with `bookings` as vendor
- 1:N with `messages` as sender
- 1:N with `reviews` as reviewer/reviewee
- 1:N with `violations`
- 1:N with `disputes`

---

### 2. vendors

**Purpose**: Vendor business profiles and verification status

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Vendor profile ID |
| user_id | UUID | FOREIGN KEY, UNIQUE | Links to users table |
| business_name | VARCHAR | NOT NULL | Food truck name |
| cuisine_type | CuisineType | NOT NULL | Mexican, BBQ, Asian, etc. |
| description | TEXT | NULL | Business description |
| price_range | PriceRange | NOT NULL | BUDGET, MODERATE, PREMIUM, LUXURY |
| capacity_min | INTEGER | NOT NULL | Minimum guest count |
| capacity_max | INTEGER | NOT NULL | Maximum guest count |
| service_area | VARCHAR | NULL | Geographic service area |
| location | VARCHAR | NULL | "lat,lng" for proximity search |
| stripe_account_id | VARCHAR | UNIQUE, NULL | Stripe Connect account ID |
| stripe_connected | BOOLEAN | DEFAULT false | Stripe account verified |
| status | VendorStatus | DEFAULT 'PENDING' | PENDING, APPROVED, REJECTED, SUSPENDED, DEACTIVATED |
| approved_at | TIMESTAMP | NULL | Admin approval timestamp |
| approved_by | UUID | NULL | Admin user ID who approved |
| rejection_reason | TEXT | NULL | Admin rejection notes |
| created_at | TIMESTAMP | DEFAULT NOW() | Profile creation |
| updated_at | TIMESTAMP | AUTO UPDATE | Last update |
| deleted_at | TIMESTAMP | NULL | Soft delete |

**Indexes**:
- `idx_vendors_user_id` (user_id)
- `idx_vendors_cuisine_status` (cuisine_type, status, approved_at)
- `idx_vendors_status` (status)
- `idx_vendors_stripe_account` (stripe_account_id)

**Relations**:
- 1:1 with `users`
- 1:N with `vendor_documents`
- 1:1 with `vendor_menus`
- 1:N with `availability`
- 1:N with `bookings`

---

### 3. vendor_documents

**Purpose**: Verification documents (licenses, permits, insurance)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Document ID |
| vendor_id | UUID | FOREIGN KEY, NOT NULL | Links to vendors |
| type | DocumentType | NOT NULL | BUSINESS_LICENSE, HEALTH_PERMIT, INSURANCE, TAX_ID, VEHICLE_REGISTRATION, OTHER |
| file_name | VARCHAR | NOT NULL | Original filename |
| file_url | VARCHAR | NOT NULL | S3 URL or key |
| file_size | INTEGER | NULL | Size in bytes |
| verified | BOOLEAN | DEFAULT false | Admin verification status |
| verified_at | TIMESTAMP | NULL | When verified |
| verified_by | UUID | NULL | Admin user ID |
| rejection_reason | TEXT | NULL | Admin rejection notes |
| created_at | TIMESTAMP | DEFAULT NOW() | Upload timestamp |
| updated_at | TIMESTAMP | AUTO UPDATE | Last update |
| deleted_at | TIMESTAMP | NULL | Soft delete |

**Indexes**:
- `idx_vendor_docs_vendor_type` (vendor_id, type)
- `idx_vendor_docs_verified` (verified)

**Relations**:
- N:1 with `vendors`

---

### 4. vendor_menus

**Purpose**: Menu items and pricing models

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Menu ID |
| vendor_id | UUID | FOREIGN KEY, UNIQUE | Links to vendors (1:1) |
| items | JSONB | NOT NULL | Array of menu items |
| pricing_model | VARCHAR | NOT NULL | "per_person", "flat_rate", "custom" |
| created_at | TIMESTAMP | DEFAULT NOW() | Menu creation |
| updated_at | TIMESTAMP | AUTO UPDATE | Last update |

**Items JSON Structure**:
```json
[
  {
    "id": "item-uuid",
    "name": "Taco Platter",
    "description": "3 tacos with choice of protein",
    "price": 12.99,
    "category": "main",
    "dietary_tags": ["gluten-free-option", "dairy-free"]
  }
]
```

**Indexes**:
- `idx_vendor_menus_vendor` (vendor_id)

**Relations**:
- 1:1 with `vendors`

---

### 5. availability

**Purpose**: Vendor calendar availability

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Availability entry ID |
| vendor_id | UUID | FOREIGN KEY, NOT NULL | Links to vendors |
| date | DATE | NOT NULL | Calendar date |
| is_available | BOOLEAN | DEFAULT true | Available for bookings |
| notes | TEXT | NULL | Optional notes |
| created_at | TIMESTAMP | DEFAULT NOW() | Entry creation |
| updated_at | TIMESTAMP | AUTO UPDATE | Last update |

**Indexes**:
- `idx_availability_vendor_date` UNIQUE (vendor_id, date)
- `idx_availability_date_available` (date, is_available)

**Relations**:
- N:1 with `vendors`

---

### 6. bookings

**Purpose**: Event bookings between customers and vendors

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Booking ID |
| customer_id | UUID | FOREIGN KEY, NOT NULL | Customer user ID |
| vendor_id | UUID | FOREIGN KEY, NOT NULL | Vendor user ID |
| event_date | DATE | NOT NULL | Event date |
| event_time | VARCHAR | NOT NULL | "HH:MM" format |
| event_type | EventType | NOT NULL | CORPORATE, WEDDING, BIRTHDAY, FESTIVAL, PRIVATE_PARTY, OTHER |
| location | TEXT | NOT NULL | Full event address |
| guest_count | INTEGER | NOT NULL | Number of guests |
| special_requests | TEXT | NULL | Customer notes |
| total_amount | DECIMAL(10,2) | NOT NULL | Total booking cost |
| platform_fee | DECIMAL(10,2) | NOT NULL | Fleet Feast fee (15%) |
| vendor_payout | DECIMAL(10,2) | NOT NULL | Vendor earnings |
| status | BookingStatus | DEFAULT 'PENDING' | PENDING, ACCEPTED, PAYMENT_FAILED, CONFIRMED, COMPLETED, CANCELLED, DISPUTED, REFUNDED |
| cancelled_at | TIMESTAMP | NULL | Cancellation timestamp |
| cancelled_by | UUID | NULL | User who cancelled |
| cancellation_reason | TEXT | NULL | Cancellation notes |
| refund_amount | DECIMAL(10,2) | NULL | Refund amount |
| accepted_at | TIMESTAMP | NULL | Vendor acceptance |
| responded_at | TIMESTAMP | NULL | Vendor response |
| created_at | TIMESTAMP | DEFAULT NOW() | Booking creation |
| updated_at | TIMESTAMP | AUTO UPDATE | Last update |

**Indexes**:
- `idx_bookings_customer_created` (customer_id, created_at DESC)
- `idx_bookings_vendor_event_date` (vendor_id, event_date DESC)
- `idx_bookings_status` (status)
- `idx_bookings_event_date` (event_date)

**Relations**:
- N:1 with `users` (as customer)
- N:1 with `users` (as vendor)
- N:1 with `vendors` (vendor profile)
- 1:1 with `payments`
- 1:N with `messages`
- 1:1 with `reviews`
- 1:1 with `disputes`

---

### 7. payments

**Purpose**: Payment tracking with Stripe integration

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Payment ID |
| booking_id | UUID | FOREIGN KEY, UNIQUE | Links to bookings (1:1) |
| stripe_payment_intent_id | VARCHAR | UNIQUE, NULL | Stripe PaymentIntent ID |
| stripe_transfer_id | VARCHAR | UNIQUE, NULL | Stripe Transfer ID |
| amount | DECIMAL(10,2) | NOT NULL | Payment amount |
| status | PaymentStatus | DEFAULT 'PENDING' | PENDING, AUTHORIZED, CAPTURED, RELEASED, REFUNDED, FAILED |
| authorized_at | TIMESTAMP | NULL | Funds held |
| captured_at | TIMESTAMP | NULL | Payment captured |
| released_at | TIMESTAMP | NULL | Transferred to vendor |
| refunded_at | TIMESTAMP | NULL | Refund processed |
| created_at | TIMESTAMP | DEFAULT NOW() | Payment creation |
| updated_at | TIMESTAMP | AUTO UPDATE | Last update |

**Indexes**:
- `idx_payments_booking` (booking_id)
- `idx_payments_status_captured` (status, captured_at)
- `idx_payments_stripe_intent` (stripe_payment_intent_id)

**Relations**:
- 1:1 with `bookings`

**Payment Flow**:
1. PENDING → booking created
2. AUTHORIZED → Stripe PaymentIntent created, funds held
3. CAPTURED → event occurred, payment captured
4. RELEASED → after 7-day dispute window, transferred to vendor
5. REFUNDED → customer refund processed

---

### 8. messages

**Purpose**: In-app messaging between customers and vendors

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Message ID |
| booking_id | UUID | FOREIGN KEY, NOT NULL | Links to bookings |
| sender_id | UUID | FOREIGN KEY, NOT NULL | User who sent |
| content | TEXT | NOT NULL | Message text |
| flagged | BOOLEAN | DEFAULT false | Flagged for review |
| flag_reason | VARCHAR | NULL | Why flagged |
| flag_severity | MessageSeverity | DEFAULT 'NONE' | NONE, LOW, MEDIUM, HIGH |
| reviewed_at | TIMESTAMP | NULL | Admin review timestamp |
| reviewed_by | UUID | NULL | Admin user ID |
| created_at | TIMESTAMP | DEFAULT NOW() | Send timestamp |
| updated_at | TIMESTAMP | AUTO UPDATE | Last update |
| deleted_at | TIMESTAMP | NULL | Soft delete |

**Indexes**:
- `idx_messages_booking_created` (booking_id, created_at ASC)
- `idx_messages_sender_created` (sender_id, created_at DESC)
- `idx_messages_flagged_reviewed` (flagged, reviewed_at)

**Relations**:
- N:1 with `bookings`
- N:1 with `users` (as sender)

**Anti-Circumvention**:
Messages are automatically scanned for:
- Phone numbers
- Email addresses
- Payment URLs
- Contact info patterns

---

### 9. reviews

**Purpose**: Ratings and reviews for completed bookings

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Review ID |
| booking_id | UUID | FOREIGN KEY, UNIQUE | Links to bookings (1:1) |
| reviewer_id | UUID | FOREIGN KEY, NOT NULL | User who wrote review |
| reviewee_id | UUID | FOREIGN KEY, NOT NULL | User being reviewed |
| rating | INTEGER | NOT NULL | 1-5 stars |
| content | TEXT | NULL | Review text |
| flagged | BOOLEAN | DEFAULT false | Flagged for moderation |
| hidden | BOOLEAN | DEFAULT false | Hidden by admin |
| created_at | TIMESTAMP | DEFAULT NOW() | Review creation |
| updated_at | TIMESTAMP | AUTO UPDATE | Last update |
| deleted_at | TIMESTAMP | NULL | Soft delete |

**Indexes**:
- `idx_reviews_booking` (booking_id)
- `idx_reviews_reviewee_created` (reviewee_id, created_at DESC)
- `idx_reviews_rating` (rating)

**Relations**:
- 1:1 with `bookings`
- N:1 with `users` (as reviewer)
- N:1 with `users` (as reviewee)

**Review Window**:
- Available 24 hours after event completion
- Can be edited for 7 days
- Locked after 7 days

---

### 10. violations

**Purpose**: Platform policy violations tracking

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Violation ID |
| user_id | UUID | FOREIGN KEY, NOT NULL | User who violated |
| type | ViolationType | NOT NULL | CONTACT_INFO_SHARING, CIRCUMVENTION_ATTEMPT, HARASSMENT, SPAM, FRAUD, OTHER |
| description | TEXT | NOT NULL | Violation details |
| severity | MessageSeverity | NOT NULL | NONE, LOW, MEDIUM, HIGH |
| related_message_id | UUID | NULL | Related message if applicable |
| related_booking_id | UUID | NULL | Related booking if applicable |
| action_taken | VARCHAR | NULL | "warning", "suspension", "ban" |
| action_duration | INTEGER | NULL | Days (for suspension) |
| resolved_at | TIMESTAMP | NULL | Resolution timestamp |
| resolved_by | UUID | NULL | Admin user ID |
| notes | TEXT | NULL | Admin notes |
| created_at | TIMESTAMP | DEFAULT NOW() | Violation timestamp |
| updated_at | TIMESTAMP | AUTO UPDATE | Last update |

**Indexes**:
- `idx_violations_user_created` (user_id, created_at DESC)
- `idx_violations_type_resolved` (type, resolved_at)

**Relations**:
- N:1 with `users`

**Violation Thresholds**:
- 3 LOW → warning
- 2 MEDIUM → 7-day suspension
- 1 HIGH → 30-day suspension
- 2 HIGH → permanent ban

---

### 11. disputes

**Purpose**: Booking dispute tracking and resolution

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Dispute ID |
| booking_id | UUID | FOREIGN KEY, UNIQUE | Links to bookings (1:1) |
| initiator_id | UUID | FOREIGN KEY, NOT NULL | User who raised dispute |
| reason | TEXT | NOT NULL | Dispute explanation |
| evidence | JSONB | NULL | Array of evidence URLs |
| status | DisputeStatus | DEFAULT 'OPEN' | OPEN, INVESTIGATING, RESOLVED_REFUND, RESOLVED_RELEASE, ESCALATED, CLOSED |
| resolution | TEXT | NULL | Admin resolution notes |
| resolved_at | TIMESTAMP | NULL | Resolution timestamp |
| resolved_by | UUID | NULL | Admin user ID |
| created_at | TIMESTAMP | DEFAULT NOW() | Dispute creation |
| updated_at | TIMESTAMP | AUTO UPDATE | Last update |

**Indexes**:
- `idx_disputes_booking` (booking_id)
- `idx_disputes_status_created` (status, created_at ASC)
- `idx_disputes_initiator` (initiator_id)

**Relations**:
- 1:1 with `bookings`
- N:1 with `users` (as initiator)

**Dispute Window**:
- Can be raised within 7 days after event
- Payment held in escrow during investigation
- Average resolution time: 3-5 days

---

## Enums

### UserRole
- `CUSTOMER` - Regular platform users
- `VENDOR` - Food truck operators
- `ADMIN` - Platform administrators

### UserStatus
- `ACTIVE` - Normal account
- `SUSPENDED` - Temporarily restricted
- `BANNED` - Permanently banned
- `DELETED` - Soft deleted account

### VendorStatus
- `PENDING` - Application submitted
- `APPROVED` - Admin verified, can accept bookings
- `REJECTED` - Application rejected
- `SUSPENDED` - Temporarily suspended
- `DEACTIVATED` - Vendor chose to deactivate

### BookingStatus
- `PENDING` - Awaiting vendor response
- `ACCEPTED` - Vendor accepted, awaiting payment
- `PAYMENT_FAILED` - Payment authorization failed
- `CONFIRMED` - Payment authorized
- `COMPLETED` - Event occurred
- `CANCELLED` - Cancelled by customer or vendor
- `DISPUTED` - Dispute raised
- `REFUNDED` - Payment refunded

### PaymentStatus
- `PENDING` - Initial state
- `AUTHORIZED` - Funds held in escrow
- `CAPTURED` - Payment captured after event
- `RELEASED` - Transferred to vendor (7 days post-event)
- `REFUNDED` - Refund processed
- `FAILED` - Payment failed

---

## Migration History

| Migration | Date | Description |
|-----------|------|-------------|
| `20241204201100_init` | 2024-12-04 | Initial schema with all 11 entities |

---

## Data Integrity Rules

1. **Soft Deletes**: Users, vendors, documents, messages, reviews use `deleted_at`
2. **Cascading Deletes**: When user deleted → vendor profile deleted → documents deleted
3. **Restrict Deletes**: Cannot delete users with active bookings
4. **Foreign Key Constraints**: All relationships enforced at database level
5. **Unique Constraints**: Email, Stripe IDs, booking reviews (1 per booking)

## Performance Optimization

1. **Composite Indexes**: For common query patterns (user role + status, vendor cuisine + status)
2. **JSONB Columns**: For flexible menu items and evidence storage
3. **Partial Indexes**: On deleted_at for soft delete queries
4. **Timestamp Indexes**: For time-based queries (created_at, event_date)

## Security Considerations

1. **Password Hashing**: Bcrypt with cost factor 10
2. **Soft Deletes**: Preserve audit trail
3. **Foreign Key Constraints**: Prevent orphaned records
4. **Message Flagging**: Automatic content scanning
5. **Payment Escrow**: 7-day hold period

---

**Maintained by**: Dana_Database
**Schema Version**: 1.0.0
**Last Audit**: 2024-12-04
