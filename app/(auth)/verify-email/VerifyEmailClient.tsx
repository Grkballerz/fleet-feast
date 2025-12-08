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

export function VerifyEmailClient() {
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
          <h1 className="neo-heading text-2xl text-white mb-2">
            Verifying your email
          </h1>
          <p className="text-white/70">
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
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-neo bg-green-500/20 neo-border-thin border-green-500">
          <svg
            className="h-8 w-8 text-green-500"
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
          <h1 className="neo-heading text-2xl text-white mb-2">
            Email verified successfully!
          </h1>
          <p className="text-white/70">
            Your account is now active. You can sign in to start using
            FleetFeast.
          </p>
          {email && (
            <p className="mt-2 text-sm text-white/60">
              Verified email: <strong className="text-white">{email}</strong>
            </p>
          )}
        </div>
        <div className="pt-4 space-y-3">
          <Link href={`/login${email ? `?email=${encodeURIComponent(email)}` : ""}`}>
            <button className="neo-btn-primary w-full py-3.5 px-6">
              Continue to sign in
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Error or invalid state
  return (
    <div className="space-y-6">
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-neo bg-red-500/20 neo-border-thin border-red-500">
        <svg
          className="h-8 w-8 text-red-500"
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
        <h1 className="neo-heading text-2xl text-white mb-2">
          Verification failed
        </h1>
        <p className="text-white/70">
          {state === "invalid"
            ? "The verification link is invalid or missing."
            : "We couldn't verify your email address."}
        </p>
      </div>

      <div className="p-4 rounded-neo bg-red-500/20 neo-border-thin border-red-500 text-red-300">
        <p className="font-bold mb-1">Error</p>
        <p className="text-sm">{errorMessage}</p>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-white/70 text-center">
          Possible reasons:
        </p>
        <ul className="text-sm text-white/60 space-y-1 list-disc list-inside text-left">
          <li>The verification link has expired</li>
          <li>The link was already used</li>
          <li>The link is malformed or incomplete</li>
        </ul>
      </div>

      <div className="pt-4 space-y-3">
        <Link href="/register">
          <button className="neo-btn-secondary w-full py-3 px-6">
            Create a new account
          </button>
        </Link>
        <Link href="/login">
          <button className="w-full py-2.5 px-6 text-white/80 hover:text-white font-medium transition-colors">
            Back to sign in
          </button>
        </Link>
      </div>
    </div>
  );
}
