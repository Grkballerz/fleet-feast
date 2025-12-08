import { handlers } from "@/lib/auth";

/**
 * NextAuth.js API route handler
 * Handles all authentication endpoints:
 * - /api/auth/signin
 * - /api/auth/signout
 * - /api/auth/session
 * - /api/auth/providers
 * - /api/auth/callback/:provider
 *
 * Note: Rate limiting removed from NextAuth endpoints as it breaks
 * the handler functionality. NextAuth has built-in protection mechanisms.
 */

export const { GET, POST } = handlers;
