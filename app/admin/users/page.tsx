"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  lastLogin?: string;
  bookingsCount?: number;
  violationsCount?: number;
}

/**
 * User Management Page
 * Search and manage platform users
 */
export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "CUSTOMER" | "VENDOR">(
    "ALL"
  );
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "SUSPENDED">(
    "ALL"
  );

  useEffect(() => {
    loadUsers();
  }, [roleFilter, statusFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (roleFilter !== "ALL") {
        params.append("role", roleFilter);
      }
      if (statusFilter !== "ALL") {
        params.append("status", statusFilter);
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  const getRoleBadge = (role: string) => {
    switch (role.toUpperCase()) {
      case "ADMIN":
        return <Badge variant="error">Admin</Badge>;
      case "VENDOR":
        return <Badge variant="warning">Vendor</Badge>;
      case "CUSTOMER":
        return <Badge variant="neutral">Customer</Badge>;
      default:
        return <Badge variant="neutral">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "ACTIVE":
        return <Badge variant="success">Active</Badge>;
      case "SUSPENDED":
        return <Badge variant="error">Suspended</Badge>;
      case "PENDING":
        return <Badge variant="warning">Pending</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatRelativeTime = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return formatDate(dateStr);
  };

  const filteredUsers = users.filter((user) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.id.toLowerCase().includes(query)
    );
  });

  return (
    <AdminLayout title="User Management">
      <div className="space-y-6">
        {/* Search and Filters */}
        <Card>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Search
                </label>
                <Input
                  type="text"
                  placeholder="Name, email, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Role
                </label>
                <select
                  value={roleFilter}
                  onChange={(e) =>
                    setRoleFilter(e.target.value as typeof roleFilter)
                  }
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="ALL">All Roles</option>
                  <option value="CUSTOMER">Customers</option>
                  <option value="VENDOR">Vendors</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as typeof statusFilter)
                  }
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" variant="primary">
                Search
              </Button>
            </div>
          </form>
        </Card>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-secondary">
                Total Users
              </p>
              <p className="text-3xl font-bold text-text-primary">
                {users.length}
              </p>
            </div>
          </Card>
          <Card>
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-secondary">
                Customers
              </p>
              <p className="text-3xl font-bold text-text-primary">
                {users.filter((u) => u.role === "CUSTOMER").length}
              </p>
            </div>
          </Card>
          <Card>
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-secondary">Vendors</p>
              <p className="text-3xl font-bold text-text-primary">
                {users.filter((u) => u.role === "VENDOR").length}
              </p>
            </div>
          </Card>
          <Card>
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-secondary">
                Suspended
              </p>
              <p className="text-3xl font-bold text-error">
                {users.filter((u) => u.status === "SUSPENDED").length}
              </p>
            </div>
          </Card>
        </div>

        {/* Users List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              <p className="mt-4 text-text-secondary">Loading users...</p>
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-text-secondary"
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
              <p className="mt-4 text-lg font-medium text-text-primary">
                No users found
              </p>
              <p className="mt-2 text-sm text-text-secondary">
                Try adjusting your search or filters
              </p>
            </div>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                      User
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                      Role
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                      Joined
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                      Last Login
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-text-secondary">
                      Activity
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-text-secondary">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-border last:border-0 hover:bg-secondary transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm font-medium text-text-primary">
                            {user.name}
                          </p>
                          <p className="text-xs text-text-secondary">
                            {user.email}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">{getRoleBadge(user.role)}</td>
                      <td className="py-3 px-4">{getStatusBadge(user.status)}</td>
                      <td className="py-3 px-4 text-sm text-text-secondary">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-sm text-text-secondary">
                        {user.lastLogin
                          ? formatRelativeTime(user.lastLogin)
                          : "Never"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-4 text-xs">
                          {user.bookingsCount !== undefined && (
                            <span className="text-text-secondary">
                              {user.bookingsCount} bookings
                            </span>
                          )}
                          {user.violationsCount !== undefined &&
                            user.violationsCount > 0 && (
                              <Badge variant="error" size="sm">
                                {user.violationsCount} violations
                              </Badge>
                            )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link href={`/admin/users/${user.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
