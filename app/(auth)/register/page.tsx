/**
 * Registration Page
 * New user account creation
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";

// Validation schema
const registerSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    role: z.enum(["CUSTOMER", "VENDOR"]),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the Terms of Service",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form handling
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "CUSTOMER",
      agreeToTerms: false,
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          role: data.role,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Registration failed. Please try again.");
        return;
      }

      // Success - show message
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
            Check your email
          </h1>
          <p className="text-text-secondary">
            We've sent you a verification link. Please check your email to
            activate your account.
          </p>
        </div>
        <Alert variant="info">
          Can't find the email? Check your spam folder or{" "}
          <button
            onClick={() => setSuccess(false)}
            className="font-medium underline hover:no-underline"
          >
            try again
          </button>
          .
        </Alert>
        <div className="pt-4">
          <Link href="/login">
            <Button variant="outline" size="lg" className="w-full">
              Return to sign in
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
          Create your account
        </h1>
        <p className="text-text-secondary">
          Join FleetFeast and start booking amazing food trucks
        </p>
      </div>

      {/* Error message */}
      {error && (
        <Alert
          variant="error"
          title="Registration failed"
          dismissible
          onDismiss={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Registration Form */}
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        {/* Role selection */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-3">
            I want to...
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`relative flex cursor-pointer rounded-lg border-2 p-4 transition-all ${
                selectedRole === "CUSTOMER"
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-gray-300"
              }`}
            >
              <input
                {...register("role")}
                type="radio"
                value="CUSTOMER"
                className="sr-only"
              />
              <div className="flex flex-col flex-1">
                <span className="block text-sm font-semibold text-text-primary">
                  Book food trucks
                </span>
                <span className="mt-1 text-xs text-text-secondary">
                  Customer account
                </span>
              </div>
              {selectedRole === "CUSTOMER" && (
                <div className="absolute top-3 right-3">
                  <svg
                    className="h-5 w-5 text-primary"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </label>
            <label
              className={`relative flex cursor-pointer rounded-lg border-2 p-4 transition-all ${
                selectedRole === "VENDOR"
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-gray-300"
              }`}
            >
              <input
                {...register("role")}
                type="radio"
                value="VENDOR"
                className="sr-only"
              />
              <div className="flex flex-col flex-1">
                <span className="block text-sm font-semibold text-text-primary">
                  Offer my food truck
                </span>
                <span className="mt-1 text-xs text-text-secondary">
                  Vendor account
                </span>
              </div>
              {selectedRole === "VENDOR" && (
                <div className="absolute top-3 right-3">
                  <svg
                    className="h-5 w-5 text-primary"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Email field */}
        <Input
          {...register("email")}
          id="email"
          type="email"
          label="Email address"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          required
        />

        {/* Password field */}
        <Input
          {...register("password")}
          id="password"
          type="password"
          label="Password"
          placeholder="Create a strong password"
          autoComplete="new-password"
          error={errors.password?.message}
          helperText="Must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number"
          required
        />

        {/* Confirm password field */}
        <Input
          {...register("confirmPassword")}
          id="confirmPassword"
          type="password"
          label="Confirm password"
          placeholder="Re-enter your password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          required
        />

        {/* Terms of service checkbox */}
        <div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              {...register("agreeToTerms")}
              type="checkbox"
              className="h-4 w-4 mt-0.5 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
            />
            <span className="text-sm text-text-secondary">
              I agree to the{" "}
              <Link
                href="/terms"
                className="text-primary hover:text-primary-hover font-medium underline"
                target="_blank"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-primary hover:text-primary-hover font-medium underline"
                target="_blank"
              >
                Privacy Policy
              </Link>
            </span>
          </label>
          {errors.agreeToTerms && (
            <p className="mt-1 text-sm text-error">
              {errors.agreeToTerms.message}
            </p>
          )}
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isLoading}
          className="w-full"
        >
          Create account
        </Button>
      </form>

      {/* Sign in link */}
      <div className="text-center pt-4 border-t border-border">
        <p className="text-sm text-text-secondary">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:text-primary-hover transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
