"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";

interface Dispute {
  id: string;
  bookingId: string;
  booking: {
    id: string;
    eventDate: string;
    eventLocation: string;
    guestCount: number;
    totalAmount: number;
  };
  claimantId: string;
  claimantName: string;
  claimantEmail: string;
  respondentId: string;
  respondentName: string;
  respondentEmail: string;
  type: string;
  status: string;
  subject: string;
  description: string;
  claimantEvidence?: string[];
  respondentEvidence?: string[];
  adminNotes?: string;
  resolution?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Dispute Detail Page
 * Review and resolve individual disputes
 */
export default function DisputeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const disputeId = params.id as string;

  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [loading, setLoading] = useState(true);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolution, setResolution] = useState("");
  const [resolutionAction, setResolutionAction] = useState<
    "FAVOR_CLAIMANT" | "FAVOR_RESPONDENT" | "PARTIAL"
  >("FAVOR_CLAIMANT");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadDispute();
  }, [disputeId]);

  const loadDispute = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/disputes/${disputeId}`);
      if (res.ok) {
        const data = await res.json();
        setDispute(data.data);
      }
    } catch (error) {
      console.error("Failed to load dispute:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!resolution.trim()) {
      alert("Please provide a resolution explanation");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/admin/disputes/${disputeId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resolution,
          action: resolutionAction,
        }),
      });

      if (res.ok) {
        setShowResolveModal(false);
        router.push("/admin/disputes");
      } else {
        console.error("Failed to resolve dispute");
      }
    } catch (error) {
      console.error("Failed to resolve dispute:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Dispute Details">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-text-secondary">Loading dispute...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!dispute) {
    return (
      <AdminLayout title="Dispute Details">
        <Card>
          <div className="text-center py-12">
            <p className="text-lg font-medium text-text-primary">
              Dispute not found
            </p>
            <Button
              variant="primary"
              className="mt-4"
              onClick={() => router.push("/admin/disputes")}
            >
              Back to Disputes
            </Button>
          </div>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Dispute: ${dispute.subject}`}>
      <div className="space-y-6">
        {/* Status Banner */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Dispute Status</p>
              <div className="mt-2 flex items-center gap-3">
                {dispute.status === "OPEN" ? (
                  <Badge variant="error" size="lg">
                    Open
                  </Badge>
                ) : dispute.status === "UNDER_REVIEW" ? (
                  <Badge variant="warning" size="lg">
                    Under Review
                  </Badge>
                ) : (
                  <Badge variant="success" size="lg">
                    Resolved
                  </Badge>
                )}
                <Badge variant="neutral">{dispute.type.replace("_", " ")}</Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-text-secondary">Filed</p>
              <p className="text-sm font-medium text-text-primary mt-1">
                {new Date(dispute.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </Card>

        {/* Booking Details */}
        <Card
          header={
            <h2 className="text-lg font-semibold text-text-primary">
              Booking Details
            </h2>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-text-secondary">
                Booking ID
              </label>
              <p className="text-base text-text-primary mt-1">
                {dispute.bookingId}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary">
                Event Date
              </label>
              <p className="text-base text-text-primary mt-1">
                {new Date(dispute.booking.eventDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary">
                Location
              </label>
              <p className="text-base text-text-primary mt-1">
                {dispute.booking.eventLocation}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary">
                Total Amount
              </label>
              <p className="text-base text-text-primary mt-1">
                ${dispute.booking.totalAmount.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Claimant Information */}
          <Card
            header={
              <h2 className="text-lg font-semibold text-text-primary">
                Claimant
              </h2>
            }
          >
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-text-secondary">
                  Name
                </label>
                <p className="text-base text-text-primary mt-1">
                  {dispute.claimantName}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-text-secondary">
                  Email
                </label>
                <p className="text-base text-text-primary mt-1">
                  {dispute.claimantEmail}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-text-secondary">
                  Claim
                </label>
                <p className="text-base text-text-primary mt-1">
                  {dispute.description}
                </p>
              </div>
              {dispute.claimantEvidence && dispute.claimantEvidence.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-text-secondary">
                    Evidence
                  </label>
                  <ul className="mt-2 space-y-2">
                    {dispute.claimantEvidence.map((evidence, idx) => (
                      <li key={idx} className="text-sm text-primary underline">
                        <a
                          href={evidence}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Evidence {idx + 1}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>

          {/* Respondent Information */}
          <Card
            header={
              <h2 className="text-lg font-semibold text-text-primary">
                Respondent
              </h2>
            }
          >
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-text-secondary">
                  Name
                </label>
                <p className="text-base text-text-primary mt-1">
                  {dispute.respondentName}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-text-secondary">
                  Email
                </label>
                <p className="text-base text-text-primary mt-1">
                  {dispute.respondentEmail}
                </p>
              </div>
              {dispute.respondentEvidence &&
                dispute.respondentEvidence.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-text-secondary">
                      Evidence
                    </label>
                    <ul className="mt-2 space-y-2">
                      {dispute.respondentEvidence.map((evidence, idx) => (
                        <li key={idx} className="text-sm text-primary underline">
                          <a
                            href={evidence}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Evidence {idx + 1}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          </Card>
        </div>

        {/* Resolution */}
        {dispute.resolution && (
          <Card
            header={
              <h2 className="text-lg font-semibold text-text-primary">
                Resolution
              </h2>
            }
          >
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-text-secondary">
                  Decision
                </label>
                <p className="text-base text-text-primary mt-1">
                  {dispute.resolution}
                </p>
              </div>
              {dispute.resolvedAt && (
                <div>
                  <label className="text-sm font-medium text-text-secondary">
                    Resolved On
                  </label>
                  <p className="text-base text-text-primary mt-1">
                    {new Date(dispute.resolvedAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Resolve Action */}
        {dispute.status !== "RESOLVED" && (
          <Card>
            <div className="flex items-center justify-between">
              <p className="text-sm text-text-secondary">
                Review all evidence and make a resolution decision
              </p>
              <Button
                variant="primary"
                onClick={() => setShowResolveModal(true)}
              >
                Resolve Dispute
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Resolve Modal */}
      <Modal
        isOpen={showResolveModal}
        onClose={() => setShowResolveModal(false)}
        title="Resolve Dispute"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Select the resolution decision and provide an explanation. Both
            parties will be notified.
          </p>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Resolution Decision
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-secondary">
                <input
                  type="radio"
                  name="resolution"
                  value="FAVOR_CLAIMANT"
                  checked={resolutionAction === "FAVOR_CLAIMANT"}
                  onChange={(e) =>
                    setResolutionAction(e.target.value as typeof resolutionAction)
                  }
                  className="w-4 h-4"
                />
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    Favor Claimant
                  </p>
                  <p className="text-xs text-text-secondary">
                    Full refund to {dispute.claimantName}
                  </p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-secondary">
                <input
                  type="radio"
                  name="resolution"
                  value="FAVOR_RESPONDENT"
                  checked={resolutionAction === "FAVOR_RESPONDENT"}
                  onChange={(e) =>
                    setResolutionAction(e.target.value as typeof resolutionAction)
                  }
                  className="w-4 h-4"
                />
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    Favor Respondent
                  </p>
                  <p className="text-xs text-text-secondary">
                    No refund, payment released to {dispute.respondentName}
                  </p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-secondary">
                <input
                  type="radio"
                  name="resolution"
                  value="PARTIAL"
                  checked={resolutionAction === "PARTIAL"}
                  onChange={(e) =>
                    setResolutionAction(e.target.value as typeof resolutionAction)
                  }
                  className="w-4 h-4"
                />
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    Partial Resolution
                  </p>
                  <p className="text-xs text-text-secondary">
                    Partial refund to both parties
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Resolution Explanation <span className="text-error">*</span>
            </label>
            <Textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="Explain the reasoning behind this decision..."
              rows={5}
              required
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowResolveModal(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleResolve}
              loading={submitting}
            >
              Submit Resolution
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
