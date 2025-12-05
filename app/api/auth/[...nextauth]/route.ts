import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

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

// Create NextAuth handler object (v5 returns object with GET/POST methods)
const authHandler = NextAuth(authOptions);

// Extract GET and POST from the handler object
const GET = authHandler.handlers?.GET ?? authHandler.GET;
const POST = authHandler.handlers?.POST ?? authHandler.POST;

export { GET, POST };
