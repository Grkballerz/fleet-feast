import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Middleware for authentication and route protection
 * Runs on every request before the route handler
 */
export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/search", "/vendors", "/about", "/contact"];
  const authRoutes = ["/login", "/register", "/auth/error"];

  // Allow public routes
  if (
    publicRoutes.includes(pathname) ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static")
  ) {
    return NextResponse.next();
  }

  // Redirect to login if trying to access auth routes while logged in
  if (authRoutes.includes(pathname) && token) {
    const role = token.role as string;
    if (role === "VENDOR") {
      return NextResponse.redirect(new URL("/vendor/dashboard", request.url));
    } else if (role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/customer/dashboard", request.url));
  }

  // Require authentication for protected routes
  if (!token) {
    if (!authRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Role-based access control
  if (token) {
    const role = token.role as string;

    // Admin routes
    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    // Vendor routes
    if (pathname.startsWith("/vendor") && role !== "VENDOR") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    // Customer routes
    if (pathname.startsWith("/customer") && role !== "CUSTOMER") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return NextResponse.next();
}

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
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
