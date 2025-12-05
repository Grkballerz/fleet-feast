# Redis Caching Setup

**Project**: Fleet Feast
**Cache**: Redis 7+
**Client**: ioredis
**Last Updated**: 2025-12-04

---

## Table of Contents

1. [Overview](#overview)
2. [Hosting Options](#hosting-options)
3. [Upstash Setup (Recommended for MVP)](#upstash-setup-recommended-for-mvp)
4. [AWS ElastiCache Setup (Production)](#aws-elasticache-setup-production)
5. [Redis Configuration](#redis-configuration)
6. [Caching Patterns](#caching-patterns)
7. [Session Storage](#session-storage)
8. [Rate Limiting](#rate-limiting)
9. [Cache Invalidation](#cache-invalidation)
10. [Monitoring](#monitoring)
11. [Troubleshooting](#troubleshooting)

---

## Overview

Fleet Feast uses **Redis 7+** for:
- **Caching**: Vendor profiles, search results (reduce database load)
- **Session Storage**: User sessions (optional, NextAuth.js uses JWT by default)
- **Rate Limiting**: Prevent abuse (5 req/min for auth, 100 req/min for API)
- **Real-Time Features**: Pub/Sub for messaging (future)

**Benefits**:
- **Performance**: Sub-millisecond read/write
- **Scalability**: Handle high traffic without database strain
- **Flexibility**: Multiple data structures (strings, hashes, sets, sorted sets)

---

## Hosting Options

### Option 1: Upstash (Recommended for MVP)

**Pros**:
- ✅ **Generous Free Tier**: 10,000 commands/day (enough for MVP)
- ✅ **Serverless**: Pay only for what you use
- ✅ **Global Replication**: Low latency worldwide
- ✅ **REST API**: Works with Vercel serverless functions
- ✅ **Zero Configuration**: No server management
- ✅ **Built-in Metrics**: Dashboard with request stats

**Cons**:
- ❌ Limited to 256MB on free tier
- ❌ REST API adds slight overhead vs native Redis protocol

**Pricing**:
- **Free Tier**: 10,000 commands/day, 256MB storage
- **Pay-as-you-go**: $0.20 per 100,000 commands

**Best for**: MVP, serverless deployments, <1000 users

### Option 2: AWS ElastiCache (Production)

**Pros**:
- ✅ **Full Redis Compatibility**: Native Redis protocol
- ✅ **High Performance**: Dedicated instances, no cold starts
- ✅ **Multi-AZ**: High availability with failover
- ✅ **VPC Isolation**: Enhanced security
- ✅ **Backup/Restore**: Automated backups

**Cons**:
- ❌ **Higher Cost**: $15-50/month for cache.t3.micro
- ❌ **Complex Setup**: Requires VPC, security groups
- ❌ **No Serverless**: Always running (fixed cost)

**Best for**: Production, >1000 users, low-latency requirements

### Option 3: Redis Cloud (Alternative)

**Pros**:
- ✅ 30MB free tier
- ✅ Managed Redis by Redis Labs
- ✅ Easy setup

**Cons**:
- ❌ Smaller free tier than Upstash
- ❌ More expensive at scale

---

## Upstash Setup (Recommended for MVP)

### Step 1: Create Upstash Account

1. Go to [Upstash Console](https://console.upstash.com)
2. Sign up with GitHub or email
3. Verify email

### Step 2: Create Database

1. Click **Create Database**
2. Configure:
   - **Name**: `fleet-feast-cache`
   - **Region**: `us-east-1` (closest to Vercel)
   - **Type**: Regional (for MVP, Global for production)
   - **Eviction Policy**: `allkeys-lru` (evict least recently used)

3. Click **Create**

### Step 3: Get Connection Details

After creation, you'll see:

#### REST API (Recommended for Vercel)
```
UPSTASH_REDIS_REST_URL=https://us1-desired-swan-12345.upstash.io
UPSTASH_REDIS_REST_TOKEN=AbCdEfGhIjKlMnOpQrStUvWxYz1234567890...
```

#### Native Redis Protocol (Optional)
```
REDIS_URL=redis://default:password@us1-desired-swan-12345.upstash.io:6379
```

### Step 4: Add to Vercel

```bash
# Add environment variables
vercel env add UPSTASH_REDIS_REST_URL production
vercel env add UPSTASH_REDIS_REST_TOKEN production

# Or use Redis URL
vercel env add REDIS_URL production
```

### Step 5: Install Client

For **REST API** (recommended for serverless):
```bash
npm install @upstash/redis
```

For **Native Redis Protocol**:
```bash
npm install ioredis
```

### Step 6: Create Redis Client

**Option A: REST API** (lib/db/redis.ts)
```typescript
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
```

**Option B: Native Protocol** (lib/db/redis.ts)
```typescript
import Redis from 'ioredis';

export const redis = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
});

redis.on('error', (err) => {
  console.error('Redis error:', err);
});
```

---

## AWS ElastiCache Setup (Production)

### Step 1: Create ElastiCache Cluster

1. Sign in to [AWS Console](https://console.aws.amazon.com/elasticache)
2. Navigate to **Redis Clusters** → **Create**

**Configuration**:
- **Cluster Mode**: Disabled (easier, enough for MVP)
- **Engine**: Redis 7.0
- **Node Type**: `cache.t3.micro` (1 vCPU, 0.5GB RAM)
- **Number of Replicas**: 1 (for high availability)
- **Multi-AZ**: Enable (for production)
- **Subnet Group**: Create new or use existing
- **Security Group**: Create `fleet-feast-cache-sg`
- **Encryption**: Enable at-rest and in-transit

### Step 2: Configure Security Group

1. Go to **EC2** → **Security Groups**
2. Find `fleet-feast-cache-sg`
3. Edit **Inbound Rules**:

```
Type: Custom TCP
Protocol: TCP
Port: 6379
Source: 0.0.0.0/0 (or Vercel IP range)
Description: Allow Vercel access
```

**Production**: Restrict to application server IPs or use VPN/VPC peering.

### Step 3: Get Endpoint

1. Go to **ElastiCache** → **Redis Clusters**
2. Click on `fleet-feast-cache`
3. Copy **Primary Endpoint**: `fleet-feast-cache.abcdef.0001.use1.cache.amazonaws.com:6379`

### Step 4: Format Connection String

```
redis://fleet-feast-cache.abcdef.0001.use1.cache.amazonaws.com:6379
```

If encryption in-transit is enabled:
```
rediss://fleet-feast-cache.abcdef.0001.use1.cache.amazonaws.com:6379
```

### Step 5: Add to Vercel

```bash
vercel env add REDIS_URL production
# Paste the ElastiCache endpoint
```

---

## Redis Configuration

### Environment Variables

```bash
# .env.local (development)
REDIS_URL="redis://localhost:6379"

# Vercel Production (Upstash REST)
UPSTASH_REDIS_REST_URL="https://us1-desired-swan-12345.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AbCdEfGhIjKlMnOp..."

# Or Native Redis (ElastiCache)
REDIS_URL="redis://fleet-feast-cache.abcdef.0001.use1.cache.amazonaws.com:6379"
```

### Connection Settings

```typescript
// lib/db/redis.ts (ioredis)
export const redis = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: 3,        // Retry failed commands 3 times
  enableReadyCheck: true,          // Ensure connection is ready
  lazyConnect: true,               // Don't connect until first command
  retryStrategy: (times) => {
    if (times > 3) return null;    // Stop retrying after 3 attempts
    return Math.min(times * 200, 1000); // Exponential backoff
  },
  reconnectOnError: (err) => {
    const targetErrors = ['READONLY', 'ETIMEDOUT'];
    return targetErrors.some(e => err.message.includes(e));
  },
});
```

---

## Caching Patterns

### 1. Cache-Aside (Lazy Loading)

**Use Case**: Vendor profiles, search results

```typescript
// lib/services/vendor.service.ts
export async function getVendor(id: string) {
  const cacheKey = `vendor:${id}`;
  const TTL = 60 * 30; // 30 minutes

  // 1. Check cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached as string);
  }

  // 2. Query database
  const vendor = await prisma.vendor.findUnique({
    where: { id },
    include: { user: true, menu: true },
  });

  // 3. Set cache
  if (vendor) {
    await redis.setex(cacheKey, TTL, JSON.stringify(vendor));
  }

  return vendor;
}
```

### 2. Write-Through Cache

**Use Case**: Frequently updated data (availability)

```typescript
export async function updateVendorAvailability(
  vendorId: string,
  date: Date,
  isAvailable: boolean
) {
  const cacheKey = `availability:${vendorId}:${date.toISOString()}`;

  // 1. Update database
  const availability = await prisma.availability.update({
    where: { vendorId_date: { vendorId, date } },
    data: { isAvailable },
  });

  // 2. Update cache
  await redis.setex(cacheKey, 60 * 60 * 24, JSON.stringify(availability));

  return availability;
}
```

### 3. Cache-Stampede Prevention

**Use Case**: High-traffic endpoints (popular vendors)

```typescript
import { Lock } from 'redis-lock';

export async function getVendorWithLock(id: string) {
  const cacheKey = `vendor:${id}`;
  const lockKey = `lock:vendor:${id}`;

  // 1. Check cache
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached as string);

  // 2. Acquire lock (prevents multiple DB queries)
  const lock = await redis.set(lockKey, '1', 'EX', 10, 'NX'); // 10s lock
  if (!lock) {
    // Another request is fetching, wait and retry
    await new Promise(resolve => setTimeout(resolve, 100));
    return getVendorWithLock(id);
  }

  try {
    // 3. Fetch from DB
    const vendor = await prisma.vendor.findUnique({ where: { id } });

    // 4. Cache result
    await redis.setex(cacheKey, 60 * 30, JSON.stringify(vendor));

    return vendor;
  } finally {
    // 5. Release lock
    await redis.del(lockKey);
  }
}
```

### 4. Time-Based Expiration

```typescript
// Different TTLs for different data
const TTL = {
  VENDOR_PROFILE: 60 * 30,       // 30 minutes
  SEARCH_RESULTS: 60 * 5,        // 5 minutes
  AVAILABILITY: 60 * 60 * 24,    // 1 day
  STATIC_CONTENT: 60 * 60 * 24 * 7, // 7 days
};

await redis.setex(`search:${query}`, TTL.SEARCH_RESULTS, JSON.stringify(results));
```

---

## Session Storage

### Option 1: JWT Sessions (Default)

NextAuth.js uses JWT by default (no Redis needed).

**Pros**: Stateless, scales easily
**Cons**: Can't invalidate sessions instantly

### Option 2: Redis Sessions (Optional)

For instant session invalidation (e.g., user logout on all devices):

```typescript
// lib/auth/config.ts
import { PrismaAdapter } from '@auth/prisma-adapter';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'database', // Use database + Redis
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async session({ session, user }) {
      // Store session in Redis
      await redis.setex(
        `session:${user.id}`,
        30 * 24 * 60 * 60,
        JSON.stringify(session)
      );
      return session;
    },
  },
};

// Logout from all devices
export async function logoutAllDevices(userId: string) {
  await redis.del(`session:${userId}`);
  await prisma.session.deleteMany({ where: { userId } });
}
```

---

## Rate Limiting

### Implementation

```typescript
// lib/utils/rate-limit.ts
import { redis } from '@/lib/db/redis';

export async function rateLimit(
  identifier: string, // User IP or user ID
  limit: number,
  window: number // seconds
): Promise<{ success: boolean; remaining: number }> {
  const key = `rate-limit:${identifier}`;

  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, window);
  }

  const remaining = Math.max(0, limit - current);

  return {
    success: current <= limit,
    remaining,
  };
}
```

### Usage in API Routes

```typescript
// app/api/bookings/route.ts
import { rateLimit } from '@/lib/utils/rate-limit';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';

  const { success, remaining } = await rateLimit(ip, 10, 60); // 10 req/min

  if (!success) {
    return Response.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': remaining.toString(),
          'Retry-After': '60',
        },
      }
    );
  }

  // Process booking...
}
```

### Rate Limit Tiers

```typescript
export const RATE_LIMITS = {
  AUTH: { requests: 5, window: 60 },      // 5/min for login/signup
  API: { requests: 100, window: 60 },     // 100/min for general API
  UPLOAD: { requests: 10, window: 60 },   // 10/min for file uploads
  SEARCH: { requests: 50, window: 60 },   // 50/min for search
};
```

---

## Cache Invalidation

### Manual Invalidation

```typescript
// lib/services/vendor.service.ts
export async function invalidateVendorCache(vendorId: string) {
  await redis.del(`vendor:${vendorId}`);

  // Also invalidate search results (vendor may appear in many searches)
  const searchKeys = await redis.keys('search:*');
  if (searchKeys.length > 0) {
    await redis.del(...searchKeys);
  }
}
```

### Event-Based Invalidation

```typescript
// After vendor update
await prisma.vendor.update({
  where: { id: vendorId },
  data: updateData,
});

// Invalidate cache
await invalidateVendorCache(vendorId);
```

### Pattern-Based Deletion

```typescript
// Delete all search caches
export async function invalidateSearchCache() {
  const keys = await redis.keys('search:*');
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

// Delete all vendor caches
export async function invalidateAllVendorCache() {
  const keys = await redis.keys('vendor:*');
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
```

---

## Monitoring

### Upstash Dashboard

1. Go to [Upstash Console](https://console.upstash.com)
2. Select your database
3. View **Metrics** tab:
   - Daily commands
   - Storage usage
   - Latency percentiles

### AWS CloudWatch (ElastiCache)

**Key Metrics**:
- `CacheHits` / `CacheMisses`: Cache effectiveness
- `CPUUtilization`: CPU usage
- `NetworkBytesIn` / `NetworkBytesOut`: Traffic
- `EvictedKeys`: Keys removed due to memory pressure

**Set Up Alarms**:
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name fleet-feast-cache-high-eviction \
  --metric-name Evictions \
  --namespace AWS/ElastiCache \
  --statistic Sum \
  --period 300 \
  --threshold 1000 \
  --comparison-operator GreaterThanThreshold
```

### Custom Logging

```typescript
// Track cache hit/miss ratio
export async function getCachedData(key: string) {
  const data = await redis.get(key);

  if (data) {
    console.log(`[CACHE HIT] ${key}`);
  } else {
    console.log(`[CACHE MISS] ${key}`);
  }

  return data;
}
```

---

## Troubleshooting

### Connection Errors

**Issue**: `Error: connect ETIMEDOUT`

**Solutions**:
1. Check Redis instance is running (Upstash/ElastiCache dashboard)
2. Verify `REDIS_URL` or `UPSTASH_REDIS_REST_URL` is correct
3. Check security group allows connections (AWS)
4. Test connection manually:
   ```bash
   redis-cli -h <host> -p 6379 ping
   ```

### Memory Pressure

**Issue**: `OOM command not allowed when used memory > 'maxmemory'`

**Solutions**:
1. Set eviction policy to `allkeys-lru` (evict least recently used)
2. Reduce TTL for cached data
3. Upgrade to larger instance (Upstash Pro, ElastiCache larger node)

### High Latency

**Issue**: Slow Redis responses (>100ms)

**Solutions**:
1. Use regional database (Upstash) instead of global
2. Reduce data size (compress JSON before caching)
3. Upgrade to ElastiCache for better performance

### Cache Stampede

**Issue**: Multiple requests fetch same data simultaneously

**Solution**: Use cache locks (see [Caching Patterns](#caching-patterns))

---

## Additional Resources

- [Upstash Documentation](https://docs.upstash.com)
- [ioredis Documentation](https://github.com/redis/ioredis)
- [AWS ElastiCache Best Practices](https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/BestPractices.html)
- [Redis Caching Patterns](https://redis.io/docs/manual/patterns/)

---

**Document Status**: Complete
**Reviewed By**: Devon_DevOps
**Last Updated**: 2025-12-04
