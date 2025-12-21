/**
 * ProposalBuilder Component - Usage Examples
 *
 * This file demonstrates various ways to use the ProposalBuilder component
 * in different contexts within the Fleet Feast application.
 */

import React, { useState } from "react";
import { ProposalBuilder } from "./ProposalBuilder";
import { EventType } from "@prisma/client";
import { useRouter } from "next/navigation";

/**
 * Example 1: Basic Usage
 * Simple implementation with minimal configuration
 */
export function BasicProposalExample() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const inquiry = {
    eventDate: "2025-01-15",
    eventTime: "18:00",
    guestCount: 100,
    eventType: "CORPORATE" as EventType,
    location: "123 Main St, New York, NY 10001",
  };

  const handleSubmit = async (proposalData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(proposalData),
      });

      if (!response.ok) throw new Error("Failed to create proposal");

      const result = await response.json();
      router.push(`/vendor/proposals/${result.id}`);
    } catch (error) {
      console.error("Error creating proposal:", error);
      alert("Failed to create proposal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-custom py-8">
      <h1 className="heading-1 mb-6">Create Proposal</h1>
      <ProposalBuilder
        inquiry={inquiry}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />
    </div>
  );
}

/**
 * Example 2: With API Integration
 * Fetches inquiry data from API and handles errors
 */
export function APIIntegratedProposalExample({ inquiryId }: { inquiryId: string }) {
  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  React.useEffect(() => {
    async function fetchInquiry() {
      try {
        const response = await fetch(`/api/inquiries/${inquiryId}`);
        if (!response.ok) throw new Error("Failed to fetch inquiry");
        const data = await response.json();
        setInquiry(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchInquiry();
  }, [inquiryId]);

  const handleSubmit = async (proposalData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/inquiries/${inquiryId}/proposals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...proposalData,
          inquiryId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create proposal");
      }

      const result = await response.json();

      // Show success notification
      alert("Proposal sent successfully!");

      // Redirect to proposals list
      router.push("/vendor/proposals");
    } catch (error) {
      console.error("Error creating proposal:", error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !inquiry) {
    return (
      <div className="container-custom py-8">
        <div className="neo-card-glass p-6 rounded-neo">
          <h2 className="heading-2 text-error mb-4">Error</h2>
          <p className="text-text-primary">{error || "Inquiry not found"}</p>
          <button
            onClick={() => router.back()}
            className="neo-btn-secondary mt-4"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <h1 className="heading-1 mb-6">Create Proposal</h1>

      {error && (
        <div className="mb-6 p-4 bg-error/10 border border-error rounded-neo">
          <p className="text-error font-medium">{error}</p>
        </div>
      )}

      <ProposalBuilder
        inquiry={inquiry}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />
    </div>
  );
}

/**
 * Example 3: With Custom Validation
 * Adds additional business logic validation
 */
export function CustomValidationProposalExample() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState(null);

  const inquiry = {
    eventDate: "2025-01-15",
    eventTime: "18:00",
    guestCount: 100,
    eventType: "WEDDING" as EventType,
    location: "Central Park, New York, NY",
    specialRequests: "Outdoor setup, need tents if rain",
  };

  const handleSubmit = async (proposalData) => {
    setValidationError(null);

    // Custom validation: minimum proposal amount
    if (proposalData.customerTotal < 500) {
      setValidationError("Proposal total must be at least $500 for wedding events");
      return;
    }

    // Custom validation: require specific inclusions for weddings
    const requiredInclusions = ["Setup", "Cleanup"];
    const missingInclusions = requiredInclusions.filter(
      (inc) => !proposalData.inclusions.includes(inc)
    );

    if (missingInclusions.length > 0) {
      setValidationError(
        `Wedding events require the following inclusions: ${missingInclusions.join(", ")}`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...proposalData,
          eventType: inquiry.eventType,
        }),
      });

      if (!response.ok) throw new Error("Failed to create proposal");

      alert("Proposal created successfully!");
    } catch (error) {
      console.error("Error:", error);
      setValidationError("Failed to create proposal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-custom py-8">
      <h1 className="heading-1 mb-6">Wedding Proposal</h1>

      {validationError && (
        <div className="mb-6 p-4 bg-warning/10 border border-warning rounded-neo">
          <p className="text-warning font-medium">{validationError}</p>
        </div>
      )}

      <ProposalBuilder
        inquiry={inquiry}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />
    </div>
  );
}

/**
 * Example 4: With Draft Saving
 * Automatically saves drafts to localStorage
 */
export function DraftSavingProposalExample({ inquiryId }: { inquiryId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const inquiry = {
    eventDate: "2025-02-20",
    eventTime: "19:00",
    guestCount: 75,
    eventType: "BIRTHDAY" as EventType,
    location: "456 Oak Ave, Brooklyn, NY",
  };

  // Load draft on component mount
  React.useEffect(() => {
    const savedDraft = localStorage.getItem(`proposal-draft-${inquiryId}`);
    if (savedDraft) {
      const shouldRestore = confirm(
        "A draft proposal was found. Would you like to restore it?"
      );
      if (shouldRestore) {
        try {
          const draft = JSON.parse(savedDraft);
          // You would need to pass this to ProposalBuilder as initial values
          // This would require adding defaultValues prop to ProposalBuilder
          console.log("Restored draft:", draft);
        } catch (err) {
          console.error("Failed to restore draft:", err);
        }
      }
    }
  }, [inquiryId]);

  const handleSubmit = async (proposalData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(proposalData),
      });

      if (!response.ok) throw new Error("Failed to create proposal");

      // Clear draft on successful submission
      localStorage.removeItem(`proposal-draft-${inquiryId}`);

      router.push("/vendor/proposals");
    } catch (error) {
      console.error("Error:", error);
      // Save draft on error
      localStorage.setItem(
        `proposal-draft-${inquiryId}`,
        JSON.stringify(proposalData)
      );
      alert("Failed to submit. Your draft has been saved.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-custom py-8">
      <h1 className="heading-1 mb-6">Create Proposal</h1>
      <ProposalBuilder
        inquiry={inquiry}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />
    </div>
  );
}

/**
 * Example 5: Within a Modal
 * Shows ProposalBuilder inside a modal dialog
 */
export function ModalProposalExample() {
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inquiry = {
    eventDate: "2025-03-10",
    eventTime: "12:00",
    guestCount: 50,
    eventType: "CORPORATE" as EventType,
    location: "789 Tech Park, San Francisco, CA",
  };

  const handleSubmit = async (proposalData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(proposalData),
      });

      if (!response.ok) throw new Error("Failed to create proposal");

      alert("Proposal sent successfully!");
      setShowModal(false);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to create proposal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="neo-btn-primary"
      >
        Create Proposal
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
          <div className="min-h-screen px-4 py-8">
            <div className="max-w-6xl mx-auto neo-glass-brutal rounded-neo p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="heading-2">Create Proposal</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-text-secondary hover:text-text-primary"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <ProposalBuilder
                inquiry={inquiry}
                onSubmit={handleSubmit}
                isLoading={isSubmitting}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
