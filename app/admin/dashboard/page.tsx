"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

interface AdminStats {
  gmv: number;
  revenue: number;
  activeUsers: number;
  activeVendors: number;
  pendingApplications: number;
  openDisputes: number;
  pendingViolations: number;
}

interface ActivityItem {
  id: string;
  type: "vendor_application" | "dispute" | "violation" | "booking";
  description: string;
  timestamp: Date;
  actionUrl?: string;
}

/**
 * Admin Dashboard Overview Page
 * Shows key metrics, pending actions, and recent activity
 */
export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch admin stats
      const statsRes = await fetch("/api/admin/stats");
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data);
      }

      // Fetch recent activity
      const activityRes = await fetch("/api/admin/activity?limit=10");
      if (activityRes.ok) {
        const activityData = await activityRes.json();
        setRecentActivity(activityData.data || []);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
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

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-text-secondary">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard" showBreadcrumbs={false}>
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* GMV */}
          <div className="neo-card-glass neo-shadow p-6 rounded-neo">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-text-secondary">GMV</p>
                <svg
                  className="w-5 h-5 text-success"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <p className="text-3xl font-bold text-text-primary neo-heading">
                {stats ? formatCurrency(stats.gmv) : "-"}
              </p>
              <p className="text-xs text-text-secondary">Gross Merchandise Value</p>
            </div>
          </div>

          {/* Revenue */}
          <div className="neo-card-glass neo-shadow p-6 rounded-neo">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-text-secondary">Revenue</p>
                <svg
                  className="w-5 h-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-3xl font-bold text-text-primary neo-heading">
                {stats ? formatCurrency(stats.revenue) : "-"}
              </p>
              <p className="text-xs text-text-secondary">Platform Commission</p>
            </div>
          </div>

          {/* Active Users */}
          <div className="neo-card-glass neo-shadow p-6 rounded-neo">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-text-secondary">Users</p>
                <svg
                  className="w-5 h-5 text-info"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <p className="text-3xl font-bold text-text-primary neo-heading">
                {stats ? formatNumber(stats.activeUsers) : "-"}
              </p>
              <p className="text-xs text-text-secondary">Active Users</p>
            </div>
          </div>

          {/* Active Vendors */}
          <div className="neo-card-glass neo-shadow p-6 rounded-neo">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-text-secondary">Vendors</p>
                <svg
                  className="w-5 h-5 text-warning"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <p className="text-3xl font-bold text-text-primary neo-heading">
                {stats ? formatNumber(stats.activeVendors) : "-"}
              </p>
              <p className="text-xs text-text-secondary">Active Vendors</p>
            </div>
          </div>
        </div>

        {/* Pending Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Pending Applications */}
          <Link href="/admin/vendors">
            <div className="neo-card-glass neo-shadow neo-shadow-hover hover:neo-shadow-lg transition-all cursor-pointer h-full p-6 rounded-neo">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-secondary">
                    Pending Applications
                  </p>
                  <p className="text-4xl font-bold text-primary mt-2 neo-heading">
                    {stats?.pendingApplications || 0}
                  </p>
                </div>
                <Badge variant="warning" size="lg">
                  Action Required
                </Badge>
              </div>
            </div>
          </Link>

          {/* Open Disputes */}
          <Link href="/admin/disputes">
            <div className="neo-card-glass neo-shadow neo-shadow-hover hover:neo-shadow-lg transition-all cursor-pointer h-full p-6 rounded-neo">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-secondary">
                    Open Disputes
                  </p>
                  <p className="text-4xl font-bold text-error mt-2 neo-heading">
                    {stats?.openDisputes || 0}
                  </p>
                </div>
                {(stats?.openDisputes || 0) > 0 && (
                  <Badge variant="error" size="lg">
                    Urgent
                  </Badge>
                )}
              </div>
            </div>
          </Link>

          {/* Pending Violations */}
          <Link href="/admin/violations">
            <div className="neo-card-glass neo-shadow neo-shadow-hover hover:neo-shadow-lg transition-all cursor-pointer h-full p-6 rounded-neo">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-secondary">
                    Pending Violations
                  </p>
                  <p className="text-4xl font-bold text-warning mt-2 neo-heading">
                    {stats?.pendingViolations || 0}
                  </p>
                </div>
                {(stats?.pendingViolations || 0) > 0 && (
                  <Badge variant="warning" size="lg">
                    Review
                  </Badge>
                )}
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="neo-card-glass neo-shadow p-6 rounded-neo">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-text-primary neo-heading">
              Recent Activity
            </h2>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </div>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <p className="text-center text-text-secondary py-8">
                No recent activity
              </p>
            ) : (
              recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start justify-between py-3 neo-border-thin border-t first:border-0"
                >
                  <div className="flex-1">
                    <p className="text-sm text-text-primary">
                      {activity.description}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      {formatRelativeTime(activity.timestamp)}
                    </p>
                  </div>
                  {activity.actionUrl && (
                    <Link href={activity.actionUrl}>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/admin/vendors">
            <button className="neo-btn-secondary w-full px-6 py-3">
              Review Applications
            </button>
          </Link>
          <Link href="/admin/disputes">
            <button className="neo-btn-secondary w-full px-6 py-3">
              Manage Disputes
            </button>
          </Link>
          <Link href="/admin/analytics">
            <button className="neo-btn-secondary w-full px-6 py-3">
              View Analytics
            </button>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
