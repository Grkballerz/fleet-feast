# Fleet Feast API Developer Guide

**Version:** 1.0
**Last Updated:** 2025-12-05
**Author:** Drew_Docs

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [Rate Limits](#rate-limits)
4. [Error Handling](#error-handling)
5. [Core Concepts](#core-concepts)
6. [API Reference](#api-reference)
7. [Code Examples](#code-examples)

---

## Getting Started

### Base URLs

| Environment | URL |
|-------------|-----|
| **Production** | `https://api.fleetfeast.com` |
| **Development** | `http://localhost:3000` |

### Quick Start Example

```bash
# 1. Register a new user
curl -X POST https://api.fleetfeast.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "role": "CUSTOMER"
  }'

# 2. Login to receive authentication cookie
curl -X POST https://api.fleetfeast.com/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'

# 3. Search for food trucks (authenticated request)
curl -X GET "https://api.fleetfeast.com/api/trucks?cuisineType=MEXICAN&minRating=4.0" \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

---

## Authentication

### Overview

Fleet Feast uses **JWT-based authentication** with HTTP-only secure cookies for session management.

### Authentication Flow

```
┌─────────┐      1. Login       ┌─────────┐
│ Client  │─────────────────────>│   API   │
└─────────┘                      └─────────┘
     │                                │
     │         2. JWT Cookie          │
     │<───────────────────────────────│
     │                                │
     │    3. Authenticated Request    │
     │───────────────────────────────>│
     │    (Cookie sent automatically) │
     │                                │
     │         4. Response            │
     │<───────────────────────────────│
```

### Step 1: Register User

**Endpoint:** `POST /api/auth/register`

**Request:**
```json
{
  "email": "customer@example.com",
  "password": "SecurePass123",
  "role": "CUSTOMER"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "customer@example.com",
    "role": "CUSTOMER",
    "status": "ACTIVE",
    "emailVerified": false,
    "createdAt": "2025-12-05T10:30:00Z"
  }
}
```

**Password Requirements:**
- Minimum 8 characters
- Must include uppercase letter
- Must include lowercase letter
- Must include number

### Step 2: Login

**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "email": "customer@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "customer@example.com",
    "role": "CUSTOMER",
    "status": "ACTIVE"
  }
}
```

**Response Headers:**
```
Set-Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800; Path=/
```

**JWT Token Structure:**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "customer@example.com",
  "role": "CUSTOMER",
  "iat": 1701619200,
  "exp": 1702224000
}
```

**Token Expiry:** 7 days

### Step 3: Authenticated Requests

Include the cookie in subsequent requests (automatically handled by browsers).

**Using cURL:**
```bash
# Save cookies on login
curl -X POST https://api.fleetfeast.com/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"user@example.com","password":"SecurePass123"}'

# Use saved cookies for authenticated requests
curl -X GET https://api.fleetfeast.com/api/bookings \
  -b cookies.txt
```

**Using JavaScript Fetch:**
```javascript
// Login
const loginResponse = await fetch('https://api.fleetfeast.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // Important: Include cookies
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123'
  })
});

// Authenticated request
const bookingsResponse = await fetch('https://api.fleetfeast.com/api/bookings', {
  credentials: 'include' // Cookies sent automatically
});
```

### Step 4: Logout

**Endpoint:** `POST /api/auth/logout`

**Request:**
```bash
curl -X POST https://api.fleetfeast.com/api/auth/logout \
  -b cookies.txt
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### Role-Based Access Control (RBAC)

| Role | Capabilities |
|------|-------------|
| **CUSTOMER** | Search vendors, create bookings, send messages, leave reviews |
| **VENDOR** | Accept/decline bookings, manage profile/menu/availability, send messages |
| **ADMIN** | Approve vendors, resolve disputes, view all resources |

---

## Rate Limits

### Overview

Rate limits prevent abuse and ensure fair API usage.

| User Type | Limit | Window |
|-----------|-------|--------|
| **Authenticated** | 100 requests | 1 minute |
| **Unauthenticated** | 20 requests | 1 minute |

### Rate Limit Headers

Every response includes rate limit information:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1701619260
```

### Rate Limit Exceeded (429)

**Response:**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again in 45 seconds.",
    "details": {
      "limit": 100,
      "remaining": 0,
      "resetAt": "2025-12-05T15:31:00Z",
      "retryAfter": 45
    }
  }
}
```

**Response Headers:**
```
Retry-After: 45
```

### Best Practices

1. **Monitor rate limit headers** and implement exponential backoff
2. **Cache responses** when possible (vendor profiles, search results)
3. **Batch requests** instead of making individual calls
4. **Use webhooks** for real-time updates instead of polling

---

## Error Handling

### Standard Error Format

All errors follow a consistent structure:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      // Optional context-specific details
    }
  }
}
```

### HTTP Status Codes

| Status | Meaning | When to Use |
|--------|---------|-------------|
| **200** | OK | Successful GET, PATCH, DELETE |
| **201** | Created | Successful POST (resource created) |
| **400** | Bad Request | Validation error, invalid input |
| **401** | Unauthorized | Authentication required or invalid token |
| **403** | Forbidden | Insufficient permissions |
| **404** | Not Found | Resource does not exist |
| **409** | Conflict | Duplicate resource, invalid state |
| **429** | Too Many Requests | Rate limit exceeded |
| **500** | Internal Server Error | Unexpected server error |

### Common Error Codes

#### Authentication Errors (401)

| Code | Description | Resolution |
|------|-------------|------------|
| `UNAUTHORIZED` | No authentication provided | Include authentication cookie |
| `INVALID_TOKEN` | JWT token malformed | Login again |
| `TOKEN_EXPIRED` | JWT token expired (7 days) | Login again |
| `SESSION_REVOKED` | Session manually revoked | Login again |
| `INVALID_CREDENTIALS` | Wrong email/password | Verify credentials |

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "Authentication token has expired. Please login again.",
    "details": {
      "expiredAt": "2025-11-26T15:30:00Z"
    }
  }
}
```

#### Authorization Errors (403)

| Code | Description | Resolution |
|------|-------------|------------|
| `FORBIDDEN` | Insufficient permissions | Verify user role |
| `INSUFFICIENT_PERMISSIONS` | Role lacks required access | Contact admin |
| `ACCOUNT_SUSPENDED` | Account temporarily suspended | Contact support |
| `ACCOUNT_BANNED` | Account permanently banned | Cannot be restored |

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "ACCOUNT_SUSPENDED",
    "message": "Your account has been suspended for violating platform policies",
    "details": {
      "suspendedAt": "2025-12-01T10:00:00Z",
      "suspendedUntil": "2025-12-31T23:59:59Z",
      "reason": "Multiple contact information sharing violations"
    }
  }
}
```

#### Validation Errors (400)

| Code | Description | Resolution |
|------|-------------|------------|
| `VALIDATION_ERROR` | Request body validation failed | Review field errors |
| `INVALID_INPUT` | Specific field has invalid value | Correct the field |
| `INVALID_DATE_FORMAT` | Date not in YYYY-MM-DD format | Use ISO 8601 format |
| `INVALID_UUID` | ID not valid UUID v4 | Provide valid UUID |

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "fieldErrors": {
        "guestCount": ["Must be at least 1", "Must be at most 10000"],
        "eventDate": ["Must be a future date"],
        "email": ["Invalid email format"]
      }
    }
  }
}
```

#### Booking Errors (400/409)

| Code | Description | Resolution |
|------|-------------|------------|
| `BOOKING_NOT_FOUND` | Booking doesn't exist | Verify booking ID |
| `BOOKING_ALREADY_ACCEPTED` | Booking already accepted | Cannot accept twice |
| `BOOKING_EXPIRED` | 48-hour window passed | Create new booking |
| `VENDOR_UNAVAILABLE` | Vendor not available on date | Choose different date |
| `VENDOR_CAPACITY_EXCEEDED` | Guest count too high | Reduce guest count |

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "VENDOR_UNAVAILABLE",
    "message": "Vendor is not available on the selected date",
    "details": {
      "requestedDate": "2025-12-25",
      "availableDates": ["2025-12-26", "2025-12-27", "2025-12-28"]
    }
  }
}
```

#### Payment Errors (400/500)

| Code | Description | Resolution |
|------|-------------|------------|
| `PAYMENT_AUTHORIZATION_FAILED` | Stripe payment failed | Verify payment method |
| `PAYMENT_ALREADY_AUTHORIZED` | Payment already exists | Cannot authorize twice |
| `PAYMENT_CANNOT_REFUND` | Payment already released | Contact support |
| `PAYMENT_STRIPE_ERROR` | Stripe API error | Retry or contact support |

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "PAYMENT_AUTHORIZATION_FAILED",
    "message": "Payment authorization failed",
    "details": {
      "stripeError": "card_declined",
      "declineCode": "insufficient_funds"
    }
  }
}
```

### Complete Error Reference

For a complete list of all 60+ error codes, see [Error Codes Reference](./api/error-codes.md).

---

## Core Concepts

### 1. Users & Roles

Three primary user roles in Fleet Feast:

| Role | Account Type | Capabilities |
|------|-------------|--------------|
| **CUSTOMER** | Free | Search vendors, create bookings, send messages, leave reviews |
| **VENDOR** | Application required | Accept/decline bookings, manage profile/menu/availability |
| **ADMIN** | Internal only | Approve vendors, resolve disputes, manage violations |

**User Lifecycle:**
```
Registration → Email Verification → [CUSTOMER]
                                        ↓
                              Vendor Application
                                        ↓
                              Admin Review → [VENDOR]
```

### 2. Booking Flow

Fleet Feast uses a **request-to-book** model with vendor approval.

**Complete Booking Flow:**
```
1. PENDING      → Customer creates booking request
2. ACCEPTED     → Vendor accepts within 48 hours
3. CONFIRMED    → Customer completes payment
4. COMPLETED    → Event date passes
5. REFUNDED     → Cancellation or dispute resolved
```

**State Transitions:**
```
PENDING → ACCEPTED → CONFIRMED → COMPLETED
         ↓           ↓           ↓
      CANCELLED  CANCELLED  CANCELLED → REFUNDED
                              ↓
                          DISPUTED → REFUNDED
```

**Business Rules:**
- **Availability Check:** Vendor must be available on event date
- **Capacity Validation:** Guest count within vendor's capacity range
- **48-Hour Response:** Vendor must accept/decline within 48 hours
- **Cancellation Policy:**
  - 7+ days before event: 100% refund
  - 3-6 days before event: 50% refund
  - Under 3 days: No refund
- **Platform Commission:** 15% fee on all bookings (10% for loyalty)

### 3. Payment Flow

Fleet Feast uses **Stripe Connect** with an escrow model to protect both parties.

**Payment Lifecycle:**
```
1. PENDING      → Booking created, no payment yet
2. AUTHORIZED   → Customer payment authorized (funds held)
3. CAPTURED     → Funds captured 7 days after event
4. RELEASED     → Funds transferred to vendor (minus commission)
```

**Escrow System:**
- Payment **authorized** when booking is **ACCEPTED**
- Funds **held** (manual capture) until event completion
- Payment **captured** 7 days after event date
- Automatic **release** to vendor after escrow hold period
- Cancellation refunds processed immediately based on policy

**Commission Structure:**
```
Base Amount:         $1000
Platform Fee (15%):   -$150
Vendor Payout:        $850

With Loyalty:
Base Amount:         $1000
Discount (5%):        -$50
Customer Pays:        $950
Platform Fee (10%):   -$95
Vendor Payout:        $855 (increased!)
```

### 4. Quote Request System

For complex events, customers can request quotes from multiple vendors.

**Quote Flow:**
```
1. Customer creates RFQ → Vendors notified
2. Vendors submit quotes → Customer compares
3. Customer accepts quote → Booking created (PENDING)
4. Standard booking flow continues
```

**Pricing Structure:**
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
- Customer selects 1-10 vendors for RFQ
- Default quote deadline: 7 days
- One quote per vendor per request
- Quote acceptance creates PENDING booking
- 15% platform commission applied

### 5. Loyalty Discount System

Repeat customers receive automatic discounts.

**How It Works:**
- **5% discount** on 2nd+ booking with same vendor
- Platform absorbs cost by reducing commission from **15% → 10%**
- **Vendor payout increases** despite customer paying less
- Discount automatically applied at booking creation
- Eligibility based on COMPLETED booking history

**Check Eligibility:**
```bash
curl -X GET "https://api.fleetfeast.com/api/loyalty/check?vendorId=abc-123" \
  -b cookies.txt
```

**Response:**
```json
{
  "success": true,
  "data": {
    "eligible": true,
    "message": "You qualify for a 5% loyalty discount! You've completed 2 booking(s) with this vendor.",
    "previousBookings": 2,
    "discountPercent": 5
  }
}
```

### 6. Messaging & Anti-Circumvention

In-app messaging keeps transactions on platform.

**Anti-Circumvention Features:**
- Real-time content scanning for contact information
- Pattern detection: phone, email, social media handles
- Automatic violation flagging (message still delivered)
- Violation tracking with progressive penalties

**Detected Patterns:**
- Phone numbers (various formats, including obfuscated)
- Email addresses (including "user [at] domain [dot] com")
- Social media handles (@username)
- Platform mentions (Instagram, Facebook, WhatsApp, etc.)
- Coded language ("call me", "text me", "off platform")
- External URLs (non-FleetFeast domains)

**Violation Penalties:**
- 1 point: Warning
- 3 points: Restricted (7-day booking restriction)
- 5 points: Suspended (30-day account suspension)
- 8+ points: Banned (permanent)

---

## API Reference

### Authentication

#### Register User
`POST /api/auth/register`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "role": "CUSTOMER"
}
```

**curl Example:**
```bash
curl -X POST https://api.fleetfeast.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "SecurePass123",
    "role": "CUSTOMER"
  }'
```

#### Login
`POST /api/auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**curl Example:**
```bash
curl -X POST https://api.fleetfeast.com/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "customer@example.com",
    "password": "SecurePass123"
  }'
```

#### Logout
`POST /api/auth/logout` (Authenticated)

**curl Example:**
```bash
curl -X POST https://api.fleetfeast.com/api/auth/logout \
  -b cookies.txt
```

---

### Food Trucks

#### Search Food Trucks
`GET /api/trucks`

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string | Full-text search (name, description, menu items) |
| `cuisineType` | array | Filter by cuisine (comma-separated) |
| `priceRange` | array | BUDGET, MODERATE, PREMIUM (comma-separated) |
| `capacityMin` | integer | Minimum guest capacity |
| `capacityMax` | integer | Maximum guest capacity |
| `minRating` | float | Minimum average rating (1-5) |
| `availableDate` | date | Filter by availability (YYYY-MM-DD) |
| `lat`, `lng`, `radiusMiles` | float | Location-based search |
| `page` | integer | Page number (default: 1) |
| `limit` | integer | Results per page (default: 20, max: 100) |
| `sortBy` | string | Sort by: relevance, rating, price |
| `sortOrder` | string | asc or desc |

**curl Example:**
```bash
curl -X GET "https://api.fleetfeast.com/api/trucks?cuisineType=MEXICAN&minRating=4.0&limit=10" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "trucks": [
      {
        "id": "vendor-123",
        "businessName": "Taco Loco Food Truck",
        "description": "Authentic Mexican street tacos",
        "cuisineType": ["MEXICAN"],
        "priceRange": "MODERATE",
        "servingCapacityMin": 10,
        "servingCapacityMax": 200,
        "averageRating": 4.8,
        "totalReviews": 156,
        "status": "APPROVED"
      }
    ],
    "pagination": {
      "nextCursor": null,
      "hasMore": false,
      "totalCount": 1
    }
  }
}
```

#### Get Truck Details
`GET /api/trucks/{id}`

**curl Example:**
```bash
curl -X GET "https://api.fleetfeast.com/api/trucks/vendor-123" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "vendor": {
      "id": "vendor-123",
      "businessName": "Taco Loco Food Truck",
      "description": "Authentic Mexican street tacos",
      "cuisineType": ["MEXICAN"],
      "priceRange": "MODERATE",
      "servingCapacityMin": 10,
      "servingCapacityMax": 200,
      "averageRating": 4.8,
      "totalReviews": 156
    },
    "menu": [
      {
        "id": "menu-1",
        "name": "Carne Asada Tacos",
        "description": "Grilled beef tacos with cilantro and onions",
        "price": 12.00
      }
    ],
    "reviews": [
      {
        "id": "review-1",
        "rating": 5,
        "content": "Best tacos in town!",
        "createdAt": "2025-12-01T10:00:00Z"
      }
    ]
  }
}
```

---

### Bookings

#### Create Booking
`POST /api/bookings` (Authenticated: CUSTOMER)

**Request:**
```json
{
  "vendorId": "vendor-123",
  "eventDate": "2025-12-25",
  "eventTime": "14:30",
  "eventType": "CORPORATE",
  "location": "123 Main St, San Francisco, CA 94102",
  "guestCount": 50,
  "totalAmount": 1000.00,
  "specialRequests": "Please include vegetarian options"
}
```

**curl Example:**
```bash
curl -X POST https://api.fleetfeast.com/api/bookings \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "vendorId": "vendor-123",
    "eventDate": "2025-12-25",
    "eventTime": "14:30",
    "eventType": "CORPORATE",
    "location": "123 Main St, San Francisco, CA 94102",
    "guestCount": 50,
    "totalAmount": 1000.00,
    "specialRequests": "Please include vegetarian options"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": "booking-123",
    "customerId": "customer-456",
    "vendorId": "vendor-123",
    "eventDate": "2025-12-25",
    "eventTime": "14:30",
    "eventType": "CORPORATE",
    "location": "123 Main St, San Francisco, CA 94102",
    "guestCount": 50,
    "totalAmount": 1000.00,
    "platformFee": 150.00,
    "vendorPayout": 850.00,
    "status": "PENDING",
    "discountAmount": null,
    "loyaltyApplied": false,
    "createdAt": "2025-12-05T10:30:00Z"
  }
}
```

#### List Bookings
`GET /api/bookings` (Authenticated)

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | array | Filter by status (comma-separated) |
| `cursor` | string | Pagination cursor |
| `limit` | integer | Results per page (default: 20, max: 100) |

**curl Example:**
```bash
curl -X GET "https://api.fleetfeast.com/api/bookings?status=PENDING,ACCEPTED" \
  -b cookies.txt
```

#### Accept Booking (Vendor)
`PUT /api/bookings/{id}/accept` (Authenticated: VENDOR)

**curl Example:**
```bash
curl -X PUT https://api.fleetfeast.com/api/bookings/booking-123/accept \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

**Response:**
```json
{
  "success": true,
  "message": "Booking accepted successfully",
  "data": {
    "id": "booking-123",
    "status": "ACCEPTED",
    "acceptedAt": "2025-12-05T11:00:00Z"
  }
}
```

#### Decline Booking (Vendor)
`PUT /api/bookings/{id}/decline` (Authenticated: VENDOR)

**Request:**
```json
{
  "reason": "Already booked for that date. Available Dec 26-28 instead."
}
```

**curl Example:**
```bash
curl -X PUT https://api.fleetfeast.com/api/bookings/booking-123/decline \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "reason": "Already booked for that date. Available Dec 26-28 instead."
  }'
```

#### Cancel Booking
`DELETE /api/bookings/{id}` (Authenticated)

**Request:**
```json
{
  "reason": "Event postponed to next year"
}
```

**curl Example:**
```bash
curl -X DELETE https://api.fleetfeast.com/api/bookings/booking-123 \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "reason": "Event postponed to next year"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "id": "booking-123",
    "status": "CANCELLED",
    "refundAmount": 1000.00,
    "refundPercentage": 100
  }
}
```

---

### Payments

#### Create Payment Intent
`POST /api/payments` (Authenticated: CUSTOMER)

**Request:**
```json
{
  "bookingId": "booking-123"
}
```

**curl Example:**
```bash
curl -X POST https://api.fleetfeast.com/api/payments \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "bookingId": "booking-123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Payment intent created",
  "data": {
    "payment": {
      "id": "payment-456",
      "bookingId": "booking-123",
      "amount": 1000.00,
      "status": "PENDING",
      "stripePaymentIntentId": "pi_abc123",
      "createdAt": "2025-12-05T11:30:00Z"
    },
    "clientSecret": "pi_abc123_secret_xyz789"
  }
}
```

**Use with Stripe.js:**
```javascript
const stripe = Stripe('pk_live_...');
const { clientSecret } = response.data;

const { error } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement,
    billing_details: { name: 'Customer Name' }
  }
});
```

---

### Messages

#### Send Message
`POST /api/messages` (Authenticated)

**Request:**
```json
{
  "bookingId": "booking-123",
  "content": "What time should we arrive for setup?"
}
```

**curl Example:**
```bash
curl -X POST https://api.fleetfeast.com/api/messages \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "bookingId": "booking-123",
    "content": "What time should we arrive for setup?"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "id": "message-789",
    "bookingId": "booking-123",
    "senderId": "customer-456",
    "content": "What time should we arrive for setup?",
    "flagged": false,
    "createdAt": "2025-12-05T12:00:00Z"
  }
}
```

#### Get Inbox
`GET /api/messages` (Authenticated)

**curl Example:**
```bash
curl -X GET "https://api.fleetfeast.com/api/messages?limit=20" \
  -b cookies.txt
```

**Response:**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "booking": {
          "id": "booking-123",
          "eventDate": "2025-12-25",
          "status": "ACCEPTED"
        },
        "lastMessage": {
          "id": "message-789",
          "content": "What time should we arrive for setup?",
          "createdAt": "2025-12-05T12:00:00Z"
        },
        "unreadCount": 1
      }
    ]
  }
}
```

#### Get Conversation
`GET /api/messages/{bookingId}` (Authenticated)

**curl Example:**
```bash
curl -X GET https://api.fleetfeast.com/api/messages/booking-123 \
  -b cookies.txt
```

---

### Reviews

#### Submit Review
`POST /api/reviews` (Authenticated)

**Request:**
```json
{
  "bookingId": "booking-123",
  "rating": 5,
  "content": "Excellent service! Food was amazing and arrived on time."
}
```

**curl Example:**
```bash
curl -X POST https://api.fleetfeast.com/api/reviews \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "bookingId": "booking-123",
    "rating": 5,
    "content": "Excellent service! Food was amazing and arrived on time."
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Review submitted successfully",
  "data": {
    "id": "review-101",
    "bookingId": "booking-123",
    "reviewerId": "customer-456",
    "revieweeId": "vendor-123",
    "rating": 5,
    "content": "Excellent service! Food was amazing and arrived on time.",
    "createdAt": "2025-12-05T13:00:00Z"
  }
}
```

#### List Vendor Reviews
`GET /api/reviews/vendor/{vendorId}`

**curl Example:**
```bash
curl -X GET "https://api.fleetfeast.com/api/reviews/vendor/vendor-123?page=1&limit=10" \
  -H "Content-Type: application/json"
```

---

### Loyalty

#### Check Loyalty Discount
`GET /api/loyalty/check?vendorId={vendorId}` (Authenticated: CUSTOMER)

**curl Example:**
```bash
curl -X GET "https://api.fleetfeast.com/api/loyalty/check?vendorId=vendor-123" \
  -b cookies.txt
```

**Response:**
```json
{
  "success": true,
  "data": {
    "eligible": true,
    "message": "You qualify for a 5% loyalty discount! You've completed 2 booking(s) with this vendor.",
    "previousBookings": 2,
    "discountPercent": 5
  }
}
```

---

### Notifications

#### Get Notifications
`GET /api/notifications` (Authenticated)

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | integer | Notifications per page (default: 20, max: 100) |
| `offset` | integer | Pagination offset (default: 0) |
| `unreadOnly` | boolean | Filter to unread only (default: false) |

**curl Example:**
```bash
curl -X GET "https://api.fleetfeast.com/api/notifications?unreadOnly=true&limit=10" \
  -b cookies.txt
```

#### Mark Notification as Read
`PUT /api/notifications/{id}/read` (Authenticated)

**curl Example:**
```bash
curl -X PUT https://api.fleetfeast.com/api/notifications/notif-123/read \
  -b cookies.txt
```

#### Mark All as Read
`PUT /api/notifications/read-all` (Authenticated)

**curl Example:**
```bash
curl -X PUT https://api.fleetfeast.com/api/notifications/read-all \
  -b cookies.txt
```

---

## Code Examples

### JavaScript / TypeScript

#### Complete Booking Flow
```typescript
// 1. Login
async function login(email: string, password: string) {
  const response = await fetch('https://api.fleetfeast.com/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }

  return response.json();
}

// 2. Search food trucks
async function searchTrucks(filters: {
  cuisineType?: string;
  minRating?: number;
  availableDate?: string;
}) {
  const params = new URLSearchParams(filters as any);
  const response = await fetch(`https://api.fleetfeast.com/api/trucks?${params}`, {
    credentials: 'include'
  });

  return response.json();
}

// 3. Create booking
async function createBooking(bookingData: {
  vendorId: string;
  eventDate: string;
  eventTime: string;
  eventType: string;
  location: string;
  guestCount: number;
  totalAmount: number;
}) {
  const response = await fetch('https://api.fleetfeast.com/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(bookingData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }

  return response.json();
}

// 4. Complete payment
async function createPaymentIntent(bookingId: string) {
  const response = await fetch('https://api.fleetfeast.com/api/payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ bookingId })
  });

  const { data } = await response.json();
  return data.clientSecret;
}

// Usage
async function bookEvent() {
  try {
    // Login
    await login('customer@example.com', 'SecurePass123');

    // Search
    const { data } = await searchTrucks({
      cuisineType: 'MEXICAN',
      minRating: 4.0,
      availableDate: '2025-12-25'
    });

    // Create booking
    const booking = await createBooking({
      vendorId: data.trucks[0].id,
      eventDate: '2025-12-25',
      eventTime: '14:30',
      eventType: 'CORPORATE',
      location: '123 Main St, San Francisco, CA 94102',
      guestCount: 50,
      totalAmount: 1000.00
    });

    console.log('Booking created:', booking.data.id);

    // Wait for vendor acceptance, then process payment
    const clientSecret = await createPaymentIntent(booking.data.id);

    // Use Stripe.js to complete payment
    const stripe = Stripe('pk_live_...');
    await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement }
    });

    console.log('Booking confirmed!');
  } catch (error) {
    console.error('Booking failed:', error.message);
  }
}
```

### Python

#### Search and Book
```python
import requests

BASE_URL = "https://api.fleetfeast.com"

class FleetFeastAPI:
    def __init__(self):
        self.session = requests.Session()

    def login(self, email, password):
        response = self.session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": email, "password": password}
        )
        response.raise_for_status()
        return response.json()

    def search_trucks(self, **filters):
        response = self.session.get(
            f"{BASE_URL}/api/trucks",
            params=filters
        )
        response.raise_for_status()
        return response.json()

    def create_booking(self, booking_data):
        response = self.session.post(
            f"{BASE_URL}/api/bookings",
            json=booking_data
        )
        response.raise_for_status()
        return response.json()

# Usage
api = FleetFeastAPI()
api.login("customer@example.com", "SecurePass123")

trucks = api.search_trucks(
    cuisineType="MEXICAN",
    minRating=4.0,
    availableDate="2025-12-25"
)

booking = api.create_booking({
    "vendorId": trucks["data"]["trucks"][0]["id"],
    "eventDate": "2025-12-25",
    "eventTime": "14:30",
    "eventType": "CORPORATE",
    "location": "123 Main St, San Francisco, CA 94102",
    "guestCount": 50,
    "totalAmount": 1000.00
})

print(f"Booking created: {booking['data']['id']}")
```

### cURL Scripts

#### Complete Workflow
```bash
#!/bin/bash

BASE_URL="https://api.fleetfeast.com"
COOKIES="cookies.txt"

# 1. Login
echo "Logging in..."
curl -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -c "$COOKIES" \
  -d '{
    "email": "customer@example.com",
    "password": "SecurePass123"
  }'

# 2. Search food trucks
echo "\nSearching food trucks..."
curl -X GET "$BASE_URL/api/trucks?cuisineType=MEXICAN&minRating=4.0" \
  -b "$COOKIES"

# 3. Create booking
echo "\nCreating booking..."
BOOKING_RESPONSE=$(curl -X POST "$BASE_URL/api/bookings" \
  -H "Content-Type: application/json" \
  -b "$COOKIES" \
  -d '{
    "vendorId": "vendor-123",
    "eventDate": "2025-12-25",
    "eventTime": "14:30",
    "eventType": "CORPORATE",
    "location": "123 Main St, San Francisco, CA 94102",
    "guestCount": 50,
    "totalAmount": 1000.00
  }')

BOOKING_ID=$(echo $BOOKING_RESPONSE | jq -r '.data.id')
echo "Booking ID: $BOOKING_ID"

# 4. Send message
echo "\nSending message..."
curl -X POST "$BASE_URL/api/messages" \
  -H "Content-Type: application/json" \
  -b "$COOKIES" \
  -d "{
    \"bookingId\": \"$BOOKING_ID\",
    \"content\": \"What time should we arrive for setup?\"
  }"

# 5. Check booking status
echo "\nChecking booking status..."
curl -X GET "$BASE_URL/api/bookings/$BOOKING_ID" \
  -b "$COOKIES"
```

---

## Support

- **Documentation:** [https://docs.fleetfeast.com](https://docs.fleetfeast.com)
- **API Support:** [api@fleetfeast.com](mailto:api@fleetfeast.com)
- **Status Page:** [https://status.fleetfeast.com](https://status.fleetfeast.com)

---

**Document Version:** 1.0
**Last Updated:** 2025-12-05
**Author:** Drew_Docs
