"use client";

import React from "react";
import Link from "next/link";
import { TruckIcon, Shield, Star } from "lucide-react";

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
 * Modern, centered layout for authentication pages with animated backgrounds.
 * Features glassmorphism effects and gradient accents.
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
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-float" />
          <div className="absolute top-1/2 -right-40 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl animate-float delay-500" />
          <div className="absolute -bottom-40 left-1/3 w-72 h-72 bg-yellow-500/15 rounded-full blur-3xl animate-float delay-300" />
        </div>
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      {/* Header with Logo */}
      <header className="relative z-10 py-8">
        <div className="max-w-md mx-auto px-4 sm:px-6">
          <Link href="/" className="flex items-center justify-center gap-3 group">
            <div className="relative">
              <div className="h-12 w-12 bg-gradient-to-br from-primary to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-xl group-hover:shadow-primary/40 transition-all duration-300 group-hover:scale-105">
                <TruckIcon className="h-7 w-7 text-white" />
              </div>
              <div className="absolute inset-0 bg-primary/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="text-2xl font-bold">
              <span className="text-white">Fleet</span>
              <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">Feast</span>
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content - WCAG 4.1.2 */}
      <main id="main-content" className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
        <div className={`w-full max-w-md animate-fade-in-up ${className}`}>
          {/* Title & Subtitle */}
          {(title || subtitle) && (
            <div className="text-center mb-8">
              {title && (
                <h1 className="text-3xl font-bold text-white mb-2">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-white/60">{subtitle}</p>
              )}
            </div>
          )}

          {/* Auth Form Card */}
          <div className="relative">
            {/* Card */}
            <div className="relative neo-card-glass p-8 neo-shadow-lg">
              {children}
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-8 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-white/50 text-sm">
              <Shield className="w-4 h-4 text-green-400" />
              <span>Secure</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-white/30" />
            <div className="flex items-center gap-2 text-white/50 text-sm">
              <Star className="w-4 h-4 text-yellow-400" />
              <span>Trusted by 10K+</span>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-white/40">
              By continuing, you agree to our{" "}
              <Link href="/terms" className="text-white/60 hover:text-primary transition-colors">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-white/60 hover:text-primary transition-colors">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="relative z-10 py-6">
        <div className="max-w-md mx-auto px-4 sm:px-6">
          <p className="text-center text-sm text-white/30" suppressHydrationWarning>
            © {new Date().getFullYear()} FleetFeast. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
