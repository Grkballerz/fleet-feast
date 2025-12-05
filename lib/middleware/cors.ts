/**
 * CORS Middleware for Fleet Feast API Routes
 *
 * Configures Cross-Origin Resource Sharing for API endpoints.
 * Handles preflight requests and sets appropriate headers.
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * CORS configuration options
 */
export interface CorsOptions {
  /**
   * Allowed origins (use "*" for all, or array of specific origins)
   */
  origin?: string | string[] | ((origin: string) => boolean);

  /**
   * Allowed HTTP methods
   */
  methods?: string[];

  /**
   * Allowed headers
   */
  allowedHeaders?: string[];

  /**
   * Exposed headers (headers client can access)
   */
  exposedHeaders?: string[];

  /**
   * Allow credentials (cookies, authorization headers)
   */
  credentials?: boolean;

  /**
   * Max age for preflight cache (in seconds)
   */
  maxAge?: number;

  /**
   * Success status code for OPTIONS request
   */
  optionsSuccessStatus?: number;
}

/**
 * Default CORS configuration
 */
const defaultCorsOptions: CorsOptions = {
  origin: process.env.NODE_ENV === "production"
    ? [process.env.NEXT_PUBLIC_APP_URL || "https://fleetfeast.com"]
    : ["http://localhost:3000", "http://127.0.0.1:3000"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "X-CSRF-Token",
  ],
  exposedHeaders: [
    "X-RateLimit-Limit",
    "X-RateLimit-Remaining",
    "X-RateLimit-Reset",
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 204,
};

/**
 * Check if origin is allowed
 */
function isOriginAllowed(
  requestOrigin: string | null,
  allowedOrigin: string | string[] | ((origin: string) => boolean) | undefined
): boolean {
  // No origin header (same-origin request)
  if (!requestOrigin) {
    return true;
  }

  // No restrictions
  if (!allowedOrigin || allowedOrigin === "*") {
    return true;
  }

  // Function-based check
  if (typeof allowedOrigin === "function") {
    return allowedOrigin(requestOrigin);
  }

  // Array of allowed origins
  if (Array.isArray(allowedOrigin)) {
    return allowedOrigin.some((origin) => {
      // Exact match
      if (origin === requestOrigin) {
        return true;
      }

      // Wildcard subdomain match (e.g., "*.example.com")
      if (origin.startsWith("*.")) {
        const domain = origin.slice(2);
        return requestOrigin.endsWith(domain);
      }

      return false;
    });
  }

  // String comparison
  return allowedOrigin === requestOrigin;
}

/**
 * Set CORS headers on response
 */
function setCorsHeaders(
  response: NextResponse,
  req: NextRequest,
  options: CorsOptions
): NextResponse {
  const requestOrigin = req.headers.get("origin");

  // Check if origin is allowed
  const originAllowed = isOriginAllowed(requestOrigin, options.origin);

  if (originAllowed) {
    // Set origin header
    if (requestOrigin) {
      // Specific origin (required when credentials: true)
      response.headers.set("Access-Control-Allow-Origin", requestOrigin);

      // Add Vary header to prevent cache issues
      response.headers.set("Vary", "Origin");
    } else if (options.origin === "*") {
      // Allow all origins (only when credentials: false)
      response.headers.set("Access-Control-Allow-Origin", "*");
    }

    // Allow credentials
    if (options.credentials) {
      response.headers.set("Access-Control-Allow-Credentials", "true");
    }

    // Expose headers
    if (options.exposedHeaders && options.exposedHeaders.length > 0) {
      response.headers.set(
        "Access-Control-Expose-Headers",
        options.exposedHeaders.join(", ")
      );
    }
  }

  return response;
}

/**
 * Handle CORS preflight (OPTIONS) request
 */
function handlePreflight(
  req: NextRequest,
  options: CorsOptions
): NextResponse | null {
  // Only handle OPTIONS requests
  if (req.method !== "OPTIONS") {
    return null;
  }

  const requestOrigin = req.headers.get("origin");

  // Check if origin is allowed
  if (!isOriginAllowed(requestOrigin, options.origin)) {
    return new NextResponse(null, { status: 403 });
  }

  // Create response
  const response = new NextResponse(null, {
    status: options.optionsSuccessStatus || 204,
  });

  // Set CORS headers
  if (requestOrigin) {
    response.headers.set("Access-Control-Allow-Origin", requestOrigin);
    response.headers.set("Vary", "Origin");
  } else if (options.origin === "*") {
    response.headers.set("Access-Control-Allow-Origin", "*");
  }

  // Allow credentials
  if (options.credentials) {
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }

  // Allow methods
  if (options.methods && options.methods.length > 0) {
    response.headers.set(
      "Access-Control-Allow-Methods",
      options.methods.join(", ")
    );
  }

  // Allow headers
  if (options.allowedHeaders && options.allowedHeaders.length > 0) {
    response.headers.set(
      "Access-Control-Allow-Headers",
      options.allowedHeaders.join(", ")
    );
  }

  // Max age
  if (options.maxAge) {
    response.headers.set("Access-Control-Max-Age", options.maxAge.toString());
  }

  return response;
}

/**
 * CORS middleware wrapper
 *
 * @example
 * // Use default CORS config
 * export const GET = withCors(async (req) => {
 *   // ...
 * });
 *
 * @example
 * // Custom CORS config
 * export const POST = withCors(
 *   async (req) => {
 *     // ...
 *   },
 *   {
 *     origin: ["https://app.example.com"],
 *     methods: ["POST"],
 *   }
 * );
 *
 * @example
 * // Dynamic origin validation
 * export const GET = withCors(
 *   async (req) => {
 *     // ...
 *   },
 *   {
 *     origin: (origin) => {
 *       // Custom validation logic
 *       return origin.endsWith(".example.com");
 *     },
 *   }
 * );
 */
export function withCors<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T,
  options?: Partial<CorsOptions>
): T {
  // Merge with defaults
  const corsOptions: CorsOptions = {
    ...defaultCorsOptions,
    ...options,
  };

  return (async (...args: any[]) => {
    const req = args[0] as NextRequest;

    try {
      // Handle preflight request
      const preflightResponse = handlePreflight(req, corsOptions);
      if (preflightResponse) {
        return preflightResponse;
      }

      // Call handler
      const response = await handler(...args);

      // Add CORS headers to response
      return setCorsHeaders(response, req, corsOptions);
    } catch (error) {
      // Even on error, we need to set CORS headers
      // Otherwise the browser will block the error response
      const errorResponse = NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );

      return setCorsHeaders(errorResponse, req, corsOptions);
    }
  }) as T;
}

/**
 * CORS middleware for public APIs (allow all origins)
 */
export function withPublicCors<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T
): T {
  return withCors(handler, {
    origin: "*",
    credentials: false,
  });
}

/**
 * CORS middleware with custom origin validator
 */
export function withCustomCors<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T,
  originValidator: (origin: string) => boolean,
  options?: Partial<Omit<CorsOptions, "origin">>
): T {
  return withCors(handler, {
    ...options,
    origin: originValidator,
  });
}

/**
 * Get allowed origins from environment
 */
export function getAllowedOrigins(): string[] {
  const envOrigins = process.env.ALLOWED_ORIGINS;

  if (envOrigins) {
    return envOrigins.split(",").map((origin) => origin.trim());
  }

  // Default origins
  if (process.env.NODE_ENV === "production") {
    return [process.env.NEXT_PUBLIC_APP_URL || "https://fleetfeast.com"];
  }

  return ["http://localhost:3000", "http://127.0.0.1:3000"];
}

/**
 * Create CORS middleware with origins from environment
 */
export function createCorsMiddleware(
  options?: Partial<Omit<CorsOptions, "origin">>
): <T extends (...args: any[]) => Promise<NextResponse>>(handler: T) => T {
  const allowedOrigins = getAllowedOrigins();

  return <T extends (...args: any[]) => Promise<NextResponse>>(handler: T) =>
    withCors(handler, {
      ...options,
      origin: allowedOrigins,
    });
}
