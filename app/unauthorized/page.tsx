/**
 * Unauthorized Access Page
 * Shown when users try to access routes they don't have permission for
 */

"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ShieldAlert, Home, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
  const router = useRouter();
  const { data: session } = useSession();

  // Determine where to send the user back based on their role
  const getDashboardLink = () => {
    const role = session?.user?.role;
    if (role === "ADMIN") return "/admin/dashboard";
    if (role === "VENDOR") return "/vendor/dashboard";
    if (role === "CUSTOMER") return "/customer/dashboard";
    return "/";
  };

  const getDashboardLabel = () => {
    const role = session?.user?.role;
    if (role === "ADMIN") return "Admin Dashboard";
    if (role === "VENDOR") return "Vendor Dashboard";
    if (role === "CUSTOMER") return "Customer Dashboard";
    return "Home";
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Skip Navigation Link - WCAG 2.4.1 */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:border-3 focus:border-black focus:shadow-brutal focus:text-black focus:font-bold"
      >
        Skip to main content
      </a>

      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Animated Gradient Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-500/30 rounded-full blur-3xl animate-float" />
          <div className="absolute top-1/2 -right-40 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl animate-float delay-500" />
          <div className="absolute -bottom-40 left-1/3 w-72 h-72 bg-yellow-500/15 rounded-full blur-3xl animate-float delay-300" />
        </div>
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      {/* Main Content */}
      <main
        id="main-content"
        className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-8"
      >
        <div className="w-full max-w-2xl animate-fade-in-up">
          {/* Error Card */}
          <div className="relative">
            <div className="relative neo-card-glass p-8 sm:p-12 neo-shadow-lg text-center">
              {/* Icon */}
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-neo bg-red-500/20 neo-border-thin border-red-500 mb-6">
                <ShieldAlert className="h-10 w-10 text-red-400" />
              </div>

              {/* Heading */}
              <h1 className="neo-heading text-3xl sm:text-4xl text-white mb-4">
                Access Denied
              </h1>

              {/* Description */}
              <div className="space-y-3 mb-8">
                <p className="text-lg text-white/80">
                  You don't have permission to access this page.
                </p>
                <p className="text-sm text-white/60">
                  This area is restricted to specific user roles. If you believe
                  this is an error, please contact support or check your account
                  permissions.
                </p>
              </div>

              {/* Error Details */}
              <div className="p-4 rounded-neo bg-red-500/10 neo-border-thin border-red-500/50 text-red-300 mb-8">
                <p className="text-sm font-bold mb-1">Error 403: Forbidden</p>
                <p className="text-xs text-red-300/80">
                  Your account role ({session?.user?.role || "unknown"}) does not
                  have access to this resource.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {/* Back Button */}
                <button
                  onClick={() => router.back()}
                  className="neo-btn-secondary px-6 py-3.5 flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Go Back</span>
                </button>

                {/* Dashboard/Home Button */}
                <Link href={getDashboardLink()}>
                  <button className="neo-btn-primary w-full px-6 py-3.5 flex items-center justify-center gap-2">
                    <Home className="w-5 h-5" />
                    <span>{getDashboardLabel()}</span>
                  </button>
                </Link>
              </div>

              {/* Help Text */}
              <div className="mt-8 pt-6 border-t border-white/20">
                <p className="text-sm text-white/50">
                  Need help?{" "}
                  <Link
                    href="/contact"
                    className="font-bold text-primary hover:text-orange-500 transition-colors"
                  >
                    Contact Support
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="relative z-10 py-6">
        <div className="max-w-md mx-auto px-4 sm:px-6">
          <p
            className="text-center text-sm text-white/30"
            suppressHydrationWarning
          >
            © {new Date().getFullYear()} FleetFeast. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
