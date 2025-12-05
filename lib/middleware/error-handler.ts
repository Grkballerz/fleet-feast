/**
 * Centralized Error Handler Middleware for Fleet Feast API Routes
 *
 * Catches and formats errors consistently across all API endpoints.
 * Logs errors appropriately while excluding sensitive information.
 */

import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import {
  ApiResponses,
  getErrorMessage,
  sanitizeErrorDetails,
} from "@/lib/api-response";

/**
 * Error types we handle specifically
 */
export enum ErrorType {
  VALIDATION = "VALIDATION",
  DATABASE = "DATABASE",
  AUTHENTICATION = "AUTHENTICATION",
  AUTHORIZATION = "AUTHORIZATION",
  NOT_FOUND = "NOT_FOUND",
  RATE_LIMIT = "RATE_LIMIT",
  CONFLICT = "CONFLICT",
  INTERNAL = "INTERNAL",
}

/**
 * Custom application error
 */
export class AppError extends Error {
  constructor(
    public type: ErrorType,
    message: string,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * Check if error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Log error with appropriate level and sanitization
 */
function logError(error: unknown, req: NextRequest): void {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.nextUrl.pathname;

  // Base log object
  const logData: Record<string, any> = {
    timestamp,
    method,
    url,
    error: {
      name: error instanceof Error ? error.name : "Unknown",
      message: getErrorMessage(error),
    },
  };

  // Add error type if AppError
  if (isAppError(error)) {
    logData.error.type = error.type;
    logData.error.statusCode = error.statusCode;

    // Sanitize and add details
    if (error.details) {
      logData.error.details = sanitizeErrorDetails(error.details);
    }
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === "development" && error instanceof Error) {
    logData.error.stack = error.stack;
  }

  // Determine log level
  const statusCode = isAppError(error) ? error.statusCode : 500;

  if (statusCode >= 500) {
    console.error("[Error Handler]", JSON.stringify(logData, null, 2));
  } else if (statusCode >= 400) {
    console.warn("[Error Handler]", JSON.stringify(logData, null, 2));
  } else {
    console.info("[Error Handler]", JSON.stringify(logData, null, 2));
  }
}

/**
 * Convert various error types to appropriate responses
 */
function handleError(error: unknown, req: NextRequest): NextResponse {
  // Log the error
  logError(error, req);

  // Handle AppError
  if (isAppError(error)) {
    return NextResponse.json(
      {
        error: {
          code: error.type,
          message: error.message,
          ...(error.details && { details: error.details }),
        },
      },
      { status: error.statusCode }
    );
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const formatted: Record<string, string[]> = {};
    for (const issue of error.issues) {
      const path = issue.path.join(".");
      const key = path || "root";
      if (!formatted[key]) {
        formatted[key] = [];
      }
      formatted[key].push(issue.message);
    }

    return ApiResponses.validationError(formatted);
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002: Unique constraint violation
    if (error.code === "P2002") {
      const target = (error.meta?.target as string[]) || ["field"];
      return ApiResponses.duplicateEntry(target.join(", "));
    }

    // P2025: Record not found
    if (error.code === "P2025") {
      return ApiResponses.notFound();
    }

    // P2003: Foreign key constraint violation
    if (error.code === "P2003") {
      return ApiResponses.badRequest(
        "Operation failed due to related records",
        { code: error.code }
      );
    }

    // Generic Prisma error
    return ApiResponses.databaseError();
  }

  // Handle Prisma validation errors
  if (error instanceof Prisma.PrismaClientValidationError) {
    return ApiResponses.badRequest("Invalid data provided to database");
  }

  // Handle standard errors
  if (error instanceof Error) {
    // Check for specific error messages
    const message = error.message.toLowerCase();

    if (message.includes("unauthorized") || message.includes("authentication")) {
      return ApiResponses.unauthorized();
    }

    if (message.includes("forbidden") || message.includes("permission")) {
      return ApiResponses.forbidden();
    }

    if (message.includes("not found")) {
      return ApiResponses.notFound();
    }

    // Development: show error message
    // Production: generic message
    if (process.env.NODE_ENV === "development") {
      return ApiResponses.internalError(error.message);
    }
  }

  // Default: Internal server error
  return ApiResponses.internalError();
}

/**
 * Error handling middleware wrapper
 *
 * @example
 * export const GET = withErrorHandler(async (req) => {
 *   // Your code here
 *   // Throws will be caught and handled
 * });
 *
 * @example
 * // With custom error
 * export const POST = withErrorHandler(async (req) => {
 *   if (!data) {
 *     throw new AppError(
 *       ErrorType.NOT_FOUND,
 *       "Resource not found",
 *       404
 *     );
 *   }
 * });
 */
export function withErrorHandler<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T
): T {
  return (async (...args: any[]) => {
    const req = args[0] as NextRequest;

    try {
      return await handler(...args);
    } catch (error) {
      return handleError(error, req);
    }
  }) as T;
}

/**
 * Async error catcher for use in route handlers
 * Alternative to withErrorHandler for more granular control
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  req: NextRequest
): Promise<T | NextResponse> {
  try {
    return await fn();
  } catch (error) {
    return handleError(error, req);
  }
}

/**
 * Helper to throw validation errors
 */
export function throwValidationError(
  message: string,
  details?: Record<string, any>
): never {
  throw new AppError(ErrorType.VALIDATION, message, 400, details);
}

/**
 * Helper to throw not found errors
 */
export function throwNotFound(resource: string = "Resource"): never {
  throw new AppError(ErrorType.NOT_FOUND, `${resource} not found`, 404);
}

/**
 * Helper to throw unauthorized errors
 */
export function throwUnauthorized(message: string = "Authentication required"): never {
  throw new AppError(ErrorType.AUTHENTICATION, message, 401);
}

/**
 * Helper to throw forbidden errors
 */
export function throwForbidden(
  message: string = "You don't have permission to access this resource"
): never {
  throw new AppError(ErrorType.AUTHORIZATION, message, 403);
}

/**
 * Helper to throw conflict errors
 */
export function throwConflict(message: string): never {
  throw new AppError(ErrorType.CONFLICT, message, 409);
}

/**
 * Helper to assert a condition, throwing not found if false
 */
export function assertExists<T>(
  value: T | null | undefined,
  resource: string = "Resource"
): asserts value is T {
  if (value === null || value === undefined) {
    throwNotFound(resource);
  }
}

/**
 * Helper to assert authorization
 */
export function assertAuthorized(
  condition: boolean,
  message: string = "You don't have permission to perform this action"
): asserts condition {
  if (!condition) {
    throwForbidden(message);
  }
}

/**
 * Compose error handler with other middleware
 */
export function withMiddleware<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T,
  ...middlewares: Array<(h: T) => T>
): T {
  // Apply middleware in order
  let wrapped = handler;
  for (const middleware of middlewares) {
    wrapped = middleware(wrapped);
  }

  // Wrap final result with error handler
  return withErrorHandler(wrapped);
}
