import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function VendorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout title="Vendor Dashboard">
      {children}
    </DashboardLayout>
  );
}
