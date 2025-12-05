/**
 * Login Page
 * User authentication with email/password
 */

"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";

// Validation schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for verification success
  const verified = searchParams.get("verified");
  const verifiedEmail = searchParams.get("email");

  // Form handling
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: verifiedEmail || "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password. Please try again.");
      } else if (result?.ok) {
        // Redirect to dashboard based on user role
        router.push("/customer");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Welcome Back
        </h1>
        <p className="text-text-secondary">
          Sign in to your account to continue
        </p>
      </div>

      {/* Verification success message */}
      {verified === "true" && (
        <Alert variant="success" title="Email verified successfully!">
          You can now sign in to your account.
        </Alert>
      )}

      {/* Error message */}
      {error && (
        <Alert variant="error" title="Sign in failed" dismissible onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Login Form */}
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
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
          placeholder="Enter your password"
          autoComplete="current-password"
          error={errors.password?.message}
          required
        />

        {/* Remember me and forgot password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              {...register("rememberMe")}
              type="checkbox"
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
            />
            <span className="text-sm text-text-secondary">Remember me</span>
          </label>

          <Link
            href="/forgot-password"
            className="text-sm font-medium text-primary hover:text-primary-hover transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isLoading}
          className="w-full"
        >
          Sign in
        </Button>
      </form>

      {/* Sign up link */}
      <div className="text-center pt-4 border-t border-border">
        <p className="text-sm text-text-secondary">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-primary hover:text-primary-hover transition-colors"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
