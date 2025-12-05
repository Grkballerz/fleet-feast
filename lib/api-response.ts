/**
 * Standardized API Response Helpers for Fleet Feast
 *
 * Provides consistent response format across all API endpoints
 * following the error structure defined in the briefing.
 */

import { NextResponse } from "next/server";

/**
 * Standard error codes used across the application
 */
export const ErrorCodes = {
  // Authentication & Authorization (401, 403)
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  SESSION_EXPIRED: "SESSION_EXPIRED",

  // Validation (400)
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_INPUT: "INVALID_INPUT",
  MISSING_REQUIRED_FIELD: "MISSING_REQUIRED_FIELD",

  // Rate Limiting (429)
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",

  // Not Found (404)
  NOT_FOUND: "NOT_FOUND",
  RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",

  // Conflict (409)
  CONFLICT: "CONFLICT",
  DUPLICATE_ENTRY: "DUPLICATE_ENTRY",

  // Server Errors (500)
  INTERNAL_ERROR: "INTERNAL_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",
} as const;

/**
 * Error response structure
 */
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

/**
 * Success response structure
 */
export interface ApiSuccess<T = any> {
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    [key: string]: any;
  };
}

/**
 * Create a success response
 */
export function successResponse<T>(
  data: T,
  meta?: ApiSuccess<T>["meta"],
  status: number = 200
): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ data, ...(meta && { meta }) }, { status });
}

/**
 * Create an error response
 */
export function errorResponse(
  code: string,
  message: string,
  status: number = 500,
  details?: Record<string, any>
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(details && { details }),
      },
    },
    { status }
  );
}

/**
 * Common error responses
 */
export const ApiResponses = {
  // 400 Bad Request
  badRequest: (message: string, details?: Record<string, any>) =>
    errorResponse(ErrorCodes.VALIDATION_ERROR, message, 400, details),

  validationError: (errors: Record<string, string[]>) =>
    errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      "Validation failed",
      400,
      { errors }
    ),

  // 401 Unauthorized
  unauthorized: (message: string = "Authentication required") =>
    errorResponse(ErrorCodes.UNAUTHORIZED, message, 401),

  invalidCredentials: () =>
    errorResponse(
      ErrorCodes.INVALID_CREDENTIALS,
      "Invalid email or password",
      401
    ),

  tokenExpired: () =>
    errorResponse(
      ErrorCodes.TOKEN_EXPIRED,
      "Your session has expired. Please log in again.",
      401
    ),

  // 403 Forbidden
  forbidden: (message: string = "You don't have permission to access this resource") =>
    errorResponse(ErrorCodes.FORBIDDEN, message, 403),

  // 404 Not Found
  notFound: (resource: string = "Resource") =>
    errorResponse(
      ErrorCodes.NOT_FOUND,
      `${resource} not found`,
      404
    ),

  // 409 Conflict
  conflict: (message: string) =>
    errorResponse(ErrorCodes.CONFLICT, message, 409),

  duplicateEntry: (field: string) =>
    errorResponse(
      ErrorCodes.DUPLICATE_ENTRY,
      `${field} already exists`,
      409
    ),

  // 429 Too Many Requests
  rateLimitExceeded: (retryAfter: number) => {
    const response = errorResponse(
      ErrorCodes.RATE_LIMIT_EXCEEDED,
      "Too many requests. Please try again later.",
      429,
      { retryAfter }
    );

    // Add Retry-After header
    response.headers.set("Retry-After", retryAfter.toString());

    return response;
  },

  // 500 Internal Server Error
  internalError: (message: string = "An unexpected error occurred") =>
    errorResponse(ErrorCodes.INTERNAL_ERROR, message, 500),

  databaseError: () =>
    errorResponse(
      ErrorCodes.DATABASE_ERROR,
      "Database operation failed. Please try again.",
      500
    ),

  // Success responses
  ok: <T>(data: T) => successResponse(data, undefined, 200),

  created: <T>(data: T) => successResponse(data, undefined, 201),

  noContent: () => new NextResponse(null, { status: 204 }),

  // Paginated response
  paginated: <T>(
    data: T[],
    page: number,
    limit: number,
    total: number
  ) =>
    successResponse(
      data,
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      200
    ),
};

/**
 * Type guard for API errors
 */
export function isApiError(value: any): value is ApiError {
  return (
    value &&
    typeof value === "object" &&
    "error" in value &&
    typeof value.error === "object" &&
    "code" in value.error &&
    "message" in value.error
  );
}

/**
 * Extract error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (isApiError(error)) {
    return error.error.message;
  }

  return "An unexpected error occurred";
}

/**
 * Sanitize error details for logging
 * Removes sensitive information before logging
 */
export function sanitizeErrorDetails(details: Record<string, any>): Record<string, any> {
  const sensitiveKeys = [
    "password",
    "passwordHash",
    "token",
    "apiKey",
    "secret",
    "accessToken",
    "refreshToken",
    "creditCard",
    "ssn",
  ];

  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(details)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = sensitiveKeys.some((sensitive) =>
      lowerKey.includes(sensitive)
    );

    if (isSensitive) {
      sanitized[key] = "[REDACTED]";
    } else if (value && typeof value === "object") {
      sanitized[key] = sanitizeErrorDetails(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
