import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function VendorPayoutsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout title="Payouts">
      {children}
    </DashboardLayout>
  );
}
