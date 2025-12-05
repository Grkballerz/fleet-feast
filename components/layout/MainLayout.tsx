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
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className={`flex-1 ${className}`}>
        {children}
      </main>

      {/* Footer */}
      {showFooter && <Footer />}
    </div>
  );
};
