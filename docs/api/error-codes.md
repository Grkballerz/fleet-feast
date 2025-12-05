# Fleet Feast API Error Codes Reference

**Version:** 1.0
**Author:** Ellis_Endpoints
**Date:** 2025-12-03
**Status:** Complete

---

## Overview

This document provides a comprehensive reference of all error codes used in the Fleet Feast API. Each error includes:
- Error code (string constant)
- HTTP status code
- Description
- Resolution steps
- Example response

---

## Error Format

All API errors follow this standard format:

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

---

## Error Categories

- [Authentication Errors](#authentication-errors)
- [Authorization Errors](#authorization-errors)
- [Validation Errors](#validation-errors)
- [User Errors](#user-errors)
- [Vendor Errors](#vendor-errors)
- [Booking Errors](#booking-errors)
- [Payment Errors](#payment-errors)
- [Message Errors](#message-errors)
- [Review Errors](#review-errors)
- [Admin Errors](#admin-errors)
- [Rate Limiting Errors](#rate-limiting-errors)
- [Server Errors](#server-errors)

---

## Authentication Errors

### UNAUTHORIZED
**HTTP Status:** 401
**Description:** Authentication required but not provided
**Resolution:** Include authentication cookie or login first

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required to access this resource"
  }
}
```

---

### INVALID_TOKEN
**HTTP Status:** 401
**Description:** JWT token is malformed or signature is invalid
**Resolution:** Login again to obtain a new token

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Authentication token is invalid"
  }
}
```

---

### TOKEN_EXPIRED
**HTTP Status:** 401
**Description:** JWT token has expired (7 days from issuance)
**Resolution:** Login again to refresh token

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

---

### SESSION_REVOKED
**HTTP Status:** 401
**Description:** Session was manually revoked (user logged out or admin action)
**Resolution:** Login again

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "SESSION_REVOKED",
    "message": "Your session has been revoked. Please login again."
  }
}
```

---

### INVALID_CREDENTIALS
**HTTP Status:** 401
**Description:** Email or password is incorrect
**Resolution:** Verify credentials and try again

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email or password is incorrect"
  }
}
```

---

### EMAIL_NOT_VERIFIED
**HTTP Status:** 401
**Description:** Email verification required before login
**Resolution:** Check email for verification link

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "EMAIL_NOT_VERIFIED",
    "message": "Please verify your email address before logging in",
    "details": {
      "email": "user@example.com"
    }
  }
}
```

---

## Authorization Errors

### FORBIDDEN
**HTTP Status:** 403
**Description:** User does not have permission to access resource
**Resolution:** Verify user role and permissions

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to access this resource"
  }
}
```

---

### INSUFFICIENT_PERMISSIONS
**HTTP Status:** 403
**Description:** User role lacks required permissions for action
**Resolution:** Contact admin to upgrade account permissions

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "Admin role required to perform this action",
    "details": {
      "requiredRole": "ADMIN",
      "currentRole": "CUSTOMER"
    }
  }
}
```

---

### ACCOUNT_SUSPENDED
**HTTP Status:** 403
**Description:** User account is suspended due to policy violations
**Resolution:** Contact support to appeal suspension

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

---

### ACCOUNT_BANNED
**HTTP Status:** 403
**Description:** User account is permanently banned
**Resolution:** Account cannot be restored

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "ACCOUNT_BANNED",
    "message": "Your account has been permanently banned for severe policy violations"
  }
}
```

---

## Validation Errors

### VALIDATION_ERROR
**HTTP Status:** 400
**Description:** Request body contains invalid or missing fields
**Resolution:** Review error details and correct invalid fields

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "fieldErrors": {
        "guestCount": ["Must be at least 10", "Must be at most 1000"],
        "eventDate": ["Must be a future date"],
        "email": ["Invalid email format"]
      }
    }
  }
}
```

---

### INVALID_INPUT
**HTTP Status:** 400
**Description:** Specific field contains invalid value
**Resolution:** Correct the specified field

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Guest count must be between 10 and 1000",
    "details": {
      "field": "guestCount",
      "value": 5,
      "constraint": "min: 10, max: 1000"
    }
  }
}
```

---

### INVALID_DATE_FORMAT
**HTTP Status:** 400
**Description:** Date is not in ISO 8601 format
**Resolution:** Use YYYY-MM-DD format for dates

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_DATE_FORMAT",
    "message": "Date must be in YYYY-MM-DD format",
    "details": {
      "field": "eventDate",
      "providedValue": "12/25/2025",
      "expectedFormat": "2025-12-25"
    }
  }
}
```

---

### INVALID_UUID
**HTTP Status:** 400
**Description:** ID is not a valid UUID v4
**Resolution:** Provide valid UUID v4 format

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_UUID",
    "message": "Invalid UUID format",
    "details": {
      "field": "vendorId",
      "providedValue": "abc123"
    }
  }
}
```

---

## User Errors

### USER_NOT_FOUND
**HTTP Status:** 404
**Description:** User with specified ID does not exist
**Resolution:** Verify user ID is correct

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found",
    "details": {
      "userId": "uuid"
    }
  }
}
```

---

### EMAIL_ALREADY_EXISTS
**HTTP Status:** 409
**Description:** Email address is already registered
**Resolution:** Use different email or login with existing account

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "EMAIL_ALREADY_EXISTS",
    "message": "An account with this email already exists",
    "details": {
      "email": "user@example.com"
    }
  }
}
```

---

### PASSWORD_TOO_WEAK
**HTTP Status:** 400
**Description:** Password does not meet security requirements
**Resolution:** Use stronger password (min 8 chars, uppercase, lowercase, number)

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "PASSWORD_TOO_WEAK",
    "message": "Password must be at least 8 characters and include uppercase, lowercase, and numbers",
    "details": {
      "requirements": {
        "minLength": 8,
        "requireUppercase": true,
        "requireLowercase": true,
        "requireNumber": true
      }
    }
  }
}
```

---

### INVALID_VERIFICATION_TOKEN
**HTTP Status:** 400
**Description:** Email verification token is invalid or expired
**Resolution:** Request new verification email

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_VERIFICATION_TOKEN",
    "message": "Email verification token is invalid or has expired"
  }
}
```

---

### INVALID_RESET_TOKEN
**HTTP Status:** 400
**Description:** Password reset token is invalid or expired
**Resolution:** Request new password reset email

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_RESET_TOKEN",
    "message": "Password reset token is invalid or has expired"
  }
}
```

---

## Vendor Errors

### VENDOR_NOT_FOUND
**HTTP Status:** 404
**Description:** Vendor with specified ID does not exist
**Resolution:** Verify vendor ID is correct

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "VENDOR_NOT_FOUND",
    "message": "Vendor not found",
    "details": {
      "vendorId": "uuid"
    }
  }
}
```

---

### VENDOR_APPLICATION_EXISTS
**HTTP Status:** 409
**Description:** User has already submitted vendor application
**Resolution:** Wait for admin review of existing application

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "VENDOR_APPLICATION_EXISTS",
    "message": "You have already submitted a vendor application",
    "details": {
      "applicationStatus": "PENDING",
      "submittedAt": "2025-11-28T10:00:00Z"
    }
  }
}
```

---

### VENDOR_NOT_APPROVED
**HTTP Status:** 403
**Description:** Vendor application has not been approved yet
**Resolution:** Wait for admin approval

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "VENDOR_NOT_APPROVED",
    "message": "Your vendor application is pending approval",
    "details": {
      "status": "PENDING",
      "submittedAt": "2025-11-28T10:00:00Z"
    }
  }
}
```

---

### VENDOR_REJECTED
**HTTP Status:** 403
**Description:** Vendor application was rejected
**Resolution:** Review rejection reason and reapply if eligible

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "VENDOR_REJECTED",
    "message": "Your vendor application was rejected",
    "details": {
      "rejectedAt": "2025-11-30T14:00:00Z",
      "reason": "Business license could not be verified"
    }
  }
}
```

---

### VENDOR_NOT_STRIPE_CONNECTED
**HTTP Status:** 403
**Description:** Vendor has not completed Stripe Connect onboarding
**Resolution:** Complete Stripe Connect onboarding process

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "VENDOR_NOT_STRIPE_CONNECTED",
    "message": "Please complete Stripe Connect onboarding to accept bookings",
    "details": {
      "onboardingUrl": "https://connect.stripe.com/oauth/v2/authorize?..."
    }
  }
}
```

---

### VENDOR_UNAVAILABLE
**HTTP Status:** 409
**Description:** Vendor is not available on requested date
**Resolution:** Choose different date or vendor

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

---

### VENDOR_CAPACITY_EXCEEDED
**HTTP Status:** 409
**Description:** Guest count exceeds vendor's capacity
**Resolution:** Reduce guest count or choose different vendor

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "VENDOR_CAPACITY_EXCEEDED",
    "message": "Guest count exceeds vendor capacity",
    "details": {
      "requestedGuestCount": 200,
      "vendorCapacityMin": 10,
      "vendorCapacityMax": 150
    }
  }
}
```

---

### DOCUMENT_UPLOAD_FAILED
**HTTP Status:** 400
**Description:** Document upload failed validation
**Resolution:** Verify file type and size requirements

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "DOCUMENT_UPLOAD_FAILED",
    "message": "Document upload failed",
    "details": {
      "reason": "File size exceeds maximum (10MB)",
      "fileSize": 15728640,
      "maxFileSize": 10485760
    }
  }
}
```

---

## Booking Errors

### BOOKING_NOT_FOUND
**HTTP Status:** 404
**Description:** Booking with specified ID does not exist
**Resolution:** Verify booking ID is correct

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "BOOKING_NOT_FOUND",
    "message": "Booking not found",
    "details": {
      "bookingId": "uuid"
    }
  }
}
```

---

### BOOKING_ALREADY_ACCEPTED
**HTTP Status:** 409
**Description:** Booking has already been accepted
**Resolution:** Cannot accept booking twice

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "BOOKING_ALREADY_ACCEPTED",
    "message": "Booking has already been accepted",
    "details": {
      "acceptedAt": "2025-11-30T10:00:00Z",
      "status": "ACCEPTED"
    }
  }
}
```

---

### BOOKING_EXPIRED
**HTTP Status:** 409
**Description:** Booking request expired (48 hours passed without vendor response)
**Resolution:** Create new booking request

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "BOOKING_EXPIRED",
    "message": "Booking request has expired (no response within 48 hours)",
    "details": {
      "createdAt": "2025-11-26T10:00:00Z",
      "expiresAt": "2025-11-28T10:00:00Z"
    }
  }
}
```

---

### BOOKING_INVALID_STATE_TRANSITION
**HTTP Status:** 409
**Description:** Cannot transition from current booking status to requested status
**Resolution:** Review valid state transitions

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "BOOKING_INVALID_STATE_TRANSITION",
    "message": "Cannot accept booking in current state",
    "details": {
      "currentStatus": "CANCELLED",
      "requestedStatus": "ACCEPTED",
      "validTransitions": []
    }
  }
}
```

---

### BOOKING_CANNOT_CANCEL
**HTTP Status:** 409
**Description:** Booking cannot be cancelled in current state
**Resolution:** Contact support for assistance

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "BOOKING_CANNOT_CANCEL",
    "message": "Booking cannot be cancelled after event has occurred",
    "details": {
      "status": "COMPLETED",
      "eventDate": "2025-11-25"
    }
  }
}
```

---

### BOOKING_EVENT_DATE_PASSED
**HTTP Status:** 400
**Description:** Event date is in the past
**Resolution:** Choose future date

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "BOOKING_EVENT_DATE_PASSED",
    "message": "Event date must be in the future",
    "details": {
      "requestedDate": "2025-11-20",
      "today": "2025-12-03"
    }
  }
}
```

---

### BOOKING_MIN_ADVANCE_NOTICE
**HTTP Status:** 400
**Description:** Booking requires minimum advance notice (72 hours)
**Resolution:** Choose date at least 72 hours in future

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "BOOKING_MIN_ADVANCE_NOTICE",
    "message": "Bookings require at least 72 hours advance notice",
    "details": {
      "requestedDate": "2025-12-04",
      "minimumDate": "2025-12-06"
    }
  }
}
```

---

## Payment Errors

### PAYMENT_NOT_FOUND
**HTTP Status:** 404
**Description:** Payment with specified ID does not exist
**Resolution:** Verify payment ID is correct

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "PAYMENT_NOT_FOUND",
    "message": "Payment not found",
    "details": {
      "paymentId": "uuid"
    }
  }
}
```

---

### PAYMENT_AUTHORIZATION_FAILED
**HTTP Status:** 400
**Description:** Stripe payment authorization failed
**Resolution:** Verify payment method and try again

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

---

### PAYMENT_ALREADY_AUTHORIZED
**HTTP Status:** 409
**Description:** Payment has already been authorized for this booking
**Resolution:** Cannot authorize payment twice

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "PAYMENT_ALREADY_AUTHORIZED",
    "message": "Payment has already been authorized for this booking",
    "details": {
      "paymentId": "uuid",
      "authorizedAt": "2025-11-30T12:00:00Z"
    }
  }
}
```

---

### PAYMENT_ALREADY_CAPTURED
**HTTP Status:** 409
**Description:** Payment has already been captured
**Resolution:** Cannot capture payment twice

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "PAYMENT_ALREADY_CAPTURED",
    "message": "Payment has already been captured",
    "details": {
      "capturedAt": "2025-12-03T10:00:00Z"
    }
  }
}
```

---

### PAYMENT_CANNOT_REFUND
**HTTP Status:** 409
**Description:** Payment cannot be refunded in current state
**Resolution:** Contact support for assistance

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "PAYMENT_CANNOT_REFUND",
    "message": "Payment has already been released to vendor and cannot be refunded",
    "details": {
      "status": "RELEASED",
      "releasedAt": "2025-12-03T10:00:00Z"
    }
  }
}
```

---

### PAYMENT_STRIPE_ERROR
**HTTP Status:** 500
**Description:** Stripe API returned an error
**Resolution:** Try again or contact support

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "PAYMENT_STRIPE_ERROR",
    "message": "Payment processing error",
    "details": {
      "stripeError": "api_connection_error",
      "retryable": true
    }
  }
}
```

---

### PAYMENT_WEBHOOK_SIGNATURE_INVALID
**HTTP Status:** 400
**Description:** Stripe webhook signature verification failed
**Resolution:** Verify webhook signing secret configuration

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "PAYMENT_WEBHOOK_SIGNATURE_INVALID",
    "message": "Webhook signature verification failed"
  }
}
```

---

## Message Errors

### MESSAGE_NOT_FOUND
**HTTP Status:** 404
**Description:** Message with specified ID does not exist
**Resolution:** Verify message ID is correct

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "MESSAGE_NOT_FOUND",
    "message": "Message not found",
    "details": {
      "messageId": "uuid"
    }
  }
}
```

---

### MESSAGE_BLOCKED
**HTTP Status:** 400
**Description:** Message blocked due to policy violation
**Resolution:** Remove contact information from message

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "MESSAGE_BLOCKED",
    "message": "Message contains prohibited content",
    "details": {
      "violationType": "CONTACT_INFO_SHARING",
      "detectedPattern": "phone_number",
      "warning": "Repeated violations may result in account suspension"
    }
  }
}
```

---

### MESSAGE_CONTAINS_CONTACT_INFO
**HTTP Status:** 400
**Description:** Message contains phone number or email address
**Resolution:** Remove contact information and use platform messaging

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "MESSAGE_CONTAINS_CONTACT_INFO",
    "message": "Messages cannot contain phone numbers or email addresses",
    "details": {
      "detectedPatterns": ["phone_number", "email"],
      "violationSeverity": "HIGH"
    }
  }
}
```

---

### MESSAGE_BOOKING_NOT_ACTIVE
**HTTP Status:** 409
**Description:** Cannot send messages for cancelled or completed booking
**Resolution:** Messages only allowed for active bookings

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "MESSAGE_BOOKING_NOT_ACTIVE",
    "message": "Cannot send messages for cancelled booking",
    "details": {
      "bookingStatus": "CANCELLED",
      "bookingId": "uuid"
    }
  }
}
```

---

### MESSAGE_TOO_LONG
**HTTP Status:** 400
**Description:** Message exceeds maximum length (2000 characters)
**Resolution:** Shorten message

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "MESSAGE_TOO_LONG",
    "message": "Message exceeds maximum length",
    "details": {
      "currentLength": 2156,
      "maxLength": 2000
    }
  }
}
```

---

## Review Errors

### REVIEW_NOT_FOUND
**HTTP Status:** 404
**Description:** Review with specified ID does not exist
**Resolution:** Verify review ID is correct

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "REVIEW_NOT_FOUND",
    "message": "Review not found",
    "details": {
      "reviewId": "uuid"
    }
  }
}
```

---

### REVIEW_ALREADY_EXISTS
**HTTP Status:** 409
**Description:** Review already submitted for this booking
**Resolution:** Update existing review instead

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "REVIEW_ALREADY_EXISTS",
    "message": "You have already reviewed this booking",
    "details": {
      "existingReviewId": "uuid",
      "createdAt": "2025-12-02T10:00:00Z"
    }
  }
}
```

---

### REVIEW_BOOKING_NOT_COMPLETED
**HTTP Status:** 403
**Description:** Cannot review booking until event occurs
**Resolution:** Wait for event date to pass

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "REVIEW_BOOKING_NOT_COMPLETED",
    "message": "Cannot review booking until after event date",
    "details": {
      "bookingStatus": "CONFIRMED",
      "eventDate": "2025-12-15"
    }
  }
}
```

---

### REVIEW_EDIT_WINDOW_EXPIRED
**HTTP Status:** 403
**Description:** Cannot edit review after 7 days
**Resolution:** Review edit window has expired

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "REVIEW_EDIT_WINDOW_EXPIRED",
    "message": "Reviews can only be edited within 7 days of creation",
    "details": {
      "createdAt": "2025-11-15T10:00:00Z",
      "editDeadline": "2025-11-22T10:00:00Z"
    }
  }
}
```

---

### REVIEW_INVALID_RATING
**HTTP Status:** 400
**Description:** Rating must be between 1 and 5
**Resolution:** Provide valid rating

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "REVIEW_INVALID_RATING",
    "message": "Rating must be between 1 and 5 stars",
    "details": {
      "providedRating": 0,
      "validRange": [1, 5]
    }
  }
}
```

---

## Admin Errors

### ADMIN_VENDOR_ALREADY_APPROVED
**HTTP Status:** 409
**Description:** Vendor application has already been approved
**Resolution:** Cannot approve twice

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "ADMIN_VENDOR_ALREADY_APPROVED",
    "message": "Vendor application has already been approved",
    "details": {
      "approvedAt": "2025-11-28T14:00:00Z",
      "approvedBy": "admin-uuid"
    }
  }
}
```

---

### ADMIN_VENDOR_ALREADY_REJECTED
**HTTP Status:** 409
**Description:** Vendor application has already been rejected
**Resolution:** Cannot reject twice

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "ADMIN_VENDOR_ALREADY_REJECTED",
    "message": "Vendor application has already been rejected",
    "details": {
      "rejectedAt": "2025-11-28T14:00:00Z",
      "rejectedBy": "admin-uuid",
      "reason": "Business license verification failed"
    }
  }
}
```

---

### ADMIN_DISPUTE_NOT_FOUND
**HTTP Status:** 404
**Description:** Dispute with specified ID does not exist
**Resolution:** Verify dispute ID is correct

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "ADMIN_DISPUTE_NOT_FOUND",
    "message": "Dispute not found",
    "details": {
      "disputeId": "uuid"
    }
  }
}
```

---

### ADMIN_DISPUTE_ALREADY_RESOLVED
**HTTP Status:** 409
**Description:** Dispute has already been resolved
**Resolution:** Cannot resolve twice

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "ADMIN_DISPUTE_ALREADY_RESOLVED",
    "message": "Dispute has already been resolved",
    "details": {
      "resolvedAt": "2025-12-02T10:00:00Z",
      "resolvedBy": "admin-uuid",
      "outcome": "REFUND"
    }
  }
}
```

---

### ADMIN_VIOLATION_NOT_FOUND
**HTTP Status:** 404
**Description:** Violation with specified ID does not exist
**Resolution:** Verify violation ID is correct

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "ADMIN_VIOLATION_NOT_FOUND",
    "message": "Violation not found",
    "details": {
      "violationId": "uuid"
    }
  }
}
```

---

## Rate Limiting Errors

### RATE_LIMIT_EXCEEDED
**HTTP Status:** 429
**Description:** Too many requests within rate limit window
**Resolution:** Wait for rate limit to reset

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please try again in 45 seconds.",
    "details": {
      "limit": 100,
      "remaining": 0,
      "resetAt": "2025-12-03T15:31:00Z",
      "retryAfter": 45
    }
  }
}
```

**Response Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1701619260
Retry-After: 45
```

---

### RATE_LIMIT_LOGIN_ATTEMPTS
**HTTP Status:** 429
**Description:** Too many failed login attempts
**Resolution:** Wait 15 minutes before trying again

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_LOGIN_ATTEMPTS",
    "message": "Too many failed login attempts. Account temporarily locked.",
    "details": {
      "lockoutDuration": 900,
      "retryAfter": 900
    }
  }
}
```

---

## Server Errors

### INTERNAL_SERVER_ERROR
**HTTP Status:** 500
**Description:** Unexpected server error occurred
**Resolution:** Try again or contact support if persists

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred. Please try again.",
    "details": {
      "requestId": "uuid",
      "timestamp": "2025-12-03T15:30:00Z"
    }
  }
}
```

---

### SERVICE_UNAVAILABLE
**HTTP Status:** 503
**Description:** Service temporarily unavailable (maintenance or overload)
**Resolution:** Try again later

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "Service temporarily unavailable. Please try again later.",
    "details": {
      "retryAfter": 300
    }
  }
}
```

**Response Headers:**
```
Retry-After: 300
```

---

### DATABASE_CONNECTION_ERROR
**HTTP Status:** 503
**Description:** Database connection failed
**Resolution:** Try again in a few moments

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "DATABASE_CONNECTION_ERROR",
    "message": "Database temporarily unavailable. Please try again.",
    "details": {
      "retryable": true
    }
  }
}
```

---

### REDIS_CONNECTION_ERROR
**HTTP Status:** 503
**Description:** Redis connection failed (affects sessions, caching)
**Resolution:** Try again or contact support

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "REDIS_CONNECTION_ERROR",
    "message": "Cache service temporarily unavailable",
    "details": {
      "retryable": true
    }
  }
}
```

---

## Error Code Quick Reference

| Code | HTTP Status | Category |
|------|-------------|----------|
| UNAUTHORIZED | 401 | Auth |
| INVALID_TOKEN | 401 | Auth |
| TOKEN_EXPIRED | 401 | Auth |
| SESSION_REVOKED | 401 | Auth |
| INVALID_CREDENTIALS | 401 | Auth |
| EMAIL_NOT_VERIFIED | 401 | Auth |
| FORBIDDEN | 403 | Authorization |
| INSUFFICIENT_PERMISSIONS | 403 | Authorization |
| ACCOUNT_SUSPENDED | 403 | Authorization |
| ACCOUNT_BANNED | 403 | Authorization |
| VALIDATION_ERROR | 400 | Validation |
| INVALID_INPUT | 400 | Validation |
| INVALID_DATE_FORMAT | 400 | Validation |
| INVALID_UUID | 400 | Validation |
| USER_NOT_FOUND | 404 | User |
| EMAIL_ALREADY_EXISTS | 409 | User |
| PASSWORD_TOO_WEAK | 400 | User |
| VENDOR_NOT_FOUND | 404 | Vendor |
| VENDOR_APPLICATION_EXISTS | 409 | Vendor |
| VENDOR_NOT_APPROVED | 403 | Vendor |
| VENDOR_UNAVAILABLE | 409 | Vendor |
| BOOKING_NOT_FOUND | 404 | Booking |
| BOOKING_ALREADY_ACCEPTED | 409 | Booking |
| BOOKING_EXPIRED | 409 | Booking |
| PAYMENT_NOT_FOUND | 404 | Payment |
| PAYMENT_AUTHORIZATION_FAILED | 400 | Payment |
| PAYMENT_ALREADY_AUTHORIZED | 409 | Payment |
| MESSAGE_BLOCKED | 400 | Message |
| MESSAGE_CONTAINS_CONTACT_INFO | 400 | Message |
| REVIEW_NOT_FOUND | 404 | Review |
| REVIEW_ALREADY_EXISTS | 409 | Review |
| RATE_LIMIT_EXCEEDED | 429 | Rate Limit |
| INTERNAL_SERVER_ERROR | 500 | Server |
| SERVICE_UNAVAILABLE | 503 | Server |

---

**Document Version:** 1.0
**Last Updated:** 2025-12-03
**Author:** Ellis_Endpoints
**Total Error Codes:** 60+
