# Code Review: Auth & Core APIs

**Review Date**: December 5, 2025
**Reviewer**: Riley_Reviewer
**Modules Reviewed**: Authentication, Vendor, Trucks, Booking, Payment

---

## Executive Summary

**Overall Score**: 7.5/10

The codebase demonstrates solid architecture with good separation of concerns, comprehensive validation using Zod, and proper TypeScript typing. However, there are **3 critical SQL injection vulnerabilities** in the trucks search module that must be addressed immediately, along with several important security and error handling improvements needed across all modules.

### Breakdown
- **Critical Issues**: 3
- **Warnings**: 12
- **Suggestions**: 8

---

## Module Reviews

### 1. Authentication Module (`modules/auth/`)

**Score: 8/10**

#### Strengths ✅
- Strong password validation (min 8 chars, uppercase, lowercase, number)
- Proper bcrypt hashing with cost factor 12
- Email normalization (lowercase, trim)
- Token expiry handling (24h for verification, 1h for reset)
- Prevents email enumeration in password reset
- No hardcoded secrets detected
- Used verification tokens stored in separate table

#### Critical Issues ❌
*None*

#### Warnings ⚠️
- **[WARN-001]** Missing `emailVerified` field update in `verifyEmail()` function (line 179-185)
  - **Impact**: Email verification status not properly tracked
  - **Fix**: Add `emailVerified: new Date()` to the update data
  - **Location**: `modules/auth/auth.service.ts:179-185`

- **[WARN-002]** Email sending failures don't fail registration but only log to console
  - **Impact**: Users may not receive verification emails but registration succeeds
  - **Fix**: Consider implementing a retry queue or alerting system
  - **Location**: `modules/auth/auth.service.ts:122-127`

- **[WARN-003]** No rate limiting specifically mentioned for auth endpoints
  - **Impact**: Vulnerable to brute force attacks
  - **Fix**: Apply `RateLimitPresets.strict` to registration/login endpoints
  - **Location**: API route level

#### Suggestions 💡
- **[SUGG-001]** Consider adding password strength meter feedback to users
- **[SUGG-002]** Implement account lockout after X failed login attempts
- **[SUGG-003]** Add 2FA support for enhanced security

---

### 2. Vendor Module (`modules/vendor/`)

**Score: 8.5/10**

#### Strengths ✅
- Comprehensive Zod validation schemas with detailed error messages
- Proper role-based access control checks
- Status transition validation (can't approve rejected vendors)
- Document type duplication prevention
- Soft delete support (`deletedAt` checks)
- Clean separation of public vs private profile data

#### Critical Issues ❌
*None*

#### Warnings ⚠️
- **[WARN-004]** Missing file size validation enforcement at service layer
  - **Impact**: Validation schema limits to 10MB but not enforced server-side
  - **Fix**: Add file size check before document creation
  - **Location**: `modules/vendor/vendor.service.ts:94-143`

- **[WARN-005]** No file type validation for uploaded documents
  - **Impact**: Users could upload executable files disguised as documents
  - **Fix**: Validate MIME types and file extensions
  - **Location**: `modules/vendor/vendor.service.ts:94-143`

#### Suggestions 💡
- **[SUGG-004]** Add audit log for vendor approval/rejection actions
- **[SUGG-005]** Implement email notifications for status changes

---

### 3. Trucks Module (`modules/trucks/`)

**Score: 5/10** ⚠️

#### Strengths ✅
- Haversine formula for accurate distance calculation
- Comprehensive search filters (cuisine, price, capacity, rating, location)
- Full-text search with PostgreSQL
- Proper pagination support
- Email masking in public reviews
- Location coordinates hidden from public responses

#### Critical Issues ❌🚨

- **[CRIT-001]** **SQL INJECTION VULNERABILITY** - Direct string interpolation in WHERE clause
  - **Severity**: CRITICAL
  - **Impact**: Allows arbitrary SQL execution, potential data breach
  - **Location**: `modules/trucks/trucks.service.ts:76-97`
  - **Vulnerable Code**:
    ```typescript
    if (excludeId) {
      conditions.push(`v.id != '${excludeId}'`);  // LINE 76 - UNSAFE!
    }

    if (cuisineType && cuisineType.length > 0) {
      const cuisineList = cuisineType.map((c) => `'${c}'`).join(", ");  // LINE 81-82 - UNSAFE!
      conditions.push(`v.cuisine_type IN (${cuisineList})`);
    }

    if (priceRange && priceRange.length > 0) {
      const priceList = priceRange.map((p) => `'${p}'`).join(", ");  // LINE 86-87 - UNSAFE!
      conditions.push(`v.price_range IN (${priceList})`);
    }
    ```
  - **Fix**: Use Prisma parameterized queries:
    ```typescript
    // Build conditions using Prisma.sql
    const whereConditions = [];

    if (excludeId) {
      whereConditions.push(Prisma.sql`v.id != ${excludeId}`);
    }

    if (cuisineType && cuisineType.length > 0) {
      whereConditions.push(Prisma.sql`v.cuisine_type = ANY(${cuisineType})`);
    }
    ```

- **[CRIT-002]** **SQL INJECTION VULNERABILITY** - Unsafe date parameter concatenation
  - **Severity**: CRITICAL
  - **Location**: `modules/trucks/trucks.service.ts:100-109`
  - **Vulnerable Code**:
    ```typescript
    if (availableDate) {
      conditions.push(`
        EXISTS (
          SELECT 1 FROM availability a
          WHERE a.vendor_id = v.id
            AND a.date = '${availableDate}'::date  // UNSAFE!
            AND a.is_available = true
        )
      `);
    }
    ```
  - **Fix**: Use parameterized date binding with Prisma

- **[CRIT-003]** **SQL INJECTION VULNERABILITY** - Numeric parameters used without validation
  - **Severity**: CRITICAL
  - **Location**: `modules/trucks/trucks.service.ts:92-97`
  - **Vulnerable Code**:
    ```typescript
    if (capacityMin !== undefined) {
      conditions.push(`v.capacity_max >= ${capacityMin}`);  // Type coercion only, not safe
    }
    if (capacityMax !== undefined) {
      conditions.push(`v.capacity_min <= ${capacityMax}`);  // Type coercion only, not safe
    }
    ```
  - **Fix**: Validate as numbers and use Prisma.sql for binding

#### Warnings ⚠️

- **[WARN-006]** Query result uses `Prisma.raw()` which bypasses type safety
  - **Impact**: Runtime type errors possible
  - **Location**: `modules/trucks/trucks.service.ts:177-191`
  - **Fix**: Properly type the raw query results

- **[WARN-007]** Distance calculation returns results in memory after DB query
  - **Impact**: Performance issues with large result sets
  - **Location**: `modules/trucks/trucks.service.ts:226-254`
  - **Fix**: Consider PostGIS for database-level spatial queries

- **[WARN-008]** No input sanitization for search query text
  - **Impact**: Potential XSS if query is reflected in responses
  - **Location**: `modules/trucks/trucks.service.ts:115-146`
  - **Fix**: Sanitize query string before using in full-text search

#### Suggestions 💡
- **[SUGG-006]** Implement query result caching for popular searches
- **[SUGG-007]** Add search analytics/logging for business insights

---

### 4. Booking Module (`modules/booking/`)

**Score: 8/10**

#### Strengths ✅
- Comprehensive status transition validation
- Proper authorization checks (only customer/vendor can view their bookings)
- Automatic refund calculation based on cancellation policy
- Business logic validation (capacity checks, availability verification)
- Platform fee calculation with proper precision
- 48-hour vendor response window enforcement

#### Critical Issues ❌
*None*

#### Warnings ⚠️

- **[WARN-009]** Decimal precision issues in amount calculations
  - **Impact**: Potential rounding errors in financial calculations
  - **Location**: `modules/booking/booking.service.ts:64-77`
  - **Fix**: Use a decimal library (e.g., `decimal.js`) for financial math
  - **Code**:
    ```typescript
    const platformFee = totalAmount * PLATFORM_COMMISSION;  // Floating point math
    const vendorPayout = totalAmount - platformFee;
    ```

- **[WARN-010]** No transaction wrapping for booking creation
  - **Impact**: Data inconsistency if booking create succeeds but related data fails
  - **Location**: `modules/booking/booking.service.ts:211-240`
  - **Fix**: Wrap in Prisma transaction:
    ```typescript
    await prisma.$transaction(async (tx) => {
      // Create booking and related records
    });
    ```

- **[WARN-011]** Response window check uses client-side Date
  - **Impact**: Vulnerable to client clock manipulation
  - **Location**: `modules/booking/booking.service.ts:82-86`
  - **Fix**: Use database server time for deadline calculations

#### Suggestions 💡
*None additional*

---

### 5. Payment Module (`modules/payment/`)

**Score: 7/10**

#### Strengths ✅
- Stripe signature verification for webhooks
- Manual capture for escrow functionality
- Comprehensive error handling for payment states
- Application fee calculation for marketplace
- Proper decimal-to-cents conversion
- Idempotent webhook handling

#### Critical Issues ❌
*None*

#### Warnings ⚠️

- **[WARN-012]** Webhook secret validation only warns if missing
  - **Impact**: Production deployments could run without webhook verification
  - **Location**: `modules/payment/stripe.client.ts:16-18`
  - **Fix**: Throw error if webhook secret missing in production:
    ```typescript
    if (!stripeWebhookSecret && process.env.NODE_ENV === 'production') {
      throw new Error("STRIPE_WEBHOOK_SECRET must be configured in production");
    }
    ```

- **[WARN-013]** No retry mechanism for failed escrow releases
  - **Impact**: Failed payouts could be lost without manual intervention
  - **Location**: `modules/payment/payment.service.ts:604-665`
  - **Fix**: Implement dead letter queue for failed releases

- **[WARN-014]** APP_URL defaults to localhost in production
  - **Impact**: Stripe redirect URLs would break in production
  - **Location**: `modules/payment/payment.service.ts:33`
  - **Fix**: Require environment variable in production

- **[WARN-015]** Rounding in financial calculations
  - **Impact**: Potential penny discrepancies in splits
  - **Location**: `modules/payment/payment.service.ts:61-69`
  - **Fix**: Use integer cents throughout, round only for display

#### Suggestions 💡
- **[SUGG-008]** Add payment reconciliation reports
- **[SUGG-009]** Implement webhook event deduplication

---

## Security Checklist Results

| Check | Status | Notes |
|-------|--------|-------|
| **No hardcoded secrets** | ✅ | All secrets use environment variables |
| **Input validation on all endpoints** | ✅ | Zod schemas consistently applied |
| **SQL injection prevention** | ❌ | **3 critical vulnerabilities in trucks module** |
| **XSS prevention** | ⚠️ | Needs output sanitization in search |
| **CSRF protection** | ✅ | NextAuth provides CSRF tokens |
| **Rate limiting in place** | ✅ | Comprehensive rate limiting middleware |
| **Proper authentication checks** | ✅ | Middleware enforces auth consistently |
| **Authorization (role-based access)** | ✅ | Proper role checks throughout |
| **Sensitive data handling** | ✅ | Passwords hashed, PII masked |
| **Stripe webhook verification** | ⚠️ | Implemented but missing production guard |
| **Consistent error responses** | ✅ | ApiResponses utility ensures consistency |
| **No stack traces in production** | ⚠️ | Not verified - needs env check |
| **Proper HTTP status codes** | ✅ | Correct codes throughout |
| **TypeScript types defined** | ✅ | Comprehensive type coverage |
| **Logging for debugging** | ✅ | Console logs present (needs structured logging) |

---

## Code Quality Assessment

### Strengths
1. **Excellent separation of concerns**: Service layer properly isolated from route handlers
2. **Comprehensive validation**: Zod schemas with detailed error messages
3. **Strong TypeScript usage**: Proper interfaces and type safety
4. **Consistent error handling**: Custom error classes with status codes
5. **Good documentation**: JSDoc comments on complex functions
6. **DRY principles**: Shared utilities and reusable validation schemas

### Areas for Improvement
1. **Financial precision**: Use decimal library for money calculations
2. **Transaction management**: Wrap multi-step operations in database transactions
3. **Logging**: Replace console.log with structured logging (Winston, Pino)
4. **Error monitoring**: Integrate Sentry or similar for production errors
5. **Testing**: No unit tests visible (critical for financial logic)

---

## Priority Recommendations

### Priority 1: IMMEDIATE (Security Critical) 🚨

1. **Fix SQL injection vulnerabilities in trucks module**
   - Replace string concatenation with Prisma parameterized queries
   - Validate and sanitize all user inputs before raw SQL
   - **Files**: `modules/trucks/trucks.service.ts`
   - **Lines**: 76, 81-82, 86-87, 100-109, 92-97
   - **Estimated effort**: 2-4 hours

2. **Add production environment validation for Stripe webhook secret**
   - Prevent deployments without required secrets
   - **Files**: `modules/payment/stripe.client.ts:16-18`
   - **Estimated effort**: 15 minutes

### Priority 2: Important (Data Integrity)

3. **Implement transaction wrapping for booking creation**
   - Prevents partial data states
   - **Files**: `modules/booking/booking.service.ts:211-240`
   - **Estimated effort**: 1 hour

4. **Add `emailVerified` field tracking**
   - Complete email verification implementation
   - **Files**: `modules/auth/auth.service.ts:179-185`
   - **Estimated effort**: 30 minutes

5. **Use decimal library for financial calculations**
   - Prevents rounding errors in payment splits
   - **Files**: `modules/booking/booking.service.ts:64-77`, `modules/payment/payment.service.ts:61-69`
   - **Estimated effort**: 2 hours

### Priority 3: Recommended (Security Hardening)

6. **Add file type validation for vendor documents**
   - Prevents malicious file uploads
   - **Files**: `modules/vendor/vendor.service.ts:94-143`
   - **Estimated effort**: 1 hour

7. **Implement structured logging**
   - Replace console.log with Winston/Pino
   - **Files**: All modules
   - **Estimated effort**: 4 hours

8. **Add retry mechanism for failed payment releases**
   - Ensures vendor payouts aren't lost
   - **Files**: `modules/payment/payment.service.ts:604-665`
   - **Estimated effort**: 3 hours

---

## Compliance Notes

### OWASP Top 10 Coverage
- ✅ **A01 Broken Access Control**: Proper auth middleware and role checks
- ❌ **A03 Injection**: SQL injection vulnerabilities present (CRITICAL)
- ✅ **A07 Identification and Authentication Failures**: Strong password policy, secure tokens
- ✅ **A08 Software and Data Integrity Failures**: Webhook signature verification
- ⚠️ **A09 Security Logging and Monitoring Failures**: Basic logging present, needs improvement

### PCI DSS Considerations
- ✅ Stripe handles card data (no card data in codebase)
- ✅ No sensitive auth data stored in plain text
- ⚠️ Needs comprehensive audit logging for compliance

---

## Test Coverage Recommendations

**Critical areas requiring unit tests:**
1. Booking refund calculation logic
2. Payment split calculations
3. Status transition validation
4. Search filter SQL generation (after SQL injection fixes)
5. Stripe webhook event handlers

**Integration tests needed:**
1. Complete booking flow (create → accept → pay → complete)
2. Vendor onboarding and approval workflow
3. Payment escrow and release cycle
4. Error scenarios and rollbacks

---

## Summary

The Fleet Feast codebase demonstrates professional development practices with strong architecture, comprehensive validation, and proper separation of concerns. However, **immediate action is required** to address the SQL injection vulnerabilities in the trucks search module before production deployment.

Once the critical security issues are resolved, the codebase will be production-ready with the recommended improvements to logging, transaction management, and financial precision calculations.

**Next Steps:**
1. Fix SQL injection vulnerabilities (Priority 1)
2. Add production environment guards (Priority 1)
3. Implement transaction wrapping (Priority 2)
4. Add comprehensive test coverage
5. Set up structured logging and error monitoring

---

**Review Complete**
Riley_Reviewer | Code Quality Specialist
December 5, 2025
