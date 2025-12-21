"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";

interface PayoutListItem {
  id: string;
  vendorId: string;
  amount: number;
  status: string;
  scheduledFor: string;
  processedAt: string | null;
  bookingCount: number;
  createdAt: string;
  vendor?: {
    businessName: string;
  };
}

interface PayoutDetails {
  id: string;
  vendorId: string;
  amount: number;
  status: string;
  payoutMethod: string | null;
  scheduledFor: string;
  processedAt: string | null;
  externalReference: string | null;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
  bookings: Array<{
    id: string;
    bookingId: string;
    amount: number;
    booking: {
      eventDate: string;
      eventType: string;
      customerEmail: string;
    };
  }>;
  vendor?: {
    businessName: string;
    bankAccountHolder: string | null;
    bankAccountNumber: string | null;
    bankRoutingNumber: string | null;
    bankAccountType: string | null;
    bankVerified: boolean;
  };
}

interface PayoutStatistics {
  totalPayouts: number;
  pendingPayouts: number;
  processingPayouts: number;
  completedPayouts: number;
  failedPayouts: number;
  totalPaidOut: number;
  avgPayoutAmount: number;
}

/**
 * Admin Payout Management Dashboard
 * Manage vendor payouts with filtering and actions
 */
export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<PayoutListItem[]>([]);
  const [statistics, setStatistics] = useState<PayoutStatistics | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [vendorSearch, setVendorSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedPayout, setSelectedPayout] = useState<PayoutDetails | null>(
    null
  );
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [holdReason, setHoldReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPayouts();
  }, [statusFilter]);

  const loadPayouts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("includeStats", "true");
      params.append("limit", "100");

      if (statusFilter !== "all") {
        params.append("status", statusFilter.toUpperCase());
      }

      const res = await fetch(`/api/admin/payouts?${params.toString()}`);
      if (res.ok) {
        const result = await res.json();
        setPayouts(result.data || []);
        if (result.statistics) {
          setStatistics(result.statistics);
        }
      }
    } catch (error) {
      console.error("Failed to load payouts:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPayoutDetails = async (payoutId: string) => {
    try {
      const res = await fetch(`/api/admin/payouts/${payoutId}`);
      if (res.ok) {
        const result = await res.json();
        setSelectedPayout(result.data);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error("Failed to load payout details:", error);
    }
  };

  const handleHoldPayout = async () => {
    if (!selectedPayout || !holdReason.trim()) {
      alert("Please provide a reason for holding the payout");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/admin/payouts/${selectedPayout.id}/hold`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: holdReason }),
      });

      if (res.ok) {
        setShowHoldModal(false);
        setShowDetailModal(false);
        setHoldReason("");
        loadPayouts();
      }
    } catch (error) {
      console.error("Failed to hold payout:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReleasePayout = async (payoutId: string) => {
    if (!confirm("Are you sure you want to release this payout?")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/payouts/${payoutId}/release`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (res.ok) {
        setShowDetailModal(false);
        loadPayouts();
      }
    } catch (error) {
      console.error("Failed to release payout:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return <Badge variant="warning">Pending</Badge>;
      case "PROCESSING":
        return <Badge variant="info">Processing</Badge>;
      case "COMPLETED":
        return <Badge variant="success">Completed</Badge>;
      case "FAILED":
        return <Badge variant="error">Failed</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
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
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatShortDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredPayouts = payouts.filter((payout) => {
    if (vendorSearch && payout.vendor?.businessName) {
      return payout.vendor.businessName
        .toLowerCase()
        .includes(vendorSearch.toLowerCase());
    }
    return true;
  });

  return (
    <AdminLayout title="Payout Management">
      <div className="space-y-6">
        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <div className="space-y-2">
                <p className="text-sm font-medium text-text-secondary">
                  Total Pending
                </p>
                <p className="text-3xl font-bold text-warning">
                  {formatCurrency(
                    statistics.pendingPayouts * statistics.avgPayoutAmount
                  )}
                </p>
                <p className="text-xs text-text-secondary">
                  {statistics.pendingPayouts} payouts
                </p>
              </div>
            </Card>
            <Card>
              <div className="space-y-2">
                <p className="text-sm font-medium text-text-secondary">
                  Processing
                </p>
                <p className="text-3xl font-bold text-info">
                  {formatCurrency(
                    statistics.processingPayouts * statistics.avgPayoutAmount
                  )}
                </p>
                <p className="text-xs text-text-secondary">
                  {statistics.processingPayouts} payouts
                </p>
              </div>
            </Card>
            <Card>
              <div className="space-y-2">
                <p className="text-sm font-medium text-text-secondary">
                  Completed This Month
                </p>
                <p className="text-3xl font-bold text-success">
                  {formatCurrency(statistics.totalPaidOut)}
                </p>
                <p className="text-xs text-text-secondary">
                  {statistics.completedPayouts} payouts
                </p>
              </div>
            </Card>
            <Card>
              <div className="space-y-2">
                <p className="text-sm font-medium text-text-secondary">
                  Failed
                </p>
                <p className="text-3xl font-bold text-error">
                  {statistics.failedPayouts}
                </p>
                <p className="text-xs text-text-secondary">
                  Require attention
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={statusFilter === "all" ? "primary" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
              >
                All Payouts
              </Button>
              <Button
                variant={statusFilter === "pending" ? "primary" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("pending")}
              >
                Pending
              </Button>
              <Button
                variant={statusFilter === "processing" ? "primary" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("processing")}
              >
                Processing
              </Button>
              <Button
                variant={statusFilter === "completed" ? "primary" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("completed")}
              >
                Completed
              </Button>
              <Button
                variant={statusFilter === "failed" ? "primary" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("failed")}
              >
                Failed
              </Button>
            </div>
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search by vendor name..."
                value={vendorSearch}
                onChange={(e) => setVendorSearch(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Payouts Table */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              <p className="mt-4 text-text-secondary">Loading payouts...</p>
            </div>
          </div>
        ) : filteredPayouts.length === 0 ? (
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="mt-4 text-lg font-medium text-text-primary">
                No payouts found
              </p>
            </div>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary">
                      ID
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary">
                      Vendor Name
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary">
                      Scheduled For
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary">
                      Bookings
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-text-secondary">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayouts.map((payout) => (
                    <tr
                      key={payout.id}
                      className="border-b border-border hover:bg-secondary/50 cursor-pointer"
                      onClick={() => loadPayoutDetails(payout.id)}
                    >
                      <td className="py-4 px-4 text-sm text-text-primary font-mono">
                        {payout.id.slice(0, 8)}
                      </td>
                      <td className="py-4 px-4 text-sm text-text-primary">
                        {payout.vendor?.businessName || "Unknown Vendor"}
                      </td>
                      <td className="py-4 px-4 text-sm font-semibold text-text-primary">
                        {formatCurrency(payout.amount)}
                      </td>
                      <td className="py-4 px-4">{getStatusBadge(payout.status)}</td>
                      <td className="py-4 px-4 text-sm text-text-secondary">
                        {formatShortDate(payout.scheduledFor)}
                      </td>
                      <td className="py-4 px-4 text-sm text-text-secondary">
                        {payout.bookingCount}
                      </td>
                      <td
                        className="py-4 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadPayoutDetails(payout.id)}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        open={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedPayout(null);
        }}
        title="Payout Details"
        size="lg"
      >
        {selectedPayout && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-text-primary">
                    {selectedPayout.vendor?.businessName || "Unknown Vendor"}
                  </h3>
                  {getStatusBadge(selectedPayout.status)}
                </div>
                <p className="text-sm text-text-secondary font-mono">
                  ID: {selectedPayout.id}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(selectedPayout.amount)}
                </p>
              </div>
            </div>

            {/* Payout Information */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-secondary rounded-lg">
              <div>
                <p className="text-xs text-text-secondary mb-1">Scheduled For</p>
                <p className="text-sm font-medium text-text-primary">
                  {formatDate(selectedPayout.scheduledFor)}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-secondary mb-1">Payout Method</p>
                <p className="text-sm font-medium text-text-primary">
                  {selectedPayout.payoutMethod || "Not specified"}
                </p>
              </div>
              {selectedPayout.processedAt && (
                <div>
                  <p className="text-xs text-text-secondary mb-1">Processed At</p>
                  <p className="text-sm font-medium text-text-primary">
                    {formatDate(selectedPayout.processedAt)}
                  </p>
                </div>
              )}
              {selectedPayout.externalReference && (
                <div>
                  <p className="text-xs text-text-secondary mb-1">
                    External Reference
                  </p>
                  <p className="text-sm font-medium text-text-primary font-mono">
                    {selectedPayout.externalReference}
                  </p>
                </div>
              )}
            </div>

            {/* Failure Reason */}
            {selectedPayout.failureReason && (
              <div className="p-4 bg-error/10 border border-error rounded-lg">
                <p className="text-sm font-medium text-error mb-1">
                  Failure Reason
                </p>
                <p className="text-sm text-text-primary">
                  {selectedPayout.failureReason}
                </p>
              </div>
            )}

            {/* Bank Information */}
            {selectedPayout.vendor && (
              <div>
                <h4 className="text-sm font-semibold text-text-secondary mb-3">
                  Bank Information
                </h4>
                <div className="grid grid-cols-2 gap-3 p-4 border border-border rounded-lg">
                  <div>
                    <p className="text-xs text-text-secondary mb-1">
                      Account Holder
                    </p>
                    <p className="text-sm text-text-primary">
                      {selectedPayout.vendor.bankAccountHolder || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary mb-1">
                      Account Type
                    </p>
                    <p className="text-sm text-text-primary">
                      {selectedPayout.vendor.bankAccountType || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary mb-1">
                      Account Number
                    </p>
                    <p className="text-sm text-text-primary font-mono">
                      {selectedPayout.vendor.bankAccountNumber
                        ? `****${selectedPayout.vendor.bankAccountNumber.slice(-4)}`
                        : "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary mb-1">
                      Routing Number
                    </p>
                    <p className="text-sm text-text-primary font-mono">
                      {selectedPayout.vendor.bankRoutingNumber || "Not provided"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <Badge
                      variant={
                        selectedPayout.vendor.bankVerified ? "success" : "warning"
                      }
                    >
                      {selectedPayout.vendor.bankVerified
                        ? "Bank Verified"
                        : "Bank Not Verified"}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Included Bookings */}
            <div>
              <h4 className="text-sm font-semibold text-text-secondary mb-3">
                Included Bookings ({selectedPayout.bookings.length})
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedPayout.bookings.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 border border-border rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-text-primary">
                          {item.booking.eventType}
                        </p>
                        <p className="text-xs text-text-secondary mt-1">
                          Event: {formatShortDate(item.booking.eventDate)}
                        </p>
                        <p className="text-xs text-text-secondary">
                          Customer: {item.booking.customerEmail}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-primary">
                        {formatCurrency(item.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t border-border">
              {selectedPayout.status.toUpperCase() === "PENDING" && (
                <Button
                  variant="destructive"
                  onClick={() => setShowHoldModal(true)}
                >
                  Hold Payout
                </Button>
              )}
              {selectedPayout.status.toUpperCase() === "PENDING" && (
                <Button
                  variant="primary"
                  onClick={() => handleReleasePayout(selectedPayout.id)}
                >
                  Release Payout
                </Button>
              )}
              {selectedPayout.status.toUpperCase() === "FAILED" && (
                <Button variant="primary">Retry Payout</Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Hold Payout Modal */}
      <Modal
        open={showHoldModal}
        onClose={() => {
          setShowHoldModal(false);
          setHoldReason("");
        }}
        title="Hold Payout"
      >
        {selectedPayout && (
          <div className="space-y-4">
            <div className="p-4 bg-warning/10 border border-warning rounded-lg">
              <p className="text-sm text-warning font-medium">Warning</p>
              <p className="text-sm text-text-secondary mt-1">
                This will prevent the payout from being processed automatically.
              </p>
            </div>

            <div className="p-3 bg-secondary rounded-lg">
              <p className="text-sm font-medium text-text-primary">
                {selectedPayout.vendor?.businessName || "Unknown Vendor"}
              </p>
              <p className="text-xs text-text-secondary mt-1">
                Amount: {formatCurrency(selectedPayout.amount)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Reason for Hold <span className="text-error">*</span>
              </label>
              <Textarea
                value={holdReason}
                onChange={(e) => setHoldReason(e.target.value)}
                placeholder="Explain why this payout is being held..."
                rows={4}
                required
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowHoldModal(false);
                  setHoldReason("");
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleHoldPayout}
                loading={submitting}
              >
                Hold Payout
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
