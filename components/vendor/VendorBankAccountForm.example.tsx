/**
 * VendorBankAccountForm Usage Examples
 *
 * This file demonstrates common integration patterns for the VendorBankAccountForm component.
 * Copy these examples into your pages as needed.
 */

import { VendorBankAccountForm } from '@/components/vendor/VendorBankAccountForm';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

/**
 * Example 1: Add New Bank Account (Vendor Onboarding)
 *
 * Use this pattern during vendor onboarding when the vendor must add
 * their first bank account before proceeding.
 */
export function OnboardingBankSetup() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-surface p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Setup Your Payout Account</h1>
          <p className="text-text-secondary">
            Add your bank account details to receive payments for bookings.
          </p>
        </div>

        <VendorBankAccountForm
          onSuccess={() => {
            // Navigate to next onboarding step
            router.push('/vendor/onboarding/verification');
          }}
        />
      </div>
    </div>
  );
}

/**
 * Example 2: Update Existing Bank Account (Settings Page)
 *
 * Use this pattern in vendor settings where they can update their
 * existing bank account information.
 */
export function BankAccountSettings() {
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);

  // In a real app, fetch this from your API
  const existingAccount = {
    holderName: "John's Food Truck LLC",
    accountNumberMasked: "****5678",
    routingNumber: "123456789",
    accountType: "CHECKING" as const,
    bankName: "Chase Bank",
    verified: true,
  };

  return (
    <div className="min-h-screen bg-surface p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Bank Account Settings</h1>
          <p className="text-text-secondary">
            Update your bank account information for payouts.
          </p>
        </div>

        <VendorBankAccountForm
          existingAccount={existingAccount}
          onSuccess={() => {
            setShowSuccess(true);
            // Refresh data
            router.refresh();
          }}
          onCancel={() => {
            router.back();
          }}
        />
      </div>
    </div>
  );
}

/**
 * Example 3: Add Bank Account with Modal (Dashboard)
 *
 * Use this pattern when adding a bank account from within a dashboard
 * or other page where you want to show the form in context.
 */
export function DashboardWithBankSetup() {
  const [showBankForm, setShowBankForm] = useState(false);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-surface p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Vendor Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dashboard cards */}
          <div className="neo-card-glass p-6 rounded-neo">
            <h2 className="font-bold text-xl mb-4">Payout Settings</h2>
            <p className="text-text-secondary mb-4">
              Setup your bank account to receive payments.
            </p>
            <button
              onClick={() => setShowBankForm(true)}
              className="neo-btn-primary w-full"
            >
              Add Bank Account
            </button>
          </div>

          {/* More dashboard cards... */}
        </div>

        {/* Bank Account Form Section */}
        {showBankForm && (
          <div className="mt-8">
            <VendorBankAccountForm
              onSuccess={() => {
                setShowBankForm(false);
                router.refresh();
              }}
              onCancel={() => setShowBankForm(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Example 4: Bank Account with Server-Side Data Fetching
 *
 * Use this pattern in a Next.js server component or with data fetching.
 */
export async function BankAccountPage({ vendorId }: { vendorId: string }) {
  // Fetch existing account from API
  const response = await fetch(`/api/vendor/${vendorId}/bank-account`);
  const existingAccount = response.ok ? await response.json() : null;

  return (
    <div className="min-h-screen bg-surface p-8">
      <div className="max-w-4xl mx-auto">
        <VendorBankAccountForm
          existingAccount={existingAccount}
          onSuccess={() => {
            // Handle success - this would need to be in a client component
            // or use server actions
            console.log('Bank account saved!');
          }}
        />
      </div>
    </div>
  );
}

/**
 * Example 5: Bank Account with Custom Success Handler
 *
 * Use this pattern when you need to perform additional actions after
 * the bank account is saved (e.g., send analytics, show toast, etc.)
 */
export function BankAccountWithAnalytics() {
  const router = useRouter();

  const handleSuccess = () => {
    // Track analytics event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'bank_account_added', {
        event_category: 'vendor_onboarding',
        event_label: 'bank_setup_complete',
      });
    }

    // Show toast notification (if using a toast library)
    // toast.success('Bank account added successfully!');

    // Navigate to next step
    router.push('/vendor/dashboard');
  };

  return (
    <div className="min-h-screen bg-surface p-8">
      <div className="max-w-4xl mx-auto">
        <VendorBankAccountForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
}

/**
 * Example 6: Integration with Form Wizard/Stepper
 *
 * Use this pattern when the bank account form is part of a multi-step process.
 */
export function VendorOnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();

  const handleBankAccountSuccess = () => {
    // Move to next step in wizard
    setCurrentStep(currentStep + 1);
  };

  return (
    <div className="min-h-screen bg-surface p-8">
      <div className="max-w-4xl mx-auto">
        {/* Step indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className={currentStep >= 1 ? 'text-primary' : 'text-text-secondary'}>
              1. Business Info
            </div>
            <div className={currentStep >= 2 ? 'text-primary' : 'text-text-secondary'}>
              2. Menu Setup
            </div>
            <div className={currentStep >= 3 ? 'text-primary' : 'text-text-secondary'}>
              3. Bank Account
            </div>
            <div className={currentStep >= 4 ? 'text-primary' : 'text-text-secondary'}>
              4. Verification
            </div>
          </div>
        </div>

        {/* Step 3: Bank Account */}
        {currentStep === 3 && (
          <VendorBankAccountForm
            onSuccess={handleBankAccountSuccess}
            onCancel={() => setCurrentStep(currentStep - 1)}
          />
        )}
      </div>
    </div>
  );
}
