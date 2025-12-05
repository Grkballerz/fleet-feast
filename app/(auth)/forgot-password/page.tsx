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
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Check your email
          </h1>
          <p className="text-text-secondary">
            We've sent password reset instructions to{" "}
            <strong className="text-text-primary">{submittedEmail}</strong>
          </p>
        </div>

        <Alert variant="info">
          <p className="text-sm">
            If you don't see the email, check your spam folder. The link will
            expire in 1 hour for security reasons.
          </p>
        </Alert>

        <div className="space-y-3">
          <p className="text-sm text-text-secondary text-center">
            Didn't receive the email?
          </p>
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => setSuccess(false)}
          >
            Try again
          </Button>
        </div>

        <div className="pt-4 border-t border-border text-center">
          <Link href="/login">
            <Button variant="ghost" size="md" className="w-full">
              Back to sign in
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Forgot your password?
        </h1>
        <p className="text-text-secondary">
          No worries! Enter your email and we'll send you reset instructions.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <Alert
          variant="error"
          title="Error"
          dismissible
          onDismiss={() => setError(null)}
        >
          {error}
        </Alert>
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

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isLoading}
          className="w-full"
        >
          Send reset instructions
        </Button>
      </form>

      {/* Back to login */}
      <div className="pt-4 border-t border-border text-center">
        <p className="text-sm text-text-secondary mb-3">
          Remember your password?
        </p>
        <Link href="/login">
          <Button variant="ghost" size="md" className="w-full">
            Back to sign in
          </Button>
        </Link>
      </div>
    </div>
  );
}
