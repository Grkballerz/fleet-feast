"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";
import { VendorBankAccountForm } from "@/components/vendor";
import {
  Building2,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
  CreditCard,
  Trash2,
  Edit,
  FileText,
  TrendingUp,
  Shield,
} from "lucide-react";
import { format, parseISO, addDays } from "date-fns";

/**
 * Bank Account data structure
 */
interface BankAccount {
  bankAccountHolder: string;
  bankAccountNumberMasked: string;
  bankRoutingNumber: string;
  bankAccountType: "CHECKING" | "SAVINGS";
  bankName: string | null;
  payoutMethod: string;
  bankVerified: boolean;
  bankVerifiedAt: string | null;
}

/**
 * Payout data structure
 */
interface Payout {
  id: string;
  vendorId: string;
  amount: number;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  scheduledFor: string;
  processedAt: string | null;
  bookingCount: number;
  createdAt: string;
}

/**
 * Pending earnings data structure
 */
interface PendingEarnings {
  id: string;
  eventDate: string;
  eventType: string;
  customerEmail: string;
  amount: number;
  payoutDate: string;
}

/**
 * Vendor Payout Settings Page
 *
 * Allows vendors to:
 * - View and manage bank account information
 * - View payout history
 * - See pending earnings and scheduled payout dates
 */
export default function VendorPayoutSettingsPage() {
  // State management
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [pendingEarnings, setPendingEarnings] = useState<PendingEarnings[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBankForm, setShowBankForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch all data on mount
  useEffect(() => {
    fetchPayoutSettings();
  }, []);

  /**
   * Fetch bank account, payout history, and pending earnings
   */
  const fetchPayoutSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch bank account
      const bankRes = await fetch("/api/vendor/bank-account");
      if (bankRes.ok) {
        const bankData = await bankRes.json();
        setBankAccount(bankData.bankAccount || null);
      }

      // Fetch payout history
      const payoutsRes = await fetch("/api/vendor/payouts");
      let payoutsData: any = { payouts: [] };
      if (payoutsRes.ok) {
        payoutsData = await payoutsRes.json();
        setPayouts(payoutsData.payouts || []);
      }

      // TODO: Fetch pending earnings when endpoint is available
      // For now, calculate from pending payouts
      const pending = (payoutsData?.payouts || [])
        .filter((p: Payout) => p.status === "PENDING")
        .map((p: Payout) => ({
          id: p.id,
          eventDate: p.scheduledFor,
          eventType: "Booking",
          customerEmail: "customer@example.com",
          amount: p.amount,
          payoutDate: p.scheduledFor,
        }));
      setPendingEarnings(pending);
    } catch (err) {
      console.error("[Payout Settings] Error:", err);
      setError(err instanceof Error ? err.message : "Failed to load payout settings");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle bank account deletion
   */
  const handleDeleteBankAccount = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch("/api/vendor/bank-account", {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to delete bank account");
      }

      setBankAccount(null);
      setShowDeleteModal(false);
    } catch (err) {
      console.error("[Delete Bank Account] Error:", err);
      alert(err instanceof Error ? err.message : "Failed to delete bank account");
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Get status badge for payout status
   */
  const getStatusBadge = (status: Payout["status"]) => {
    const config = {
      PENDING: { variant: "warning" as const, label: "Pending", icon: Clock },
      PROCESSING: { variant: "neutral" as const, label: "Processing", icon: Clock },
      COMPLETED: { variant: "success" as const, label: "Completed", icon: CheckCircle },
      FAILED: { variant: "error" as const, label: "Failed", icon: AlertCircle },
    };
    const { variant, label, icon: Icon } = config[status];
    return (
      <Badge variant={variant}>
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    );
  };

  /**
   * Calculate total pending earnings
   */
  const totalPendingEarnings = pendingEarnings.reduce((sum, e) => sum + e.amount, 0);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary neo-heading">Payout Settings</h1>
          <p className="text-text-secondary mt-1">
            Manage your bank account and view payout history
          </p>
        </div>
        <Alert variant="error" title="Error" dismissible onDismiss={() => setError(null)}>
          {error}
        </Alert>
        <Button onClick={fetchPayoutSettings}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary neo-heading">Payout Settings</h1>
        <p className="text-text-secondary mt-1">
          Manage your bank account and view payout history
        </p>
      </div>

      {/* Payout Info Banner */}
      <Alert variant="info" title="Payout Schedule">
        <div className="flex items-start gap-2">
          <Shield className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="text-sm">
            Payouts are automatically processed 7 days after event completion. Funds typically
            arrive in your bank account within 2-3 business days via ACH transfer.
          </div>
        </div>
      </Alert>

      {/* Pending Earnings Summary */}
      {pendingEarnings.length > 0 && (
        <Card className="neo-card-glass neo-shadow rounded-neo">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary neo-heading">
                    Pending Earnings
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Awaiting 7-day escrow period
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-warning">
                  ${(totalPendingEarnings / 100).toFixed(2)}
                </p>
                <p className="text-xs text-text-secondary">
                  {pendingEarnings.length} booking{pendingEarnings.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {pendingEarnings.slice(0, 3).map((earning) => (
                <div
                  key={earning.id}
                  className="p-3 neo-border rounded-neo bg-surface/50 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-text-secondary" />
                      <span className="text-sm font-medium text-text-primary">
                        {format(parseISO(earning.eventDate), "MMM dd, yyyy")}
                      </span>
                      <span className="text-sm text-text-secondary">•</span>
                      <span className="text-sm text-text-secondary">{earning.eventType}</span>
                    </div>
                    <p className="text-xs text-text-secondary">
                      Payout date: {format(parseISO(earning.payoutDate), "MMM dd, yyyy")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-text-primary">
                      ${(earning.amount / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
              {pendingEarnings.length > 3 && (
                <p className="text-xs text-text-secondary text-center pt-2">
                  + {pendingEarnings.length - 3} more pending
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Bank Account Section */}
      <Card className="neo-card-glass neo-shadow rounded-neo">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-primary neo-heading">
                Bank Account
              </h2>
              <p className="text-sm text-text-secondary">
                Manage your payout destination
              </p>
            </div>
          </div>

          {/* No Bank Account */}
          {!bankAccount && !showBankForm && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-surface rounded-full mb-4">
                <CreditCard className="w-8 h-8 text-text-secondary" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                No Bank Account Added
              </h3>
              <p className="text-text-secondary mb-6 max-w-md mx-auto">
                Add your bank account information to receive payouts. All information is
                securely encrypted.
              </p>
              <Button variant="primary" onClick={() => setShowBankForm(true)}>
                <Building2 className="w-4 h-4 mr-2" />
                Add Bank Account
              </Button>
            </div>
          )}

          {/* Show Bank Account */}
          {bankAccount && !showBankForm && (
            <div>
              {/* Verification Status */}
              <div className="mb-6">
                {bankAccount.bankVerified ? (
                  <Alert variant="success" title="Account Verified">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">
                        Your bank account is verified and ready to receive payouts
                      </span>
                    </div>
                  </Alert>
                ) : (
                  <Alert variant="warning" title="Verification Pending">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">
                        Your bank account is pending verification. This may take 1-2 business days.
                      </span>
                    </div>
                  </Alert>
                )}
              </div>

              {/* Account Details */}
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 neo-border rounded-neo bg-surface/50">
                    <p className="text-xs text-text-secondary mb-1">Account Holder</p>
                    <p className="font-semibold text-text-primary">
                      {bankAccount.bankAccountHolder}
                    </p>
                  </div>
                  <div className="p-4 neo-border rounded-neo bg-surface/50">
                    <p className="text-xs text-text-secondary mb-1">Account Number</p>
                    <p className="font-semibold text-text-primary font-mono">
                      {bankAccount.bankAccountNumberMasked}
                    </p>
                  </div>
                  <div className="p-4 neo-border rounded-neo bg-surface/50">
                    <p className="text-xs text-text-secondary mb-1">Routing Number</p>
                    <p className="font-semibold text-text-primary font-mono">
                      {bankAccount.bankRoutingNumber}
                    </p>
                  </div>
                  <div className="p-4 neo-border rounded-neo bg-surface/50">
                    <p className="text-xs text-text-secondary mb-1">Account Type</p>
                    <p className="font-semibold text-text-primary">
                      {bankAccount.bankAccountType}
                    </p>
                  </div>
                </div>
                {bankAccount.bankName && (
                  <div className="p-4 neo-border rounded-neo bg-surface/50">
                    <p className="text-xs text-text-secondary mb-1">Bank Name</p>
                    <p className="font-semibold text-text-primary">{bankAccount.bankName}</p>
                  </div>
                )}
              </div>

              {/* Account Actions */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button
                  variant="secondary"
                  onClick={() => setShowBankForm(true)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Update Account
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowDeleteModal(true)}
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove Account
                </Button>
              </div>
            </div>
          )}

          {/* Bank Account Form */}
          {showBankForm && (
            <VendorBankAccountForm
              existingAccount={
                bankAccount
                  ? {
                      holderName: bankAccount.bankAccountHolder,
                      accountNumberMasked: bankAccount.bankAccountNumberMasked,
                      routingNumber: bankAccount.bankRoutingNumber,
                      accountType: bankAccount.bankAccountType,
                      bankName: bankAccount.bankName || undefined,
                      verified: bankAccount.bankVerified,
                    }
                  : undefined
              }
              onSuccess={() => {
                setShowBankForm(false);
                fetchPayoutSettings();
              }}
              onCancel={() => setShowBankForm(false)}
            />
          )}
        </div>
      </Card>

      {/* Payout History */}
      <Card className="neo-card-glass neo-shadow rounded-neo">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-success" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-primary neo-heading">
                Payout History
              </h2>
              <p className="text-sm text-text-secondary">
                View all past and pending payouts
              </p>
            </div>
          </div>

          {payouts.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="w-16 h-16 mx-auto mb-4 text-text-tertiary" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                No payouts yet
              </h3>
              <p className="text-text-secondary max-w-md mx-auto">
                When you complete bookings, your payouts will appear here. Payouts are
                processed 7 days after event completion.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Table Header (hidden on mobile) */}
              <div className="hidden sm:grid sm:grid-cols-5 gap-4 pb-3 border-b border-border text-xs font-semibold text-text-secondary uppercase">
                <div>Date</div>
                <div>Amount</div>
                <div>Status</div>
                <div>Bookings</div>
                <div>Reference</div>
              </div>

              {/* Payout Rows */}
              {payouts.map((payout) => (
                <div
                  key={payout.id}
                  className="p-4 neo-border rounded-neo hover:bg-background-hover transition-colors"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-center">
                    {/* Date */}
                    <div>
                      <p className="text-sm sm:hidden text-text-secondary mb-1">Date</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-text-secondary" />
                        <span className="text-sm font-medium text-text-primary">
                          {format(parseISO(payout.createdAt), "MMM dd, yyyy")}
                        </span>
                      </div>
                    </div>

                    {/* Amount */}
                    <div>
                      <p className="text-sm sm:hidden text-text-secondary mb-1">Amount</p>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-success" />
                        <span className="font-bold text-text-primary">
                          ${(payout.amount / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <p className="text-sm sm:hidden text-text-secondary mb-1">Status</p>
                      {getStatusBadge(payout.status)}
                    </div>

                    {/* Bookings */}
                    <div>
                      <p className="text-sm sm:hidden text-text-secondary mb-1">Bookings</p>
                      <span className="text-sm text-text-primary">
                        {payout.bookingCount} booking{payout.bookingCount !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Reference */}
                    <div>
                      <p className="text-sm sm:hidden text-text-secondary mb-1">Reference</p>
                      <span className="text-xs font-mono text-text-secondary">
                        {payout.id.substring(0, 8)}
                      </span>
                    </div>
                  </div>

                  {/* Processed Date (if applicable) */}
                  {payout.processedAt && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-text-secondary">
                        Processed: {format(parseISO(payout.processedAt), "MMM dd, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => !isDeleting && setShowDeleteModal(false)}
        title="Remove Bank Account"
      >
        <div className="space-y-4">
          <Alert variant="warning" title="Are you sure?">
            This will remove your bank account information. You will need to add a new bank
            account to receive future payouts.
          </Alert>

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              variant="ghost"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleDeleteBankAccount}
              disabled={isDeleting}
              loading={isDeleting}
              className="flex-1"
            >
              Remove Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
