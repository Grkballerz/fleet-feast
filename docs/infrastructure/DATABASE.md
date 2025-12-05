# PostgreSQL Database Setup

**Project**: Fleet Feast
**Database**: PostgreSQL 15+
**ORM**: Prisma 5.20+
**Last Updated**: 2025-12-04

---

## Table of Contents

1. [Overview](#overview)
2. [Hosting Options](#hosting-options)
3. [Railway Setup (Recommended for MVP)](#railway-setup-recommended-for-mvp)
4. [AWS RDS Setup (Production)](#aws-rds-setup-production)
5. [Database Configuration](#database-configuration)
6. [Prisma Setup](#prisma-setup)
7. [Migrations](#migrations)
8. [Connection Pooling](#connection-pooling)
9. [Backup and Recovery](#backup-and-recovery)
10. [Performance Optimization](#performance-optimization)
11. [Monitoring](#monitoring)
12. [Troubleshooting](#troubleshooting)

---

## Overview

Fleet Feast uses **PostgreSQL 15+** as the primary database for:
- User accounts and authentication
- Vendor profiles and menus
- Bookings and payments
- Messaging and reviews
- Admin operations

**Key Features**:
- **ACID Compliance**: Ensures data consistency for payments
- **JSON Support**: Flexible schema for vendor menus
- **Full-Text Search**: Built-in search for vendor discovery
- **Robust Indexing**: Fast queries for bookings, availability
- **Proven Reliability**: Battle-tested at scale

---

## Hosting Options

### Option 1: Railway (Recommended for MVP)

**Pros**:
- ✅ Free tier: $5 credit/month (enough for MVP)
- ✅ Zero configuration setup
- ✅ Automatic backups
- ✅ Web-based SQL editor
- ✅ Easy Vercel integration
- ✅ Fast provisioning (2 minutes)

**Cons**:
- ❌ Limited control over database config
- ❌ Shared resources on free tier
- ❌ No read replicas on free tier

**Best for**: MVP, testing, <1000 users

### Option 2: AWS RDS (Recommended for Production)

**Pros**:
- ✅ Full control over instance type, storage
- ✅ Read replicas for scaling
- ✅ Multi-AZ deployment (high availability)
- ✅ Automated backups and point-in-time recovery
- ✅ VPC isolation for security

**Cons**:
- ❌ More complex setup
- ❌ Higher cost ($15-50/month for db.t3.micro)
- ❌ Requires AWS knowledge

**Best for**: Production, >1000 users, enterprise

### Option 3: Neon (Serverless Postgres)

**Pros**:
- ✅ Generous free tier
- ✅ Serverless (scales to zero)
- ✅ Instant branching for testing

**Cons**:
- ❌ Newer service (less proven)
- ❌ Cold start latency

**Best for**: Side projects, experimentation

---

## Railway Setup (Recommended for MVP)

### Step 1: Create Railway Account

1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Verify email

### Step 2: Create New Project

```bash
# Via Railway CLI
npm install -g @railway/cli
railway login
railway init
```

Or via Web Dashboard:
1. Click **New Project**
2. Select **Provision PostgreSQL**
3. Choose **PostgreSQL** from templates

### Step 3: Get Connection String

1. Go to your project in Railway Dashboard
2. Click on **PostgreSQL** service
3. Navigate to **Variables** tab
4. Copy `DATABASE_URL`

**Connection String Format**:
```
postgresql://postgres:password@containers-us-west-123.railway.app:5432/railway
```

### Step 4: Add to Vercel

```bash
# Add to Vercel environment variables
vercel env add DATABASE_URL production
# Paste the Railway connection string
```

### Step 5: Configure Database Settings

In Railway Dashboard → **PostgreSQL** → **Settings**:

- **Max Connections**: 20 (default)
- **Shared Buffers**: 128MB (default)
- **Backup Schedule**: Daily at 2:00 AM UTC

### Step 6: Test Connection

```bash
# Local test
npm install -g prisma
prisma db execute --url "postgresql://..." --stdin <<< "SELECT NOW();"
```

---

## AWS RDS Setup (Production)

### Step 1: Create RDS Instance

1. Sign in to [AWS Console](https://console.aws.amazon.com/rds)
2. Navigate to **RDS** → **Create Database**

**Configuration**:
- **Engine**: PostgreSQL 15.x
- **Template**: Production (or Dev/Test for staging)
- **DB Instance Class**: `db.t3.micro` (1 vCPU, 1GB RAM) for MVP
- **Storage**: 20GB General Purpose SSD (gp3)
- **Multi-AZ**: Enable for production
- **DB Instance Identifier**: `fleet-feast-production`
- **Master Username**: `fleetfeast_admin`
- **Master Password**: Generate strong password (save in 1Password)

**Network & Security**:
- **VPC**: Default VPC (or create dedicated VPC)
- **Public Access**: Yes (for Vercel access)
- **VPC Security Group**: Create new `fleet-feast-db-sg`
- **Availability Zone**: No preference

**Database Options**:
- **Database Name**: `fleet_feast`
- **Port**: 5432
- **Parameter Group**: default.postgres15
- **Backup Retention**: 7 days
- **Encryption**: Enable (AWS KMS)

### Step 2: Configure Security Group

1. Go to **EC2** → **Security Groups**
2. Find `fleet-feast-db-sg`
3. Edit **Inbound Rules**:

```
Type: PostgreSQL
Protocol: TCP
Port: 5432
Source: 0.0.0.0/0 (Vercel IPs - or use Vercel's IP range)
Description: Allow Vercel access
```

**Production Best Practice**: Restrict to Vercel's IP ranges (contact Vercel support for current list).

### Step 3: Get Connection String

1. Go to **RDS** → **Databases** → `fleet-feast-production`
2. Copy **Endpoint**: `fleet-feast-production.c9aklu4k6c7w.us-east-1.rds.amazonaws.com`
3. Format connection string:

```
postgresql://fleetfeast_admin:YOUR_PASSWORD@fleet-feast-production.c9aklu4k6c7w.us-east-1.rds.amazonaws.com:5432/fleet_feast
```

### Step 4: Add to Vercel

```bash
vercel env add DATABASE_URL production
# Paste the RDS connection string
```

### Step 5: Enable Connection Pooling (PgBouncer)

**Option A: RDS Proxy** (Recommended)

1. Go to **RDS** → **Proxies** → **Create Proxy**
2. Configure:
   - **Name**: `fleet-feast-proxy`
   - **Engine**: PostgreSQL
   - **Target Database**: `fleet-feast-production`
   - **Max Connections**: 100
   - **Connection Pool Size**: 20

3. Update `DATABASE_URL` to use proxy endpoint

**Option B: Self-Hosted PgBouncer**

See [Connection Pooling](#connection-pooling) section below.

---

## Database Configuration

### Environment Variables

```bash
# .env.local (local development)
DATABASE_URL="postgresql://postgres:password@localhost:5432/fleet_feast_dev?schema=public"

# Vercel Production
DATABASE_URL="postgresql://user:pass@host:5432/fleet_feast?schema=public&connection_limit=20"

# Connection String Parameters
# - connection_limit: Max connections per Vercel function (default: 10, max: 20)
# - pool_timeout: Wait time for connection (default: 10s)
# - connect_timeout: TCP connection timeout (default: 5s)
```

### Connection String Format

```
postgresql://[user]:[password]@[host]:[port]/[database]?schema=[schema]&connection_limit=[limit]
```

**Example**:
```
postgresql://admin:SecurePass123@fleet-db.railway.app:5432/railway?schema=public&connection_limit=15
```

---

## Prisma Setup

### Installation

```bash
npm install prisma @prisma/client
npm install -D prisma
```

### Initialize Prisma

```bash
npx prisma init
```

Creates:
- `prisma/schema.prisma` - Database schema
- `.env` - Environment variables (add to `.gitignore`)

### Prisma Client Singleton

Create `lib/db/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

**Why Singleton?** Prevents "Too many connections" in Next.js development (hot reload).

---

## Migrations

### Development Workflow

#### 1. Create Migration

```bash
# After updating schema.prisma
npx prisma migrate dev --name add_vendor_menu_table
```

This:
- Creates SQL migration file in `prisma/migrations/`
- Applies migration to database
- Regenerates Prisma Client

#### 2. Apply Migration to Production

```bash
# Production database
npx prisma migrate deploy
```

**Never use `migrate dev` in production!** It can reset your database.

### Migration Best Practices

1. **Always test migrations locally first**:
   ```bash
   # Copy production data to local (optional)
   pg_dump -h production-host -U user -d fleet_feast > backup.sql
   psql -h localhost -U postgres -d fleet_feast_dev < backup.sql

   # Test migration
   npx prisma migrate dev
   ```

2. **Backup before production migrations**:
   ```bash
   # AWS RDS creates automatic backups, but manual snapshot is safer
   aws rds create-db-snapshot --db-instance-identifier fleet-feast-production --db-snapshot-identifier pre-migration-2025-12-04
   ```

3. **Use transactions for data migrations**:
   ```typescript
   // prisma/migrations/20241204_add_default_status/migration.sql
   BEGIN;

   ALTER TABLE bookings ADD COLUMN status VARCHAR(20);
   UPDATE bookings SET status = 'CONFIRMED' WHERE confirmed_at IS NOT NULL;
   UPDATE bookings SET status = 'PENDING' WHERE confirmed_at IS NULL;
   ALTER TABLE bookings ALTER COLUMN status SET NOT NULL;

   COMMIT;
   ```

### Rollback Migrations

Prisma doesn't support automatic rollback. Manual process:

```bash
# 1. Restore from backup
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier fleet-feast-production \
  --target-db-instance-identifier fleet-feast-restored \
  --restore-time 2025-12-04T12:00:00Z

# 2. Or manually revert schema changes
# Edit migration file and run:
npx prisma db execute --file prisma/migrations/rollback.sql
```

---

## Connection Pooling

### Why Connection Pooling?

- Vercel serverless functions open new connections per request
- PostgreSQL has connection limits (100 default, 200 max on Railway)
- Without pooling, you hit "Too many connections" errors

### Option 1: Prisma Connection Pool (Built-In)

Set `connection_limit` in `DATABASE_URL`:

```
postgresql://user:pass@host:5432/db?connection_limit=10
```

**Recommended Limits**:
- Development: 5
- Preview: 10
- Production: 15-20

### Option 2: PgBouncer (External)

**Setup with Railway**:
1. Add PgBouncer plugin to Railway project
2. Connect to PgBouncer instead of direct PostgreSQL
3. Configure pooling mode: `transaction` (recommended)

**PgBouncer Config**:
```ini
[databases]
fleet_feast = host=localhost port=5432 dbname=fleet_feast

[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 20
```

### Option 3: AWS RDS Proxy

See [AWS RDS Setup](#aws-rds-setup-production) above.

---

## Backup and Recovery

### Railway Backups

**Automatic Backups**:
- Frequency: Daily at 2:00 AM UTC
- Retention: 7 days (free tier)
- Location: Railway infrastructure

**Manual Backup**:
```bash
# Export database
railway run pg_dump > backup-$(date +%Y%m%d).sql

# Restore database
railway run psql < backup-20241204.sql
```

### AWS RDS Backups

**Automatic Backups**:
- Frequency: Daily during backup window
- Retention: 7 days (configurable up to 35 days)
- Stored in S3 (encrypted)

**Manual Snapshot**:
```bash
aws rds create-db-snapshot \
  --db-instance-identifier fleet-feast-production \
  --db-snapshot-identifier manual-backup-$(date +%Y%m%d)
```

**Restore from Snapshot**:
```bash
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier fleet-feast-restored \
  --db-snapshot-identifier manual-backup-20241204
```

### Point-in-Time Recovery (AWS RDS)

Restore to any point within backup retention window:

```bash
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier fleet-feast-production \
  --target-db-instance-identifier fleet-feast-restored \
  --restore-time 2025-12-04T14:30:00Z
```

---

## Performance Optimization

### Indexes

Ensure indexes exist for common queries (defined in `schema.prisma`):

```prisma
model Booking {
  @@index([customerId, createdAt])
  @@index([vendorId, eventDate])
  @@index([status, eventDate])
}

model Vendor {
  @@index([status, approvedAt])
  @@index([cuisineType])
}
```

### Query Optimization

#### Use `select` to fetch only needed fields:
```typescript
const users = await prisma.user.findMany({
  select: { id: true, email: true }, // Don't fetch passwordHash
});
```

#### Use `include` sparingly:
```typescript
// BAD: Fetches all related data
const vendor = await prisma.vendor.findUnique({
  where: { id },
  include: { user: true, menu: true, bookings: true },
});

// GOOD: Fetch only what you need
const vendor = await prisma.vendor.findUnique({
  where: { id },
  select: {
    id: true,
    businessName: true,
    menu: { select: { id: true, items: true } },
  },
});
```

### Connection Monitoring

```typescript
// Log active connections (development)
const activeConnections = await prisma.$queryRaw`
  SELECT count(*) FROM pg_stat_activity WHERE datname = 'fleet_feast';
`;
console.log('Active connections:', activeConnections);
```

---

## Monitoring

### Railway Monitoring

1. **Metrics Tab**: CPU, Memory, Network usage
2. **Logs**: Query logs, connection errors
3. **Alerts**: Email notifications for downtime

### AWS CloudWatch (RDS)

**Key Metrics**:
- `DatabaseConnections`: Number of active connections
- `CPUUtilization`: Database CPU usage
- `FreeableMemory`: Available RAM
- `ReadLatency` / `WriteLatency`: Query performance

**Set Up Alarms**:
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name fleet-feast-high-connections \
  --metric-name DatabaseConnections \
  --namespace AWS/RDS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold
```

### Prisma Logging

```typescript
// lib/db/prisma.ts
export const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'stdout', level: 'error' },
    { emit: 'stdout', level: 'warn' },
  ],
});

// Log slow queries
prisma.$on('query', (e) => {
  if (e.duration > 1000) { // Queries slower than 1 second
    console.warn('Slow query detected:', {
      query: e.query,
      duration: e.duration,
      params: e.params,
    });
  }
});
```

---

## Troubleshooting

### "Too Many Connections" Error

**Cause**: Exceeded PostgreSQL connection limit (100 on Railway, 200 max).

**Solutions**:
1. Reduce `connection_limit` in `DATABASE_URL`:
   ```
   postgresql://user:pass@host:5432/db?connection_limit=10
   ```

2. Enable connection pooling (PgBouncer or RDS Proxy)

3. Close connections explicitly:
   ```typescript
   await prisma.$disconnect();
   ```

### Slow Query Performance

**Diagnosis**:
```sql
-- Find slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

**Solutions**:
1. Add missing indexes
2. Use `select` to reduce data fetched
3. Cache results in Redis (see [REDIS.md](./REDIS.md))

### Migration Failures

**Issue**: `npx prisma migrate deploy` fails

**Solutions**:
1. Check connection string is correct
2. Verify database user has `CREATE`, `ALTER` permissions
3. Review migration SQL for errors:
   ```bash
   cat prisma/migrations/20241204_migration/migration.sql
   ```

### Connection Timeouts

**Issue**: `Error: P1001: Can't reach database server`

**Solutions**:
1. Check database is running (Railway/RDS dashboard)
2. Verify security group allows connections (AWS)
3. Test connection manually:
   ```bash
   psql "postgresql://user:pass@host:5432/db"
   ```

---

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Railway PostgreSQL Docs](https://docs.railway.app/databases/postgresql)
- [AWS RDS PostgreSQL Guide](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html)
- [PostgreSQL Performance Tips](https://www.postgresql.org/docs/current/performance-tips.html)

---

**Document Status**: Complete
**Reviewed By**: Devon_DevOps
**Last Updated**: 2025-12-04
