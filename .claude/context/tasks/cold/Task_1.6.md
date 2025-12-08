# Task 1.6: Authentication System Setup

## Objective
Implement NextAuth.js authentication with email/password registration, email verification, and JWT tokens.

## Requirements (from PRD)
- F1: User Registration & Auth
- Email/password registration for customers and vendors
- Email verification required
- Password reset functionality
- Role-based access control (Customer, Vendor, Admin)
- bcrypt password hashing
- JWT tokens with secure HTTP-only cookies
- CSRF protection

## Acceptance Criteria
- [ ] NextAuth.js configured with credentials provider
- [ ] User registration endpoint with validation
- [ ] Email verification flow implemented
- [ ] Password reset flow implemented
- [ ] Role-based session data
- [ ] Protected route middleware
- [ ] Secure cookie configuration
- [ ] Rate limiting on auth endpoints

## Deliverables
- [ ] lib/auth.ts (NextAuth configuration)
- [ ] app/api/auth/[...nextauth]/route.ts
- [ ] app/api/auth/register/route.ts
- [ ] app/api/auth/verify-email/route.ts
- [ ] app/api/auth/reset-password/route.ts
- [ ] middleware.ts (route protection)

## Dependencies
- [ ] Task 1.2 - Database Schema Design
- [ ] Task 1.4 - Project Scaffolding

## Assigned
Blake_Backend

## Priority
high

## Files
- lib/auth.ts
- app/api/auth/[...nextauth]/route.ts
- app/api/auth/register/route.ts
- app/api/auth/verify-email/route.ts
- app/api/auth/reset-password/route.ts
- middleware.ts

## Status
[ ]
