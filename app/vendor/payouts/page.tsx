"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import {
  DollarSign,
  Clock,
  CheckCircle,
  TrendingUp,
  ExternalLink,
  CreditCard,
  Calendar,
  Download,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import Link from "next/link";

interface Payout {
  id: string;
  amount: number;
  status: string;
  arrivalDate: string;
  createdAt: string;
  method: string;
  description?: string;
}

interface PayoutSummary {
  pendingAmount: number;
  availableAmount: number;
  totalEarnings: number;
  nextPayoutDate: string | null;
}

export default function VendorPayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [summary, setSummary] = useState<PayoutSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stripeConnected, setStripeConnected] = useState(false);

  useEffect(() => {
    fetchPayouts();
  }, []);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch vendor profile to check Stripe connection
      const profileRes = await fetch("/api/vendor/profile");
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        const profile = profileData.data?.profile || profileData.data;
        setStripeConnected(!!profile?.stripeAccountId);
      }

      // Fetch payouts
      const payoutsRes = await fetch("/api/vendor/payouts");
      if (!payoutsRes.ok) throw new Error("Failed to fetch payouts");

      const payoutsData = await payoutsRes.json();
      const rawData = payoutsData.data;
      const payoutsList = Array.isArray(rawData) ? rawData : Array.isArray(rawData?.payouts) ? rawData.payouts : [];
      setPayouts(payoutsList);

      // Calculate summary
      const pending = payoutsList
        .filter((p: Payout) => p.status === "PENDING")
        .reduce((sum: number, p: Payout) => sum + p.amount, 0);

      const total = payoutsList.reduce((sum: number, p: Payout) => sum + p.amount, 0);

      // Find next payout date
      const nextPayout = payoutsList
        .filter((p: Payout) => p.status === "PENDING")
        .sort((a: Payout, b: Payout) =>
          new Date(a.arrivalDate).getTime() - new Date(b.arrivalDate).getTime()
        )[0];

      setSummary({
        pendingAmount: pending,
        availableAmount: 0, // Available for immediate payout
        totalEarnings: total,
        nextPayoutDate: nextPayout?.arrivalDate || null,
      });
    } catch (err: any) {
      setError(err.message || "Failed to load payout data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "success" | "warning" | "neutral", label: string }> = {
      PENDING: { variant: "warning", label: "Pending" },
      PAID: { variant: "success", label: "Paid" },
      PROCESSING: { variant: "neutral", label: "Processing" },
    };
    const { variant, label } = config[status] || { variant: "neutral", label: status };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const handleConnectStripe = async () => {
    try {
      const res = await fetch("/api/payments/connect/onboard", {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed to create onboarding link");

      const data = await res.json();
      if (data.data?.url) {
        window.location.href = data.data.url;
      }
    } catch (err: any) {
      alert(err.message || "Failed to connect Stripe");
    }
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

  // Stripe Not Connected State
  if (!stripeConnected) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary neo-heading">Payouts</h2>
          <p className="text-text-secondary mt-1">
            Manage your earnings and payout schedule
          </p>
        </div>

        <div className="neo-card-glass neo-shadow rounded-neo p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-4">
            <CreditCard className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            Connect Your Bank Account
          </h3>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            To receive payouts, you'll need to connect your bank account through Stripe.
            This is a secure process that only takes a few minutes.
          </p>
          <Button variant="primary" size="lg" onClick={handleConnectStripe}>
            <ExternalLink className="w-5 h-5 mr-2" />
            Connect with Stripe
          </Button>
          <p className="text-xs text-text-secondary mt-4">
            Powered by <span className="font-semibold">Stripe</span> • Secure & Encrypted
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary neo-heading">Payouts</h2>
        <p className="text-text-secondary mt-1">
          Manage your earnings and payout schedule
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="neo-card-glass neo-shadow rounded-neo p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-secondary">Pending Payouts</p>
              <p className="text-2xl font-bold text-warning mt-2">
                ${((summary?.pendingAmount || 0) / 100).toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-warning/10 rounded-neo">
              <Clock className="w-5 h-5 text-warning" />
            </div>
          </div>
        </div>

        <div className="neo-card-glass neo-shadow rounded-neo p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-secondary">Available Now</p>
              <p className="text-2xl font-bold text-success mt-2">
                ${((summary?.availableAmount || 0) / 100).toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-success/10 rounded-neo">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
          </div>
        </div>

        <div className="neo-card-glass neo-shadow rounded-neo p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-secondary">Total Earnings</p>
              <p className="text-2xl font-bold text-text-primary mt-2">
                ${((summary?.totalEarnings || 0) / 100).toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-neo">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
          </div>
        </div>

        <div className="neo-card-glass neo-shadow rounded-neo p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-secondary">Next Payout</p>
              <p className="text-lg font-bold text-text-primary mt-2">
                {summary?.nextPayoutDate
                  ? format(parseISO(summary.nextPayoutDate), "MMM dd")
                  : "N/A"}
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-neo">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <Alert variant="info" title="Payout Schedule">
        Payouts are processed automatically 7 days after event completion. Funds typically
        arrive in your bank account within 2-3 business days.
      </Alert>

      {/* Bank Account Management */}
      <div className="neo-card-glass neo-shadow rounded-neo p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-text-primary neo-heading mb-1">
              Bank Account
            </h3>
            <p className="text-sm text-text-secondary">
              Manage your payout destination and settings
            </p>
          </div>
          <Button variant="secondary" onClick={handleConnectStripe}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Manage in Stripe
          </Button>
        </div>
      </div>

      {/* Payout History */}
      <div className="neo-card-glass neo-shadow rounded-neo p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-text-primary neo-heading">
            Payout History
          </h3>
          <Button variant="ghost" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        {payouts.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 mx-auto mb-4 text-text-tertiary" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              No payouts yet
            </h3>
            <p className="text-text-secondary">
              When you complete bookings, your payouts will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {payouts.map((payout) => (
              <div
                key={payout.id}
                className="p-4 neo-border rounded-neo hover:bg-background-hover transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <DollarSign className="w-5 h-5 text-success" />
                      <span className="font-semibold text-text-primary">
                        ${(payout.amount / 100).toFixed(2)}
                      </span>
                      {getStatusBadge(payout.status)}
                    </div>
                    {payout.description && (
                      <p className="text-sm text-text-secondary mb-2">
                        {payout.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-text-secondary">
                      <span>Created: {format(parseISO(payout.createdAt), "MMM dd, yyyy")}</span>
                      {payout.status !== "PENDING" && (
                        <span>Arrived: {format(parseISO(payout.arrivalDate), "MMM dd, yyyy")}</span>
                      )}
                      {payout.status === "PENDING" && (
                        <span>Expected: {format(parseISO(payout.arrivalDate), "MMM dd, yyyy")}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="neutral" size="sm">
                      {payout.method || "Bank Transfer"}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="neo-card-glass neo-shadow rounded-neo p-6 bg-background">
        <h3 className="text-lg font-semibold text-text-primary neo-heading mb-3">
          Need Help?
        </h3>
        <div className="space-y-2 text-sm text-text-secondary">
          <p>
            <strong>How are payouts calculated?</strong> You receive 85% of the booking
            total after the platform fee (15%).
          </p>
          <p>
            <strong>When will I receive my payout?</strong> Payouts are released 7 days
            after event completion and arrive in 2-3 business days.
          </p>
          <p>
            <strong>Can I change my bank account?</strong> Yes, click "Manage in Stripe"
            to update your payout settings.
          </p>
        </div>
        <Link href="/help/payouts" className="inline-block mt-4">
          <Button variant="ghost" size="sm">
            View Full FAQ
          </Button>
        </Link>
      </div>
    </div>
  );
}
