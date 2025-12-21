# Fleet Feast API Registry

**Version:** 1.0
**Author:** Ellis_Endpoints
**Date:** 2025-12-03
**Status:** Complete

---

## Overview

This registry tracks all API endpoints in the Fleet Feast platform. It serves as a central reference for backend implementation, frontend consumption, and testing.

**Documentation Files:**
- **OpenAPI Spec:** `docs/api/openapi.yaml` - Complete API specification
- **API Design:** `docs/api/api-design.md` - Design patterns and standards
- **Error Codes:** `docs/api/error-codes.md` - Comprehensive error reference
- **User Guides:** `docs/user-guides/` - End-user documentation
  - `Customer_Guide.md` - Customer-facing documentation
  - `Vendor_Guide.md` - Vendor-facing documentation
  - `Admin_Guide.md` - Administrator documentation

---

## Statistics

- **Total Endpoints:** 92
- **Public Endpoints:** 14
- **Protected Endpoints:** 71
- **Admin-Only Endpoints:** 15
- **HTTP Methods:** GET (45), POST (37), PUT (16), PATCH (5), DELETE (2)

---

## API Domains

### 1. Authentication (6 endpoints)
**Base Path:** `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login user |
| POST | `/api/auth/logout` | Required | Logout user |
| POST | `/api/auth/verify-email` | Public | Verify email |
| POST | `/api/auth/reset-password` | Public | Request password reset |
| POST | `/api/auth/reset-password/confirm` | Public | Confirm password reset |

---

### 2. Users (2 endpoints)
**Base Path:** `/api/users`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users/me` | Required | Get current user |
| PATCH | `/api/users/me` | Required | Update current user |

---

### 3. Vendors (9 endpoints)
**Base Path:** `/api/vendor`

| Method | Endpoint | Auth | Role | Description | Status |
|--------|----------|------|------|-------------|--------|
| POST | `/api/vendor/apply` | Required | Vendor | Apply as vendor | ✅ Implemented |
| POST | `/api/vendor/documents` | Required | Vendor | Upload document | ✅ Implemented |
| GET | `/api/vendor/documents` | Required | Vendor | List own documents | ✅ Implemented |
| GET | `/api/vendor/profile` | Required | Vendor | Get own profile | ✅ Implemented |
| PUT | `/api/vendor/profile` | Required | Vendor | Update own profile | ✅ Implemented |
| GET | `/api/vendor/{id}/public` | Public | - | Get public vendor profile | ✅ Implemented |
| GET | `/api/vendor/menu` | Required | Vendor | Get own menu | ✅ Implemented |
| PUT | `/api/vendor/menu` | Required | Vendor | Update own menu | ✅ Implemented |
| GET | `/api/vendor/availability` | Required | Vendor | Get own availability | ✅ Implemented |
| POST | `/api/vendor/availability` | Required | Vendor | Set own availability | ✅ Implemented |

---

### 4. Food Trucks (3 endpoints)
**Base Path:** `/api/trucks`

| Method | Endpoint | Auth | Description | Status |
|--------|----------|------|-------------|--------|
| GET | `/api/trucks` | Public | List/search food trucks with filters | ✅ Implemented |
| GET | `/api/trucks/{id}` | Public | Get truck profile with menu, reviews, availability | ✅ Implemented |
| GET | `/api/trucks/{id}/availability` | Public | Check truck availability for a date | ✅ Implemented |

**Search Query Parameters:**
- `query` (string) - Full-text search (name, description, menu items)
- `cuisineType` (array) - Filter by cuisine (comma-separated)
- `priceRange` (array) - Filter by price (comma-separated)
- `capacityMin` (integer) - Minimum guest capacity
- `capacityMax` (integer) - Maximum guest capacity
- `minRating` (float) - Minimum average rating (1-5)
- `availableDate` (date) - Filter by availability date (YYYY-MM-DD)
- `lat`, `lng`, `radiusMiles` (float) - Location-based filtering
- `page` (integer) - Page number (default: 1)
- `limit` (integer) - Results per page (default: 20, max: 100)
- `sortBy` (string) - Sort by: relevance, rating, price (default: relevance)
- `sortOrder` (string) - Sort order: asc, desc (default: desc)

---

### 5. Search (DEPRECATED - Use `/api/trucks` instead)
**Base Path:** `/api/search`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/search/vendors` | Public | ⚠️ Deprecated - Use `/api/trucks` |

---

### 5. Bookings (7 endpoints)
**Base Path:** `/api/bookings`

| Method | Endpoint | Auth | Role | Description | Status |
|--------|----------|------|------|-------------|--------|
| GET | `/api/bookings` | Required | Customer/Vendor | List user bookings | ✅ Implemented |
| POST | `/api/bookings` | Required | Customer | Create booking | ✅ Implemented |
| GET | `/api/bookings/{id}` | Required | Customer/Vendor | Get booking details | ✅ Implemented |
| PUT | `/api/bookings/{id}` | Required | Customer | Update booking (PENDING only) | ✅ Implemented |
| PUT | `/api/bookings/{id}/accept` | Required | Vendor | Accept booking | ✅ Implemented |
| PUT | `/api/bookings/{id}/decline` | Required | Vendor | Decline booking | ✅ Implemented |
| DELETE | `/api/bookings/{id}` | Required | Customer/Vendor | Cancel booking | ✅ Implemented |

**Booking State Transitions:**
```
PENDING → ACCEPTED → CONFIRMED → COMPLETED
         ↓           ↓           ↓
      CANCELLED  CANCELLED  CANCELLED → REFUNDED
                              ↓
                          DISPUTED → REFUNDED
```

**Business Rules:**
- **Availability Check:** Vendor must be available on event date
- **Capacity Validation:** Guest count must be within vendor capacity range
- **48-Hour Response Window:** Vendor must accept/decline within 48 hours
- **Status Validation:** Only valid status transitions allowed
- **Cancellation Policy:**
  - 7+ days before event: 100% refund
  - 3-6 days before event: 50% refund
  - Under 3 days: No refund
- **Platform Commission:** 15% fee on all bookings
- **Authorization:** Users can only view/manage their own bookings

---

### 6. Payments (8 endpoints)
**Base Path:** `/api/payments`

| Method | Endpoint | Auth | Role | Description | Status |
|--------|----------|------|------|-------------|--------|
| POST | `/api/payments` | Required | Customer | Create payment intent | ✅ Implemented |
| GET | `/api/payments/{id}` | Required | Customer/Vendor | Get payment details | ✅ Implemented |
| POST | `/api/payments/{id}/refund` | Required | Customer/Admin | Process refund | ✅ Implemented |
| POST | `/api/payments/webhook` | Webhook | Helcim | Helcim webhook handler | ✅ Implemented |
| POST | `/api/payments/connect/onboard` | Required | Vendor | Create Stripe Connect onboarding link | ✅ Implemented |
| GET | `/api/vendor/payouts` | Required | Vendor | List vendor payouts | ✅ Implemented |
| GET | `/api/vendor/payouts/{id}` | Required | Vendor | Get payout details | ✅ Implemented |
| POST | `/api/vendor/payouts` | Required | Vendor | Request early payout (placeholder) | ⏳ Pending |

**Payment State Machine:**
```
PENDING → AUTHORIZED → CAPTURED → RELEASED
         ↓           ↓           ↓
      FAILED     REFUNDED    REFUNDED
```

**Helcim Payment Integration:**
- Card payment processing with pre-authorization
- Webhook signature verification via HMAC SHA-256
- Idempotency handling for duplicate webhooks
- Support for payment authorization, capture, refund, and void operations
- Application fee for platform commission (15%)
- Manual capture for escrow control

**Escrow System:**
- Payment authorized when booking is ACCEPTED
- Funds held (manual capture) until event completion
- Payment captured 7 days after event date
- Automatic release to vendor after escrow hold period
- Cancellation refunds processed immediately based on policy

**Refund Policy:**
- 7+ days before event: 100% refund
- 3-6 days before event: 50% refund
- Under 3 days: 0% refund
- Partial refunds supported for disputes

**Webhook Events Handled:**
- `APPROVED` - Payment approved/authorized, update status to AUTHORIZED
- `DECLINED` - Payment declined/failed, update status to FAILED
- `REFUNDED` - Payment refunded, update status to REFUNDED
- Unknown events logged and acknowledged (returns 200 to prevent retries)

**Webhook Security:**
- HMAC signature verification using webhook secret
- 401 Unauthorized for invalid signatures
- 200 OK response for all valid webhooks (prevents unnecessary retries)
- Idempotency checks prevent duplicate processing
- Raw body parsing required for signature verification

---

### 7. Messages (4 endpoints)
**Base Path:** `/api/messages`

| Method | Endpoint | Auth | Role | Description | Status |
|--------|----------|------|------|-------------|--------|
| POST | `/api/messages` | Required | Customer/Vendor | Send message in booking conversation | ✅ Implemented |
| GET | `/api/messages` | Required | Customer/Vendor | Get inbox (all conversations) | ✅ Implemented |
| GET | `/api/messages/{bookingId}` | Required | Customer/Vendor | Get conversation for booking | ✅ Implemented |
| PUT | `/api/messages/{bookingId}/read` | Required | Customer/Vendor | Mark all messages in booking as read | ✅ Implemented |

**Anti-Circumvention Features:**
- Real-time content scanning for contact information (phone, email, social media)
- Automatic flagging of suspicious messages (still delivered)
- Violation tracking with severity levels (LOW, MEDIUM, HIGH)
- Pattern detection for:
  - Phone numbers (various formats, including obfuscated)
  - Email addresses (including obfuscated like "user [at] domain [dot] com")
  - Social media handles (@username)
  - Social platform mentions (Instagram, Facebook, WhatsApp, etc.)
  - Coded language ("call me", "text me", "off platform")
  - External URLs (non-FleetFeast domains)

**Message Scoping:**
- Messages are scoped to bookings only
- Both customer and vendor can send messages
- Messaging allowed for statuses: PENDING, ACCEPTED, CONFIRMED, COMPLETED
- Message history preserved for dispute resolution
- Flagged messages still delivered (trust + verify approach)

**Inbox Features:**
- Paginated conversation list
- Last message preview
- Unread count per conversation (TODO: implement read tracking)
- Sorted by most recent message first
- Booking context included (event date, type, status, parties)

---

### 8. Reviews (7 endpoints)
**Base Path:** `/api/reviews`

| Method | Endpoint | Auth | Role | Description | Status |
|--------|----------|------|------|-------------|--------|
| POST | `/api/reviews` | Required | Customer/Vendor | Submit review for completed booking | ✅ Implemented |
| GET | `/api/reviews/{id}` | Public | - | Get single review with context | ✅ Implemented |
| PUT | `/api/reviews/{id}` | Required | Owner | Update own review (within 7 days) | ✅ Implemented |
| DELETE | `/api/reviews/{id}` | Required | Owner | Soft delete own review | ✅ Implemented |
| GET | `/api/reviews/vendor/{vendorId}` | Public | - | List vendor's reviews with aggregates | ✅ Implemented |
| GET | `/api/reviews/user/{userId}` | Public | - | List user's reviews (as reviewer) | ✅ Implemented |
| GET | `/api/reviews/vendor/{vendorId}/rating` | Public | - | Get vendor rating aggregate | ✅ Via vendor endpoint |

**Review Rules:**
- Only allowed for COMPLETED bookings
- Each party can submit ONE review per booking
- 7-day edit window for modifications
- Bidirectional (customer ↔ vendor)
- Rating: 1-5 stars (required)
- Content: Optional but encouraged
- Email masking in public display (e.g., j***@example.com)
- Soft delete (deletedAt timestamp)
- Hidden reviews excluded from aggregates

**Aggregate Calculations:**
- Average rating per vendor
- Total review count
- Rating breakdown (1-5 star distribution)
- Updated automatically on create/update/delete

---

### 9. Quotes (6 endpoints)
**Base Path:** `/api/quotes`

| Method | Endpoint | Auth | Role | Description | Status |
|--------|----------|------|------|-------------|--------|
| POST | `/api/quotes/request` | Required | Customer | Create quote request (RFQ) | ✅ Implemented |
| GET | `/api/quotes/requests` | Required | Customer | List customer's quote requests | ✅ Implemented |
| GET | `/api/quotes/requests/:id` | Required | Customer | Get quote request with all quotes | ✅ Implemented |
| GET | `/api/quotes/vendor` | Required | Vendor | List vendor's received RFQs | ✅ Implemented |
| POST | `/api/quotes/:requestId/submit` | Required | Vendor | Submit quote for RFQ | ✅ Implemented |
| PUT | `/api/quotes/:id/accept` | Required | Customer | Accept quote and create booking | ✅ Implemented |

**Quote Request Flow:**
```
Customer creates RFQ → Vendors notified → Vendors submit quotes → Customer compares → Customer accepts quote → Booking created
```

**Quote Pricing Structure:**
```json
{
  "basePrice": 500.00,
  "perPersonPrice": 25.00,
  "additionalFees": [
    { "name": "Setup Fee", "amount": 100.00 },
    { "name": "Travel Fee", "amount": 50.00 }
  ],
  "total": 650.00
}
```

**Business Rules:**
- **Customer RFQ Creation:**
  - Can select 1-10 vendors to request quotes from
  - Must provide event details, requirements, and optional budget
  - Default quote deadline: 7 days from request
- **Vendor Quote Submission:**
  - Only invited vendors can submit quotes
  - Must include pricing breakdown, inclusions, and validity period
  - Can only submit before RFQ expiry date
  - One quote per vendor per request
- **Quote Acceptance:**
  - Creates PENDING booking automatically
  - Requires event time (not included in RFQ)
  - Marks quote request as ACCEPTED
  - Rejects other submitted quotes
  - 15% platform commission applied
- **Quote Expiry:**
  - RFQ expires after customer-defined deadline (default 7 days)
  - Individual quotes expire based on vendor-defined validity
  - Expired quotes cannot be accepted

**Quote Statuses:**
- `PENDING` - RFQ sent, vendor hasn't responded
- `SUBMITTED` - Vendor submitted quote
- `ACCEPTED` - Customer accepted quote (booking created)
- `REJECTED` - Customer chose a different quote
- `EXPIRED` - Quote validity period expired
- `WITHDRAWN` - Vendor withdrew the quote

**Quote Request Statuses:**
- `OPEN` - Awaiting vendor quotes
- `CLOSED` - No longer accepting quotes (manually closed)
- `ACCEPTED` - Customer accepted a quote

---

### 10. Disputes (6 endpoints)
**Base Path:** `/api/disputes`

| Method | Endpoint | Auth | Role | Description | Status |
|--------|----------|------|------|-------------|--------|
| POST | `/api/disputes` | Required | Customer/Vendor | Create dispute for completed booking | ✅ Implemented |
| GET | `/api/disputes` | Required | Customer/Vendor | List user's disputes with filters | ✅ Implemented |
| GET | `/api/disputes/{id}` | Required | Customer/Vendor/Admin | Get dispute details | ✅ Implemented |
| PUT | `/api/disputes/{id}` | Required | Customer | Update dispute (limited) | ✅ Implemented |

**Dispute Types:**
- `NO_SHOW` - Vendor didn't arrive at event
- `LATE_ARRIVAL` - Vendor arrived late (metadata: lateMinutes)
- `SERVICE_QUALITY` - Poor service quality
- `WRONG_ORDER` - Incorrect menu items delivered
- `FOOD_QUALITY` - Poor food quality
- `OTHER` - Other issues

**Dispute Status Flow:**
```
OPEN → INVESTIGATING → RESOLVED_REFUND
     ↘               ↗ RESOLVED_RELEASE
      → ESCALATED →   CLOSED
```

**Auto-Resolution Rules:**
- **NO_SHOW**: Automatic 100% refund
- **LATE_ARRIVAL**:
  - 60+ minutes late: 50% refund
  - 30-59 minutes late: 25% refund
  - <30 minutes: Manual review required
- **SERVICE_QUALITY**: Always requires manual review
- **WRONG_ORDER**: Manual review required
- **FOOD_QUALITY**: Manual review required
- **OTHER**: Manual review required

**Business Rules:**
- Only COMPLETED bookings can be disputed
- 7-day window from event completion
- Funds held during dispute (payment stays CAPTURED)
- Resolution outcomes: FULL_REFUND, PARTIAL_REFUND, NO_REFUND, CANCELLED
- Auto-resolution applied when eligible
- Manual escalation for subjective disputes

---

### 11. Loyalty (1 endpoint)
**Base Path:** `/api/loyalty`

| Method | Endpoint | Auth | Role | Description | Status |
|--------|----------|------|------|-------------|--------|
| GET | `/api/loyalty/check?vendorId={vendorId}` | Required | Customer | Check loyalty discount eligibility | ✅ Implemented |

**Loyalty Discount System:**
- **5% discount** on 2nd+ booking with same vendor
- Platform absorbs cost by reducing commission from **15% → 10%**
- Vendor payout remains unchanged
- Discount automatically applied at booking creation
- Eligibility based on COMPLETED booking history

**Example Response:**
```json
{
  "eligible": true,
  "message": "You qualify for a 5% loyalty discount! You've completed 2 booking(s) with this vendor.",
  "previousBookings": 2,
  "discountPercent": 5
}
```

**Pricing Calculation (with loyalty):**
```
Base Amount: $1000
Discount (5%): -$50
Total Amount: $950 (customer pays)
Commission (10%): $95 (platform earns)
Vendor Payout: $855 (vendor receives)
```

**Business Rules:**
- Only customers can check loyalty status
- Eligibility requires at least 1 COMPLETED booking with vendor
- Discount applied automatically during booking creation
- Commission rate reduced for loyalty bookings (15% → 10%)
- Vendor payout increased despite lower customer payment

**Updated Booking Fields:**
- `discountAmount` (decimal) - Amount discounted from base price
- `loyaltyApplied` (boolean) - Whether loyalty discount was applied
- Booking responses now include loyalty information

---

### 12. Notifications (5 endpoints)
**Base Path:** `/api/notifications`

| Method | Endpoint | Auth | Role | Description | Status |
|--------|----------|------|------|-------------|--------|
| GET | `/api/notifications` | Required | All | Get user's notifications with pagination | ✅ Implemented |
| PUT | `/api/notifications/{id}/read` | Required | All | Mark notification as read | ✅ Implemented |
| PUT | `/api/notifications/read-all` | Required | All | Mark all notifications as read | ✅ Implemented |
| GET | `/api/notifications/preferences` | Required | All | Get notification preferences | ✅ Implemented |
| PUT | `/api/notifications/preferences` | Required | All | Update notification preferences | ✅ Implemented |

**Notification Types:**
- `BOOKING_REQUEST` - Vendor: New booking request received
- `BOOKING_ACCEPTED` - Customer: Booking was accepted
- `BOOKING_DECLINED` - Customer: Booking was declined
- `BOOKING_CANCELLED` - Both: Booking was cancelled
- `PAYMENT_CONFIRMED` - Both: Payment was successful
- `NEW_MESSAGE` - Both: New message in booking conversation
- `EVENT_REMINDER` - Both: Event happening in 24 hours
- `REVIEW_PROMPT` - Both: Time to leave a review (7 days after event)
- `DISPUTE_CREATED` - Both: Dispute was created
- `DISPUTE_RESOLVED` - Both: Dispute was resolved
- `VIOLATION_WARNING` - User: Received a violation warning
- `ACCOUNT_STATUS_CHANGED` - User: Account status changed

**Features:**
- In-app notifications stored in database
- Email notifications via SendGrid
- User preferences per notification type
- Email digest mode (daily summary)
- Auto-creation from booking/payment/message events
- Pagination support (limit, offset)
- Unread count tracking
- Mark as read (individual or all)

**Email Templates:**
- Responsive HTML templates for all notification types
- Brand-consistent design with Fleet Feast styling
- Dynamic content based on notification metadata
- Platform links for quick action
- Configurable sender (FROM_EMAIL, FROM_NAME)

**Query Parameters (GET /api/notifications):**
- `limit` (integer) - Notifications per page (default: 20, max: 100)
- `offset` (integer) - Pagination offset (default: 0)
- `unreadOnly` (boolean) - Filter to unread only (default: false)

**Notification Preferences:**
- Individual toggles for each notification type
- Email digest mode (daily summary instead of immediate)
- In-app notifications always enabled
- Default: all email notifications ON

---

### 13. Violations (2 endpoints)
**Base Path:** `/api/violations`

| Method | Endpoint | Auth | Role | Description | Status |
|--------|----------|------|------|-------------|--------|
| POST | `/api/violations` | Required | Admin | Create violation manually | ✅ Implemented |
| GET | `/api/violations/user/{userId}` | Required | User/Admin | Get user's violation summary | ✅ Implemented |

**Violation Types:**
- `CONTACT_INFO_SHARING` - Sharing phone/email in messages
- `CIRCUMVENTION_ATTEMPT` - Attempting to bypass platform
- `HARASSMENT` - Abusive messages
- `SPAM` - Unsolicited messages
- `FRAUD` - Fraudulent activity
- `OTHER` - Other policy violations

**Penalty Progression:**
- **1 point**: Warning (account remains active)
- **3 points**: Restricted (7-day restriction on new bookings)
- **5 points**: Suspended (30-day account suspension)
- **8+ points**: Banned (permanent account closure)

**Features:**
- Automatic violation creation from messaging circumvention flags
- Points accumulate over rolling 365-day period
- Account status automatically updated based on penalty thresholds
- Temporary penalties (restricted/suspended) with automatic expiry
- Appeal system for disputed violations

---

### 13. Admin (15 endpoints)
**Base Path:** `/api/admin`

| Method | Endpoint | Auth | Role | Description | Status |
|--------|----------|------|------|-------------|--------|
| GET | `/api/admin/vendors/pending` | Required | Admin | List pending vendors | ✅ Implemented |
| POST | `/api/admin/vendors/{id}/approve` | Required | Admin | Approve vendor | ✅ Implemented |
| POST | `/api/admin/vendors/{id}/reject` | Required | Admin | Reject vendor | ✅ Implemented |
| GET | `/api/admin/disputes` | Required | Admin | List all disputes with filters | ✅ Implemented |
| GET | `/api/admin/disputes/{id}` | Required | Admin | Get dispute details | ✅ Implemented |
| PUT | `/api/admin/disputes/{id}` | Required | Admin | Update dispute status | ✅ Implemented |
| POST | `/api/admin/disputes/{id}/resolve` | Required | Admin | Resolve dispute with outcome | ✅ Implemented |
| GET | `/api/admin/violations` | Required | Admin | List all violations with filters | ✅ Implemented |
| GET | `/api/admin/violations/{id}` | Required | Admin | Get violation details | ✅ Implemented |
| PUT | `/api/admin/violations/{id}` | Required | Admin | Update violation notes | ✅ Implemented |
| POST | `/api/admin/violations/{id}/appeal` | Required | Admin | Handle violation appeal | ✅ Implemented |
| PUT | `/api/admin/users/{id}/status` | Required | Admin | Update user account status | ✅ Implemented |

**Admin Dispute Actions:**
- Update dispute status (OPEN → INVESTIGATING → ESCALATED)
- Apply auto-resolution rules (PUT with `autoResolve: true`)
- Manual resolution with custom refund percentage
- View dispute statistics and trends

**Admin Violation Management:**
- List all violations with filters (type, severity, user, date range)
- View detailed violation information
- Handle violation appeals (approve/reject)
- Manual account status updates (warning, restriction, suspension, ban)
- Audit trail for all admin actions

**Appeal Process:**
- Users can appeal violations via support
- Admin reviews evidence and makes decision
- Approved appeals remove violation from point calculation
- Account status automatically recalculated on appeal approval
- Full audit trail with admin notes

---

## Implementation Status

| Domain | Endpoints | Status | Implemented By |
|--------|-----------|--------|----------------|
| Authentication | 6 | Complete | Blake_Backend (Task Fleet-Feast-igb) |
| Users | 2 | Pending | Blake_Backend |
| Vendors | 10/10 | ✅ Complete | Blake_Backend (Task Fleet-Feast-ok7), Ellis_Endpoints (Task Fleet-Feast-w6w) |
| Food Trucks | 3/3 | ✅ Complete | Ellis_Endpoints (Task Fleet-Feast-w6w) |
| Search | 1 (deprecated) | Replaced by Food Trucks API | Ellis_Endpoints |
| Bookings | 7/7 | ✅ Complete | Blake_Backend (Task Fleet-Feast-wu8, Fleet-Feast-4tc) |
| Quotes | 6/6 | ✅ Complete | Ellis_Endpoints (Task Fleet-Feast-4h6) |
| Payments | 7/8 | ✅ Complete | Blake_Backend (Task Fleet-Feast-5cl) |
| Loyalty | 1/1 | ✅ Complete | Blake_Backend (Task Fleet-Feast-4tc) |
| Messages | 4/4 | ✅ Complete | Blake_Backend (Task Fleet-Feast-2f0) |
| Reviews | 7/7 | ✅ Complete | Ellis_Endpoints (Task Fleet-Feast-bj4) |
| Disputes | 4/4 | ✅ Complete | Blake_Backend (Task Fleet-Feast-32i) |
| Notifications | 5/5 | ✅ Complete | Jordan_Junction (Task Fleet-Feast-zft) |
| Violations | 2/2 | ✅ Complete | Blake_Backend (Task Fleet-Feast-9xc) |
| Admin | 12/15 | ✅ Partial | Blake_Backend (Vendors, Disputes, Violations) |

---

## Authentication & Authorization

### Authentication Methods
- **JWT Tokens:** Signed with HS256, 7-day expiry
- **HTTP-Only Cookies:** Secure, SameSite=Strict
- **Session Storage:** Redis (30-day TTL)

### Role-Based Access Control (RBAC)

| Role | Capabilities |
|------|--------------|
| **CUSTOMER** | Search vendors, create bookings, send messages, leave reviews |
| **VENDOR** | Accept/decline bookings, manage profile/menu/availability, send messages |
| **ADMIN** | Approve vendors, resolve disputes, view all resources |

### Protected Endpoint Pattern
```typescript
// middleware.ts checks:
// 1. JWT token presence
// 2. Token signature validity
// 3. Session exists in Redis
// 4. User role matches route requirements
```

---

## Rate Limiting

| User Type | Limit | Window |
|-----------|-------|--------|
| Authenticated | 100 requests | 1 minute |
| Unauthenticated | 20 requests | 1 minute |

**Implementation:** Redis-based with sliding window
**Headers:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## Pagination

**Pattern:** Cursor-based pagination
**Default Limit:** 20 items
**Max Limit:** 100 items

**Query Parameters:**
- `cursor` (string) - Opaque cursor for next page
- `limit` (integer) - Items per page

**Response Format:**
```json
{
  "data": {
    "items": [...],
    "pagination": {
      "nextCursor": "eyJpZCI6ImFiYzEyMyJ9",
      "prevCursor": null,
      "hasMore": true,
      "totalCount": 150
    }
  }
}
```

---

## Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...}
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {...}
  }
}
```

---

## Caching Strategy

| Resource | Location | TTL | Invalidation |
|----------|----------|-----|--------------|
| Vendor Profiles | Redis | 5 min | On profile update |
| Search Results | Redis | 5 min | On vendor approval |
| Menu Data | Redis | 15 min | On menu update |
| Availability | Redis | 1 min | On availability update |

**Cache Key Pattern:**
```
vendor:profile:{vendorId}
search:vendors:{hash(queryParams)}
vendor:menu:{vendorId}
vendor:availability:{vendorId}:{date}
```

---

## Error Codes

**Total Error Codes:** 60+
**Categories:** Auth, Authorization, Validation, User, Vendor, Booking, Payment, Message, Review, Admin, Rate Limiting, Server

**Complete Reference:** See `docs/api/error-codes.md`

**Most Common:**
- `UNAUTHORIZED` (401) - Authentication required
- `FORBIDDEN` (403) - Insufficient permissions
- `VALIDATION_ERROR` (400) - Invalid input
- `NOT_FOUND` (404) - Resource not found
- `CONFLICT` (409) - Duplicate resource or invalid state
- `RATE_LIMIT_EXCEEDED` (429) - Too many requests

---

## Performance Targets

| Metric | Target |
|--------|--------|
| API p95 response time | < 500ms |
| Search results | < 1 second |
| Database query time | < 100ms (p95) |
| Cache hit rate | > 70% |
| Uptime | 99.9% |

---

## External Integrations

### Helcim Payments
**Endpoints Affected:**
- `POST /api/payments` - Create payment pre-authorization
- `POST /api/payments/webhook` - Handle Helcim webhook events
- `POST /api/payments/{id}/refund` - Process refunds via Helcim API

**Webhook Events Handled:**
- `APPROVED` - Payment successfully authorized
- `DECLINED` - Payment authorization failed
- `REFUNDED` - Payment refunded to customer

**Integration Details:**
- REST API integration (no official SDK)
- HMAC SHA-256 webhook signature verification
- Pre-authorization for escrow control
- Card tokenization via HelcimPay.js on frontend
- Server-side processing with API tokens

### SendGrid Email
**Triggered By:**
- User registration (verification email)
- Booking creation (notification to vendor)
- Booking acceptance (notification to customer)
- Payment receipt (notification to customer)
- Vendor approval (notification to vendor)
- Dispute resolution (notification to both parties)

---

## Testing Requirements

### Unit Tests (Vitest)
- All service layer functions
- Request validation schemas
- Error handling logic
- Business logic (fee calculation, refund logic)

### Integration Tests (Playwright)
- Complete booking flow
- Vendor onboarding flow
- Message anti-circumvention
- Payment escrow release

### Load Tests (k6)
- Sustained throughput: 100 req/s
- Peak load: 500 req/s
- Search endpoint performance
- Database connection pooling

---

## Next Steps

1. **Blake_Backend (Task 2.2):** Implement API routes and service layer
2. **Quinn_QA (Task 4.1):** Write comprehensive API tests
3. **Logan_Load (Task 5.2):** Perform load testing and optimization
4. **Drew_Docs (Task 6.1):** Generate API documentation from OpenAPI spec

---

## Change Log

### Version 2.2 - 2025-12-20 (Ellis_Endpoints)
- **Rebuilt Helcim Webhook Handler** (Task Fleet-Feast-zt6)
  - Rebuilt `/api/payments/webhook` for Helcim integration
  - Implemented HMAC SHA-256 signature verification using `verifyWebhook` from `lib/helcim.ts`
  - Event handlers for all payment events:
    - `APPROVED` - Updates Payment to AUTHORIZED with timestamp
    - `DECLINED` - Updates Payment to FAILED
    - `REFUNDED` - Updates Payment to REFUNDED with timestamp
  - Idempotency handling using `externalPaymentId` to prevent duplicate processing
  - Security features:
    - Raw body parsing for signature verification
    - 401 Unauthorized for invalid signatures
    - 200 OK for all processed events (prevents unnecessary retries)
    - Comprehensive error logging
  - Database integration:
    - Queries Payment by `externalPaymentId` (Helcim transaction ID)
    - Updates status and timestamps atomically
    - Includes booking context for logging
  - Graceful error handling:
    - Returns 200 even on processing errors to prevent webhook retries
    - Logs warnings for missing payments
    - Handles unknown event types
  - Added GET endpoint for webhook debugging/info
- Updated API Registry:
  - Changed webhook integration from Stripe to Helcim
  - Updated webhook event documentation
  - Updated external integrations section

### Version 1.9 - 2025-12-05 (Ellis_Endpoints)
- Implemented Quote Request System API (6 endpoints)
  - POST `/api/quotes/request` - Create quote request (RFQ)
  - GET `/api/quotes/requests` - List customer's quote requests
  - GET `/api/quotes/requests/:id` - Get quote request with all submitted quotes
  - GET `/api/quotes/vendor` - List vendor's received RFQs
  - POST `/api/quotes/:requestId/submit` - Vendor submits quote with pricing
  - PUT `/api/quotes/:id/accept` - Accept quote and create booking
- Features:
  - Multi-vendor RFQ system for complex events
  - Flexible pricing breakdown (base price, per-person pricing, additional fees)
  - Quote comparison with vendor ratings
  - Automatic booking creation when quote is accepted
  - Quote expiry management (RFQ deadline and individual quote validity)
  - One quote per vendor per request enforcement
  - Status tracking for quotes and requests
  - Authorization checks (customers create RFQs, vendors submit quotes)
- Created quote module with:
  - Type definitions for quote requests, quotes, and pricing structures
  - Zod validation schemas with pricing calculation validation
  - Service layer with transaction handling for quote acceptance
  - Comprehensive error handling with QuoteError class
- Updated Prisma schema:
  - Added QuoteRequest model with event details and requirements
  - Added Quote model with JSON pricing, inclusions array, and booking relation
  - Added QuoteRequestStatus enum (OPEN, CLOSED, ACCEPTED)
  - Added QuoteStatus enum (PENDING, SUBMITTED, ACCEPTED, REJECTED, EXPIRED, WITHDRAWN)
  - Added relations to User and Booking models
- Business logic:
  - Default 7-day RFQ expiry
  - Default 14-day quote validity
  - Quote acceptance creates PENDING booking automatically
  - 15% platform commission applied on booking creation
  - Other quotes automatically rejected when one is accepted
  - Vendor ratings included in quote comparisons
- All endpoints follow service layer pattern with proper authorization
- Quote pricing validation ensures total matches base + fees

### Version 1.8 - 2025-12-05 (Blake_Backend)
- Implemented Violation & Penalty System API (8 endpoints)
  - POST `/api/violations` - Create violation manually (admin only)
  - GET `/api/violations/user/{userId}` - Get user's violation summary and history
  - GET `/api/admin/violations` - List all violations with filters
  - GET `/api/admin/violations/{id}` - Get violation details
  - PUT `/api/admin/violations/{id}` - Update violation notes
  - POST `/api/admin/violations/{id}/appeal` - Handle violation appeal decision
  - PUT `/api/admin/users/{id}/status` - Update user account status manually
- Features:
  - Automatic violation creation from messaging circumvention flags
  - Progressive penalty system based on point accumulation:
    - 1 point: Warning (account remains active)
    - 3 points: Restricted (7-day restriction on new bookings)
    - 5 points: Suspended (30-day account suspension)
    - 8+ points: Banned (permanent account closure)
  - Points calculated over rolling 365-day period
  - Account status automatically updated when violations occur
  - Temporary penalties (restricted/suspended) with automatic expiry
  - Appeal system for disputed violations
  - Appeal approval recalculates user status automatically
  - Full audit trail for all violations and admin actions
  - Violation types: contact sharing, circumvention, harassment, spam, fraud
  - Source tracking (messaging system, dispute system, manual report)
  - Admin filtering by type, severity, user, date range
- Created violation module with:
  - Type definitions for violations, penalties, and appeals
  - Penalty progression rules with configurable thresholds
  - Validation schemas for all endpoints
  - Service layer with automatic penalty calculation
  - Integration with messaging anti-circumvention system
- Updated Prisma schema:
  - Added statusExpiresAt to User model for temporary penalties
  - Added appeal fields to Violation model (appealed, appealDecision, appealNotes)
  - Added automated and source tracking fields
  - Added indexes for performance
- Updated messaging service to use violation service for auto-penalties
- All endpoints follow service layer pattern with proper authorization
- Comprehensive error handling with ViolationError class

### Version 1.7 - 2025-12-05 (Blake_Backend)
- Implemented Dispute Resolution System API (4 user + 4 admin endpoints)
  - POST `/api/disputes` - Create dispute for completed booking
  - GET `/api/disputes` - List user's disputes with filters
  - GET `/api/disputes/{id}` - Get dispute details
  - PUT `/api/disputes/{id}` - Update dispute (limited, customer-facing)
  - GET `/api/admin/disputes` - List all disputes with optional statistics
  - GET `/api/admin/disputes/{id}` - Get complete dispute details (admin)
  - PUT `/api/admin/disputes/{id}` - Update dispute status or auto-resolve
  - POST `/api/admin/disputes/{id}/resolve` - Resolve with specific outcome
- Features:
  - Only COMPLETED bookings within 7-day window can be disputed
  - Dispute types: NO_SHOW, LATE_ARRIVAL, SERVICE_QUALITY, WRONG_ORDER, FOOD_QUALITY, OTHER
  - Auto-resolution rules engine:
    - NO_SHOW: Automatic 100% refund
    - LATE_ARRIVAL: 50% refund (60+ min), 25% refund (30-59 min), manual review (<30 min)
    - All subjective disputes (SERVICE_QUALITY, FOOD_QUALITY, etc.): Manual review required
  - Funds held during dispute (payment remains CAPTURED)
  - Resolution outcomes: FULL_REFUND, PARTIAL_REFUND, NO_REFUND, CANCELLED
  - Admin can manually resolve with custom refund percentage
  - Dispute status workflow: OPEN → INVESTIGATING → ESCALATED → RESOLVED_REFUND/RESOLVED_RELEASE/CLOSED
  - Integration with payment service for refund processing
  - Booking status updated appropriately (DISPUTED → REFUNDED/COMPLETED)
  - Dispute statistics for admin dashboard
- Created dispute module with:
  - Type definitions for disputes, resolutions, and outcomes
  - Zod validation schemas with conditional logic
  - Auto-resolution rules engine with threshold-based logic
  - Service layer with transaction handling for fund management
  - Comprehensive error handling with DisputeError class
- All endpoints follow service layer pattern with proper authorization
- Auto-resolution can be triggered via API or applied during creation
- Dispute metadata stored as JSON for flexible data (e.g., lateMinutes)

### Version 1.6 - 2025-12-05 (Blake_Backend)
- Implemented Payment & Escrow System API (8 endpoints)
  - POST `/api/payments` - Create payment intent for booking
  - GET `/api/payments/{id}` - Get payment details
  - POST `/api/payments/{id}/refund` - Process refund with cancellation policy
  - POST `/api/payments/webhook` - Stripe webhook event handler
  - POST `/api/payments/connect/onboard` - Vendor Stripe Connect onboarding
  - GET `/api/vendor/payouts` - List vendor payouts
  - GET `/api/vendor/payouts/{id}` - Get single payout details
  - POST `/api/vendor/payouts` - Request early payout (placeholder)
- Features:
  - Stripe Connect marketplace integration with Express accounts
  - Payment intent creation with manual capture (escrow)
  - 15% platform commission via application fees
  - 7-day escrow hold after event completion
  - Automatic payment release after hold period
  - Refund processing with cancellation policy enforcement
  - Partial refund support for disputes
  - Vendor onboarding with account links
  - Webhook signature verification
  - Payment status tracking (PENDING → AUTHORIZED → CAPTURED → RELEASED)
  - Comprehensive error handling for Stripe API failures
  - Idempotency for payment operations
- Created payment module with types, validation, service layer, and Stripe client
- All endpoints follow service layer pattern with proper error handling
- Webhook handlers for all critical Stripe events
- Vendor payout tracking and reporting

### Version 1.5 - 2025-12-05 (Blake_Backend)
- Implemented Messaging System with Anti-Circumvention (4 endpoints)
  - POST `/api/messages` - Send message in booking conversation
  - GET `/api/messages` - Get inbox (all conversations with pagination)
  - GET `/api/messages/{bookingId}` - Get conversation for specific booking
  - PUT `/api/messages/{bookingId}/read` - Mark all messages in booking as read
- Features:
  - Booking-scoped messaging (only parties to booking can message)
  - Anti-circumvention pattern detection with real-time scanning:
    - Phone numbers (various formats including international and obfuscated)
    - Email addresses (including obfuscated like "user [at] domain [dot] com")
    - Social media handles (@username)
    - Social platform mentions (Instagram, Facebook, WhatsApp, Telegram, etc.)
    - Coded language suggesting off-platform contact
    - External URLs (non-FleetFeast domains)
  - Automatic violation tracking with severity levels (LOW, MEDIUM, HIGH)
  - Flagged messages still delivered (trust + verify approach)
  - Message history preserved for dispute resolution
  - Messaging allowed for statuses: PENDING, ACCEPTED, CONFIRMED, COMPLETED
  - Inbox with conversation previews and unread counts
  - Read receipt placeholder (TODO: implement full read tracking)
- Created messaging module with:
  - Type definitions for messages, conversations, and inbox items
  - Zod validation schemas for all endpoints
  - Anti-circumvention detection engine with 10+ pattern types
  - Service layer with booking access validation
  - Comprehensive error handling with MessagingError class
- Pattern detection includes:
  - US/International phone numbers in multiple formats
  - Email addresses with obfuscation detection
  - Social handles and platform mentions
  - Suspicious coded language
  - External URL detection with domain whitelisting
- All endpoints follow service layer pattern with proper authorization

### Version 1.4 - 2025-12-05 (Blake_Backend)
- Implemented Booking System API (7 endpoints)
  - POST `/api/bookings` - Create booking request
  - GET `/api/bookings` - List user's bookings (customer or vendor view)
  - GET `/api/bookings/{id}` - Get booking details
  - PUT `/api/bookings/{id}` - Update booking (PENDING status only)
  - PUT `/api/bookings/{id}/accept` - Vendor accepts booking
  - PUT `/api/bookings/{id}/decline` - Vendor declines booking
  - DELETE `/api/bookings/{id}` - Cancel booking
- Features:
  - Request-to-book flow with vendor availability checking
  - 48-hour vendor response window enforcement
  - Status transition validation (PENDING → ACCEPTED → CONFIRMED → COMPLETED)
  - Cancellation policy with refund calculation:
    - 7+ days before: 100% refund
    - 3-6 days before: 50% refund
    - Under 3 days: No refund
  - Platform commission calculation (15% fee)
  - Vendor capacity validation (guest count must be within min/max range)
  - Authorization checks (users can only view/manage own bookings)
  - Customer can update booking in PENDING status only
  - Vendor can accept/decline only within 48-hour window
- Created booking module with types, validation, and service layer
- All endpoints follow service layer pattern with proper error handling
- Comprehensive business logic for booking lifecycle management

### Version 1.3 - 2025-12-05 (Ellis_Endpoints)
- Implemented Review & Rating System API (7 endpoints)
  - POST `/api/reviews` - Submit review for completed booking
  - GET `/api/reviews/{id}` - Get single review with booking context
  - PUT `/api/reviews/{id}` - Update own review (within 7-day window)
  - DELETE `/api/reviews/{id}` - Soft delete own review
  - GET `/api/reviews/vendor/{vendorId}` - List vendor reviews with pagination
  - GET `/api/reviews/user/{userId}` - List user reviews (as reviewer)
  - Aggregate rating endpoint integrated into vendor listing
- Features:
  - Bidirectional reviews (customer ↔ vendor)
  - Tied to COMPLETED bookings only
  - Each party can submit ONE review per booking
  - Rating 1-5 stars (required), content optional
  - 7-day edit window after creation
  - Email masking in public display (j***@example.com)
  - Soft delete with deletedAt timestamp
  - Hidden reviews excluded from aggregates
  - Automatic aggregate rating calculation on create/update/delete
  - Rating breakdown by star level (1-5)
  - Pagination and filtering support
- Created reviews module with types, validation, and service layer
- All endpoints follow service layer pattern with proper error handling
- Review eligibility checks prevent duplicate/invalid reviews

### Version 1.2 - 2025-12-05 (Ellis_Endpoints)
- Implemented Food Truck Profiles & Search API (7 endpoints)
  - GET `/api/trucks` - List/search trucks with PostgreSQL full-text search
  - GET `/api/trucks/{id}` - Get truck details with menu, reviews, availability
  - GET `/api/trucks/{id}/availability` - Check truck availability for a date
  - GET `/api/vendor/menu` - Get vendor's own menu
  - PUT `/api/vendor/menu` - Update vendor's menu (upsert)
  - GET `/api/vendor/availability` - Get vendor's own availability calendar
  - POST `/api/vendor/availability` - Batch update vendor availability
- Features:
  - PostgreSQL full-text search on business name, description, AND menu items
  - Combined filters: cuisine, price, capacity, rating, availability, location
  - Location-based filtering with radius (Haversine distance calculation)
  - Pagination with offset/limit pattern
  - Sorting by relevance, rating, or price
  - Review aggregation (average rating, total reviews)
  - Email masking in public reviews
  - Excludes sensitive data (coordinates, stripe info) from public endpoints
- Created trucks module with types, validation, and service layer
- All endpoints follow service layer pattern with proper error handling

### Version 1.1 - 2025-12-05 (Blake_Backend)
- Implemented Vendor Application & Onboarding API (6 endpoints)
  - POST `/api/vendor/apply` - Vendor application submission
  - POST `/api/vendor/documents` - Document upload
  - GET `/api/vendor/documents` - List vendor documents
  - GET `/api/vendor/profile` - Get vendor profile
  - PUT `/api/vendor/profile` - Update vendor profile
  - GET `/api/vendor/{id}/public` - Public vendor profile
- Implemented Admin Vendor Approval API (3 endpoints)
  - GET `/api/admin/vendors/pending` - List pending applications
  - POST `/api/admin/vendors/{id}/approve` - Approve vendor
  - POST `/api/admin/vendors/{id}/reject` - Reject vendor
- Created vendor service layer with business logic
- Added Zod validation schemas for all vendor endpoints
- Implemented file upload placeholder for S3/Cloudinary integration

### Version 1.0 - 2025-12-03 (Ellis_Endpoints)
- Initial API design complete
- 52 endpoints defined across 9 domains
- OpenAPI 3.0 specification created
- Comprehensive error code system established
- Rate limiting strategy defined
- Cursor-based pagination pattern standardized
- RBAC enforcement documented

### Version 2.0 - 2025-12-05 (Jordan_Junction)
- Implemented Notification System API (5 endpoints)
  - GET `/api/notifications` - Get user's notifications with pagination
  - PUT `/api/notifications/{id}/read` - Mark notification as read
  - PUT `/api/notifications/read-all` - Mark all notifications as read
  - GET `/api/notifications/preferences` - Get notification preferences
  - PUT `/api/notifications/preferences` - Update notification preferences
- Features:
  - In-app notifications stored in PostgreSQL
  - Email notifications via SendGrid integration
  - 12 notification types covering all major events
  - User preferences with per-type email toggles
  - Email digest mode for daily summaries
  - Automatic notification creation from booking/payment/message services
  - Pagination with unreadOnly filter
  - Unread count tracking
  - Individual and bulk mark-as-read
- Email Templates:
  - Responsive HTML templates for all 12 notification types
  - Brand-consistent Fleet Feast styling
  - Dynamic content rendering with metadata
  - Platform action links
  - Configurable sender email and name
- Created notification module with:
  - Type definitions for notifications and preferences
  - Email service with SendGrid integration
  - Notification service with preference checking
  - 12 responsive email templates
  - Convenience functions for common notifications
  - Email preference mapping
- All endpoints follow service layer pattern with proper authorization
- Default notification preferences created on first access
- Email sending failures don't block notification creation

---

**Document Version:** 2.0
**Last Updated:** 2025-12-05
**Author:** Jordan_Junction
**Next Review:** 2026-01-03
