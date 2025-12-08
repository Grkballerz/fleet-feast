# Task 1.2: Database Schema Design

## Objective
Design the complete PostgreSQL database schema for all Fleet Feast data entities with proper relationships, indexes, and constraints.

## Requirements (from PRD)
Data Entities:
- User: id, email, password_hash, role, created_at, status
- Vendor: id, user_id, business_name, cuisine_type, capacity_min, capacity_max, price_range, status, approved_at
- VendorDocument: id, vendor_id, type, file_url, verified, verified_at
- VendorMenu: id, vendor_id, items (JSON), pricing_model
- Availability: id, vendor_id, date, is_available
- Booking: id, customer_id, vendor_id, event_date, event_time, location, guest_count, event_type, status, total_amount, platform_fee, vendor_payout, created_at
- Payment: id, booking_id, stripe_payment_id, amount, status, captured_at, released_at
- Message: id, booking_id, sender_id, content, flagged, created_at
- Review: id, booking_id, reviewer_id, reviewee_id, rating, content, created_at
- Violation: id, user_id, type, description, action_taken, created_at
- Dispute: id, booking_id, initiator_id, reason, status, resolution, resolved_at

## Acceptance Criteria
- [ ] All 10+ entities defined with proper data types
- [ ] Foreign key relationships established
- [ ] Indexes defined for query performance
- [ ] Constraints for data integrity (NOT NULL, UNIQUE, CHECK)
- [ ] Enum types for status fields
- [ ] Timestamps with timezone support
- [ ] Soft delete strategy defined

## Deliverables
- [ ] prisma/schema.prisma (complete schema)
- [ ] docs/Schema_Registry.md (updated)
- [ ] Database ERD diagram

## Dependencies
- [ ] Task 1.1 - System Architecture Design

## Assigned
Dana_Database

## Priority
high

## Files
- prisma/schema.prisma
- docs/Schema_Registry.md

## Status
[ ]
