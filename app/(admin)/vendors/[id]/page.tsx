"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";

interface VendorApplication {
  id: string;
  userId: string;
  userEmail: string;
  businessName: string;
  cuisineType: string[];
  description: string;
  priceRange: string;
  capacityMin: number;
  capacityMax: number;
  serviceArea: string;
  status: string;
  createdAt: string;
  documents: Array<{
    id: string;
    type: string;
    fileName: string;
    fileUrl: string;
    verified: boolean;
  }>;
  menu?: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
  }>;
}

/**
 * Vendor Application Detail Page
 * Review and approve/reject vendor applications
 */
export default function VendorApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.id as string;

  const [application, setApplication] = useState<VendorApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadApplication();
  }, [applicationId]);

  const loadApplication = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/vendors/${applicationId}`);
      if (res.ok) {
        const data = await res.json();
        setApplication(data.application);
      } else {
        console.error("Failed to load application");
      }
    } catch (error) {
      console.error("Failed to load application:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setSubmitting(true);
      const res = await fetch(`/api/admin/vendors/${applicationId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      if (res.ok) {
        setShowApproveModal(false);
        router.push("/admin/vendors");
      } else {
        console.error("Failed to approve application");
      }
    } catch (error) {
      console.error("Failed to approve application:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!notes.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/admin/vendors/${applicationId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: notes }),
      });

      if (res.ok) {
        setShowRejectModal(false);
        router.push("/admin/vendors");
      } else {
        console.error("Failed to reject application");
      }
    } catch (error) {
      console.error("Failed to reject application:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Application Details">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-text-secondary">Loading application...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!application) {
    return (
      <AdminLayout title="Application Details">
        <Card>
          <div className="text-center py-12">
            <p className="text-lg font-medium text-text-primary">
              Application not found
            </p>
            <Button
              variant="primary"
              className="mt-4"
              onClick={() => router.push("/admin/vendors")}
            >
              Back to Applications
            </Button>
          </div>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={application.businessName}>
      <div className="space-y-6">
        {/* Status Banner */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Application Status</p>
              <div className="mt-1">
                {application.status === "PENDING" ? (
                  <Badge variant="warning" size="lg">
                    Pending Review
                  </Badge>
                ) : application.status === "APPROVED" ? (
                  <Badge variant="success" size="lg">
                    Approved
                  </Badge>
                ) : (
                  <Badge variant="error" size="lg">
                    Rejected
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-text-secondary">Submitted</p>
              <p className="text-sm font-medium text-text-primary mt-1">
                {new Date(application.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Business Information */}
          <Card
            header={
              <h2 className="text-lg font-semibold text-text-primary">
                Business Information
              </h2>
            }
          >
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-text-secondary">
                  Business Name
                </label>
                <p className="text-base text-text-primary mt-1">
                  {application.businessName}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-text-secondary">
                  Owner Email
                </label>
                <p className="text-base text-text-primary mt-1">
                  {application.userEmail}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-text-secondary">
                  Description
                </label>
                <p className="text-base text-text-primary mt-1">
                  {application.description}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-text-secondary">
                  Cuisine Types
                </label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {application.cuisineType.map((cuisine) => (
                    <Badge key={cuisine} variant="neutral">
                      {cuisine}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Service Details */}
          <Card
            header={
              <h2 className="text-lg font-semibold text-text-primary">
                Service Details
              </h2>
            }
          >
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-text-secondary">
                  Price Range
                </label>
                <p className="text-base text-text-primary mt-1">
                  {application.priceRange}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-text-secondary">
                  Guest Capacity
                </label>
                <p className="text-base text-text-primary mt-1">
                  {application.capacityMin} - {application.capacityMax} guests
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-text-secondary">
                  Service Area
                </label>
                <p className="text-base text-text-primary mt-1">
                  {application.serviceArea}
                </p>
              </div>
            </div>
          </Card>

          {/* Documents */}
          <Card
            header={
              <h2 className="text-lg font-semibold text-text-primary">
                Documents ({application.documents.length})
              </h2>
            }
          >
            <div className="space-y-3">
              {application.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-6 h-6 text-text-secondary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {doc.fileName}
                      </p>
                      <p className="text-xs text-text-secondary">{doc.type}</p>
                    </div>
                  </div>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </a>
                </div>
              ))}
            </div>
          </Card>

          {/* Menu Preview */}
          {application.menu && application.menu.length > 0 && (
            <Card
              header={
                <h2 className="text-lg font-semibold text-text-primary">
                  Menu Preview ({application.menu.length} items)
                </h2>
              }
            >
              <div className="space-y-3">
                {application.menu.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between p-3 border border-border rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {item.name}
                      </p>
                      <p className="text-xs text-text-secondary mt-1">
                        {item.description}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-primary">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>
                ))}
                {application.menu.length > 5 && (
                  <p className="text-sm text-text-secondary text-center">
                    +{application.menu.length - 5} more items
                  </p>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Decision Panel */}
        {application.status === "PENDING" && (
          <Card>
            <div className="flex items-center justify-between">
              <p className="text-sm text-text-secondary">
                Review this application and make a decision
              </p>
              <div className="flex gap-3">
                <Button
                  variant="destructive"
                  onClick={() => setShowRejectModal(true)}
                >
                  Reject Application
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setShowApproveModal(true)}
                >
                  Approve Application
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Approve Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Approve Application"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Are you sure you want to approve this vendor application for{" "}
            <strong>{application.businessName}</strong>?
          </p>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Notes (Optional)
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this approval..."
              rows={3}
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowApproveModal(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleApprove}
              loading={submitting}
            >
              Approve
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Application"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Please provide a reason for rejecting this application. This will be
            sent to the applicant.
          </p>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Rejection Reason <span className="text-error">*</span>
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Explain why this application is being rejected..."
              rows={4}
              required
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowRejectModal(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              loading={submitting}
            >
              Reject Application
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
