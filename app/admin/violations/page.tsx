"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";

interface Violation {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: string;
  severity: string;
  description: string;
  evidenceUrl?: string;
  status: string;
  appealReason?: string;
  appealedAt?: string;
  resolvedAt?: string;
  adminNotes?: string;
  createdAt: string;
}

/**
 * Violations Management Page
 * Manage user violations and appeals
 */
export default function ViolationsPage() {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [filter, setFilter] = useState<"pending" | "appealed" | "all">("pending");
  const [loading, setLoading] = useState(true);
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(
    null
  );
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolution, setResolution] = useState<"UPHOLD" | "OVERTURN">("UPHOLD");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadViolations();
  }, [filter]);

  const loadViolations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filter === "pending") {
        params.append("status", "PENDING");
      } else if (filter === "appealed") {
        params.append("status", "APPEALED");
      }

      const res = await fetch(`/api/admin/violations?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setViolations(data.violations || []);
      }
    } catch (error) {
      console.error("Failed to load violations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAppeal = async () => {
    if (!selectedViolation) return;

    try {
      setSubmitting(true);
      const res = await fetch(
        `/api/admin/violations/${selectedViolation.id}/appeal`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            decision: resolution,
            notes,
          }),
        }
      );

      if (res.ok) {
        setShowResolveModal(false);
        setSelectedViolation(null);
        loadViolations();
      }
    } catch (error) {
      console.error("Failed to resolve appeal:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity.toUpperCase()) {
      case "LOW":
        return <Badge variant="neutral">Low</Badge>;
      case "MEDIUM":
        return <Badge variant="warning">Medium</Badge>;
      case "HIGH":
        return <Badge variant="error">High</Badge>;
      case "CRITICAL":
        return (
          <Badge variant="error" size="lg">
            Critical
          </Badge>
        );
      default:
        return <Badge variant="neutral">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return <Badge variant="warning">Pending</Badge>;
      case "APPEALED":
        return <Badge variant="info">Appealed</Badge>;
      case "UPHELD":
        return <Badge variant="error">Upheld</Badge>;
      case "OVERTURNED":
        return <Badge variant="success">Overturned</Badge>;
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

  return (
    <AdminLayout title="Violations & Appeals">
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex items-center gap-4">
          <Button
            variant={filter === "pending" ? "primary" : "outline"}
            onClick={() => setFilter("pending")}
          >
            Pending
          </Button>
          <Button
            variant={filter === "appealed" ? "primary" : "outline"}
            onClick={() => setFilter("appealed")}
          >
            Appealed
          </Button>
          <Button
            variant={filter === "all" ? "primary" : "outline"}
            onClick={() => setFilter("all")}
          >
            All Violations
          </Button>
        </div>

        {/* Violations List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              <p className="mt-4 text-text-secondary">Loading violations...</p>
            </div>
          </div>
        ) : violations.length === 0 ? (
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
                No violations found
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {violations.map((violation) => (
              <Card key={violation.id}>
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-text-primary">
                          {violation.type.replace("_", " ")}
                        </h3>
                        {getSeverityBadge(violation.severity)}
                        {getStatusBadge(violation.status)}
                      </div>
                      <p className="text-sm text-text-secondary">
                        User: {violation.userName} ({violation.userEmail})
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-sm font-medium text-text-secondary">
                      Violation Description
                    </label>
                    <p className="text-sm text-text-primary mt-1">
                      {violation.description}
                    </p>
                  </div>

                  {/* Appeal Information */}
                  {violation.status === "APPEALED" && violation.appealReason && (
                    <div className="p-4 bg-secondary rounded-lg">
                      <label className="text-sm font-medium text-text-secondary">
                        Appeal Reason
                      </label>
                      <p className="text-sm text-text-primary mt-1">
                        {violation.appealReason}
                      </p>
                      <p className="text-xs text-text-secondary mt-2">
                        Appealed on {formatDate(violation.appealedAt!)}
                      </p>
                    </div>
                  )}

                  {/* Evidence */}
                  {violation.evidenceUrl && (
                    <div>
                      <label className="text-sm font-medium text-text-secondary">
                        Evidence
                      </label>
                      <a
                        href={violation.evidenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary underline mt-1 block"
                      >
                        View Evidence
                      </a>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="text-xs text-text-secondary">
                      Reported on {formatDate(violation.createdAt)}
                    </div>
                    {violation.status === "APPEALED" && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setSelectedViolation(violation);
                          setShowResolveModal(true);
                        }}
                      >
                        Review Appeal
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Resolve Appeal Modal */}
      <Modal
        isOpen={showResolveModal}
        onClose={() => {
          setShowResolveModal(false);
          setSelectedViolation(null);
        }}
        title="Resolve Violation Appeal"
      >
        {selectedViolation && (
          <div className="space-y-4">
            <div className="p-4 bg-secondary rounded-lg">
              <p className="text-sm font-medium text-text-primary">
                {selectedViolation.type.replace("_", " ")}
              </p>
              <p className="text-xs text-text-secondary mt-1">
                User: {selectedViolation.userName}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Original Violation
              </label>
              <p className="text-sm text-text-primary">
                {selectedViolation.description}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Appeal Reason
              </label>
              <p className="text-sm text-text-primary">
                {selectedViolation.appealReason}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Decision
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-secondary">
                  <input
                    type="radio"
                    name="resolution"
                    value="UPHOLD"
                    checked={resolution === "UPHOLD"}
                    onChange={(e) => setResolution(e.target.value as typeof resolution)}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      Uphold Violation
                    </p>
                    <p className="text-xs text-text-secondary">
                      Violation stands, penalty remains
                    </p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-secondary">
                  <input
                    type="radio"
                    name="resolution"
                    value="OVERTURN"
                    checked={resolution === "OVERTURN"}
                    onChange={(e) => setResolution(e.target.value as typeof resolution)}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      Overturn Violation
                    </p>
                    <p className="text-xs text-text-secondary">
                      Violation removed, penalty reversed
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Admin Notes <span className="text-error">*</span>
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Explain your decision..."
                rows={4}
                required
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowResolveModal(false);
                  setSelectedViolation(null);
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleResolveAppeal}
                loading={submitting}
              >
                Submit Decision
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
