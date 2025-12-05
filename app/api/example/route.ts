/**
 * Example API Route demonstrating middleware usage
 *
 * This file shows how to use the Fleet Feast middleware layer.
 * DELETE THIS FILE before production deployment.
 */

import { protectedRoute, ApiResponses, validateBody } from "@/lib/middleware";
import { z } from "zod";

/**
 * Example GET route - Protected with authentication and rate limiting
 *
 * Features:
 * - Requires authentication
 * - Rate limited (100 req/min for authenticated users)
 * - Automatic error handling
 * - CORS enabled
 */
export const GET = protectedRoute(async (req) => {
  // User is guaranteed to exist because of protectedRoute
  const userId = req.user!.id;
  const userRole = req.user!.role;

  // Example: Fetch user-specific data
  const data = {
    message: "This is a protected endpoint",
    userId,
    userRole,
    timestamp: new Date().toISOString(),
  };

  return ApiResponses.ok(data);
});

/**
 * Example POST route - With request validation
 *
 * Features:
 * - Validates request body using Zod
 * - Type-safe access to validated data
 * - Returns 400 with validation errors if invalid
 */
const createExampleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  age: z.number().int().positive().optional(),
});

export const POST = validateBody(createExampleSchema, async (req) => {
  // Data is validated and typed
  const { name, email, age } = req.validatedBody;

  // Example: Create resource
  const result = {
    id: "example-123",
    name,
    email,
    age,
    createdAt: new Date().toISOString(),
  };

  return ApiResponses.created(result);
});

/**
 * Example usage patterns:
 *
 * 1. Public route (no auth required):
 * ```typescript
 * import { publicRoute } from '@/lib/middleware';
 *
 * export const GET = publicRoute(async (req) => {
 *   return ApiResponses.ok({ message: 'Public data' });
 * });
 * ```
 *
 * 2. Admin-only route:
 * ```typescript
 * import { adminRoute } from '@/lib/middleware';
 *
 * export const DELETE = adminRoute(async (req, { params }) => {
 *   await deleteUser(params.id);
 *   return ApiResponses.noContent();
 * });
 * ```
 *
 * 3. Custom rate limiting:
 * ```typescript
 * import { rateLimit, RateLimitPresets } from '@/lib/middleware';
 *
 * export const POST = rateLimit(handler, RateLimitPresets.strict);
 * ```
 *
 * 4. Validation with query params:
 * ```typescript
 * import { validate, CommonSchemas } from '@/lib/middleware';
 *
 * export const GET = validate(
 *   { query: CommonSchemas.pagination },
 *   async (req) => {
 *     const { page, limit } = req.validatedQuery;
 *     return ApiResponses.ok({ page, limit });
 *   }
 * );
 * ```
 *
 * 5. Error handling:
 * ```typescript
 * import { throwNotFound, assertExists } from '@/lib/middleware';
 *
 * const user = await findUser(id);
 * assertExists(user, 'User'); // Throws 404 if null/undefined
 * ```
 */
