/**
 * Authentication Middleware for Fleet Feast API Routes
 *
 * Integrates with NextAuth to verify JWT tokens and attach user context.
 * Supports both authenticated and public routes.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ApiResponses } from "@/lib/api-response";
import { UserRole } from "@prisma/client";

/**
 * User context attached to request after authentication
 */
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

/**
 * Extended NextRequest with user context
 */
export interface AuthenticatedRequest extends NextRequest {
  user?: AuthUser;
}

/**
 * Options for authentication middleware
 */
export interface AuthMiddlewareOptions {
  required?: boolean; // If true, returns 401 for unauthenticated requests
  roles?: UserRole[]; // If specified, checks if user has one of these roles
}

/**
 * Type for route handlers
 */
export type RouteHandler = (
  req: AuthenticatedRequest,
  context?: any
) => Promise<NextResponse> | NextResponse;

/**
 * Authentication middleware wrapper
 *
 * @example
 * // Require authentication
 * export const GET = withAuth(async (req) => {
 *   const userId = req.user!.id;
 *   // ...
 * }, { required: true });
 *
 * @example
 * // Optional authentication
 * export const GET = withAuth(async (req) => {
 *   const userId = req.user?.id; // May be undefined
 *   // ...
 * });
 *
 * @example
 * // Require specific role
 * export const POST = withAuth(async (req) => {
 *   // Only admins can access
 *   // ...
 * }, { required: true, roles: ['ADMIN'] });
 */
export function withAuth(
  handler: RouteHandler,
  options: AuthMiddlewareOptions = {}
): RouteHandler {
  return async (req: AuthenticatedRequest, context?: any) => {
    try {
      // Get session from NextAuth
      const session = await auth();

      // Attach user to request if session exists
      if (session?.user) {
        req.user = {
          id: session.user.id,
          email: session.user.email || "",
          role: session.user.role,
        };
      }

      // Check if authentication is required
      if (options.required && !req.user) {
        return ApiResponses.unauthorized();
      }

      // Check role-based access
      if (options.roles && req.user) {
        const hasRole = options.roles.includes(req.user.role);
        if (!hasRole) {
          return ApiResponses.forbidden(
            `This endpoint requires one of the following roles: ${options.roles.join(", ")}`
          );
        }
      }

      // Call the actual handler
      return await handler(req, context);
    } catch (error) {
      console.error("[Auth Middleware] Error:", error);

      // Handle specific NextAuth errors
      if (error instanceof Error) {
        if (error.message.includes("JWT")) {
          return ApiResponses.tokenExpired();
        }
      }

      return ApiResponses.internalError("Authentication check failed");
    }
  };
}

/**
 * Middleware to require authentication
 * Shorthand for withAuth(handler, { required: true })
 */
export function requireAuth(handler: RouteHandler): RouteHandler {
  return withAuth(handler, { required: true });
}

/**
 * Middleware to require admin role
 * Shorthand for withAuth(handler, { required: true, roles: ['ADMIN'] })
 */
export function requireAdmin(handler: RouteHandler): RouteHandler {
  return withAuth(handler, { required: true, roles: [UserRole.ADMIN] });
}

/**
 * Middleware to require vendor role
 * Shorthand for withAuth(handler, { required: true, roles: ['VENDOR', 'ADMIN'] })
 */
export function requireVendor(handler: RouteHandler): RouteHandler {
  return withAuth(handler, {
    required: true,
    roles: [UserRole.VENDOR, UserRole.ADMIN],
  });
}

/**
 * Middleware to require customer role
 * Allows both customers and admins
 */
export function requireCustomer(handler: RouteHandler): RouteHandler {
  return withAuth(handler, {
    required: true,
    roles: [UserRole.CUSTOMER, UserRole.ADMIN],
  });
}

/**
 * Helper to check if user has specific role
 */
export function hasRole(user: AuthUser | undefined, ...roles: UserRole[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

/**
 * Helper to check if user is admin
 */
export function isAdmin(user: AuthUser | undefined): boolean {
  return hasRole(user, UserRole.ADMIN);
}

/**
 * Helper to check if user is vendor
 */
export function isVendor(user: AuthUser | undefined): boolean {
  return hasRole(user, UserRole.VENDOR);
}

/**
 * Helper to check if user is customer
 */
export function isCustomer(user: AuthUser | undefined): boolean {
  return hasRole(user, UserRole.CUSTOMER);
}

/**
 * Helper to get user ID or throw error
 */
export function getUserId(req: AuthenticatedRequest): string {
  if (!req.user?.id) {
    throw new Error("User not authenticated");
  }
  return req.user.id;
}

/**
 * Helper to get user or throw error
 */
export function getUser(req: AuthenticatedRequest): AuthUser {
  if (!req.user) {
    throw new Error("User not authenticated");
  }
  return req.user;
}
