import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function VendorReviewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout title="Reviews">
      {children}
    </DashboardLayout>
  );
}
