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

- **Total Endpoints:** 52
- **Public Endpoints:** 8
- **Protected Endpoints:** 44
- **Admin-Only Endpoints:** 7
- **HTTP Methods:** GET (21), POST (24), PATCH (5), PUT (1), DELETE (1)

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
| GET | `/api/vendor/{vendorId}/menu` | Public | - | Get vendor menu | Pending |
| PUT | `/api/vendor/{vendorId}/menu` | Required | Vendor | Update menu | Pending |
| GET | `/api/vendor/{vendorId}/availability` | Public | - | Get availability | Pending |
| POST | `/api/vendor/{vendorId}/availability` | Required | Vendor | Set availability | Pending |

---

### 4. Search (1 endpoint)
**Base Path:** `/api/search`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/search/vendors` | Public | Search food trucks |

**Query Parameters:**
- `query` (string) - Search term
- `cuisineType` (array) - Filter by cuisine
- `priceRange` (array) - Filter by price
- `minCapacity` (integer) - Minimum guest count
- `maxCapacity` (integer) - Maximum guest count
- `eventDate` (date) - Check availability
- `cursor` (string) - Pagination cursor
- `limit` (integer) - Results per page (default: 20, max: 100)

---

### 5. Bookings (7 endpoints)
**Base Path:** `/api/bookings`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/bookings` | Required | Customer/Vendor | List user bookings |
| POST | `/api/bookings` | Required | Customer | Create booking |
| GET | `/api/bookings/{bookingId}` | Required | Customer/Vendor | Get booking details |
| PATCH | `/api/bookings/{bookingId}` | Required | Customer/Vendor | Update booking |
| POST | `/api/bookings/{bookingId}/accept` | Required | Vendor | Accept booking |
| POST | `/api/bookings/{bookingId}/decline` | Required | Vendor | Decline booking |
| POST | `/api/bookings/{bookingId}/cancel` | Required | Customer/Vendor | Cancel booking |

**Booking State Transitions:**
```
PENDING → ACCEPTED → CONFIRMED → COMPLETED
         ↓           ↓
      DECLINED   CANCELLED → REFUNDED
```

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

### 8. Reviews (4 endpoints)
**Base Path:** `/api/reviews`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/reviews` | Public | - | List reviews |
| POST | `/api/reviews` | Required | Customer/Vendor | Create review |
| PATCH | `/api/reviews/{reviewId}` | Required | Owner | Update review |
| DELETE | `/api/reviews/{reviewId}` | Required | Owner | Delete review |

**Review Rules:**
- Only after booking completion (event date passed)
- 7-day edit window
- Bidirectional (customer ↔ vendor)
- Rating: 1-5 stars

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
| Vendors | 6/10 | In Progress | Blake_Backend (Task Fleet-Feast-ok7) |
| Admin (Vendors) | 3/7 | Partial | Blake_Backend (Task Fleet-Feast-ok7) |
| Search | 1 | Pending | Blake_Backend |
| Bookings | 7 | Pending | Blake_Backend |
| Payments | 2 | Pending | Blake_Backend |
| Messages | 3 | Pending | Blake_Backend |
| Reviews | 4 | Pending | Blake_Backend |
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

**Document Version:** 1.1
**Last Updated:** 2025-12-05
**Author:** Blake_Backend
**Next Review:** 2026-01-03
