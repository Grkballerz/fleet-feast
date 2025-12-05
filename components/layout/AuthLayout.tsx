"use client";

import React from "react";
import Link from "next/link";

export interface AuthLayoutProps {
  /**
   * Page content (login/register form)
   */
  children: React.ReactNode;
  /**
   * Page title
   */
  title?: string;
  /**
   * Subtitle or description
   */
  subtitle?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * AuthLayout Component
 *
 * Clean, centered layout for authentication pages (login, register, forgot password).
 * Minimal design with logo and centered form.
 *
 * @example
 * ```tsx
 * <AuthLayout title="Welcome Back" subtitle="Sign in to your account">
 *   <LoginForm />
 * </AuthLayout>
 * ```
 */
export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  className,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header with Logo */}
      <header className="py-6">
        <div className="max-w-md mx-auto px-4 sm:px-6">
          <Link href="/" className="flex items-center justify-center gap-2">
            <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center">
              <svg
                className="h-8 w-8 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-text-primary">
              Fleet<span className="text-primary">Feast</span>
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className={`w-full max-w-md ${className}`}>
          {/* Title & Subtitle */}
          {(title || subtitle) && (
            <div className="text-center mb-8">
              {title && (
                <h1 className="text-3xl font-bold text-text-primary mb-2">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-text-secondary">{subtitle}</p>
              )}
            </div>
          )}

          {/* Auth Form */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-border">
            {children}
          </div>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-text-secondary">
              By continuing, you agree to our{" "}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="py-6">
        <div className="max-w-md mx-auto px-4 sm:px-6">
          <p className="text-center text-sm text-text-secondary">
            © {new Date().getFullYear()} FleetFeast. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
