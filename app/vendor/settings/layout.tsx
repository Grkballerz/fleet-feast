import React from "react";

/**
 * Vendor Settings Layout
 *
 * Provides a consistent layout for all vendor settings pages.
 * Can be extended with navigation tabs or sidebar in the future.
 */
export default function VendorSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
}
