"use client";

import React from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

export interface MainLayoutProps {
  /**
   * Page content
   */
  children: React.ReactNode;
  /**
   * Show footer (default: true)
   */
  showFooter?: boolean;
  /**
   * Additional CSS classes for main content
   */
  className?: string;
}

/**
 * MainLayout Component
 *
 * Default layout for public pages.
 * Includes header, main content area, and footer.
 *
 * @example
 * ```tsx
 * <MainLayout>
 *   <h1>Welcome to FleetFeast</h1>
 * </MainLayout>
 * ```
 */
export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  showFooter = true,
  className,
}) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Skip Navigation Link - WCAG 2.4.1 */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Skip to main content
      </a>

      {/* Header */}
      <Header />

      {/* Main Content */}
      <main id="main-content" tabIndex={-1} className={`flex-1 ${className}`}>
        {children}
      </main>

      {/* Footer */}
      {showFooter && <Footer />}
    </div>
  );
};
