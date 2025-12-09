"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Star,
  Users,
  BarChart,
} from "lucide-react";
import {
  format,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
  parseISO,
} from "date-fns";

interface MonthlyRevenue {
  month: string;
  revenue: number;
  bookings: number;
}

interface MenuItem {
  name: string;
  orders: number;
}

export default function VendorAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [popularItems, setPopularItems] = useState<MenuItem[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    averageRating: 0,
    completionRate: 0,
    repeatCustomers: 0,
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch bookings
      const bookingsRes = await fetch("/api/bookings");
      if (!bookingsRes.ok) throw new Error("Failed to fetch bookings");
      const bookingsData = await bookingsRes.json();
      // Ensure bookings is always an array
      const bookings = Array.isArray(bookingsData.data) ? bookingsData.data : [];

      // Calculate monthly revenue (last 6 months)
      const months = eachMonthOfInterval({
        start: subMonths(new Date(), 5),
        end: new Date(),
      });

      const revenueByMonth = months.map((month) => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);

        const monthBookings = bookings.filter((b: any) => {
          const bookingDate = parseISO(b.createdAt);
          return (
            bookingDate >= monthStart &&
            bookingDate <= monthEnd &&
            (b.status === "ACCEPTED" || b.status === "COMPLETED")
          );
        });

        return {
          month: format(month, "MMM yyyy"),
          revenue: monthBookings.reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0),
          bookings: monthBookings.length,
        };
      });

      setMonthlyRevenue(revenueByMonth);

      // Calculate stats
      const completedBookings = bookings.filter(
        (b: any) => b.status === "COMPLETED" || b.status === "ACCEPTED"
      );
      const totalRevenue = completedBookings.reduce(
        (sum: number, b: any) => sum + (b.totalAmount || 0),
        0
      );

      const customerIds = bookings.map((b: any) => b.customer?.id).filter(Boolean);
      const uniqueCustomers = new Set(customerIds);
      const repeatCustomers = customerIds.length - uniqueCustomers.size;

      const completionRate = bookings.length > 0
        ? (completedBookings.length / bookings.length) * 100
        : 0;

      // Fetch vendor profile for rating
      const profileRes = await fetch("/api/vendor/profile");
      const profileData = profileRes.ok ? await profileRes.json() : null;
      const averageRating = profileData?.data?.averageRating || 0;

      setStats({
        totalRevenue,
        totalBookings: bookings.length,
        averageRating,
        completionRate,
        repeatCustomers,
      });

      // Mock popular menu items (in production, this would come from order data)
      setPopularItems([
        { name: "Tacos", orders: 45 },
        { name: "Burgers", orders: 38 },
        { name: "Pizza", orders: 32 },
        { name: "BBQ Platter", orders: 28 },
        { name: "Veggie Bowl", orders: 21 },
      ]);
    } catch (err: any) {
      setError(err.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const renderRevenueChart = () => {
    if (monthlyRevenue.length === 0) return null;

    const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue), 1);

    return (
      <div className="space-y-3">
        {monthlyRevenue.map((month) => (
          <div key={month.month}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-text-secondary">
                {month.month}
              </span>
              <span className="text-sm font-semibold text-text-primary">
                ${(month.revenue / 100).toFixed(2)}
              </span>
            </div>
            <div className="relative h-8 bg-background rounded-lg overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-primary rounded-lg transition-all"
                style={{ width: `${(month.revenue / maxRevenue) * 100}%` }}
              />
              <div className="absolute inset-0 flex items-center px-3">
                <span className="text-xs font-medium text-text-primary">
                  {month.bookings} booking{month.bookings !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderPopularItems = () => {
    if (popularItems.length === 0) return null;

    const maxOrders = Math.max(...popularItems.map((i) => i.orders), 1);

    return (
      <div className="space-y-3">
        {popularItems.map((item, index) => (
          <div key={item.name}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-text-tertiary">
                  #{index + 1}
                </span>
                <span className="text-sm font-medium text-text-primary">
                  {item.name}
                </span>
              </div>
              <span className="text-sm font-semibold text-text-secondary">
                {item.orders} orders
              </span>
            </div>
            <div className="h-2 bg-background rounded-full overflow-hidden">
              <div
                className="h-full bg-success rounded-full transition-all"
                style={{ width: `${(item.orders / maxOrders) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" title="Error">
        {error}
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary neo-heading">Analytics</h2>
        <p className="text-text-secondary mt-1">
          Track your performance and business insights
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="neo-card-glass neo-shadow rounded-neo p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-secondary">Total Revenue</p>
              <p className="text-2xl font-bold text-text-primary mt-2">
                ${(stats.totalRevenue / 100).toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-success/10 rounded-neo">
              <DollarSign className="w-5 h-5 text-success" />
            </div>
          </div>
        </div>

        <div className="neo-card-glass neo-shadow rounded-neo p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-secondary">Total Bookings</p>
              <p className="text-2xl font-bold text-text-primary mt-2">
                {stats.totalBookings}
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-neo">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
          </div>
        </div>

        <div className="neo-card-glass neo-shadow rounded-neo p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-secondary">Average Rating</p>
              <p className="text-2xl font-bold text-text-primary mt-2">
                {stats.averageRating.toFixed(1)}
              </p>
            </div>
            <div className="p-3 bg-warning/10 rounded-neo">
              <Star className="w-5 h-5 text-warning" />
            </div>
          </div>
        </div>

        <div className="neo-card-glass neo-shadow rounded-neo p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-secondary">Completion Rate</p>
              <p className="text-2xl font-bold text-text-primary mt-2">
                {stats.completionRate.toFixed(0)}%
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-neo">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="neo-card-glass neo-shadow rounded-neo p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-text-primary neo-heading">
              Revenue Trend
            </h3>
            <Badge variant="neutral">Last 6 Months</Badge>
          </div>
          {monthlyRevenue.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              <BarChart className="w-12 h-12 mx-auto mb-3 text-text-tertiary" />
              <p>No revenue data yet</p>
            </div>
          ) : (
            renderRevenueChart()
          )}
        </div>

        {/* Popular Menu Items */}
        <div className="neo-card-glass neo-shadow rounded-neo p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-text-primary neo-heading">
              Popular Menu Items
            </h3>
            <Badge variant="neutral">Top 5</Badge>
          </div>
          {popularItems.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              <Star className="w-12 h-12 mx-auto mb-3 text-text-tertiary" />
              <p>No order data yet</p>
            </div>
          ) : (
            renderPopularItems()
          )}
        </div>
      </div>

      {/* Additional Insights */}
      <div className="neo-card-glass neo-shadow rounded-neo p-6">
        <h3 className="text-lg font-semibold text-text-primary neo-heading mb-4">
          Business Insights
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-background rounded-neo neo-border">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-primary" />
              <span className="font-medium text-text-primary">
                Repeat Customers
              </span>
            </div>
            <p className="text-2xl font-bold text-text-primary">
              {stats.repeatCustomers}
            </p>
            <p className="text-sm text-text-secondary mt-1">
              Customers who booked multiple times
            </p>
          </div>

          <div className="p-4 bg-background rounded-neo neo-border">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-success" />
              <span className="font-medium text-text-primary">
                Average Booking Value
              </span>
            </div>
            <p className="text-2xl font-bold text-text-primary">
              ${stats.totalBookings > 0
                ? ((stats.totalRevenue / stats.totalBookings) / 100).toFixed(2)
                : "0.00"}
            </p>
            <p className="text-sm text-text-secondary mt-1">
              Per booking revenue
            </p>
          </div>

          <div className="p-4 bg-background rounded-neo neo-border">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="font-medium text-text-primary">
                Customer Satisfaction
              </span>
            </div>
            <p className="text-2xl font-bold text-text-primary">
              {stats.averageRating > 4.5 ? "Excellent" : stats.averageRating > 4.0 ? "Good" : "Fair"}
            </p>
            <p className="text-sm text-text-secondary mt-1">
              Based on {stats.averageRating.toFixed(1)} star rating
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
