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
import { LogIn, Mail, Lock, CheckCircle, AlertCircle } from "lucide-react";

// Validation schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginClient() {
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
        // Fetch session to get user role for redirect
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();

        // Redirect to dashboard based on user role
        const role = session?.user?.role;
        if (role === "ADMIN") {
          router.push("/admin/dashboard");
        } else if (role === "VENDOR") {
          router.push("/vendor/dashboard");
        } else {
          router.push("/customer/dashboard");
        }
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
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-neo bg-primary neo-border neo-shadow-primary mb-4">
          <LogIn className="w-7 h-7 text-white" />
        </div>
        <h1 className="neo-heading text-2xl text-white mb-2">
          Welcome Back
        </h1>
        <p className="text-white/60">
          Sign in to your account to continue
        </p>
      </div>

      {/* Verification success message */}
      {verified === "true" && (
        <div className="flex items-center gap-3 p-4 rounded-neo bg-green-500/20 neo-border-thin border-green-500 text-green-300">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-bold">Email verified successfully!</p>
            <p className="text-sm text-green-300/80">You can now sign in to your account.</p>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-neo bg-red-500/20 neo-border-thin border-red-500 text-red-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-bold">Sign in failed</p>
            <p className="text-sm text-red-300/80">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="p-1 rounded-neo hover:bg-white/10 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Login Form */}
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        {/* Email field */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-bold text-white/90">
            Email address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Mail className="w-5 h-5 text-gray-600" />
            </div>
            <input
              {...register("email")}
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              className="neo-input w-full pl-11 pr-4 py-3 text-gray-900 placeholder-gray-400"
            />
          </div>
          {errors.email?.message && (
            <p className="text-sm text-red-400 font-medium">{errors.email.message}</p>
          )}
        </div>

        {/* Password field */}
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-bold text-white/90">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Lock className="w-5 h-5 text-gray-600" />
            </div>
            <input
              {...register("password")}
              id="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              className="neo-input w-full pl-11 pr-4 py-3 text-gray-900 placeholder-gray-400"
            />
          </div>
          {errors.password?.message && (
            <p className="text-sm text-red-400 font-medium">{errors.password.message}</p>
          )}
        </div>

        {/* Remember me and forgot password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              {...register("rememberMe")}
              type="checkbox"
              className="h-4 w-4 rounded-sm border-2 border-black text-primary focus:ring-2 focus:ring-primary cursor-pointer"
            />
            <span className="text-sm text-white/80 font-medium group-hover:text-white transition-colors">Remember me</span>
          </label>

          <Link
            href="/forgot-password"
            className="text-sm font-bold text-primary hover:text-orange-500 transition-colors"
          >
            Forgot password?
          </Link>
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
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              <span>Sign in</span>
            </>
          )}
        </button>
      </form>

      {/* Sign up link */}
      <div className="text-center pt-5 border-t border-white/20">
        <p className="text-sm text-white/70">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="font-bold text-primary hover:text-orange-500 transition-colors"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
