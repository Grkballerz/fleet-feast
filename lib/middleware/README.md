# Fleet Feast API Middleware

Comprehensive middleware layer for Fleet Feast API routes, providing authentication, rate limiting, validation, error handling, and CORS.

## Features

- **Authentication**: JWT token validation with NextAuth integration
- **Rate Limiting**: Per-user and per-IP rate limiting with configurable limits
- **Request Validation**: Type-safe validation using Zod schemas
- **Error Handling**: Centralized error handling with standardized responses
- **CORS**: Cross-origin resource sharing with configurable origins

## Quick Start

### Basic Protected Route

```typescript
import { protectedRoute, ApiResponses } from '@/lib/middleware';

export const GET = protectedRoute(async (req) => {
  const userId = req.user!.id; // User is guaranteed to exist

  const data = await fetchUserData(userId);

  return ApiResponses.ok(data);
});
```

### Public Route with Rate Limiting

```typescript
import { publicRoute, ApiResponses } from '@/lib/middleware';

export const GET = publicRoute(async (req) => {
  // Rate limited by IP (30 req/min)
  const data = await fetchPublicData();

  return ApiResponses.ok(data);
});
```

### Route with Validation

```typescript
import { apiRoute, CommonSchemas } from '@/lib/middleware';
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().min(1),
  email: CommonSchemas.email,
  password: CommonSchemas.password,
});

export const POST = apiRoute(
  { body: createUserSchema },
  async (req) => {
    const { name, email, password } = req.validatedBody;

    // Data is validated and typed
    const user = await createUser({ name, email, password });

    return ApiResponses.created(user);
  }
);
```

### Admin-Only Route

```typescript
import { adminRoute, ApiResponses } from '@/lib/middleware';

export const DELETE = adminRoute(async (req, { params }) => {
  const { id } = params;

  await deleteUser(id);

  return ApiResponses.noContent();
});
```

## Middleware Components

### Authentication

```typescript
import {
  withAuth,
  requireAuth,
  requireAdmin,
  requireVendor
} from '@/lib/middleware';

// Optional authentication
export const GET = withAuth(async (req) => {
  const userId = req.user?.id; // May be undefined
  // ...
});

// Required authentication
export const GET = requireAuth(async (req) => {
  const userId = req.user!.id; // Guaranteed to exist
  // ...
});

// Admin only
export const POST = requireAdmin(async (req) => {
  // Only admins can access
  // ...
});

// Vendor only (vendors + admins)
export const PUT = requireVendor(async (req) => {
  // Only vendors and admins
  // ...
});
```

### Rate Limiting

```typescript
import {
  rateLimit,
  RateLimitPresets,
  rateLimitByIp,
  rateLimitByUser
} from '@/lib/middleware';

// Default limits (100 req/min for auth, 30 for unauth)
export const GET = rateLimit(handler);

// Strict limits (5 req/15min)
export const POST = rateLimit(handler, RateLimitPresets.strict);

// Custom limits
export const POST = rateLimit(handler, {
  limit: 10,
  windowMs: 60000, // 10 requests per minute
});

// Rate limit by IP only
export const GET = rateLimitByIp(handler, {
  limit: 20,
  windowMs: 60000,
});

// Rate limit by user ID only
export const POST = rateLimitByUser(handler, {
  limit: 50,
  windowMs: 60000,
});
```

### Request Validation

```typescript
import { validate, validateBody, CommonSchemas } from '@/lib/middleware';
import { z } from 'zod';

// Validate body
const schema = z.object({
  name: z.string(),
  email: z.string().email(),
});

export const POST = validateBody(schema, async (req) => {
  const { name, email } = req.validatedBody;
  // ...
});

// Validate query parameters
export const GET = validate(
  { query: CommonSchemas.pagination },
  async (req) => {
    const { page, limit } = req.validatedQuery;
    // ...
  }
);

// Validate multiple parts
export const PUT = validate(
  {
    params: z.object({ id: z.string().uuid() }),
    body: z.object({ name: z.string() }),
  },
  async (req, { params }) => {
    const { id } = req.validatedParams;
    const { name } = req.validatedBody;
    // ...
  }
);
```

### Error Handling

```typescript
import {
  withErrorHandler,
  throwNotFound,
  throwForbidden,
  assertExists,
  ApiResponses
} from '@/lib/middleware';

export const GET = withErrorHandler(async (req) => {
  const data = await fetchData();

  // Throw typed errors
  if (!data) {
    throwNotFound('Resource');
  }

  // Or use assertions
  assertExists(data, 'Resource');

  return ApiResponses.ok(data);
});
```

### CORS

```typescript
import { withCors, withPublicCors } from '@/lib/middleware';

// Default CORS (configured origins)
export const GET = withCors(handler);

// Public CORS (allow all origins)
export const GET = withPublicCors(handler);

// Custom CORS
export const POST = withCors(handler, {
  origin: ['https://app.example.com'],
  methods: ['POST', 'PUT'],
});
```

## Composition Patterns

### Manual Composition

```typescript
import {
  withAuth,
  rateLimit,
  validate,
  withErrorHandler,
  withCors
} from '@/lib/middleware';

const schema = z.object({ name: z.string() });

export const POST = withCors(
  withErrorHandler(
    withAuth(
      rateLimit(
        validate({ body: schema }, handler)
      )
    )
  )
);
```

### Using compose helper

```typescript
import { compose, withAuth, rateLimit, validate, withErrorHandler } from '@/lib/middleware';

export const POST = compose(
  withErrorHandler,
  withAuth,
  rateLimit,
  validate({ body: schema })
)(handler);
```

### Using preset routes

```typescript
import { apiRoute, protectedRoute, publicRoute, adminRoute } from '@/lib/middleware';

// API route with auth, rate limiting, validation, error handling
export const POST = apiRoute({ body: schema }, handler);

// Protected route (auth required)
export const GET = protectedRoute(handler);

// Public route (no auth)
export const GET = publicRoute(handler);

// Admin only
export const DELETE = adminRoute(handler);
```

## API Response Helpers

```typescript
import { ApiResponses, ErrorCodes } from '@/lib/middleware';

// Success responses
return ApiResponses.ok(data);
return ApiResponses.created(newResource);
return ApiResponses.noContent();

// Paginated response
return ApiResponses.paginated(items, page, limit, total);

// Error responses
return ApiResponses.badRequest('Invalid input');
return ApiResponses.unauthorized();
return ApiResponses.forbidden();
return ApiResponses.notFound('User');
return ApiResponses.conflict('Email already exists');
return ApiResponses.internalError();
```

## Common Schemas

```typescript
import { CommonSchemas } from '@/lib/middleware';

// Pagination
CommonSchemas.pagination // { page: number, limit: number }

// UUID
CommonSchemas.uuid // { id: string (uuid) }

// Email
CommonSchemas.email // string (email format)

// Password
CommonSchemas.password // string (min 8, uppercase, lowercase, number)

// Search
CommonSchemas.search // { q?: string, page: number, limit: number }

// Date range
CommonSchemas.dateRange // { startDate: Date, endDate: Date }

// Sorting
CommonSchemas.sort // { sortBy?: string, sortOrder: 'asc' | 'desc' }
```

## Configuration

### Environment Variables

```bash
# CORS allowed origins (comma-separated)
ALLOWED_ORIGINS=https://app.example.com,https://admin.example.com

# NextAuth secret (required for JWT validation)
NEXTAUTH_SECRET=your-secret-key

# App URL (used for default CORS)
NEXT_PUBLIC_APP_URL=https://fleetfeast.com
```

### Rate Limit Presets

```typescript
import { RateLimitPresets } from '@/lib/middleware';

RateLimitPresets.authenticated  // 100 req/min
RateLimitPresets.unauthenticated // 30 req/min
RateLimitPresets.strict          // 5 req/15min
RateLimitPresets.relaxed         // 300 req/min
```

## Error Response Format

All errors follow a standardized format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": ["error1", "error2"]
    }
  }
}
```

## Rate Limit Headers

Responses include rate limit information:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2024-01-01T12:00:00.000Z
```

When limit is exceeded:

```
HTTP/1.1 429 Too Many Requests
Retry-After: 42
```

## Testing

### Reset Rate Limits

```typescript
import { resetRateLimit, clearAllRateLimits } from '@/lib/middleware';

// Reset for specific key
resetRateLimit('user:123');
resetRateLimit('ip:192.168.1.1');

// Clear all
clearAllRateLimits();
```

### Get Rate Limit Status

```typescript
import { getRateLimitStatus } from '@/lib/middleware';

const status = getRateLimitStatus('user:123', 100, 60000);
// { allowed: true, remaining: 95, resetAt: 1234567890, resetIn: 42000 }
```

## Architecture

```
lib/
├── middleware/
│   ├── index.ts              # Main exports and composition helpers
│   ├── auth.middleware.ts    # Authentication with NextAuth
│   ├── rate-limit.ts         # Rate limiting logic
│   ├── validation.ts         # Request validation with Zod
│   ├── error-handler.ts      # Centralized error handling
│   └── cors.ts               # CORS configuration
├── api-response.ts           # Standardized response helpers
└── rate-limit-store.ts       # In-memory rate limit storage
```

## Best Practices

1. **Always use preset routes** (`protectedRoute`, `publicRoute`, `apiRoute`) for consistency
2. **Validate all inputs** using Zod schemas
3. **Use typed errors** (`throwNotFound`, `throwForbidden`, etc.) instead of manual responses
4. **Configure CORS** properly for production environments
5. **Set appropriate rate limits** based on endpoint sensitivity
6. **Log errors** but sanitize sensitive data
7. **Return standardized responses** using `ApiResponses`

## Migration from Manual Middleware

Before:
```typescript
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ... handler logic
}
```

After:
```typescript
import { protectedRoute, ApiResponses } from '@/lib/middleware';

export const GET = protectedRoute(async (req) => {
  const userId = req.user!.id;
  // ... handler logic
  return ApiResponses.ok(data);
});
```

## Performance

- **Authentication**: ~2-5ms (JWT validation)
- **Rate Limiting**: <1ms (in-memory lookup)
- **Validation**: 1-3ms (Zod parsing)
- **Total Middleware Overhead**: ~5-10ms

All middleware is designed to add minimal latency (< 10ms total).

## Future Enhancements

- Redis-backed rate limiting for distributed systems
- Request/response logging middleware
- API versioning middleware
- GraphQL middleware support
- WebSocket authentication
