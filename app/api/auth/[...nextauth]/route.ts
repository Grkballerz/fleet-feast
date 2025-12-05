import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimit, RateLimitPresets } from "@/lib/middleware/rate-limit";

/**
 * NextAuth.js API route handler
 * Handles all authentication endpoints:
 * - /api/auth/signin (rate limited)
 * - /api/auth/signout
 * - /api/auth/session
 * - /api/auth/providers
 * - /api/auth/callback/:provider
 */
const handler = NextAuth(authOptions);

// Apply strict rate limiting to prevent brute force attacks
// 5 requests per 15 minutes per IP address
const rateLimitedPOST = rateLimit(handler, RateLimitPresets.strict);

// GET requests (session check) can use relaxed limits
const rateLimitedGET = rateLimit(handler, RateLimitPresets.relaxed);

export { rateLimitedGET as GET, rateLimitedPOST as POST };
