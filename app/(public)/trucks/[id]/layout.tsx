import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";

export interface TruckProfileLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout for Truck Profile Pages
 *
 * Uses MainLayout with header and footer.
 * Provides consistent page structure for all truck profile pages.
 */
export default function TruckProfileLayout({ children }: TruckProfileLayoutProps) {
  return <MainLayout>{children}</MainLayout>;
}
