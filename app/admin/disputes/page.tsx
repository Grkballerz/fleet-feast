"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

interface Dispute {
  id: string;
  bookingId: string;
  claimantId: string;
  claimantName: string;
  respondentId: string;
  respondentName: string;
  type: string;
  status: string;
  subject: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface DisputeStats {
  total: number;
  open: number;
  resolved: number;
  avgResolutionTime: number;
}

/**
 * Disputes Management Page
 * List and manage all platform disputes
 */
export default function DisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [stats, setStats] = useState<DisputeStats | null>(null);
  const [filter, setFilter] = useState<"all" | "open" | "resolved">("open");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDisputes();
  }, [filter]);

  const loadDisputes = async () => {
    try {
      setLoading(true);

      // Build query params
      const params = new URLSearchParams();
      if (filter === "open") {
        params.append("status", "OPEN");
      } else if (filter === "resolved") {
        params.append("status", "RESOLVED");
      }
      params.append("includeStats", "true");

      const res = await fetch(`/api/admin/disputes?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setDisputes(data.data || []);
        setStats(data.statistics || null);
      }
    } catch (error) {
      console.error("Failed to load disputes:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "OPEN":
        return <Badge variant="error">Open</Badge>;
      case "UNDER_REVIEW":
        return <Badge variant="warning">Under Review</Badge>;
      case "RESOLVED":
        return <Badge variant="success">Resolved</Badge>;
      case "CLOSED":
        return <Badge variant="neutral">Closed</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const typeColors: Record<string, "error" | "warning" | "neutral"> = {
      CANCELLATION: "warning",
      REFUND: "error",
      SERVICE_QUALITY: "warning",
      NO_SHOW: "error",
      OTHER: "neutral",
    };

    return (
      <Badge variant={typeColors[type] || "neutral"} size="sm">
        {type.replace("_", " ")}
      </Badge>
    );
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

  return (
    <AdminLayout title="Dispute Management">
      <div className="space-y-6">
        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <div className="space-y-2">
                <p className="text-sm font-medium text-text-secondary">
                  Total Disputes
                </p>
                <p className="text-3xl font-bold text-text-primary">
                  {stats.total}
                </p>
              </div>
            </Card>
            <Card>
              <div className="space-y-2">
                <p className="text-sm font-medium text-text-secondary">
                  Open Disputes
                </p>
                <p className="text-3xl font-bold text-error">{stats.open}</p>
              </div>
            </Card>
            <Card>
              <div className="space-y-2">
                <p className="text-sm font-medium text-text-secondary">
                  Resolved
                </p>
                <p className="text-3xl font-bold text-success">
                  {stats.resolved}
                </p>
              </div>
            </Card>
            <Card>
              <div className="space-y-2">
                <p className="text-sm font-medium text-text-secondary">
                  Avg Resolution
                </p>
                <p className="text-3xl font-bold text-text-primary">
                  {stats.avgResolutionTime}d
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-4">
          <Button
            variant={filter === "open" ? "primary" : "outline"}
            onClick={() => setFilter("open")}
          >
            Open ({stats?.open || 0})
          </Button>
          <Button
            variant={filter === "all" ? "primary" : "outline"}
            onClick={() => setFilter("all")}
          >
            All Disputes
          </Button>
          <Button
            variant={filter === "resolved" ? "primary" : "outline"}
            onClick={() => setFilter("resolved")}
          >
            Resolved ({stats?.resolved || 0})
          </Button>
        </div>

        {/* Disputes List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              <p className="mt-4 text-text-secondary">Loading disputes...</p>
            </div>
          </div>
        ) : disputes.length === 0 ? (
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="mt-4 text-lg font-medium text-text-primary">
                No disputes found
              </p>
              <p className="mt-2 text-sm text-text-secondary">
                {filter === "open"
                  ? "There are no open disputes at the moment."
                  : "No disputes match your filter."}
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {disputes.map((dispute) => (
              <Link key={dispute.id} href={`/admin/disputes/${dispute.id}`}>
                <Card variant="interactive">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-text-primary">
                            {dispute.subject}
                          </h3>
                          {getStatusBadge(dispute.status)}
                          {getTypeBadge(dispute.type)}
                        </div>
                        <p className="text-sm text-text-secondary line-clamp-2">
                          {dispute.description}
                        </p>
                      </div>
                    </div>

                    {/* Parties */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
                      <div>
                        <p className="text-xs font-medium text-text-secondary mb-1">
                          Claimant
                        </p>
                        <p className="text-sm text-text-primary">
                          {dispute.claimantName}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-text-secondary mb-1">
                          Respondent
                        </p>
                        <p className="text-sm text-text-primary">
                          {dispute.respondentName}
                        </p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-4 text-xs text-text-secondary">
                        <span>Filed {formatRelativeTime(dispute.createdAt)}</span>
                        <span>Booking #{dispute.bookingId.slice(0, 8)}</span>
                      </div>
                      <Button variant="primary" size="sm">
                        Review
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
