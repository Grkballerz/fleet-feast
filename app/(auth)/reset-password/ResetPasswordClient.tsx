/**
 * Reset Password Page
 * Set new password with reset token
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";

// Validation schema
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [tokenValid, setTokenValid] = useState(true);

  // Form handling
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    const resetToken = searchParams.get("token");
    if (!resetToken) {
      setTokenValid(false);
      setError("No reset token provided. Please request a new password reset.");
    } else {
      setToken(resetToken);
    }
  }, [searchParams]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError("Invalid reset token. Please request a new password reset.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Failed to reset password. Please try again.");
        return;
      }

      // Success
      setSuccess(true);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Success state
  if (success) {
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
            Password reset successful!
          </h1>
          <p className="text-white/70">
            Your password has been updated. You can now sign in with your new
            password.
          </p>
        </div>
        <div className="pt-4">
          <Link href="/login">
            <button className="neo-btn-primary w-full py-3.5 px-6">
              Continue to sign in
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (!tokenValid) {
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
            Invalid reset link
          </h1>
          <p className="text-white/70">
            This password reset link is invalid or has expired.
          </p>
        </div>

        <div className="p-4 rounded-neo bg-red-500/20 neo-border-thin border-red-500 text-red-300">
          <p className="font-bold mb-1">Error</p>
          <p className="text-sm">{error || "The reset token is missing or malformed."}</p>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-white/70 text-center">
            Reset links expire after 1 hour for security.
          </p>
        </div>

        <div className="space-y-3">
          <Link href="/forgot-password">
            <button className="neo-btn-primary w-full py-3.5 px-6">
              Request new reset link
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

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="text-center">
        <h1 className="neo-heading text-2xl text-white mb-2">
          Reset your password
        </h1>
        <p className="text-white/70">
          Choose a strong password for your account
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
          {...register("password")}
          id="password"
          type="password"
          label="New password"
          placeholder="Create a strong password"
          autoComplete="new-password"
          error={errors.password?.message}
          helperText="Must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number"
          required
        />

        <Input
          {...register("confirmPassword")}
          id="confirmPassword"
          type="password"
          label="Confirm new password"
          placeholder="Re-enter your password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
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
              <span>Resetting...</span>
            </>
          ) : (
            <span>Reset password</span>
          )}
        </button>
      </form>

      {/* Security notice */}
      <div className="p-4 rounded-neo bg-blue-500/20 neo-border-thin border-blue-500 text-blue-200">
        <p className="text-sm">
          After resetting your password, you'll be signed out of all devices
          for security.
        </p>
      </div>

      {/* Back to login */}
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
