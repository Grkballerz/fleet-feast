import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Middleware for authentication and route protection
 * Uses NextAuth v5 auth() function for proper session handling
 */
export default auth((request) => {
  const session = request.auth;
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/", "/search", "/about", "/contact", "/vendor/apply",
    "/blog", "/cookies", "/faq", "/for-vendors", "/help",
    "/how-it-works", "/privacy", "/refunds", "/safety", "/terms",
    "/unauthorized",
  ];
  const authRoutes = ["/login", "/register", "/auth/error", "/forgot-password", "/reset-password", "/verify-email"];

  // Allow public routes
  if (
    publicRoutes.includes(pathname) ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/trucks") ||
    pathname.startsWith("/api/test-db") ||
    pathname.startsWith("/api/health") ||
    pathname.startsWith("/trucks") ||
    pathname.startsWith("/blog/") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/vendor/apply")
  ) {
    return NextResponse.next();
  }

  // Redirect to dashboard if trying to access auth routes while logged in
  if (authRoutes.includes(pathname) && session) {
    const role = session.user?.role as string;
    if (role === "VENDOR") {
      return NextResponse.redirect(new URL("/vendor/dashboard", request.url));
    } else if (role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/customer/dashboard", request.url));
  }

  // Only require authentication for known protected route prefixes
  const protectedPrefixes = ["/admin", "/vendor", "/customer", "/api/admin", "/api/vendor", "/api/bookings", "/api/messages", "/api/payments", "/api/reviews", "/api/disputes", "/api/notifications"];
  const isProtectedRoute = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  // Allow /vendor/apply as public even though it starts with /vendor
  if (isProtectedRoute && pathname.startsWith("/vendor/apply")) {
    return NextResponse.next();
  }

  if (!session && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Let unknown paths through to Next.js (will show 404 if no page exists)
  if (!session && !isProtectedRoute) {
    return NextResponse.next();
  }

  // Role-based access control
  if (session) {
    const role = session.user?.role as string;

    // Admin routes
    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    // Vendor routes (except /vendor/apply which is public)
    if (pathname.startsWith("/vendor") && !pathname.startsWith("/vendor/apply") && role !== "VENDOR") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    // Customer routes
    if (pathname.startsWith("/customer") && role !== "CUSTOMER") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return NextResponse.next();
});

/**
 * Configure which routes middleware runs on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (static image assets)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|images|public).*)",
  ],
};
