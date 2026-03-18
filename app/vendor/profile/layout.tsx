import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function VendorProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout title="Profile">
      {children}
    </DashboardLayout>
  );
}
