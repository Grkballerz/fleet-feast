"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface AnalyticsData {
  gmv: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  users: {
    total: number;
    active: number;
    newThisMonth: number;
    growth: number;
  };
  vendors: {
    total: number;
    active: number;
    newThisMonth: number;
    growth: number;
  };
  bookings: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  topVendors: Array<{
    id: string;
    name: string;
    bookings: number;
    revenue: number;
  }>;
  recentBookings: Array<{
    id: string;
    vendorName: string;
    customerName: string;
    amount: number;
    date: string;
    status: string;
  }>;
}

/**
 * Analytics Dashboard Page
 * Platform-wide analytics and insights
 */
export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "90d">("30d");

  useEffect(() => {
    loadAnalytics();
  }, [timeframe]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/analytics?timeframe=${timeframe}`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const formatPercentage = (num: number) => {
    const sign = num >= 0 ? "+" : "";
    return `${sign}${num.toFixed(1)}%`;
  };

  const getGrowthBadge = (growth: number) => {
    if (growth > 0) {
      return <Badge variant="success">{formatPercentage(growth)}</Badge>;
    } else if (growth < 0) {
      return <Badge variant="error">{formatPercentage(growth)}</Badge>;
    }
    return <Badge variant="neutral">0%</Badge>;
  };

  if (loading) {
    return (
      <AdminLayout title="Analytics">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-text-secondary">Loading analytics...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Platform Analytics">
      <div className="space-y-6">
        {/* Timeframe Selector */}
        <div className="flex items-center gap-4">
          <p className="text-sm text-text-secondary">Timeframe:</p>
          <div className="flex gap-2">
            {["7d", "30d", "90d"].map((period) => (
              <button
                key={period}
                onClick={() => setTimeframe(period as typeof timeframe)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeframe === period
                    ? "bg-primary text-white"
                    : "bg-secondary text-text-secondary hover:bg-border"
                }`}
              >
                {period === "7d" && "Last 7 Days"}
                {period === "30d" && "Last 30 Days"}
                {period === "90d" && "Last 90 Days"}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        {analytics && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* GMV */}
              <Card>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-text-secondary">
                      Gross Merchandise Value
                    </p>
                    {getGrowthBadge(analytics.gmv.growth)}
                  </div>
                  <p className="text-3xl font-bold text-text-primary">
                    {formatCurrency(analytics.gmv.thisMonth)}
                  </p>
                  <p className="text-xs text-text-secondary">
                    Total: {formatCurrency(analytics.gmv.total)}
                  </p>
                </div>
              </Card>

              {/* Revenue */}
              <Card>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-text-secondary">
                      Platform Revenue
                    </p>
                    {getGrowthBadge(analytics.revenue.growth)}
                  </div>
                  <p className="text-3xl font-bold text-text-primary">
                    {formatCurrency(analytics.revenue.thisMonth)}
                  </p>
                  <p className="text-xs text-text-secondary">
                    Total: {formatCurrency(analytics.revenue.total)}
                  </p>
                </div>
              </Card>

              {/* Bookings */}
              <Card>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-text-secondary">
                      Bookings
                    </p>
                    {getGrowthBadge(analytics.bookings.growth)}
                  </div>
                  <p className="text-3xl font-bold text-text-primary">
                    {formatNumber(analytics.bookings.thisMonth)}
                  </p>
                  <p className="text-xs text-text-secondary">
                    Total: {formatNumber(analytics.bookings.total)}
                  </p>
                </div>
              </Card>

              {/* Users */}
              <Card>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-text-secondary">
                      Active Users
                    </p>
                    {getGrowthBadge(analytics.users.growth)}
                  </div>
                  <p className="text-3xl font-bold text-text-primary">
                    {formatNumber(analytics.users.active)}
                  </p>
                  <p className="text-xs text-text-secondary">
                    New this month: {formatNumber(analytics.users.newThisMonth)}
                  </p>
                </div>
              </Card>

              {/* Vendors */}
              <Card>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-text-secondary">
                      Active Vendors
                    </p>
                    {getGrowthBadge(analytics.vendors.growth)}
                  </div>
                  <p className="text-3xl font-bold text-text-primary">
                    {formatNumber(analytics.vendors.active)}
                  </p>
                  <p className="text-xs text-text-secondary">
                    New this month: {formatNumber(analytics.vendors.newThisMonth)}
                  </p>
                </div>
              </Card>

              {/* Conversion Rate */}
              <Card>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-text-secondary">
                      Avg Booking Value
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-text-primary">
                    {analytics.bookings.thisMonth > 0
                      ? formatCurrency(
                          analytics.gmv.thisMonth / analytics.bookings.thisMonth
                        )
                      : "$0"}
                  </p>
                  <p className="text-xs text-text-secondary">
                    Per booking this month
                  </p>
                </div>
              </Card>
            </div>

            {/* Top Performing Vendors */}
            <Card
              header={
                <h2 className="text-lg font-semibold text-text-primary">
                  Top Performing Vendors
                </h2>
              }
            >
              <div className="space-y-4">
                {analytics.topVendors && analytics.topVendors.length > 0 ? (
                  analytics.topVendors.map((vendor, idx) => (
                    <div
                      key={vendor.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-bold">
                          #{idx + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">
                            {vendor.name}
                          </p>
                          <p className="text-xs text-text-secondary">
                            {formatNumber(vendor.bookings)} bookings
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-primary">
                          {formatCurrency(vendor.revenue)}
                        </p>
                        <p className="text-xs text-text-secondary">Revenue</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-text-secondary py-8">
                    No vendor data available
                  </p>
                )}
              </div>
            </Card>

            {/* Recent Bookings */}
            <Card
              header={
                <h2 className="text-lg font-semibold text-text-primary">
                  Recent Bookings
                </h2>
              }
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                        Vendor
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                        Customer
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                        Date
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-text-secondary">
                        Amount
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-text-secondary">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.recentBookings &&
                    analytics.recentBookings.length > 0 ? (
                      analytics.recentBookings.map((booking) => (
                        <tr
                          key={booking.id}
                          className="border-b border-border last:border-0"
                        >
                          <td className="py-3 px-4 text-sm text-text-primary">
                            {booking.vendorName}
                          </td>
                          <td className="py-3 px-4 text-sm text-text-primary">
                            {booking.customerName}
                          </td>
                          <td className="py-3 px-4 text-sm text-text-secondary">
                            {new Date(booking.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="py-3 px-4 text-sm text-right font-medium text-primary">
                            {formatCurrency(booking.amount)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge
                              variant={
                                booking.status === "COMPLETED"
                                  ? "success"
                                  : booking.status === "PENDING"
                                  ? "warning"
                                  : "neutral"
                              }
                              size="sm"
                            >
                              {booking.status}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="text-center py-8 text-text-secondary"
                        >
                          No recent bookings
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
