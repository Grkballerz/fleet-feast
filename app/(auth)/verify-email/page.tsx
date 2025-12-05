/**
 * Email Verification Page
 * Verifies user email with token from URL
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";

type VerificationState = "loading" | "success" | "error" | "invalid";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<VerificationState>("loading");
  const [email, setEmail] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setState("invalid");
      setErrorMessage("No verification token provided.");
      return;
    }

    // Verify email with token
    const verifyEmail = async () => {
      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const result = await response.json();

        if (!response.ok) {
          setState("error");
          setErrorMessage(
            result.message || "Verification failed. Please try again."
          );
          return;
        }

        // Success
        setState("success");
        setEmail(result.email || "");
      } catch (err) {
        setState("error");
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    };

    verifyEmail();
  }, [searchParams]);

  // Loading state
  if (state === "loading") {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex items-center justify-center">
          <Spinner size="lg" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Verifying your email
          </h1>
          <p className="text-text-secondary">
            Please wait while we confirm your email address...
          </p>
        </div>
      </div>
    );
  }

  // Success state
  if (state === "success") {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-success/10">
          <svg
            className="h-8 w-8 text-success"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Email verified successfully!
          </h1>
          <p className="text-text-secondary">
            Your account is now active. You can sign in to start using
            FleetFeast.
          </p>
          {email && (
            <p className="mt-2 text-sm text-text-secondary">
              Verified email: <strong className="text-text-primary">{email}</strong>
            </p>
          )}
        </div>
        <div className="pt-4 space-y-3">
          <Link href={`/login${email ? `?email=${encodeURIComponent(email)}` : ""}`}>
            <Button variant="primary" size="lg" className="w-full">
              Continue to sign in
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Error or invalid state
  return (
    <div className="space-y-6">
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-error/10">
        <svg
          className="h-8 w-8 text-error"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Verification failed
        </h1>
        <p className="text-text-secondary">
          {state === "invalid"
            ? "The verification link is invalid or missing."
            : "We couldn't verify your email address."}
        </p>
      </div>

      <Alert variant="error" title="Error">
        {errorMessage}
      </Alert>

      <div className="space-y-3">
        <p className="text-sm text-text-secondary text-center">
          Possible reasons:
        </p>
        <ul className="text-sm text-text-secondary space-y-1 list-disc list-inside text-left">
          <li>The verification link has expired</li>
          <li>The link was already used</li>
          <li>The link is malformed or incomplete</li>
        </ul>
      </div>

      <div className="pt-4 space-y-3">
        <Link href="/register">
          <Button variant="outline" size="lg" className="w-full">
            Create a new account
          </Button>
        </Link>
        <Link href="/login">
          <Button variant="ghost" size="lg" className="w-full">
            Back to sign in
          </Button>
        </Link>
      </div>
    </div>
  );
}
