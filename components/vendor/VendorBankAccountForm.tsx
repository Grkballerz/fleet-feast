"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";
import {
  Building2,
  Lock,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Shield
} from "lucide-react";

export interface VendorBankAccountFormProps {
  /**
   * Existing bank account details (if updating)
   */
  existingAccount?: {
    holderName: string;
    accountNumberMasked: string; // e.g., "****1234"
    routingNumber: string;
    accountType: "CHECKING" | "SAVINGS";
    bankName?: string;
    verified: boolean;
  };
  /**
   * Callback when form is successfully submitted
   */
  onSuccess: () => void;
  /**
   * Optional callback when form is cancelled
   */
  onCancel?: () => void;
}

interface FormData {
  holderName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  routingNumber: string;
  accountType: "CHECKING" | "SAVINGS";
  bankName: string;
}

interface FormErrors {
  holderName?: string;
  accountNumber?: string;
  confirmAccountNumber?: string;
  routingNumber?: string;
  accountType?: string;
  bankName?: string;
}

/**
 * VendorBankAccountForm Component
 *
 * Secure form for vendors to enter or update their bank account details for payouts.
 * Features account number masking, validation, confirmation step, and security messaging.
 *
 * @example
 * ```tsx
 * <VendorBankAccountForm
 *   existingAccount={vendorAccount}
 *   onSuccess={() => router.push('/vendor/dashboard')}
 *   onCancel={() => router.back()}
 * />
 * ```
 */
export const VendorBankAccountForm: React.FC<VendorBankAccountFormProps> = ({
  existingAccount,
  onSuccess,
  onCancel,
}) => {
  // Form state
  const [formData, setFormData] = useState<FormData>({
    holderName: existingAccount?.holderName || "",
    accountNumber: "",
    confirmAccountNumber: "",
    routingNumber: existingAccount?.routingNumber || "",
    accountType: existingAccount?.accountType || "CHECKING",
    bankName: existingAccount?.bankName || "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [showConfirmAccountNumber, setShowConfirmAccountNumber] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Validate routing number format (9 digits for US banks)
  const validateRoutingNumber = (value: string): boolean => {
    const cleaned = value.replace(/\D/g, "");
    return cleaned.length === 9;
  };

  // Validate account number (basic length check)
  const validateAccountNumber = (value: string): boolean => {
    const cleaned = value.replace(/\D/g, "");
    return cleaned.length >= 4 && cleaned.length <= 17;
  };

  // Handle form field changes
  const handleChange = (
    field: keyof FormData,
    value: string | "CHECKING" | "SAVINGS"
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    setSubmitError(null);
  };

  // Validate entire form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Account holder name
    if (!formData.holderName.trim()) {
      newErrors.holderName = "Account holder name is required";
    } else if (formData.holderName.trim().length < 2) {
      newErrors.holderName = "Name must be at least 2 characters";
    }

    // Account number
    if (!formData.accountNumber) {
      newErrors.accountNumber = "Account number is required";
    } else if (!validateAccountNumber(formData.accountNumber)) {
      newErrors.accountNumber = "Account number must be 4-17 digits";
    }

    // Confirm account number
    if (!formData.confirmAccountNumber) {
      newErrors.confirmAccountNumber = "Please confirm account number";
    } else if (formData.accountNumber !== formData.confirmAccountNumber) {
      newErrors.confirmAccountNumber = "Account numbers do not match";
    }

    // Routing number
    if (!formData.routingNumber) {
      newErrors.routingNumber = "Routing number is required";
    } else if (!validateRoutingNumber(formData.routingNumber)) {
      newErrors.routingNumber = "Routing number must be 9 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission (show confirmation modal)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setShowConfirmModal(true);
    }
  };

  // Handle confirmed submission
  const handleConfirmedSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/vendor/bank-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          holderName: formData.holderName.trim(),
          accountNumber: formData.accountNumber.replace(/\D/g, ""),
          routingNumber: formData.routingNumber.replace(/\D/g, ""),
          accountType: formData.accountType,
          bankName: formData.bankName.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save bank account");
      }

      setShowConfirmModal(false);
      setSuccessMessage(
        existingAccount
          ? "Bank account updated successfully!"
          : "Bank account added successfully!"
      );

      // Call onSuccess after a brief delay to show success message
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "An error occurred. Please try again."
      );
      setShowConfirmModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format routing number with spaces for better readability
  const formatRoutingNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const limited = cleaned.slice(0, 9);
    return limited;
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Security Banner */}
      <Alert variant="info" title="Your Information is Secure">
        <div className="flex items-start gap-2">
          <Shield className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="text-sm">
            All bank account information is encrypted and stored securely. We use
            industry-standard PCI compliance to protect your data.
          </div>
        </div>
      </Alert>

      {/* Success Message */}
      {successMessage && (
        <Alert variant="success" title="Success">
          {successMessage}
        </Alert>
      )}

      {/* Error Message */}
      {submitError && (
        <Alert variant="error" title="Error" dismissible onDismiss={() => setSubmitError(null)}>
          {submitError}
        </Alert>
      )}

      {/* Existing Account Info */}
      {existingAccount && existingAccount.verified && (
        <Alert variant="success" title="Current Account">
          <div className="space-y-1 text-sm">
            <p>
              <strong>Account Holder:</strong> {existingAccount.holderName}
            </p>
            <p>
              <strong>Account Number:</strong> {existingAccount.accountNumberMasked}
            </p>
            <p>
              <strong>Account Type:</strong> {existingAccount.accountType}
            </p>
            {existingAccount.bankName && (
              <p>
                <strong>Bank:</strong> {existingAccount.bankName}
              </p>
            )}
          </div>
        </Alert>
      )}

      {/* Form Card */}
      <Card className="neo-card-glass neo-shadow rounded-neo">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-text-primary">
              {existingAccount ? "Update Bank Account" : "Add Bank Account"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Account Holder Name */}
            <Input
              label="Account Holder Name"
              type="text"
              value={formData.holderName}
              onChange={(e) => handleChange("holderName", e.target.value)}
              placeholder="John Doe"
              error={errors.holderName}
              required
            />

            {/* Account Number */}
            <div>
              <label className="mb-2 block text-sm font-bold text-white/90">
                Account Number <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showAccountNumber ? "text" : "password"}
                  value={formData.accountNumber}
                  onChange={(e) =>
                    handleChange("accountNumber", e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="Enter account number"
                  className={`neo-input w-full px-4 py-2.5 pr-12 text-gray-900 transition-all duration-normal placeholder:text-gray-400 ${
                    errors.accountNumber ? "border-error" : ""
                  }`}
                  required
                  maxLength={17}
                />
                <button
                  type="button"
                  onClick={() => setShowAccountNumber(!showAccountNumber)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded"
                  aria-label={showAccountNumber ? "Hide account number" : "Show account number"}
                >
                  {showAccountNumber ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.accountNumber && (
                <p className="mt-1 text-sm text-red-400 font-medium">
                  {errors.accountNumber}
                </p>
              )}
            </div>

            {/* Confirm Account Number */}
            <div>
              <label className="mb-2 block text-sm font-bold text-white/90">
                Confirm Account Number <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmAccountNumber ? "text" : "password"}
                  value={formData.confirmAccountNumber}
                  onChange={(e) =>
                    handleChange("confirmAccountNumber", e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="Re-enter account number"
                  className={`neo-input w-full px-4 py-2.5 pr-12 text-gray-900 transition-all duration-normal placeholder:text-gray-400 ${
                    errors.confirmAccountNumber ? "border-error" : ""
                  }`}
                  required
                  maxLength={17}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmAccountNumber(!showConfirmAccountNumber)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded"
                  aria-label={
                    showConfirmAccountNumber
                      ? "Hide confirm account number"
                      : "Show confirm account number"
                  }
                >
                  {showConfirmAccountNumber ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmAccountNumber && (
                <p className="mt-1 text-sm text-red-400 font-medium">
                  {errors.confirmAccountNumber}
                </p>
              )}
            </div>

            {/* Routing Number */}
            <Input
              label="Routing Number"
              type="text"
              value={formData.routingNumber}
              onChange={(e) =>
                handleChange("routingNumber", formatRoutingNumber(e.target.value))
              }
              placeholder="123456789"
              error={errors.routingNumber}
              helperText="9-digit routing number for US banks"
              required
              maxLength={9}
            />

            {/* Account Type */}
            <div>
              <label className="mb-2 block text-sm font-bold text-white/90">
                Account Type <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleChange("accountType", "CHECKING")}
                  className={`px-4 py-3 rounded-neo neo-border-thick text-sm font-bold transition-all ${
                    formData.accountType === "CHECKING"
                      ? "neo-border bg-primary/10 text-primary neo-shadow"
                      : "bg-white text-text-secondary hover:neo-shadow"
                  }`}
                >
                  Checking
                </button>
                <button
                  type="button"
                  onClick={() => handleChange("accountType", "SAVINGS")}
                  className={`px-4 py-3 rounded-neo neo-border-thick text-sm font-bold transition-all ${
                    formData.accountType === "SAVINGS"
                      ? "neo-border bg-primary/10 text-primary neo-shadow"
                      : "bg-white text-text-secondary hover:neo-shadow"
                  }`}
                >
                  Savings
                </button>
              </div>
            </div>

            {/* Bank Name (Optional) */}
            <Input
              label="Bank Name (Optional)"
              type="text"
              value={formData.bankName}
              onChange={(e) => handleChange("bankName", e.target.value)}
              placeholder="e.g., Chase Bank"
              helperText="Will be auto-populated if available from routing number"
            />

            {/* Security Notice */}
            <div className="bg-surface/50 rounded-neo p-4 neo-border-thick">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="text-sm text-text-secondary">
                  <p className="font-bold text-text-primary mb-1">Secure Processing</p>
                  <p>
                    Your bank account information is encrypted with 256-bit SSL encryption
                    and never stored in plain text. We comply with PCI DSS standards to
                    ensure your financial data is protected.
                  </p>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4 border-t border-border">
              {onCancel && (
                <Button
                  type="button"
                  onClick={onCancel}
                  variant="ghost"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                loading={isSubmitting}
                className="flex-1"
              >
                {existingAccount ? "Update Account" : "Add Account"}
              </Button>
            </div>
          </form>
        </div>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        open={showConfirmModal}
        onClose={() => !isSubmitting && setShowConfirmModal(false)}
        title="Confirm Bank Account Details"
      >
        <div className="space-y-4">
          <Alert variant="warning" title="Please Review">
            Double-check your bank account details before confirming. Incorrect
            information may delay your payouts.
          </Alert>

          <div className="bg-surface/50 rounded-neo p-4 space-y-3">
            <div>
              <p className="text-sm text-text-secondary">Account Holder</p>
              <p className="font-bold text-text-primary">{formData.holderName}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Account Number</p>
              <p className="font-bold text-text-primary">
                ****{formData.accountNumber.slice(-4)}
              </p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Routing Number</p>
              <p className="font-bold text-text-primary">{formData.routingNumber}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Account Type</p>
              <p className="font-bold text-text-primary">{formData.accountType}</p>
            </div>
            {formData.bankName && (
              <div>
                <p className="text-sm text-text-secondary">Bank Name</p>
                <p className="font-bold text-text-primary">{formData.bankName}</p>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              variant="ghost"
              onClick={() => setShowConfirmModal(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              Go Back
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmedSubmit}
              disabled={isSubmitting}
              loading={isSubmitting}
              className="flex-1"
            >
              Confirm and Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
