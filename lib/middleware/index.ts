/**
 * Fleet Feast API Middleware
 *
 * Centralized exports for all middleware components.
 * Provides authentication, rate limiting, validation, error handling, and CORS.
 *
 * @example
 * // Import specific middleware
 * import { withAuth, rateLimit, validate } from '@/lib/middleware';
 *
 * @example
 * // Chain multiple middleware
 * import { compose, withAuth, rateLimit, validate, withErrorHandler } from '@/lib/middleware';
 *
 * export const POST = compose(
 *   withErrorHandler,
 *   withAuth,
 *   rateLimit,
 *   validate({ body: schema })
 * )(handler);
 */

// Authentication middleware
export {
  withAuth,
  requireAuth,
  requireAdmin,
  requireVendor,
  requireCustomer,
  hasRole,
  isAdmin,
  isVendor,
  isCustomer,
  getUserId,
  getUser,
  type AuthUser,
  type AuthenticatedRequest,
  type AuthMiddlewareOptions,
  type RouteHandler,
} from "./auth.middleware";

// Rate limiting
export {
  rateLimit,
  adaptiveRateLimit,
  rateLimitByIp,
  rateLimitByUser,
  rateLimitByKey,
  getRateLimitStatus,
  resetRateLimit,
  clearAllRateLimits,
  RateLimitPresets,
  type RateLimitConfig,
} from "./rate-limit";

// Request validation
export {
  validate,
  validateBody,
  validateQuery,
  validateParams,
  CommonSchemas,
  compose,
  type ValidationType,
  type ValidationSchemas,
  type ValidatedRequest,
} from "./validation";

// Error handling
export {
  withErrorHandler,
  withErrorHandling,
  withMiddleware,
  tryCatch,
  throwValidationError,
  throwNotFound,
  throwUnauthorized,
  throwForbidden,
  throwConflict,
  assertExists,
  assertAuthorized,
  AppError,
  isAppError,
  ErrorType,
} from "./error-handler";

// CORS
export {
  withCors,
  withPublicCors,
  withCustomCors,
  createCorsMiddleware,
  getAllowedOrigins,
  type CorsOptions,
} from "./cors";

/**
 * Common middleware composition patterns
 */

/**
 * Standard API route with auth, rate limiting, validation, and error handling
 *
 * @example
 * import { apiRoute, CommonSchemas } from '@/lib/middleware';
 *
 * export const POST = apiRoute(
 *   { body: CommonSchemas.pagination },
 *   async (req) => {
 *     const { page, limit } = req.validatedBody;
 *     // ...
 *   }
 * );
 */
export function apiRoute<TBody = any, TQuery = any, TParams = any>(
  schemas: import("./validation").ValidationSchemas,
  handler: (
    req: import("./validation").ValidatedRequest<TBody, TQuery, TParams> &
      import("./auth.middleware").AuthenticatedRequest,
    context?: any
  ) => Promise<NextResponse> | NextResponse
): (req: NextRequest, context?: any) => Promise<NextResponse> {
  const { withAuth } = require("./auth.middleware");
  const { rateLimit } = require("./rate-limit");
  const { validate } = require("./validation");
  const { withErrorHandler } = require("./error-handler");
  const { withCors } = require("./cors");

  // Compose middleware: CORS -> Error -> Auth -> RateLimit -> Validation
  return withCors(
    withErrorHandler(
      withAuth(
        rateLimit(validate(schemas, handler))
      )
    )
  );
}

/**
 * Protected API route (requires authentication)
 *
 * @example
 * import { protectedRoute } from '@/lib/middleware';
 *
 * export const GET = protectedRoute(async (req) => {
 *   const userId = req.user!.id;
 *   // ...
 * });
 */
export function protectedRoute(
  handler: (
    req: import("./auth.middleware").AuthenticatedRequest,
    context?: any
  ) => Promise<NextResponse> | NextResponse
): (req: NextRequest, context?: any) => Promise<NextResponse> {
  const { requireAuth } = require("./auth.middleware");
  const { rateLimit } = require("./rate-limit");
  const { withErrorHandler } = require("./error-handler");
  const { withCors } = require("./cors");

  return withCors(withErrorHandler(requireAuth(rateLimit(handler))));
}

/**
 * Public API route (no authentication required)
 *
 * @example
 * import { publicRoute } from '@/lib/middleware';
 *
 * export const GET = publicRoute(async (req) => {
 *   // No auth required
 *   // ...
 * });
 */
export function publicRoute(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse> | NextResponse
): (req: NextRequest, context?: any) => Promise<NextResponse> {
  const { rateLimitByIp, RateLimitPresets } = require("./rate-limit");
  const { withErrorHandler } = require("./error-handler");
  const { withCors } = require("./cors");

  return withCors(
    withErrorHandler(rateLimitByIp(handler, RateLimitPresets.unauthenticated))
  );
}

/**
 * Admin-only API route
 *
 * @example
 * import { adminRoute } from '@/lib/middleware';
 *
 * export const DELETE = adminRoute(async (req) => {
 *   // Only admins can access
 *   // ...
 * });
 */
export function adminRoute(
  handler: (
    req: import("./auth.middleware").AuthenticatedRequest,
    context?: any
  ) => Promise<NextResponse> | NextResponse
): (req: NextRequest, context?: any) => Promise<NextResponse> {
  const { requireAdmin } = require("./auth.middleware");
  const { rateLimit } = require("./rate-limit");
  const { withErrorHandler } = require("./error-handler");
  const { withCors } = require("./cors");

  return withCors(withErrorHandler(requireAdmin(rateLimit(handler))));
}

/**
 * Vendor-only API route
 *
 * @example
 * import { vendorRoute } from '@/lib/middleware';
 *
 * export const POST = vendorRoute(async (req) => {
 *   // Only vendors (and admins) can access
 *   // ...
 * });
 */
export function vendorRoute(
  handler: (
    req: import("./auth.middleware").AuthenticatedRequest,
    context?: any
  ) => Promise<NextResponse> | NextResponse
): (req: NextRequest, context?: any) => Promise<NextResponse> {
  const { requireVendor } = require("./auth.middleware");
  const { rateLimit } = require("./rate-limit");
  const { withErrorHandler } = require("./error-handler");
  const { withCors } = require("./cors");

  return withCors(withErrorHandler(requireVendor(rateLimit(handler))));
}

// Re-export from api-response for convenience
export {
  successResponse,
  errorResponse,
  ApiResponses,
  ErrorCodes,
  isApiError,
  getErrorMessage,
  sanitizeErrorDetails,
  type ApiError,
  type ApiSuccess,
} from "@/lib/api-response";

// Re-export from rate-limit-store
export { rateLimitStore, RateLimitStore } from "@/lib/rate-limit-store";

// Type imports
import { NextRequest, NextResponse } from "next/server";
