/**
 * Rate Limiting Middleware for Fleet Feast API Routes
 *
 * Implements per-user and per-IP rate limiting using token bucket algorithm.
 * Returns 429 Too Many Requests with Retry-After header when limit exceeded.
 */

import { NextRequest, NextResponse } from "next/server";
import { rateLimitStore } from "@/lib/rate-limit-store";
import { ApiResponses } from "@/lib/api-response";
import { AuthenticatedRequest } from "./auth.middleware";

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the window
   */
  limit: number;

  /**
   * Time window in milliseconds
   */
  windowMs: number;

  /**
   * Custom key generator function
   * Default: uses user ID for authenticated, IP for unauthenticated
   */
  keyGenerator?: (req: NextRequest) => string;

  /**
   * Skip rate limiting based on custom logic
   * Useful for whitelisting certain IPs or users
   */
  skip?: (req: NextRequest) => boolean;

  /**
   * Custom handler when rate limit is exceeded
   */
  onLimitReached?: (req: NextRequest, key: string) => void;
}

/**
 * Default rate limit configurations
 */
export const RateLimitPresets = {
  /**
   * Default limits for authenticated users
   * 100 requests per minute
   */
  authenticated: {
    limit: 100,
    windowMs: 60 * 1000, // 1 minute
  },

  /**
   * Stricter limits for unauthenticated users
   * 30 requests per minute
   */
  unauthenticated: {
    limit: 30,
    windowMs: 60 * 1000, // 1 minute
  },

  /**
   * Very strict limits for sensitive operations (login, signup)
   * 5 requests per 15 minutes
   */
  strict: {
    limit: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },

  /**
   * Relaxed limits for read operations
   * 300 requests per minute
   */
  relaxed: {
    limit: 300,
    windowMs: 60 * 1000, // 1 minute
  },
} as const;

/**
 * Extract client IP address from request
 * Handles proxy headers (X-Forwarded-For, X-Real-IP)
 */
function getClientIp(req: NextRequest): string {
  // Check X-Forwarded-For header (set by proxies)
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    // X-Forwarded-For can contain multiple IPs, take the first one
    return forwarded.split(",")[0].trim();
  }

  // Check X-Real-IP header (set by some proxies)
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  // Fallback to connection remote address
  // Note: In Next.js App Router, this might not be available
  return "unknown";
}

/**
 * Default key generator
 * Uses user ID for authenticated requests, IP for unauthenticated
 */
function defaultKeyGenerator(req: NextRequest): string {
  const authReq = req as AuthenticatedRequest;

  // Use user ID if authenticated
  if (authReq.user?.id) {
    return `user:${authReq.user.id}`;
  }

  // Use IP address for unauthenticated
  const ip = getClientIp(req);
  return `ip:${ip}`;
}

/**
 * Rate limiting middleware
 *
 * @example
 * // Use default authenticated limits
 * export const GET = rateLimit(handler);
 *
 * @example
 * // Custom limits
 * export const POST = rateLimit(handler, {
 *   limit: 10,
 *   windowMs: 60000, // 10 requests per minute
 * });
 *
 * @example
 * // Strict limits for auth endpoints
 * export const POST = rateLimit(handler, RateLimitPresets.strict);
 *
 * @example
 * // Custom key generator (by endpoint)
 * export const POST = rateLimit(handler, {
 *   limit: 5,
 *   windowMs: 60000,
 *   keyGenerator: (req) => `endpoint:${req.nextUrl.pathname}:${getClientIp(req)}`,
 * });
 */
export function rateLimit<T extends (...args: any[]) => any>(
  handler: T,
  config?: Partial<RateLimitConfig>
): T {
  // Merge with defaults
  const options: RateLimitConfig = {
    limit: config?.limit ?? RateLimitPresets.authenticated.limit,
    windowMs: config?.windowMs ?? RateLimitPresets.authenticated.windowMs,
    keyGenerator: config?.keyGenerator ?? defaultKeyGenerator,
    skip: config?.skip,
    onLimitReached: config?.onLimitReached,
  };

  return (async (req: NextRequest, ...args: any[]) => {
    try {
      // Check if rate limiting should be skipped
      if (options.skip?.(req)) {
        return await handler(req, ...args);
      }

      // Generate rate limit key
      const key = options.keyGenerator!(req);

      // Check rate limit
      const result = rateLimitStore.check(key, options.limit, options.windowMs);

      // Add rate limit headers to response
      const headers = new Headers();
      headers.set("X-RateLimit-Limit", options.limit.toString());
      headers.set("X-RateLimit-Remaining", result.remaining.toString());
      headers.set(
        "X-RateLimit-Reset",
        new Date(result.resetAt).toISOString()
      );

      // Check if limit exceeded
      if (!result.allowed) {
        // Calculate retry after in seconds
        const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);

        // Call custom handler if provided
        options.onLimitReached?.(req, key);

        // Return 429 with Retry-After header
        const response = ApiResponses.rateLimitExceeded(retryAfter);

        // Add rate limit headers
        headers.forEach((value, name) => {
          response.headers.set(name, value);
        });

        return response;
      }

      // Call the handler
      const response = await handler(req, ...args);

      // Add rate limit headers to successful response
      headers.forEach((value, name) => {
        response.headers.set(name, value);
      });

      return response;
    } catch (error) {
      console.error("[Rate Limit Middleware] Error:", error);
      // On error, allow the request through (fail open)
      return await handler(req, ...args);
    }
  }) as T;
}

/**
 * Apply adaptive rate limiting based on authentication status
 * Authenticated users get higher limits
 */
export function adaptiveRateLimit<T extends (...args: any[]) => any>(
  handler: T
): T {
  return rateLimit(handler, {
    keyGenerator: (req) => {
      const authReq = req as AuthenticatedRequest;
      return defaultKeyGenerator(req);
    },
    limit: 100, // Will be overridden by custom logic
    windowMs: 60 * 1000,
    skip: (req) => {
      const authReq = req as AuthenticatedRequest;

      // Get appropriate config based on auth status
      const config = authReq.user
        ? RateLimitPresets.authenticated
        : RateLimitPresets.unauthenticated;

      // Check with appropriate limits
      const key = defaultKeyGenerator(req);
      const result = rateLimitStore.check(key, config.limit, config.windowMs);

      // Return true to skip if allowed, false to apply rate limit
      return result.allowed;
    },
  });
}

/**
 * Rate limit by IP only (ignores authentication)
 * Useful for public endpoints
 */
export function rateLimitByIp<T extends (...args: any[]) => any>(
  handler: T,
  config?: Partial<Omit<RateLimitConfig, "keyGenerator">>
): T {
  return rateLimit(handler, {
    ...config,
    keyGenerator: (req) => `ip:${getClientIp(req)}`,
  });
}

/**
 * Rate limit by user ID only
 * Requires authentication
 */
export function rateLimitByUser<T extends (...args: any[]) => any>(
  handler: T,
  config?: Partial<Omit<RateLimitConfig, "keyGenerator">>
): T {
  return rateLimit(handler, {
    ...config,
    keyGenerator: (req) => {
      const authReq = req as AuthenticatedRequest;
      if (!authReq.user?.id) {
        throw new Error("User must be authenticated for user-based rate limiting");
      }
      return `user:${authReq.user.id}`;
    },
  });
}

/**
 * Rate limit by custom key
 */
export function rateLimitByKey<T extends (...args: any[]) => any>(
  handler: T,
  keyFn: (req: NextRequest) => string,
  config?: Partial<Omit<RateLimitConfig, "keyGenerator">>
): T {
  return rateLimit(handler, {
    ...config,
    keyGenerator: keyFn,
  });
}

/**
 * Get current rate limit status for a key
 */
export function getRateLimitStatus(
  key: string,
  limit: number,
  windowMs: number
): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  resetIn: number;
} {
  const result = rateLimitStore.check(key, limit, windowMs);
  return {
    ...result,
    resetIn: Math.max(0, result.resetAt - Date.now()),
  };
}

/**
 * Reset rate limit for a specific key
 * Useful for testing or admin overrides
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.reset(key);
}

/**
 * Clear all rate limits
 * Useful for testing
 */
export function clearAllRateLimits(): void {
  rateLimitStore.clear();
}
