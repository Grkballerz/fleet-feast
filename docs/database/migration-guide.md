# Fleet Feast - Database Migration Guide

**Version**: 1.0
**Date**: 2025-12-03
**Author**: Dana_Database

---

## Table of Contents

1. [Overview](#overview)
2. [Development Workflow](#development-workflow)
3. [Staging Deployment](#staging-deployment)
4. [Production Deployment](#production-deployment)
5. [Zero-Downtime Migration Patterns](#zero-downtime-migration-patterns)
6. [Rollback Procedures](#rollback-procedures)
7. [Seeding Data](#seeding-data)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)

---

## Overview

This guide covers database migration strategies for Fleet Feast using Prisma ORM. The migration system follows a three-tier deployment process:

1. **Development**: Create and test migrations locally
2. **Staging**: Validate migrations in production-like environment
3. **Production**: Deploy with zero-downtime strategies

### Migration Philosophy

- **Version-controlled**: All migrations stored in `prisma/migrations/` and committed to Git
- **Forward-only**: Migrations should be additive; rollbacks handled via new migrations
- **Tested**: Every migration tested on staging before production
- **Documented**: Complex migrations include inline SQL comments
- **Atomic**: Migrations run in transactions (PostgreSQL default)

---

## Development Workflow

### 1. Making Schema Changes

Edit `prisma/schema.prisma` to add/modify models, fields, or relationships.

**Example: Adding a new field**
```prisma
model Vendor {
  // ... existing fields

  // New field
  loyaltyTier  String?  @map("loyalty_tier")  // "bronze", "silver", "gold"

  // ... rest of schema
}
```

### 2. Create Migration

```bash
# Create migration with descriptive name
npx prisma migrate dev --name add_vendor_loyalty_tier

# Prisma will:
# 1. Generate SQL migration file
# 2. Apply to local database
# 3. Regenerate Prisma Client types
# 4. Run seed script (if configured)
```

**Output:**
```
✔ Generated Prisma Client
✔ The migration has been created successfully
✔ Applied migration: 20251203120000_add_vendor_loyalty_tier
```

### 3. Review Generated SQL

```bash
# View migration SQL
cat prisma/migrations/20251203120000_add_vendor_loyalty_tier/migration.sql
```

**Example migration.sql:**
```sql
-- AlterTable
ALTER TABLE "vendors" ADD COLUMN "loyalty_tier" TEXT;

-- CreateIndex (if added)
CREATE INDEX "idx_vendor_loyalty" ON "vendors"("loyalty_tier");
```

### 4. Test Migration

```typescript
// Test new field in your code
import { prisma } from '@/lib/prisma';

const vendor = await prisma.vendor.update({
  where: { id: vendorId },
  data: { loyaltyTier: 'gold' }
});

console.log(vendor.loyaltyTier); // Should be typed and work
```

### 5. Commit Migration

```bash
git add prisma/migrations/
git add prisma/schema.prisma
git commit -m "feat: Add vendor loyalty tier field"
git push
```

### 6. Reset Database (if needed during development)

```bash
# WARNING: Deletes all data and recreates schema
npx prisma migrate reset

# This will:
# 1. Drop database
# 2. Create database
# 3. Run all migrations
# 4. Run seed script
```

---

## Staging Deployment

### Pre-Deployment Checklist

- [ ] All migrations committed to Git
- [ ] Migrations tested locally
- [ ] Migration SQL reviewed for performance impact
- [ ] Backup staging database (if needed)
- [ ] Team notified of deployment

### Deployment Steps

```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies (if package.json changed)
npm install

# 3. Apply migrations (does NOT create new migrations)
npx prisma migrate deploy

# Output:
# ✔ Applied migration: 20251203120000_add_vendor_loyalty_tier
# 1 migration applied

# 4. Regenerate Prisma Client
npx prisma generate

# 5. Restart application server
npm run build
npm start
```

### Validation

```bash
# Check migration status
npx prisma migrate status

# Expected output:
# Database schema is up to date!

# Verify database schema
npx prisma db pull
# (Should not generate any changes to schema.prisma)
```

### Staging Testing

1. **Smoke Tests**: Run automated test suite
2. **Manual Testing**: Test affected features in UI
3. **Performance Testing**: Check query performance with `EXPLAIN ANALYZE`
4. **Rollback Testing**: Verify rollback procedure (see below)

---

## Production Deployment

### Critical Pre-Deployment Steps

#### 1. Backup Database

```bash
# Option A: Using pg_dump (PostgreSQL)
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Option B: Using cloud provider backup (Neon, Railway, etc.)
# Use provider's dashboard or CLI to create snapshot
```

#### 2. Review Migration SQL

```bash
# Review all pending migrations
cat prisma/migrations/*/migration.sql

# Check for:
# - Destructive operations (DROP COLUMN, DROP TABLE)
# - Lock-heavy operations (ALTER TABLE on large tables)
# - Missing indexes (should be added in separate migration)
# - Data migrations (UPDATE statements)
```

#### 3. Estimate Downtime

| Operation | Table Size | Estimated Lock Time | Requires Downtime? |
|-----------|------------|---------------------|--------------------|
| ADD COLUMN (nullable) | Any | < 1s | No |
| ADD COLUMN (NOT NULL, no default) | Any | Requires backfill | Yes |
| CREATE INDEX | > 1M rows | Minutes | Use `CONCURRENTLY` |
| DROP COLUMN | Any | < 1s | No (if not in use) |
| ALTER COLUMN TYPE | > 100K rows | Seconds-Minutes | Yes |
| ADD CONSTRAINT | > 100K rows | Seconds | Maybe |

#### 4. Write Rollback Plan

**Example rollback.sql** (manually created):
```sql
-- Rollback for: 20251203120000_add_vendor_loyalty_tier
-- If migration fails or needs reverting

BEGIN;

-- Drop the new column
ALTER TABLE vendors DROP COLUMN loyalty_tier;

-- Drop the new index (if created)
DROP INDEX IF EXISTS idx_vendor_loyalty;

COMMIT;
```

Save as: `prisma/migrations/20251203120000_add_vendor_loyalty_tier/rollback.sql`

### Production Deployment Steps

#### Standard Deployment (< 5 minute downtime acceptable)

```bash
# 1. Enable maintenance mode (optional)
# Set environment variable or use load balancer

# 2. Stop application servers
# (Prevents new connections during migration)

# 3. Apply migrations
npx prisma migrate deploy

# 4. Regenerate Prisma Client
npx prisma generate

# 5. Restart application
npm run build
npm start

# 6. Disable maintenance mode
```

#### Zero-Downtime Deployment (see next section)

For large-scale changes that require zero downtime.

### Post-Deployment

#### 1. Monitor Application

```bash
# Check application logs
tail -f logs/application.log

# Check database connections
# (Use your database provider's monitoring dashboard)

# Check error rates
# (Use Sentry, Datadog, or similar)
```

#### 2. Verify Migration

```bash
npx prisma migrate status

# Expected:
# Database schema is up to date!
```

#### 3. Test Critical Flows

- User authentication
- Booking creation
- Payment processing
- Message sending
- Admin operations

#### 4. Rollback if Issues Detected

```bash
# If errors detected within first 15 minutes:
psql $DATABASE_URL < prisma/migrations/20251203120000_add_vendor_loyalty_tier/rollback.sql

# Revert code
git revert <commit-hash>
git push

# Redeploy previous version
# (Follow CI/CD pipeline)
```

---

## Zero-Downtime Migration Patterns

### Pattern 1: Adding a Nullable Column

**Safe**: No downtime required

```prisma
model Vendor {
  // Add new field as nullable
  loyaltyTier  String?  @map("loyalty_tier")
}
```

**Migration SQL:**
```sql
ALTER TABLE vendors ADD COLUMN loyalty_tier TEXT;
```

**Why it's safe**: Adding a nullable column doesn't require a table rewrite in PostgreSQL.

---

### Pattern 2: Adding a NOT NULL Column

**Unsafe**: Requires multi-step deployment

#### Step 1: Add Nullable Column with Default

```prisma
model Vendor {
  loyaltyTier  String?  @default("bronze")  @map("loyalty_tier")
}
```

```bash
npx prisma migrate dev --name add_loyalty_tier_nullable
```

Deploy to production:
```bash
npx prisma migrate deploy
```

#### Step 2: Backfill Existing Data

```sql
-- Run in batches to avoid locking table
UPDATE vendors
SET loyalty_tier = 'bronze'
WHERE loyalty_tier IS NULL
LIMIT 1000;
-- Repeat until all rows updated
```

Or use Prisma script:
```typescript
// scripts/backfill-loyalty-tier.ts
import { prisma } from '@/lib/prisma';

async function backfill() {
  const batchSize = 1000;
  let processed = 0;

  while (true) {
    const result = await prisma.vendor.updateMany({
      where: { loyaltyTier: null },
      data: { loyaltyTier: 'bronze' },
      take: batchSize,
    });

    processed += result.count;
    console.log(`Backfilled ${processed} vendors`);

    if (result.count < batchSize) break;
    await new Promise(resolve => setTimeout(resolve, 100)); // Rate limit
  }
}

backfill();
```

#### Step 3: Make Column NOT NULL

```prisma
model Vendor {
  loyaltyTier  String  @default("bronze")  @map("loyalty_tier")
}
```

```bash
npx prisma migrate dev --name make_loyalty_tier_not_null
```

**Migration SQL:**
```sql
ALTER TABLE vendors ALTER COLUMN loyalty_tier SET NOT NULL;
```

Deploy to production:
```bash
npx prisma migrate deploy
```

---

### Pattern 3: Renaming a Column (Backward-Compatible)

**Goal**: Rename `name` → `business_name` without downtime

#### Step 1: Add New Column

```prisma
model Vendor {
  name         String?  // Keep old column
  businessName String?  @map("business_name")  // Add new column
}
```

```bash
npx prisma migrate dev --name add_business_name_column
npx prisma migrate deploy
```

#### Step 2: Dual-Write in Application

```typescript
// Update application code to write to BOTH columns
await prisma.vendor.create({
  data: {
    name: businessName,         // Old column (for compatibility)
    businessName: businessName, // New column
  }
});
```

Deploy application code.

#### Step 3: Backfill Data

```sql
UPDATE vendors SET business_name = name WHERE business_name IS NULL;
```

#### Step 4: Switch Reads to New Column

```typescript
// Update application code to read from new column
const vendor = await prisma.vendor.findUnique({
  where: { id },
  select: {
    businessName: true,  // Read from new column
    // Remove 'name' from selects
  }
});
```

Deploy application code.

#### Step 5: Drop Old Column

```prisma
model Vendor {
  businessName String  @map("business_name")  // Only new column remains
}
```

```bash
npx prisma migrate dev --name drop_name_column
npx prisma migrate deploy
```

---

### Pattern 4: Creating an Index on Large Table

**Problem**: `CREATE INDEX` locks table for reads/writes

**Solution**: Use `CONCURRENTLY` (requires raw SQL)

#### Create Migration File Manually

```bash
npx prisma migrate dev --create-only --name add_vendor_search_index
```

Edit generated migration file:
```sql
-- prisma/migrations/20251203120000_add_vendor_search_index/migration.sql

-- Use CONCURRENTLY to avoid locking table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vendor_search
ON vendors(cuisine_type, status, approved_at);
```

Apply migration:
```bash
npx prisma migrate resolve --applied 20251203120000_add_vendor_search_index
npx prisma migrate deploy
```

**Note**: Prisma doesn't generate `CONCURRENTLY` by default, so manual editing required.

---

### Pattern 5: Changing Column Type

**Risky**: May require table rewrite

#### Safe Changes (No Rewrite)
- `VARCHAR(50)` → `VARCHAR(100)` (increasing length)
- `INT` → `BIGINT` (in PostgreSQL 12+)

#### Unsafe Changes (Requires Rewrite)
- `VARCHAR` → `TEXT` (PostgreSQL 9.1+, no rewrite)
- `TEXT` → `INTEGER` (requires conversion, fails on invalid data)

**Example: Safe Type Change**
```sql
-- From VARCHAR(100) to VARCHAR(255)
ALTER TABLE vendors ALTER COLUMN business_name TYPE VARCHAR(255);
```

**Example: Unsafe Type Change (use multi-step)**

#### Step 1: Add New Column
```sql
ALTER TABLE bookings ADD COLUMN guest_count_new BIGINT;
```

#### Step 2: Backfill
```sql
UPDATE bookings SET guest_count_new = guest_count::BIGINT;
```

#### Step 3: Drop Old, Rename New
```sql
ALTER TABLE bookings DROP COLUMN guest_count;
ALTER TABLE bookings RENAME COLUMN guest_count_new TO guest_count;
```

---

## Rollback Procedures

### Automatic Rollback (Migration Fails)

If a migration fails during `npx prisma migrate deploy`, Prisma automatically rolls back the transaction.

**Example:**
```
❌ Migration failed to apply
Error: Column "invalid_column" does not exist
Rolling back...
✔ Rollback successful
```

### Manual Rollback (Post-Deployment Issues)

#### 1. Identify Last Good State

```bash
npx prisma migrate status

# Output shows applied migrations:
# ✔ 20251201120000_initial_schema
# ✔ 20251202150000_add_vendor_fields
# ✘ 20251203120000_add_loyalty_tier (need to rollback)
```

#### 2. Create Rollback SQL

```sql
-- rollback.sql
BEGIN;

-- Reverse changes from 20251203120000_add_loyalty_tier
ALTER TABLE vendors DROP COLUMN loyalty_tier;
DROP INDEX IF EXISTS idx_vendor_loyalty;

-- Mark migration as rolled back in Prisma
DELETE FROM "_prisma_migrations"
WHERE migration_name = '20251203120000_add_loyalty_tier';

COMMIT;
```

#### 3. Apply Rollback

```bash
# Backup current state first
pg_dump $DATABASE_URL > backup_before_rollback.sql

# Apply rollback
psql $DATABASE_URL < rollback.sql

# Verify
npx prisma migrate status
```

#### 4. Revert Code

```bash
# Revert commit that introduced migration
git revert <commit-hash>

# Or reset to previous state
git reset --hard <previous-commit>

# Deploy previous version
git push
```

#### 5. Create Forward-Fix Migration

Instead of reverting migration files (which can cause issues), create a new migration to undo changes:

```bash
# Remove field from schema
# Edit prisma/schema.prisma (remove loyaltyTier field)

# Create forward-fix migration
npx prisma migrate dev --name remove_loyalty_tier_field

# This creates a new migration that drops the column
```

---

## Seeding Data

### Running Seed Script

The seed script populates the database with development data.

```bash
# Seed database
npx prisma db seed

# Or run directly
npx ts-node prisma/seed.ts
```

**Output:**
```
🌱 Starting database seed...

👤 Creating admin users...
✅ Created 3 admin users

👥 Creating customer accounts...
✅ Created 20 customer accounts

🚚 Creating vendor accounts and profiles...
✅ Created 10 vendor accounts with profiles

📅 Creating bookings with payments...
✅ Created 30 bookings with payments

💬 Creating messages...
✅ Created 87 messages (7 flagged for review)

⚠️  Creating sample violations...
✅ Created 5 violations

⚖️  Creating sample dispute...
✅ Created 1 active dispute

🎉 Database seed completed successfully!
```

### Seed Script Details

**Location**: `prisma/seed.ts`

**What it creates:**
- **3 admin users** (admin@fleetfeast.com, support@fleetfeast.com, moderator@fleetfeast.com)
- **20 customers** (john.doe@example.com, jane.smith@example.com, etc.)
- **10 vendors** (8 approved, 1 pending, 1 suspended)
- **30 bookings** (10 completed, 8 confirmed, 5 pending, 3 cancelled, 1 disputed)
- **Payments** (1:1 with bookings, various statuses)
- **Messages** (realistic conversations, some flagged for anti-circumvention)
- **Violations** (linked to flagged messages)
- **1 active dispute** (for testing dispute resolution flow)

**Test Credentials:**
```
Admin:    admin@fleetfeast.com / Admin123!
Customer: john.doe@example.com / Customer123!
Vendor:   tacos.loco@fleetfeast.com / Vendor123!
```

### Custom Seed Data

To add custom seed data, edit `prisma/seed.ts`:

```typescript
// Add your custom data
const customVendor = await prisma.vendor.create({
  data: {
    userId: customUser.id,
    businessName: "My Custom Truck",
    // ... other fields
  }
});
```

### Seeding Production (Not Recommended)

**Warning**: Do NOT run seed script in production. It will:
- Create duplicate test accounts
- Generate fake bookings
- Pollute analytics

If you need to add data to production:
1. Create a separate migration script
2. Use `prisma.$transaction()` for safety
3. Test on staging first

---

## Troubleshooting

### Issue 1: Migration Fails with "Column Already Exists"

**Cause**: Migration was partially applied or database manually modified.

**Solution:**
```bash
# Mark migration as applied (if column actually exists)
npx prisma migrate resolve --applied <migration-name>

# Or reset (DELETES ALL DATA)
npx prisma migrate reset
```

---

### Issue 2: "Migration is Not in a Clean State"

**Cause**: Prisma detected unapplied migrations or drift.

**Solution:**
```bash
# View status
npx prisma migrate status

# If drift detected, reset (dev only)
npx prisma migrate reset

# Or manually fix database to match schema
npx prisma db push --force-reset
```

---

### Issue 3: Seed Script Fails

**Cause**: Database already contains data (UNIQUE constraint violations).

**Solution:**
```bash
# Option 1: Reset database (DELETES ALL DATA)
npx prisma migrate reset

# Option 2: Manually delete data
psql $DATABASE_URL
# DELETE FROM users; (repeat for all tables)
```

---

### Issue 4: Prisma Client Not Updated

**Cause**: Schema changed but Prisma Client not regenerated.

**Solution:**
```bash
npx prisma generate

# Or regenerate and apply migrations
npx prisma migrate dev
```

---

### Issue 5: Connection Pool Exhausted During Migration

**Cause**: Too many connections during migration.

**Solution:**
```bash
# Increase connection pool size (temporarily)
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=50"

# Or use connection pooling (PgBouncer, Prisma Data Proxy)
```

---

## Best Practices

### 1. Migration Naming

Use descriptive names that explain the change:

✅ **Good:**
```bash
npx prisma migrate dev --name add_vendor_loyalty_tier
npx prisma migrate dev --name fix_booking_status_enum
npx prisma migrate dev --name optimize_vendor_search_index
```

❌ **Bad:**
```bash
npx prisma migrate dev --name update
npx prisma migrate dev --name fix
npx prisma migrate dev --name test123
```

### 2. Small, Atomic Migrations

**Preferred**: Multiple small migrations
```bash
npx prisma migrate dev --name add_vendor_tier_field
npx prisma migrate dev --name add_vendor_tier_index
npx prisma migrate dev --name backfill_vendor_tier_data
```

**Avoid**: One large migration that does everything

### 3. Test Before Production

Always test migrations in this order:
1. Local development database
2. Staging environment
3. Production environment

### 4. Backup Before Migration

**Always** backup production database before applying migrations:
```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 5. Document Complex Migrations

Add comments to migration SQL for future reference:
```sql
-- Migration: Add loyalty tier system for vendors
-- Date: 2025-12-03
-- Author: Dana_Database
-- Rationale: Support tiered pricing based on vendor performance

ALTER TABLE vendors ADD COLUMN loyalty_tier TEXT;
CREATE INDEX idx_vendor_loyalty ON vendors(loyalty_tier);
```

### 6. Monitor After Deployment

Watch for:
- Increased query latency
- Database connection spikes
- Application errors
- User-reported issues

### 7. Avoid Manual Database Changes

**Never** modify production database directly. Always use migrations:

❌ **Bad:**
```sql
-- Directly in production database
ALTER TABLE vendors ADD COLUMN new_field TEXT;
```

✅ **Good:**
```bash
# Edit schema.prisma
npx prisma migrate dev --name add_new_field
# Deploy to staging, then production
```

### 8. Keep Migration History

**Never delete migration files** from `prisma/migrations/`:
- Git history tracks all changes
- Other developers need migration history
- Rollbacks require understanding of past changes

### 9. Use Transactions for Data Migrations

```typescript
await prisma.$transaction(async (tx) => {
  // Multiple operations in single transaction
  await tx.vendor.updateMany({ ... });
  await tx.booking.updateMany({ ... });
});
```

### 10. Review Generated SQL

Always review the SQL that Prisma generates:
```bash
cat prisma/migrations/*/migration.sql
```

Check for:
- Correct column types
- Proper indexes
- Foreign key constraints
- Performance implications

---

## Summary

This migration guide provides a comprehensive strategy for safely deploying database changes to Fleet Feast. Key takeaways:

✅ **Development**: Use `npx prisma migrate dev` to create and test migrations
✅ **Staging**: Use `npx prisma migrate deploy` to validate before production
✅ **Production**: Always backup, review SQL, and have rollback plan
✅ **Zero-Downtime**: Use multi-step deployments for breaking changes
✅ **Seeding**: Use `npx prisma db seed` for development data only

**Next Steps:**
- Review migration SQL for Task 1.2 schema
- Test seed script locally
- Prepare staging environment for first deployment

---

*Document created by Dana_Database*
*Version: 1.0*
*Date: 2025-12-03*
