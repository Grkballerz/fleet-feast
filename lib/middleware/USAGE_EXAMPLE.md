# Error Handling Middleware Usage Examples

## withErrorHandling

The `withErrorHandling` higher-order function provides consistent error handling across all API routes.

### Basic Usage

```typescript
import { NextRequest } from "next/server";
import { withErrorHandling, ApiResponses } from "@/lib/middleware";

export const GET = withErrorHandling(async (req: NextRequest) => {
  const data = await fetchData();
  return ApiResponses.ok(data);
});
```

### With Route Parameters

```typescript
import { NextRequest } from "next/server";
import { withErrorHandling, ApiResponses } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";

export const GET = withErrorHandling(async (req: NextRequest, context) => {
  const { id } = context?.params || {};

  const truck = await prisma.truck.findUniqueOrThrow({
    where: { id: id as string }
  });

  return ApiResponses.ok(truck);
});
```

### Error Types Handled Automatically

1. **Prisma Errors**
   - `P2025` (Record not found) → 404 Not Found
   - `P2002` (Unique constraint violation) → 409 Conflict

2. **Zod Validation Errors**
   - Automatically formatted into field-level error messages
   - Returns 400 Bad Request with validation details

3. **Generic Errors**
   - Logs error details
   - Returns 500 Internal Server Error with sanitized message

### Advanced Usage with Validation

```typescript
import { NextRequest } from "next/server";
import { withErrorHandling, ApiResponses } from "@/lib/middleware";
import { z } from "zod";

const createTruckSchema = z.object({
  name: z.string().min(1),
  cuisine: z.string(),
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();

  // Zod validation errors are automatically caught and formatted
  const data = createTruckSchema.parse(body);

  const truck = await prisma.truck.create({
    data
  });

  return ApiResponses.created(truck);
});
```

## withErrorHandler (More Features)

For more advanced error handling with custom error types and middleware composition, use `withErrorHandler`:

```typescript
import { withErrorHandler, AppError, ErrorType } from "@/lib/middleware";

export const DELETE = withErrorHandler(async (req: NextRequest) => {
  const isAuthorized = checkAuth();

  if (!isAuthorized) {
    throw new AppError(
      ErrorType.AUTHORIZATION,
      "Not authorized to delete this resource",
      403
    );
  }

  // ... rest of handler
});
```

## Comparison

| Feature | withErrorHandling | withErrorHandler |
|---------|------------------|------------------|
| Prisma error handling | ✅ | ✅ |
| Zod validation errors | ✅ | ✅ |
| Custom AppError support | ❌ | ✅ |
| Simplified typing | ✅ | ❌ |
| Error logging | ✅ | ✅ (with more detail) |
| Best for | Simple API routes | Complex routes with custom errors |
