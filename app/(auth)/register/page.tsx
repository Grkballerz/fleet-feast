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
            Check your email
          </h1>
          <p className="text-white/70">
            We've sent you a verification link. Please check your email to
            activate your account.
          </p>
        </div>
        <div className="p-4 rounded-neo bg-blue-500/20 neo-border-thin border-blue-500 text-blue-200">
          <p className="text-sm">
            Can't find the email? Check your spam folder or{" "}
            <button
              onClick={() => setSuccess(false)}
              className="font-bold underline hover:no-underline"
            >
              try again
            </button>
            .
          </p>
        </div>
        <div className="pt-4">
          <Link href="/login">
            <button className="neo-btn-secondary w-full py-3 px-6">
              Return to sign in
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
          Create your account
        </h1>
        <p className="text-white/70">
          Join FleetFeast and start booking amazing food trucks
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 rounded-neo bg-red-500/20 neo-border-thin border-red-500 text-red-300">
          <p className="font-bold mb-1">Registration failed</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Registration Form */}
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        {/* Role selection */}
        <div>
          <label className="block text-sm font-bold text-white/90 mb-3">
            I want to...
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`relative flex cursor-pointer rounded-neo p-4 transition-all ${
                selectedRole === "CUSTOMER"
                  ? "neo-border-primary bg-primary/10 neo-shadow-primary"
                  : "neo-border bg-white/5 hover:bg-white/10"
              }`}
            >
              <input
                {...register("role")}
                type="radio"
                value="CUSTOMER"
                className="sr-only"
              />
              <div className="flex flex-col flex-1">
                <span className="block text-sm font-bold text-white">
                  Book food trucks
                </span>
                <span className="mt-1 text-xs text-white/60">
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
              className={`relative flex cursor-pointer rounded-neo p-4 transition-all ${
                selectedRole === "VENDOR"
                  ? "neo-border-primary bg-primary/10 neo-shadow-primary"
                  : "neo-border bg-white/5 hover:bg-white/10"
              }`}
            >
              <input
                {...register("role")}
                type="radio"
                value="VENDOR"
                className="sr-only"
              />
              <div className="flex flex-col flex-1">
                <span className="block text-sm font-bold text-white">
                  Offer my food truck
                </span>
                <span className="mt-1 text-xs text-white/60">
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
              className="h-4 w-4 mt-0.5 rounded-sm border-2 border-black text-primary focus:ring-2 focus:ring-primary cursor-pointer"
            />
            <span className="text-sm text-white/80">
              I agree to the{" "}
              <Link
                href="/terms"
                className="text-primary hover:text-orange-500 font-bold underline"
                target="_blank"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-primary hover:text-orange-500 font-bold underline"
                target="_blank"
              >
                Privacy Policy
              </Link>
            </span>
          </label>
          {errors.agreeToTerms && (
            <p className="mt-1 text-sm text-red-400 font-medium">
              {errors.agreeToTerms.message}
            </p>
          )}
        </div>

        {/* Submit button */}
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
              <span>Creating account...</span>
            </>
          ) : (
            <span>Create account</span>
          )}
        </button>
      </form>

      {/* Sign in link */}
      <div className="text-center pt-4 border-t border-white/20">
        <p className="text-sm text-white/70">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold text-primary hover:text-orange-500 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
