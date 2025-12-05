/**
 * Request Validation Middleware for Fleet Feast API Routes
 *
 * Provides Zod-based validation for request bodies, query parameters, and path parameters.
 * Returns standardized 400 Bad Request errors with detailed validation messages.
 */

import { NextRequest, NextResponse } from "next/server";
import { z, ZodSchema, ZodError } from "zod";
import { ApiResponses } from "@/lib/api-response";

/**
 * Validation target (what to validate)
 */
export type ValidationType = "body" | "query" | "params" | "headers";

/**
 * Validation schemas for different parts of the request
 */
export interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
  headers?: ZodSchema;
}

/**
 * Extended request with validated data
 */
export interface ValidatedRequest<
  TBody = any,
  TQuery = any,
  TParams = any
> extends NextRequest {
  validatedBody?: TBody;
  validatedQuery?: TQuery;
  validatedParams?: TParams;
}

/**
 * Format Zod errors into user-friendly messages
 */
function formatZodErrors(error: ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join(".");
    const key = path || "root";

    if (!formatted[key]) {
      formatted[key] = [];
    }

    formatted[key].push(issue.message);
  }

  return formatted;
}

/**
 * Parse and validate request body
 */
async function validateBody(
  req: NextRequest,
  schema: ZodSchema
): Promise<{ success: true; data: any } | { success: false; error: NextResponse }> {
  try {
    // Parse JSON body
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return {
        success: false,
        error: ApiResponses.badRequest("Invalid JSON in request body"),
      };
    }

    // Validate with schema
    const result = schema.safeParse(body);

    if (!result.success) {
      return {
        success: false,
        error: ApiResponses.validationError(formatZodErrors(result.error)),
      };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error("[Validation] Body validation error:", error);
    return {
      success: false,
      error: ApiResponses.badRequest("Request body validation failed"),
    };
  }
}

/**
 * Parse and validate query parameters
 */
function validateQuery(
  req: NextRequest,
  schema: ZodSchema
): { success: true; data: any } | { success: false; error: NextResponse } {
  try {
    // Extract query parameters
    const searchParams = req.nextUrl.searchParams;
    const query: Record<string, any> = {};

    searchParams.forEach((value, key) => {
      // Handle array params (key[]=value)
      if (key.endsWith("[]")) {
        const arrayKey = key.slice(0, -2);
        if (!query[arrayKey]) {
          query[arrayKey] = [];
        }
        query[arrayKey].push(value);
      } else {
        query[key] = value;
      }
    });

    // Validate with schema
    const result = schema.safeParse(query);

    if (!result.success) {
      return {
        success: false,
        error: ApiResponses.validationError(formatZodErrors(result.error)),
      };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error("[Validation] Query validation error:", error);
    return {
      success: false,
      error: ApiResponses.badRequest("Query parameter validation failed"),
    };
  }
}

/**
 * Validate route parameters
 */
function validateParams(
  params: any,
  schema: ZodSchema
): { success: true; data: any } | { success: false; error: NextResponse } {
  try {
    const result = schema.safeParse(params);

    if (!result.success) {
      return {
        success: false,
        error: ApiResponses.validationError(formatZodErrors(result.error)),
      };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error("[Validation] Params validation error:", error);
    return {
      success: false,
      error: ApiResponses.badRequest("Route parameter validation failed"),
    };
  }
}

/**
 * Validation middleware
 *
 * @example
 * // Validate body only
 * const bodySchema = z.object({
 *   name: z.string().min(1),
 *   email: z.string().email(),
 * });
 *
 * export const POST = validate(
 *   { body: bodySchema },
 *   async (req) => {
 *     const data = req.validatedBody;
 *     // ...
 *   }
 * );
 *
 * @example
 * // Validate query and params
 * export const GET = validate(
 *   {
 *     query: z.object({ page: z.coerce.number().int().positive() }),
 *     params: z.object({ id: z.string().uuid() }),
 *   },
 *   async (req, { params }) => {
 *     const query = req.validatedQuery;
 *     const routeParams = req.validatedParams;
 *     // ...
 *   }
 * );
 */
export function validate<TBody = any, TQuery = any, TParams = any>(
  schemas: ValidationSchemas,
  handler: (
    req: ValidatedRequest<TBody, TQuery, TParams>,
    context?: any
  ) => Promise<NextResponse> | NextResponse
): (req: NextRequest, context?: any) => Promise<NextResponse> {
  return async (req: NextRequest, context?: any) => {
    const validatedReq = req as ValidatedRequest<TBody, TQuery, TParams>;

    try {
      // Validate body if schema provided
      if (schemas.body) {
        const result = await validateBody(req, schemas.body);
        if (!result.success) {
          return result.error;
        }
        validatedReq.validatedBody = result.data;
      }

      // Validate query if schema provided
      if (schemas.query) {
        const result = validateQuery(req, schemas.query);
        if (!result.success) {
          return result.error;
        }
        validatedReq.validatedQuery = result.data;
      }

      // Validate params if schema provided and context.params exists
      if (schemas.params && context?.params) {
        const result = validateParams(context.params, schemas.params);
        if (!result.success) {
          return result.error;
        }
        validatedReq.validatedParams = result.data;
      }

      // Call handler with validated request
      return await handler(validatedReq, context);
    } catch (error) {
      console.error("[Validation Middleware] Error:", error);
      return ApiResponses.internalError("Validation middleware failed");
    }
  };
}

/**
 * Validate body only (shorthand)
 */
export function validateBody<T = any>(
  schema: ZodSchema<T>,
  handler: (
    req: ValidatedRequest<T>,
    context?: any
  ) => Promise<NextResponse> | NextResponse
): (req: NextRequest, context?: any) => Promise<NextResponse> {
  return validate({ body: schema }, handler);
}

/**
 * Validate query only (shorthand)
 */
export function validateQuery<T = any>(
  schema: ZodSchema<T>,
  handler: (
    req: ValidatedRequest<any, T>,
    context?: any
  ) => Promise<NextResponse> | NextResponse
): (req: NextRequest, context?: any) => Promise<NextResponse> {
  return validate({ query: schema }, handler);
}

/**
 * Validate params only (shorthand)
 */
export function validateParams<T = any>(
  schema: ZodSchema<T>,
  handler: (
    req: ValidatedRequest<any, any, T>,
    context?: any
  ) => Promise<NextResponse> | NextResponse
): (req: NextRequest, context?: any) => Promise<NextResponse> {
  return validate({ params: schema }, handler);
}

/**
 * Common validation schemas
 */
export const CommonSchemas = {
  /**
   * Pagination query parameters
   */
  pagination: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  }),

  /**
   * UUID parameter
   */
  uuid: z.object({
    id: z.string().uuid("Invalid ID format"),
  }),

  /**
   * Email validation
   */
  email: z.string().email("Invalid email address").toLowerCase(),

  /**
   * Password validation (min 8 chars, requires uppercase, lowercase, number)
   */
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),

  /**
   * Search query
   */
  search: z.object({
    q: z.string().min(1, "Search query cannot be empty").optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  }),

  /**
   * Date range
   */
  dateRange: z.object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  }),

  /**
   * Sorting
   */
  sort: z.object({
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).default("asc"),
  }),
};

/**
 * Compose multiple validation middleware
 * Useful when you want to apply auth + validation together
 */
export function compose<T extends (...args: any[]) => any>(
  ...middlewares: Array<(handler: T) => T>
): (handler: T) => T {
  return (handler: T) => {
    return middlewares.reduceRight(
      (wrapped, middleware) => middleware(wrapped),
      handler
    );
  };
}
