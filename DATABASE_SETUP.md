# Fleet Feast Database Setup Guide

This guide covers setting up the PostgreSQL database, running migrations, and seeding test data for Fleet Feast.

## Prerequisites

- PostgreSQL 15+ installed and running
- Node.js 20+ installed
- npm 10+ installed

## Quick Start

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Set up PostgreSQL database
createdb fleet_feast

# 3. Configure environment variables
cp .env.example .env
# Edit .env and update DATABASE_URL with your PostgreSQL credentials

# 4. Run migrations
npx prisma migrate deploy

# 5. Seed the database
npx prisma db seed

# 6. Verify setup
npx prisma studio
```

## Environment Variables

The `.env` file should contain:

```env
# Database connection string
DATABASE_URL="postgresql://username:password@localhost:5432/fleet_feast?schema=public"
```

Replace `username` and `password` with your PostgreSQL credentials.

## Database Schema

The Fleet Feast database consists of 11 core entities:

### User Management
- **users** - User accounts (customers, vendors, admins)
- **vendors** - Vendor business profiles
- **vendor_documents** - Verification documents (licenses, permits)
- **vendor_menus** - Menu items and pricing

### Booking & Availability
- **availability** - Vendor calendar availability
- **bookings** - Event bookings
- **payments** - Payment tracking with Stripe integration

### Communication & Reviews
- **messages** - In-app messaging between customers and vendors
- **reviews** - Customer and vendor ratings

### Moderation
- **violations** - Platform policy violations
- **disputes** - Booking disputes and resolutions

## Migration Commands

### Development Environment

```bash
# Generate a new migration (after schema changes)
npx prisma migrate dev --name description_of_change

# Apply all pending migrations
npx prisma migrate deploy

# Reset database (WARNING: destroys all data)
npx prisma migrate reset

# View migration status
npx prisma migrate status
```

### Production Environment

```bash
# Deploy migrations (does not seed)
npx prisma migrate deploy

# Check migration status
npx prisma migrate status
```

## Seeding Test Data

The seed script (`prisma/seed.ts`) creates comprehensive test data:

### Users (10 total)
- **2 Admins**
  - `admin@fleetfeast.com` / `Admin123!`
  - `support@fleetfeast.com` / `Admin123!`

- **5 Vendors**
  - `tacos.loco@fleetfeast.com` / `Vendor123!` (APPROVED)
  - `bbq.masters@fleetfeast.com` / `Vendor123!` (APPROVED)
  - `asian.fusion@fleetfeast.com` / `Vendor123!` (APPROVED)
  - `italian.delight@fleetfeast.com` / `Vendor123!` (APPROVED)
  - `vegan.vibes@fleetfeast.com` / `Vendor123!` (APPROVED)
  - Additional: `seafood.shack@`, `coffee.cart@`, `dessert.dreams@`, `pending.vendor@`, `suspended.vendor@`

- **20 Customers**
  - `john.doe@example.com` / `Customer123!`
  - `jane.smith@example.com` / `Customer123!`
  - Plus 18 more customer accounts

### Vendor Data
- **10 Vendor Profiles** (various cuisines: Mexican, BBQ, Asian, Italian, Vegan, Seafood, Coffee, Desserts, American)
  - 8 APPROVED, 1 PENDING, 1 SUSPENDED
  - All with realistic NYC locations and service areas
  - 3 approved vendors have Stripe accounts connected

### Documents & Menus
- **30 Vendor Documents** (business licenses, health permits, insurance)
  - Most verified, some pending review
- **8 Vendor Menus** with sample menu items

### Availability
- **~240 Availability Entries** (30 days for 8 approved vendors)
  - Realistic availability patterns (80% available)

### Bookings
- **30 Sample Bookings** across all statuses:
  - 10 COMPLETED (past events with reviews)
  - 8 CONFIRMED (upcoming events)
  - 5 PENDING (awaiting vendor response)
  - 3 CANCELLED (with refunds)
  - 1 DISPUTED (active dispute)

### Payments
- **27 Payment Records** matching bookings
  - Various states: RELEASED, AUTHORIZED, PENDING, REFUNDED, CAPTURED

### Messages
- **60+ Messages** across booking threads
  - Realistic conversation patterns
  - Some flagged for content review (contact info sharing)

### Reviews
- **15 Reviews** from completed bookings
  - Mix of customer→vendor and vendor→customer
  - Ratings from 2-5 stars

### Violations & Disputes
- **5 Violations** (contact info sharing, spam)
- **1 Active Dispute** (investigating status)

## Resetting the Database

To clear all data and reseed:

```bash
# Full reset (drops database, runs migrations, seeds)
npx prisma migrate reset

# Manual approach
npx prisma migrate reset --skip-seed
npx prisma db seed
```

## Prisma Studio

Prisma Studio provides a GUI for browsing and editing database data:

```bash
npx prisma studio
```

Access at: http://localhost:5555

## Troubleshooting

### Connection Refused
```
Error: P1000: Authentication failed
```
**Solution**: Check PostgreSQL is running and credentials in `.env` are correct.

### Database Does Not Exist
```
Error: P1003: Database fleet_feast does not exist
```
**Solution**: Create the database first:
```bash
createdb fleet_feast
# or via psql:
psql -U postgres -c "CREATE DATABASE fleet_feast;"
```

### Migration Conflicts
```
Error: Migration ... conflicts with existing migration
```
**Solution**: In development, you can reset:
```bash
npx prisma migrate reset
```

### Seed Script Fails
```
Error: Foreign key constraint violation
```
**Solution**: Ensure migrations are applied before seeding:
```bash
npx prisma migrate deploy
npx prisma db seed
```

## Schema Changes Workflow

1. Edit `prisma/schema.prisma`
2. Generate migration:
   ```bash
   npx prisma migrate dev --name your_change_description
   ```
3. Review generated SQL in `prisma/migrations/`
4. Test migration on development database
5. Commit migration files to version control

## Production Deployment

1. Ensure all migrations are committed to git
2. Deploy code to production
3. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```
4. **Do NOT run seed script in production**

## Database Backup & Restore

### Backup
```bash
pg_dump -U postgres fleet_feast > fleet_feast_backup.sql
```

### Restore
```bash
psql -U postgres fleet_feast < fleet_feast_backup.sql
```

## Performance Considerations

The schema includes optimized indexes for:
- User lookups (email, role + status)
- Vendor search (cuisine type, status, location)
- Booking queries (customer, vendor, event date)
- Message threads (booking ID, sender)
- Payment processing (status + captured date)

## Security Notes

1. **Never commit `.env` to version control** - Use `.env.example` as template
2. **Rotate database credentials regularly** in production
3. **Use SSL connections** for production databases
4. **Limit database user permissions** - Don't use superuser accounts
5. **Enable PostgreSQL audit logging** for compliance

## Next Steps

After database setup:
1. Review schema in Prisma Studio
2. Test authentication with seed users
3. Test booking workflow end-to-end
4. Configure Stripe webhooks for payment handling
5. Set up S3 for document uploads

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Fleet Feast Schema Registry](./docs/Schema_Registry.md)
