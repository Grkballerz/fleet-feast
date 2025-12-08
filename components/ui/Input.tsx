"use client";

import React, { forwardRef, InputHTMLAttributes, useState } from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /**
   * Label text to display above the input
   */
  label?: string;
  /**
   * Error message to display below the input
   */
  error?: string;
  /**
   * Helper text to display below the input (when no error)
   */
  helperText?: string;
  /**
   * Container className for the wrapper div
   */
  containerClassName?: string;
}

/**
 * Input Component
 *
 * Form input component with label, error states, helper text, and password visibility toggle.
 * Fully accessible with proper ARIA attributes and keyboard navigation.
 *
 * @example
 * ```tsx
 * <Input
 *   label="Email Address"
 *   type="email"
 *   placeholder="you@example.com"
 *   error={errors.email}
 * />
 *
 * <Input
 *   label="Password"
 *   type="password"
 *   helperText="Must be at least 8 characters"
 * />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      containerClassName,
      label,
      error,
      helperText,
      type = "text",
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, "-")}`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    // Determine actual input type (handle password visibility toggle)
    const inputType = type === "password" && showPassword ? "text" : type;

    // Base input styles
    const baseStyles =
      "neo-input w-full px-4 py-2.5 text-gray-900 transition-all duration-normal placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100";

    // Error state styles
    const errorStyles = error
      ? "border-error focus:border-error focus:neo-shadow-primary"
      : "";

    return (
      <div className={cn("flex flex-col", containerClassName)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-sm font-bold text-white/90"
          >
            {label}
            {props.required && (
              <span className="ml-1 text-red-400" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        {/* Input container (for password toggle positioning) */}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={cn(
              baseStyles,
              errorStyles,
              type === "password" && "pr-12", // Extra padding for password toggle
              className
            )}
            disabled={disabled}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            {...props}
          />

          {/* Password visibility toggle */}
          {type === "password" && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded"
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={0}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Eye className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p
            id={errorId}
            className="mt-1 text-sm text-red-400 font-medium"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}

        {/* Helper text (only shown when no error) */}
        {!error && helperText && (
          <p id={helperId} className="mt-1 text-sm text-white/60">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
