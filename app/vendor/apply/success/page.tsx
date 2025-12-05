import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Application Submitted | Fleet Feast",
  description: "Your vendor application has been submitted successfully",
};

export default function ApplicationSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="max-w-2xl w-full">
        <div className="p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-success"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-text-primary mb-4">
            Application Submitted!
          </h1>
          <p className="text-lg text-text-secondary mb-8">
            Thank you for applying to become a Fleet Feast vendor. We've received your
            application and will review it within 3-5 business days.
          </p>

          {/* What Happens Next */}
          <div className="bg-background rounded-lg p-6 mb-8 text-left">
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              What happens next?
            </h2>
            <ol className="space-y-4">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
                  1
                </span>
                <div>
                  <p className="font-medium text-text-primary">Application Review</p>
                  <p className="text-sm text-text-secondary">
                    Our team will review your business information and documents
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
                  2
                </span>
                <div>
                  <p className="font-medium text-text-primary">Background Check</p>
                  <p className="text-sm text-text-secondary">
                    We'll verify your business license and insurance coverage
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
                  3
                </span>
                <div>
                  <p className="font-medium text-text-primary">Decision & Setup</p>
                  <p className="text-sm text-text-secondary">
                    You'll receive an email with our decision and next steps for account
                    setup
                  </p>
                </div>
              </li>
            </ol>
          </div>

          {/* Email Confirmation */}
          <p className="text-sm text-text-secondary mb-6">
            We've sent a confirmation email with your application details. Check your spam
            folder if you don't see it.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/vendor/dashboard">
              <Button variant="primary" size="lg">
                Go to Dashboard
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="lg">
                Return Home
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
