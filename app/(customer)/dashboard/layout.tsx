import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
