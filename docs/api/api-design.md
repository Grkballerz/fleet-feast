# Fleet Feast API Design Document

**Version:** 1.0
**Author:** Ellis_Endpoints
**Date:** 2025-12-03
**Status:** Complete

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [API Architecture](#api-architecture)
3. [Endpoint Catalog](#endpoint-catalog)
4. [Design Patterns](#design-patterns)
5. [Authentication & Authorization](#authentication--authorization)
6. [Rate Limiting Strategy](#rate-limiting-strategy)
7. [Pagination Pattern](#pagination-pattern)
8. [Error Handling](#error-handling)
9. [Request Validation](#request-validation)
10. [Response Format](#response-format)
11. [Versioning Strategy](#versioning-strategy)
12. [Performance Optimization](#performance-optimization)
13. [Security Considerations](#security-considerations)
14. [Testing Approach](#testing-approach)
15. [Documentation Standards](#documentation-standards)

---

## Executive Summary

Fleet Feast's API is a RESTful interface designed for a food truck marketplace platform. The API follows REST principles with pragmatic RPC-style actions for complex state transitions. It serves three primary user roles (Customer, Vendor, Admin) with 50+ endpoints across 9 domains.

### Key Statistics

- **Total Endpoints:** 52 endpoints
- **Public Endpoints:** 8 (search, vendor profiles, auth)
- **Protected Endpoints:** 44 (require authentication)
- **Admin-Only Endpoints:** 7
- **Average Response Time Target:** < 500ms (p95)
- **Rate Limits:** 100/min (authenticated), 20/min (unauthenticated)

### Design Principles

1. **RESTful with Pragmatism:** Resource-oriented URLs with RPC-style actions where appropriate
2. **Security First:** RBAC enforcement, input validation, rate limiting on all endpoints
3. **Developer Experience:** Consistent response format, comprehensive error codes, cursor pagination
4. **Performance:** Aggressive caching (search results), efficient database queries, connection pooling
5. **Observability:** Request ID tracking, structured logging, performance metrics

---

## API Architecture

### Architectural Pattern: Modular Monolith with API Routes

```
┌─────────────────────────────────────────────────────┐
│                  Next.js API Routes                  │
│              (app/api/*/route.ts)                    │
├─────────────────────────────────────────────────────┤
│                  Middleware Layer                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │   Auth   │→ │   RBAC   │→ │   Rate   │         │
│  │  Check   │  │  Check   │  │  Limit   │         │
│  └──────────┘  └──────────┘  └──────────┘         │
├─────────────────────────────────────────────────────┤
│                   Service Layer                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │ Booking  │  │ Payment  │  │ Message  │         │
│  │ Service  │  │ Service  │  │ Service  │         │
│  └──────────┘  └──────────┘  └──────────┘         │
├─────────────────────────────────────────────────────┤
│                    Data Layer                        │
│  ┌──────────────┐           ┌──────────────┐       │
│  │ PostgreSQL   │           │    Redis     │       │
│  │ (via Prisma) │           │   (Cache)    │       │
│  └──────────────┘           └──────────────┘       │
└─────────────────────────────────────────────────────┘
```

### API Domain Organization

| Domain | Endpoints | Purpose |
|--------|-----------|---------|
| **Authentication** | 6 | User registration, login, logout, email verification, password reset |
| **Users** | 2 | User profile management |
| **Vendors** | 9 | Vendor application, profile, documents, menu, availability |
| **Search** | 1 | Food truck search with filters |
| **Bookings** | 7 | Booking CRUD, accept/decline, cancellation |
| **Payments** | 2 | Payment authorization, Stripe webhooks |
| **Messages** | 3 | In-app messaging, flagging |
| **Reviews** | 4 | Create, read, update, delete reviews |
| **Admin** | 8 | Vendor approval, dispute resolution, violation management |

---

## Endpoint Catalog

### Authentication Endpoints (Public)

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register new user account |
| POST | `/api/auth/login` | Public | Login and create session |
| POST | `/api/auth/logout` | Authenticated | Logout and invalidate session |
| POST | `/api/auth/verify-email` | Public | Verify email with token |
| POST | `/api/auth/reset-password` | Public | Request password reset email |
| POST | `/api/auth/reset-password/confirm` | Public | Confirm password reset with token |

### User Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/users/me` | Authenticated | Get current user profile |
| PATCH | `/api/users/me` | Authenticated | Update current user profile |

### Vendor Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/vendors` | Customer | Submit vendor application |
| GET | `/api/vendors/{vendorId}` | Public | Get vendor profile |
| PATCH | `/api/vendors/{vendorId}` | Vendor | Update own vendor profile |
| POST | `/api/vendors/{vendorId}/documents` | Vendor | Upload verification document |
| GET | `/api/vendors/{vendorId}/documents` | Vendor/Admin | List vendor documents |
| GET | `/api/vendors/{vendorId}/menu` | Public | Get vendor menu |
| PUT | `/api/vendors/{vendorId}/menu` | Vendor | Update vendor menu |
| GET | `/api/vendors/{vendorId}/availability` | Public | Get vendor availability |
| POST | `/api/vendors/{vendorId}/availability` | Vendor | Set vendor availability |

### Search Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/search/vendors` | Public | Search food trucks with filters |

### Booking Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/bookings` | Customer/Vendor | List user bookings |
| POST | `/api/bookings` | Customer | Create booking request |
| GET | `/api/bookings/{bookingId}` | Customer/Vendor | Get booking details |
| PATCH | `/api/bookings/{bookingId}` | Customer/Vendor | Update booking |
| POST | `/api/bookings/{bookingId}/accept` | Vendor | Accept booking request |
| POST | `/api/bookings/{bookingId}/decline` | Vendor | Decline booking request |
| POST | `/api/bookings/{bookingId}/cancel` | Customer/Vendor | Cancel booking |

### Payment Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/payments/authorize` | Customer | Authorize payment (Stripe) |
| POST | `/api/payments/webhook` | Stripe | Stripe webhook handler |

### Message Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/messages` | Customer/Vendor | List messages for booking |
| POST | `/api/messages` | Customer/Vendor | Send message |
| POST | `/api/messages/{messageId}/flag` | Customer/Vendor | Flag message for review |

### Review Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/reviews` | Public | List reviews for user |
| POST | `/api/reviews` | Customer/Vendor | Create review |
| PATCH | `/api/reviews/{reviewId}` | Customer/Vendor | Update own review |
| DELETE | `/api/reviews/{reviewId}` | Customer/Vendor | Delete own review |

### Admin Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/vendors/pending` | Admin | List pending vendor applications |
| POST | `/api/admin/vendors/{vendorId}/approve` | Admin | Approve vendor application |
| POST | `/api/admin/vendors/{vendorId}/reject` | Admin | Reject vendor application |
| GET | `/api/admin/disputes` | Admin | List disputes |
| POST | `/api/admin/disputes/{disputeId}/resolve` | Admin | Resolve dispute |
| GET | `/api/admin/violations` | Admin | List violations |

---

## Design Patterns

### 1. RESTful Resource Pattern

Standard CRUD operations follow RESTful conventions:

```
GET    /api/vendors           # List vendors
GET    /api/vendors/{id}      # Get vendor
POST   /api/vendors           # Create vendor
PATCH  /api/vendors/{id}      # Update vendor
DELETE /api/vendors/{id}      # Delete vendor
```

### 2. RPC-Style Action Pattern

Complex state transitions use RPC-style actions for clarity:

```
POST   /api/bookings/{id}/accept    # Vendor accepts booking
POST   /api/bookings/{id}/decline   # Vendor declines booking
POST   /api/bookings/{id}/cancel    # Cancel booking with refund logic
POST   /api/messages/{id}/flag      # Flag message for review
```

**Rationale:** Pure REST (`PATCH /api/bookings/{id}` with `status: ACCEPTED`) lacks intent clarity. RPC-style actions are self-documenting and map directly to business operations.

### 3. Nested Resource Pattern

Related resources use nested URLs:

```
POST   /api/vendors/{id}/documents       # Upload vendor document
GET    /api/vendors/{id}/availability    # Get vendor availability
PUT    /api/vendors/{id}/menu            # Update vendor menu
```

**Guideline:** Nest resources when they:
- Always belong to a parent resource
- Cannot exist independently
- Are frequently accessed together

### 4. Query Parameter Filtering

List endpoints use query parameters for filtering:

```
GET /api/bookings?status=PENDING,CONFIRMED&cursor=abc123&limit=20
GET /api/search/vendors?cuisineType=MEXICAN&priceRange=MODERATE&eventDate=2025-12-15
```

### 5. Webhook Pattern

External service webhooks use POST with signature verification:

```
POST   /api/payments/webhook      # Stripe webhook events
```

**Security:**
- Verify webhook signature (Stripe HMAC)
- Return 200 immediately, process async
- Idempotent processing (check event ID already processed)

---

## Authentication & Authorization

### Authentication Flow

1. **Login:** `POST /api/auth/login` returns JWT token in HTTP-only secure cookie
2. **Request:** Client sends cookie automatically on subsequent requests
3. **Middleware:** Extracts JWT from cookie, verifies signature, attaches user to request context
4. **Session Storage:** Redis stores session for revocation capability

### JWT Token Structure

```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "role": "CUSTOMER",
  "iat": 1701619200,
  "exp": 1702224000
}
```

**Token Expiry:** 7 days
**Refresh Strategy:** Silent refresh on every request (extend expiry if > 24 hours old)

### Role-Based Access Control (RBAC)

| Role | Access |
|------|--------|
| **CUSTOMER** | Search vendors, create bookings, send messages, leave reviews |
| **VENDOR** | Accept/decline bookings, manage profile/menu/availability, send messages, view payouts |
| **ADMIN** | Approve vendors, resolve disputes, view all bookings, manage violations |

### Middleware Chain

```typescript
// middleware.ts
export async function middleware(req: NextRequest) {
  // 1. Extract JWT from cookie
  const token = req.cookies.get('token');

  // 2. Verify token signature
  const payload = await verifyJWT(token);

  // 3. Check session in Redis (for revocation)
  const session = await redis.get(`session:${payload.userId}`);
  if (!session) return NextResponse.redirect('/login');

  // 4. RBAC check based on route
  if (req.nextUrl.pathname.startsWith('/api/admin')) {
    if (payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  // 5. Attach user to request context
  req.user = payload;
  return NextResponse.next();
}
```

### Protected Endpoint Annotation

All protected endpoints include `security: cookieAuth` in OpenAPI spec.

---

## Rate Limiting Strategy

### Rate Limits

| User Type | Limit | Window |
|-----------|-------|--------|
| **Authenticated Users** | 100 requests | 1 minute |
| **Unauthenticated Users** | 20 requests | 1 minute |

### Implementation (Redis)

```typescript
// Rate limit key: `ratelimit:{userId or IP}:{minute}`
async function checkRateLimit(identifier: string): Promise<boolean> {
  const key = `ratelimit:${identifier}:${Math.floor(Date.now() / 60000)}`;

  const current = await redis.incr(key);
  if (current === 1) {
    await redis.expire(key, 60); // 1 minute TTL
  }

  const limit = identifier.startsWith('ip:') ? 20 : 100;
  return current <= limit;
}
```

### Response Headers

All responses include rate limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1701619260
```

### 429 Response

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again in 45 seconds.",
    "details": {
      "retryAfter": 45
    }
  }
}
```

---

## Pagination Pattern

### Cursor-Based Pagination

All list endpoints use cursor-based pagination for performance:

```
GET /api/bookings?cursor=eyJpZCI6ImFiYzEyMyIsImNyZWF0ZWRBdCI6MTcwMTYxOTIwMH0&limit=20
```

**Cursor Format:** Base64-encoded JSON with last item's sort key:
```json
{"id": "abc123", "createdAt": 1701619200}
```

### Response Format

```json
{
  "success": true,
  "data": {
    "bookings": [...],
    "pagination": {
      "nextCursor": "eyJpZCI6ImRlZjQ1NiIsImNyZWF0ZWRBdCI6MTcwMTYxOTEwMH0",
      "prevCursor": null,
      "hasMore": true,
      "totalCount": 150
    }
  }
}
```

### Query Parameters

| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| `cursor` | string | null | - | Opaque cursor for next page |
| `limit` | integer | 20 | 100 | Number of items per page |

### Pagination Implementation

```typescript
async function paginateBookings(cursor: string | null, limit: number) {
  const decodedCursor = cursor ? JSON.parse(atob(cursor)) : null;

  const bookings = await prisma.booking.findMany({
    where: decodedCursor ? {
      createdAt: { lt: decodedCursor.createdAt }
    } : {},
    orderBy: { createdAt: 'desc' },
    take: limit + 1, // Fetch one extra to check hasMore
  });

  const hasMore = bookings.length > limit;
  const items = hasMore ? bookings.slice(0, limit) : bookings;

  const nextCursor = hasMore
    ? btoa(JSON.stringify({
        id: items[items.length - 1].id,
        createdAt: items[items.length - 1].createdAt.getTime(),
      }))
    : null;

  return { items, nextCursor, hasMore };
}
```

---

## Error Handling

### Standard Error Format

All errors follow consistent structure:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Guest count must be between 10 and 1000",
    "details": {
      "field": "guestCount",
      "value": 5,
      "constraint": "min: 10"
    }
  }
}
```

### HTTP Status Codes

| Status | Usage |
|--------|-------|
| **200 OK** | Successful GET, PATCH, DELETE |
| **201 Created** | Successful POST (resource created) |
| **400 Bad Request** | Validation error, invalid input |
| **401 Unauthorized** | Authentication required or invalid token |
| **403 Forbidden** | Insufficient permissions (RBAC) |
| **404 Not Found** | Resource does not exist |
| **409 Conflict** | Duplicate resource, invalid state transition |
| **429 Too Many Requests** | Rate limit exceeded |
| **500 Internal Server Error** | Unexpected server error |

### Error Code Categories

| Prefix | Category | Examples |
|--------|----------|----------|
| `AUTH_*` | Authentication | `AUTH_INVALID_TOKEN`, `AUTH_TOKEN_EXPIRED` |
| `VALIDATION_*` | Input Validation | `VALIDATION_ERROR`, `VALIDATION_EMAIL_INVALID` |
| `BOOKING_*` | Booking Logic | `BOOKING_ALREADY_ACCEPTED`, `BOOKING_VENDOR_UNAVAILABLE` |
| `PAYMENT_*` | Payment Logic | `PAYMENT_AUTHORIZATION_FAILED`, `PAYMENT_ALREADY_CAPTURED` |
| `MESSAGE_*` | Messaging | `MESSAGE_BLOCKED`, `MESSAGE_CONTAINS_CONTACT_INFO` |
| `ADMIN_*` | Admin Operations | `ADMIN_VENDOR_ALREADY_APPROVED`, `ADMIN_DISPUTE_RESOLVED` |

See `error-codes.md` for complete reference.

### Error Logging

All errors are logged with context:

```typescript
logger.error('Booking creation failed', {
  userId,
  vendorId,
  error: error.message,
  stack: error.stack,
  requestId: req.id,
});
```

---

## Request Validation

### Validation Library: Zod

All request bodies validated with Zod schemas:

```typescript
import { z } from 'zod';

const CreateBookingSchema = z.object({
  vendorId: z.string().uuid(),
  eventDate: z.string().datetime(),
  eventTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  eventType: z.enum(['CORPORATE', 'WEDDING', 'BIRTHDAY', 'FESTIVAL', 'PRIVATE_PARTY', 'OTHER']),
  location: z.string().min(10).max(500),
  guestCount: z.number().int().min(10).max(1000),
  specialRequests: z.string().max(1000).optional(),
  totalAmount: z.number().positive().min(100),
});

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Validate request body
  const result = CreateBookingSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request body',
        details: result.error.flatten(),
      }
    }, { status: 400 });
  }

  const validatedData = result.data;
  // Proceed with business logic...
}
```

### Validation Rules

| Field Type | Validation |
|------------|------------|
| **Email** | Regex + DNS check (optional) |
| **Password** | Min 8 chars, must include uppercase, lowercase, number |
| **UUID** | Valid UUID v4 format |
| **Date** | ISO 8601 format, future dates only for events |
| **Time** | HH:MM format (24-hour) |
| **Phone** | E.164 format (optional, for vendor business phone) |
| **Currency** | Positive decimal, max 2 decimal places |

---

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": "uuid",
    "status": "PENDING",
    "createdAt": "2025-12-03T15:30:00Z"
  }
}
```

### List Response

```json
{
  "success": true,
  "data": {
    "bookings": [...],
    "pagination": {
      "nextCursor": "eyJpZCI6ImFiYzEyMyJ9",
      "hasMore": true,
      "totalCount": 150
    }
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "BOOKING_VENDOR_UNAVAILABLE",
    "message": "Vendor is not available on selected date",
    "details": {
      "vendorId": "uuid",
      "requestedDate": "2025-12-25",
      "availableDates": ["2025-12-26", "2025-12-27"]
    }
  }
}
```

---

## Versioning Strategy

### Current Approach: No Versioning (v1)

Initial release uses unversioned endpoints:
```
GET /api/vendors
```

### Future Versioning Strategy

When breaking changes are required, introduce URL-based versioning:

```
GET /api/v2/vendors  # New version with breaking changes
GET /api/vendors     # Remains v1, eventually deprecated
```

**Versioning Triggers:**
- Breaking changes to request/response schema
- Removal of fields
- Change in authentication mechanism
- Major architectural refactor

**Deprecation Policy:**
- Announce deprecation 6 months in advance
- Support old version for minimum 12 months
- Include `Deprecation` header in responses:
  ```
  Deprecation: Sun, 01 Jun 2026 00:00:00 GMT
  Sunset: Sun, 01 Dec 2026 00:00:00 GMT
  ```

---

## Performance Optimization

### 1. Caching Strategy

| Resource | Cache Location | TTL | Invalidation |
|----------|---------------|-----|--------------|
| **Vendor Profiles** | Redis | 5 minutes | On profile update |
| **Search Results** | Redis | 5 minutes | On new vendor approval |
| **Menu Data** | Redis | 15 minutes | On menu update |
| **Availability** | Redis | 1 minute | On availability update |

**Cache Key Pattern:**
```
vendor:profile:{vendorId}
search:vendors:{hash(queryParams)}
vendor:menu:{vendorId}
vendor:availability:{vendorId}:{date}
```

### 2. Database Query Optimization

**N+1 Query Prevention:**
```typescript
// Bad: N+1 queries
const bookings = await prisma.booking.findMany();
for (const booking of bookings) {
  booking.vendor = await prisma.vendor.findUnique({ where: { id: booking.vendorId } });
}

// Good: Single query with include
const bookings = await prisma.booking.findMany({
  include: {
    vendor: true,
    customer: true,
    payment: true,
  }
});
```

**Index Usage:**
```sql
-- Vendor search query uses composite index
SELECT * FROM vendors
WHERE cuisine_type = 'MEXICAN'
  AND status = 'APPROVED'
  AND approved_at IS NOT NULL
ORDER BY approved_at DESC;

-- Index: idx_vendor_search (cuisine_type, status, approved_at)
```

### 3. Connection Pooling

**Prisma Connection Pool:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Connection pool configuration
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['query', 'error', 'warn'],
});

// Connection pool size: 10 (Vercel serverless default)
```

**PgBouncer for Serverless:**
- Pool mode: Transaction
- Max connections: 100
- Default pool size: 20

### 4. Response Compression

Enable gzip/brotli compression for all responses > 1KB:
```typescript
// Next.js automatically compresses responses
// Compression ratio: ~70-80% for JSON
```

---

## Security Considerations

### 1. Input Sanitization

**XSS Prevention:**
- React auto-escapes by default
- Use DOMPurify for user-generated HTML (reviews)
- CSP header restricts script sources

**SQL Injection Prevention:**
- Prisma uses parameterized queries
- Never use raw SQL string concatenation
- Use `$queryRaw` with tagged templates only

### 2. CSRF Protection

**NextAuth.js CSRF Tokens:**
- All state-changing requests (POST, PATCH, DELETE) require CSRF token
- Token included in form hidden field or `X-CSRF-Token` header
- Token validated on server before processing

### 3. Content Security Policy (CSP)

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https: blob:;
  connect-src 'self' https://api.stripe.com;
  frame-src https://js.stripe.com;
```

### 4. Sensitive Data Handling

**Never Log:**
- Passwords (plain or hashed)
- Credit card numbers
- Stripe API keys
- JWT tokens

**Encryption at Rest:**
- Passwords: bcrypt with cost factor 12
- Sensitive vendor documents: Application-level encryption (AES-256)

### 5. API Key Management

**Stripe API Keys:**
- Stored in environment variables
- Never committed to version control
- Different keys for dev/staging/production
- Restricted API key scopes (only required permissions)

---

## Testing Approach

### 1. Unit Tests (Vitest)

**Test Coverage:** 80% minimum

```typescript
describe('POST /api/bookings', () => {
  it('should create booking with valid data', async () => {
    const booking = await createBooking({
      vendorId: 'uuid',
      eventDate: '2025-12-25',
      guestCount: 50,
      totalAmount: 1000,
    });

    expect(booking.status).toBe('PENDING');
    expect(booking.totalAmount).toBe(1000);
  });

  it('should reject booking with invalid guest count', async () => {
    await expect(createBooking({ guestCount: 5 }))
      .rejects
      .toThrow('Guest count must be between 10 and 1000');
  });
});
```

### 2. Integration Tests (Playwright)

**Test Critical Flows:**
- Complete booking flow (search → book → accept → pay)
- Vendor onboarding flow (apply → approve → Stripe Connect)
- Message anti-circumvention (blocked patterns)
- Escrow payment release (7-day window)

```typescript
test('complete booking flow', async ({ page }) => {
  await page.goto('/search');
  await page.click('text=Mexican Food Truck');
  await page.click('text=Book Now');
  await page.fill('#eventDate', '2025-12-25');
  await page.fill('#guestCount', '50');
  await page.click('text=Submit Booking Request');

  // Vendor accepts
  await loginAsVendor(page);
  await page.goto('/vendor/bookings');
  await page.click('text=Accept');

  // Customer pays
  await loginAsCustomer(page);
  await page.click('text=Complete Payment');
  await fillStripePayment(page);

  expect(await page.textContent('.status')).toBe('Confirmed');
});
```

### 3. Load Testing (k6)

**Target Metrics:**
- API p95 response time < 500ms
- Search endpoint < 1 second
- Sustained throughput: 100 req/s

```javascript
// k6 load test script
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 50,
  duration: '2m',
  thresholds: {
    http_req_duration: ['p(95)<500'],
  },
};

export default function() {
  let res = http.get('https://api.fleetfeast.com/api/search/vendors?cuisineType=MEXICAN');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

---

## Documentation Standards

### 1. OpenAPI Specification

**Location:** `docs/api/openapi.yaml`

**Completeness Requirements:**
- All endpoints documented
- All request/response schemas defined
- All enums defined
- Authentication requirements specified
- Example requests/responses

### 2. Inline Code Documentation

```typescript
/**
 * Accept booking request
 *
 * Vendor accepts customer booking request. Triggers:
 * - Booking status change: PENDING → ACCEPTED
 * - Payment authorization (Stripe PaymentIntent)
 * - Email notification to customer
 *
 * @param bookingId - UUID of booking to accept
 * @param vendorId - UUID of vendor accepting (from JWT)
 * @returns Booking with ACCEPTED status + Stripe client secret
 * @throws BOOKING_NOT_FOUND if booking doesn't exist
 * @throws BOOKING_ALREADY_ACCEPTED if already accepted
 * @throws BOOKING_EXPIRED if > 48 hours since request
 */
async function acceptBooking(bookingId: string, vendorId: string): Promise<AcceptBookingResult>
```

### 3. API Changelog

**Location:** `docs/api/CHANGELOG.md`

**Format:**
```markdown
## [1.0.0] - 2025-12-03

### Added
- Initial API release
- 52 endpoints across 9 domains
- JWT authentication with RBAC
- Cursor-based pagination
- Rate limiting (100/min authenticated, 20/min unauthenticated)

### Changed
- N/A (initial release)

### Deprecated
- N/A

### Removed
- N/A

### Fixed
- N/A

### Security
- CSRF protection on all state-changing endpoints
- Rate limiting on all endpoints
- Input validation with Zod
```

---

## Appendix

### A. Request ID Tracking

All requests assigned unique ID for tracing:

```typescript
// Middleware adds request ID
req.id = crypto.randomUUID();

// Returned in response header
res.headers.set('X-Request-Id', req.id);

// Included in all logs
logger.info('Booking created', { requestId: req.id, bookingId });
```

### B. API Health Check

```
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2025-12-03T15:30:00Z",
  "services": {
    "database": "connected",
    "redis": "connected",
    "stripe": "reachable"
  }
}
```

### C. Performance Monitoring

**Metrics Tracked:**
- Request duration (p50, p95, p99)
- Error rate (4xx, 5xx)
- Database query time
- Cache hit rate
- Rate limit rejections

**Tools:**
- Vercel Analytics (automatic)
- Sentry (error tracking)
- Custom middleware (request duration)

---

**Document Version:** 1.0
**Last Updated:** 2025-12-03
**Author:** Ellis_Endpoints
**Next Review:** 2026-03-03
