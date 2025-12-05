# Fleet Feast Test Data Reference

Quick reference for test accounts and sample data created by the seed script.

## Test Credentials

### Admin Accounts
| Email | Password | Role |
|-------|----------|------|
| admin@fleetfeast.com | Admin123! | ADMIN |
| support@fleetfeast.com | Admin123! | ADMIN |
| moderator@fleetfeast.com | Admin123! | ADMIN |

### Vendor Accounts (Approved)
| Email | Business Name | Cuisine | Password | Stripe Connected |
|-------|---------------|---------|----------|------------------|
| tacos.loco@fleetfeast.com | Tacos Loco NYC | Mexican | Vendor123! | Yes |
| bbq.masters@fleetfeast.com | BBQ Masters | BBQ | Vendor123! | Yes |
| asian.fusion@fleetfeast.com | Asian Fusion Express | Asian | Vendor123! | Yes |
| italian.delight@fleetfeast.com | Italian Delight Truck | Italian | Vendor123! | Yes |
| vegan.vibes@fleetfeast.com | Vegan Vibes | Vegan | Vendor123! | Yes |
| seafood.shack@fleetfeast.com | Seafood Shack on Wheels | Seafood | Vendor123! | Yes |
| coffee.cart@fleetfeast.com | Artisan Coffee Cart | Coffee | Vendor123! | Yes |
| dessert.dreams@fleetfeast.com | Dessert Dreams | Desserts | Vendor123! | Yes |

### Vendor Accounts (Other Status)
| Email | Business Name | Status | Password |
|-------|---------------|--------|----------|
| pending.vendor@fleetfeast.com | New American Food Co | PENDING | Vendor123! |
| suspended.vendor@fleetfeast.com | Spicy Street Food | SUSPENDED | Vendor123! |

### Customer Accounts
| Email | Password |
|-------|----------|
| john.doe@example.com | Customer123! |
| jane.smith@example.com | Customer123! |
| mike.johnson@example.com | Customer123! |
| sarah.williams@example.com | Customer123! |
| david.brown@example.com | Customer123! |
| emily.davis@example.com | Customer123! |
| chris.miller@example.com | Customer123! |
| amanda.wilson@example.com | Customer123! |
| robert.moore@example.com | Customer123! |
| lisa.taylor@example.com | Customer123! |
| james.anderson@example.com | Customer123! |
| maria.thomas@example.com | Customer123! |
| kevin.jackson@example.com | Customer123! |
| linda.white@example.com | Customer123! |
| daniel.harris@example.com | Customer123! |
| patricia.martin@example.com | Customer123! |
| mark.thompson@example.com | Customer123! |
| jennifer.garcia@example.com | Customer123! |
| paul.martinez@example.com | Customer123! |
| nancy.robinson@example.com | Customer123! |

## Sample Bookings

### Completed Bookings (10)
- **Status**: COMPLETED
- **Payment**: RELEASED (funds transferred to vendor)
- **Reviews**: Some have reviews (4-5 stars)
- **Date Range**: Past events (Sept - Nov 2024)

### Upcoming Confirmed Bookings (8)
- **Status**: CONFIRMED
- **Payment**: AUTHORIZED (funds held in escrow)
- **Event Dates**: December 2024 - January 2025

### Pending Bookings (5)
- **Status**: PENDING
- **Awaiting**: Vendor response
- **Payment**: PENDING (not yet authorized)

### Cancelled Bookings (3)
- **Status**: CANCELLED
- **Payment**: REFUNDED (50% refund applied)
- **Reason**: Various (scheduling conflicts, weather)

### Disputed Booking (1)
- **Status**: DISPUTED
- **Payment**: CAPTURED (held pending resolution)
- **Dispute Reason**: Food quality issues
- **Dispute Status**: INVESTIGATING

## Sample Messages

- **Total Messages**: ~60
- **Flagged Messages**: ~10 (contain phone numbers or contact info)
- **Conversation Threads**: Across 15 bookings
- **Content**: Realistic booking-related conversations

## Sample Reviews

- **Total Reviews**: 15
- **Rating Distribution**:
  - 5 stars: ~70%
  - 4 stars: ~20%
  - 2-3 stars: ~10%
- **Customer → Vendor**: Most reviews
- **Vendor → Customer**: Some reciprocal reviews

## Violations

- **Total**: 5
- **Types**:
  - Contact Info Sharing: 3
  - Spam: 1
  - Circumvention Attempt: 1
- **Actions Taken**:
  - Warnings: 4
  - Suspension: 1 (30 days)

## Disputes

- **Active Disputes**: 1 (INVESTIGATING status)
- **Resolved Disputes**: 1 (RESOLVED_REFUND status)

## Vendor Documents

- **Total**: 30 documents
- **Types**:
  - Business Licenses: 10
  - Health Permits: 8
  - Insurance: 8
  - Tax IDs: 2
  - Vehicle Registrations: 2
- **Verification Status**:
  - Verified: ~24 documents
  - Pending Verification: ~6 documents

## Vendor Menus

- **Total Menus**: 8 (one per approved vendor)
- **Items per Menu**: 3-5 items
- **Pricing Model**: All use "per_person"
- **Dietary Tags**: Vegetarian, vegan, gluten-free options included

## Availability

- **Total Entries**: ~240
- **Date Range**: Next 30 days
- **Vendors with Availability**: 8 approved vendors
- **Availability Rate**: ~80% of dates marked available

## Testing Workflows

### 1. Customer Booking Flow
1. Login as: john.doe@example.com / Customer123!
2. Browse vendors (8 approved vendors available)
3. View vendor menus and availability
4. Create booking (pending vendor response)
5. Send messages to vendor
6. Await vendor acceptance

### 2. Vendor Booking Management
1. Login as: tacos.loco@fleetfeast.com / Vendor123!
2. View pending bookings (5 available)
3. Accept or decline booking
4. Manage availability calendar
5. Respond to customer messages
6. View completed bookings and reviews

### 3. Admin Moderation
1. Login as: admin@fleetfeast.com / Admin123!
2. Review flagged messages (10 flagged)
3. Review pending vendor applications (1 pending)
4. Verify vendor documents (6 pending)
5. Resolve disputes (1 active)
6. Review violations (5 total)

### 4. Payment Processing
1. Test payment authorization (8 confirmed bookings)
2. Test payment capture (after event completion)
3. Test escrow release (7 days post-event)
4. Test refund processing (3 cancelled bookings)
5. View payment history

### 5. Review System
1. Complete a booking
2. Leave review (1-5 stars)
3. View vendor reviews (average ratings)
4. Reciprocal reviews (vendor → customer)

## Database Queries for Testing

### Find all pending vendor applications
```sql
SELECT * FROM vendors WHERE status = 'PENDING';
```

### Find bookings awaiting payment
```sql
SELECT b.*, p.status as payment_status
FROM bookings b
JOIN payments p ON b.id = p.booking_id
WHERE b.status = 'ACCEPTED' AND p.status = 'PENDING';
```

### Find flagged messages
```sql
SELECT m.*, b.id as booking_id
FROM messages m
JOIN bookings b ON m.booking_id = b.id
WHERE m.flagged = true AND m.reviewed_at IS NULL;
```

### Find payments ready for escrow release
```sql
SELECT * FROM payments
WHERE status = 'CAPTURED'
AND captured_at < NOW() - INTERVAL '7 days';
```

### Vendor performance metrics
```sql
SELECT
  u.email,
  v.business_name,
  COUNT(DISTINCT b.id) as total_bookings,
  AVG(r.rating) as avg_rating,
  COUNT(DISTINCT r.id) as review_count
FROM vendors v
JOIN users u ON v.user_id = u.id
LEFT JOIN bookings b ON b.vendor_id = u.id
LEFT JOIN reviews r ON r.reviewee_id = u.id
WHERE v.status = 'APPROVED'
GROUP BY u.email, v.business_name
ORDER BY avg_rating DESC;
```

## Resetting Test Data

To reset all test data and reseed:

```bash
# WARNING: This destroys all data
npx prisma migrate reset

# This will:
# 1. Drop and recreate the database
# 2. Run all migrations
# 3. Run the seed script
```

## Notes

- All passwords use bcrypt hashing (cost factor 12)
- All timestamps are in UTC
- Soft deletes are used (deleted_at column)
- Foreign key constraints are enforced
- Stripe IDs are test values (non-functional)

---

**Last Updated**: 2024-12-04
**Seed Script**: prisma/seed.ts
**Total Entities**: ~400+ records
