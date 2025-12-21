"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";

interface UserDetail {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  lastLogin?: string;
  bookings: Array<{
    id: string;
    vendorName: string;
    eventDate: string;
    amount: number;
    status: string;
  }>;
  violations: Array<{
    id: string;
    type: string;
    severity: string;
    description: string;
    status: string;
    createdAt: string;
  }>;
  stats: {
    totalBookings: number;
    totalSpent: number;
    averageRating?: number;
    violationsCount: number;
  };
}

/**
 * User Detail Page
 * View and manage individual user accounts
 */
export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadUser();
  }, [userId]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/users/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error("Failed to load user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!reason.trim()) {
      alert("Please provide a reason for suspension");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "SUSPENDED",
          reason,
        }),
      });

      if (res.ok) {
        setShowSuspendModal(false);
        loadUser();
      }
    } catch (error) {
      console.error("Failed to suspend user:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleActivate = async () => {
    try {
      setSubmitting(true);
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "ACTIVE",
          reason: reason || "Account reactivated by admin",
        }),
      });

      if (res.ok) {
        setShowActivateModal(false);
        loadUser();
      }
    } catch (error) {
      console.error("Failed to activate user:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <AdminLayout title="User Details">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-text-secondary">Loading user...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!user) {
    return (
      <AdminLayout title="User Details">
        <Card>
          <div className="text-center py-12">
            <p className="text-lg font-medium text-text-primary">
              User not found
            </p>
            <Button
              variant="primary"
              className="mt-4"
              onClick={() => router.push("/admin/users")}
            >
              Back to Users
            </Button>
          </div>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={user.name}>
      <div className="space-y-6">
        {/* User Profile */}
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-text-primary">
                  {user.name}
                </h2>
                <Badge
                  variant={
                    user.role === "ADMIN"
                      ? "error"
                      : user.role === "VENDOR"
                      ? "warning"
                      : "neutral"
                  }
                >
                  {user.role}
                </Badge>
                <Badge
                  variant={user.status === "ACTIVE" ? "success" : "error"}
                >
                  {user.status}
                </Badge>
              </div>
              <p className="text-sm text-text-secondary">{user.email}</p>
              <p className="text-sm text-text-secondary mt-1">
                Joined {formatDate(user.createdAt)}
              </p>
              {user.lastLogin && (
                <p className="text-sm text-text-secondary">
                  Last login: {formatDate(user.lastLogin)}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              {user.status === "ACTIVE" ? (
                <Button
                  variant="destructive"
                  onClick={() => setShowSuspendModal(true)}
                >
                  Suspend Account
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={() => setShowActivateModal(true)}
                >
                  Activate Account
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-secondary">
                Total Bookings
              </p>
              <p className="text-3xl font-bold text-text-primary">
                {user.stats.totalBookings}
              </p>
            </div>
          </Card>
          <Card>
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-secondary">
                Total Spent
              </p>
              <p className="text-3xl font-bold text-text-primary">
                {formatCurrency(user.stats.totalSpent)}
              </p>
            </div>
          </Card>
          {user.stats.averageRating !== undefined && (
            <Card>
              <div className="space-y-2">
                <p className="text-sm font-medium text-text-secondary">
                  Average Rating
                </p>
                <p className="text-3xl font-bold text-text-primary">
                  {user.stats.averageRating.toFixed(1)}
                </p>
              </div>
            </Card>
          )}
          <Card>
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-secondary">
                Violations
              </p>
              <p
                className={`text-3xl font-bold ${
                  user.stats.violationsCount > 0 ? "text-error" : "text-success"
                }`}
              >
                {user.stats.violationsCount}
              </p>
            </div>
          </Card>
        </div>

        {/* Recent Bookings */}
        <Card
          header={
            <h2 className="text-lg font-semibold text-text-primary">
              Recent Bookings ({user.bookings.length})
            </h2>
          }
        >
          {user.bookings.length === 0 ? (
            <p className="text-center text-text-secondary py-8">
              No bookings yet
            </p>
          ) : (
            <div className="space-y-3">
              {user.bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {booking.vendorName}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      Event: {formatDate(booking.eventDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-sm font-semibold text-primary">
                      {formatCurrency(booking.amount)}
                    </p>
                    <Badge
                      variant={
                        booking.status === "COMPLETED"
                          ? "success"
                          : booking.status === "PENDING"
                          ? "warning"
                          : "neutral"
                      }
                    >
                      {booking.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Violations */}
        {user.violations.length > 0 && (
          <Card
            header={
              <h2 className="text-lg font-semibold text-text-primary">
                Violations ({user.violations.length})
              </h2>
            }
          >
            <div className="space-y-3">
              {user.violations.map((violation) => (
                <div
                  key={violation.id}
                  className="p-4 border border-border rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-medium text-text-primary">
                        {violation.type.replace("_", " ")}
                      </p>
                      <Badge
                        variant={
                          violation.severity === "HIGH" ||
                          violation.severity === "CRITICAL"
                            ? "error"
                            : "warning"
                        }
                      >
                        {violation.severity}
                      </Badge>
                      <Badge variant="neutral">{violation.status}</Badge>
                    </div>
                    <p className="text-xs text-text-secondary">
                      {formatDate(violation.createdAt)}
                    </p>
                  </div>
                  <p className="text-sm text-text-secondary">
                    {violation.description}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Suspend Modal */}
      <Modal
        open={showSuspendModal}
        onClose={() => setShowSuspendModal(false)}
        title="Suspend User Account"
      >
        <div className="space-y-4">
          <div className="p-4 bg-error/10 border border-error rounded-lg">
            <p className="text-sm text-error font-medium">Warning</p>
            <p className="text-sm text-text-secondary mt-1">
              This will prevent {user.name} from accessing their account and
              using the platform.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Reason for Suspension <span className="text-error">*</span>
            </label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this account is being suspended..."
              rows={4}
              required
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowSuspendModal(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSuspend}
              loading={submitting}
            >
              Suspend Account
            </Button>
          </div>
        </div>
      </Modal>

      {/* Activate Modal */}
      <Modal
        open={showActivateModal}
        onClose={() => setShowActivateModal(false)}
        title="Activate User Account"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            This will restore {user.name}'s access to the platform.
          </p>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Notes (Optional)
            </label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Add any notes about this reactivation..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowActivateModal(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleActivate}
              loading={submitting}
            >
              Activate Account
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
