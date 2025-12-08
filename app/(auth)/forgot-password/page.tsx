/**
 * Forgot Password Page
 * Request password reset email
 */

"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string>("");

  // Form handling
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Failed to send reset email. Please try again.");
        return;
      }

      // Success
      setSuccess(true);
      setSubmittedEmail(data.email);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="space-y-6">
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
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div className="text-center">
          <h1 className="neo-heading text-2xl text-white mb-2">
            Check your email
          </h1>
          <p className="text-white/70">
            We've sent password reset instructions to{" "}
            <strong className="text-white">{submittedEmail}</strong>
          </p>
        </div>

        <div className="p-4 rounded-neo bg-blue-500/20 neo-border-thin border-blue-500 text-blue-200">
          <p className="text-sm">
            If you don't see the email, check your spam folder. The link will
            expire in 1 hour for security reasons.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-white/70 text-center">
            Didn't receive the email?
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="neo-btn-secondary w-full py-3 px-6"
          >
            Try again
          </button>
        </div>

        <div className="pt-4 border-t border-white/20 text-center">
          <Link href="/login">
            <button className="w-full py-2.5 px-6 text-white/80 hover:text-white font-medium transition-colors">
              Back to sign in
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="text-center">
        <h1 className="neo-heading text-2xl text-white mb-2">
          Forgot your password?
        </h1>
        <p className="text-white/70">
          No worries! Enter your email and we'll send you reset instructions.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 rounded-neo bg-red-500/20 neo-border-thin border-red-500 text-red-300">
          <p className="font-bold mb-1">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Form */}
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <Input
          {...register("email")}
          id="email"
          type="email"
          label="Email address"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          helperText="Enter the email associated with your account"
          required
        />

        <button
          type="submit"
          disabled={isLoading}
          className="neo-btn-primary w-full py-3.5 px-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Sending...</span>
            </>
          ) : (
            <span>Send reset instructions</span>
          )}
        </button>
      </form>

      {/* Back to login */}
      <div className="pt-4 border-t border-white/20 text-center">
        <p className="text-sm text-white/70 mb-3">
          Remember your password?
        </p>
        <Link href="/login">
          <button className="w-full py-2.5 px-6 text-white/80 hover:text-white font-medium transition-colors">
            Back to sign in
          </button>
        </Link>
      </div>
    </div>
  );
}
