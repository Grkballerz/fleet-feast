"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

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
    verified: boolean;
  }>;
}

/**
 * Vendor Applications List Page
 * Shows pending and all vendor applications for admin review
 */
export default function VendorApplicationsPage() {
  const [applications, setApplications] = useState<VendorApplication[]>([]);
  const [filter, setFilter] = useState<"pending" | "all">("pending");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, [filter]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const endpoint =
        filter === "pending"
          ? "/api/admin/vendors/pending"
          : "/api/admin/vendors";

      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
      }
    } catch (error) {
      console.error("Failed to load applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return <Badge variant="warning">Pending Review</Badge>;
      case "APPROVED":
        return <Badge variant="success">Approved</Badge>;
      case "REJECTED":
        return <Badge variant="error">Rejected</Badge>;
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
    <AdminLayout title="Vendor Applications">
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex items-center gap-4">
          <Button
            variant={filter === "pending" ? "primary" : "outline"}
            onClick={() => setFilter("pending")}
          >
            Pending ({applications.filter((a) => a.status === "PENDING").length})
          </Button>
          <Button
            variant={filter === "all" ? "primary" : "outline"}
            onClick={() => setFilter("all")}
          >
            All Applications
          </Button>
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              <p className="mt-4 text-text-secondary">Loading applications...</p>
            </div>
          </div>
        ) : applications.length === 0 ? (
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="mt-4 text-lg font-medium text-text-primary">
                No applications found
              </p>
              <p className="mt-2 text-sm text-text-secondary">
                {filter === "pending"
                  ? "There are no pending applications to review."
                  : "No vendor applications in the system."}
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {applications.map((app) => (
              <Link key={app.id} href={`/admin/vendors/${app.id}`}>
                <Card variant="interactive">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Main Info */}
                    <div className="lg:col-span-6">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-text-primary">
                            {app.businessName}
                          </h3>
                          <p className="text-sm text-text-secondary">
                            {app.userEmail}
                          </p>
                        </div>
                        {getStatusBadge(app.status)}
                      </div>
                      <p className="text-sm text-text-secondary line-clamp-2 mt-2">
                        {app.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {app.cuisineType.map((cuisine) => (
                          <Badge key={cuisine} variant="neutral" size="sm">
                            {cuisine}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="lg:col-span-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <svg
                          className="w-4 h-4 text-text-secondary"
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
                        <span className="text-text-secondary">
                          {app.priceRange}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <svg
                          className="w-4 h-4 text-text-secondary"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        <span className="text-text-secondary">
                          {app.capacityMin}-{app.capacityMax} guests
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <svg
                          className="w-4 h-4 text-text-secondary"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="text-text-secondary">
                          {app.serviceArea}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <svg
                          className="w-4 h-4 text-text-secondary"
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
                        <span className="text-text-secondary">
                          {app.documents.length} document
                          {app.documents.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="lg:col-span-2 flex items-center justify-end">
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
