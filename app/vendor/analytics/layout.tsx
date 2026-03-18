import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function VendorAnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout title="Analytics">
      {children}
    </DashboardLayout>
  );
}
