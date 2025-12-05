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

---

## Statistics

- **Total Endpoints:** 58
- **Public Endpoints:** 14
- **Protected Endpoints:** 44
- **Admin-Only Endpoints:** 7
- **HTTP Methods:** GET (28), POST (24), PUT (6), PATCH (5), DELETE (2)

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

### 6. Payments (2 endpoints)
**Base Path:** `/api/payments`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/payments/authorize` | Required | Customer | Authorize payment |
| POST | `/api/payments/webhook` | Webhook | Stripe | Stripe webhook handler |

**Payment State Machine:**
```
PENDING → AUTHORIZED → CAPTURED → RELEASED
                      ↓
                   REFUNDED
```

---

### 7. Messages (3 endpoints)
**Base Path:** `/api/messages`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/messages` | Required | Customer/Vendor | List messages |
| POST | `/api/messages` | Required | Customer/Vendor | Send message |
| POST | `/api/messages/{messageId}/flag` | Required | Customer/Vendor | Flag message |

**Anti-Circumvention Features:**
- Real-time content filtering (phone, email detection)
- Automatic violation tracking
- Progressive penalties (warning → suspension → ban)

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

### 9. Admin (7 endpoints)
**Base Path:** `/api/admin`

| Method | Endpoint | Auth | Role | Description | Status |
|--------|----------|------|------|-------------|--------|
| GET | `/api/admin/vendors/pending` | Required | Admin | List pending vendors | ✅ Implemented |
| POST | `/api/admin/vendors/{id}/approve` | Required | Admin | Approve vendor | ✅ Implemented |
| POST | `/api/admin/vendors/{id}/reject` | Required | Admin | Reject vendor | ✅ Implemented |
| GET | `/api/admin/disputes` | Required | Admin | List disputes | Pending |
| POST | `/api/admin/disputes/{disputeId}/resolve` | Required | Admin | Resolve dispute | Pending |
| GET | `/api/admin/violations` | Required | Admin | List violations | Pending |

---

## Implementation Status

| Domain | Endpoints | Status | Implemented By |
|--------|-----------|--------|----------------|
| Authentication | 6 | Complete | Blake_Backend (Task Fleet-Feast-igb) |
| Users | 2 | Pending | Blake_Backend |
| Vendors | 10/10 | ✅ Complete | Blake_Backend (Task Fleet-Feast-ok7), Ellis_Endpoints (Task Fleet-Feast-w6w) |
| Food Trucks | 3/3 | ✅ Complete | Ellis_Endpoints (Task Fleet-Feast-w6w) |
| Admin (Vendors) | 3/7 | Partial | Blake_Backend (Task Fleet-Feast-ok7) |
| Search | 1 (deprecated) | Replaced by Food Trucks API | Ellis_Endpoints |
| Bookings | 7/7 | ✅ Complete | Blake_Backend (Task Fleet-Feast-wu8) |
| Payments | 2 | Pending | Blake_Backend |
| Messages | 3 | Pending | Blake_Backend |
| Reviews | 7/7 | ✅ Complete | Ellis_Endpoints (Task Fleet-Feast-bj4) |
| Admin (Other) | 4/7 | Pending | Blake_Backend |

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

### Stripe Connect
**Endpoints Affected:**
- `POST /api/payments/authorize` - Create PaymentIntent
- `POST /api/payments/webhook` - Handle Stripe events
- `POST /api/admin/vendors/{vendorId}/approve` - Trigger Stripe onboarding

**Events Handled:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `transfer.created`
- `charge.dispute.created`
- `account.updated`

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

---

**Document Version:** 1.4
**Last Updated:** 2025-12-05
**Author:** Blake_Backend
**Next Review:** 2026-01-03
