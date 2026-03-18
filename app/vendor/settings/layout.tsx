import { DashboardLayout } from "@/components/layout/DashboardLayout";

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
    <DashboardLayout title="Settings">
      {children}
    </DashboardLayout>
  );
}
