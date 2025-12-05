import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function VendorApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout title="Vendor Application" showBreadcrumbs={false}>
      {children}
    </DashboardLayout>
  );
}
