import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function VendorCalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout title="Calendar">
      {children}
    </DashboardLayout>
  );
}
