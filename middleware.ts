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
  const publicRoutes = ["/", "/search", "/vendors", "/about", "/contact", "/vendor/apply"];
  const authRoutes = ["/login", "/register", "/auth/error"];

  // Allow public routes
  if (
    publicRoutes.includes(pathname) ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/trucks") ||
    pathname.startsWith("/trucks") ||
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

  // Require authentication for protected routes
  if (!session) {
    if (!authRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
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
