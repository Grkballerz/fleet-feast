"use client";

import React, { forwardRef, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * Label text to display above the textarea
   */
  label?: string;
  /**
   * Error message to display below the textarea
   */
  error?: string;
  /**
   * Helper text to display below the textarea (when no error)
   */
  helperText?: string;
  /**
   * Container className for the wrapper div
   */
  containerClassName?: string;
  /**
   * Show character count (requires maxLength prop)
   */
  showCharCount?: boolean;
}

/**
 * Textarea Component
 *
 * Multi-line text input component with label, error states, helper text, and optional character count.
 * Fully accessible with proper ARIA attributes.
 *
 * @example
 * ```tsx
 * <Textarea
 *   label="Message"
 *   placeholder="Type your message..."
 *   rows={4}
 *   error={errors.message}
 * />
 *
 * <Textarea
 *   label="Description"
 *   maxLength={500}
 *   showCharCount
 *   helperText="Describe your event in detail"
 * />
 * ```
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      containerClassName,
      label,
      error,
      helperText,
      id,
      disabled,
      maxLength,
      showCharCount = false,
      value,
      ...props
    },
    ref
  ) => {
    const textareaId = id || `textarea-${label?.toLowerCase().replace(/\s+/g, "-")}`;
    const errorId = `${textareaId}-error`;
    const helperId = `${textareaId}-helper`;

    // Calculate current character count
    const currentLength = typeof value === "string" ? value.length : 0;

    // Base textarea styles
    const baseStyles =
      "neo-input w-full px-4 py-2.5 text-text-primary transition-all duration-normal placeholder:text-text-secondary disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 resize-none";

    // Error state styles
    const errorStyles = error
      ? "border-error focus:border-error focus:neo-shadow-primary"
      : "";

    return (
      <div className={cn("flex flex-col", containerClassName)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={textareaId}
            className="mb-2 block text-sm font-medium text-text-primary"
          >
            {label}
            {props.required && (
              <span className="ml-1 text-error" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        {/* Textarea */}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            baseStyles,
            errorStyles,
            className
          )}
          disabled={disabled}
          maxLength={maxLength}
          value={value}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={
            error ? errorId : helperText ? helperId : undefined
          }
          {...props}
        />

        {/* Character count */}
        {showCharCount && maxLength && (
          <div className="mt-1 text-right text-xs text-text-secondary">
            {currentLength}/{maxLength}
          </div>
        )}

        {/* Error message */}
        {error && (
          <p
            id={errorId}
            className="mt-1 text-sm text-error"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}

        {/* Helper text (only shown when no error) */}
        {!error && helperText && (
          <p id={helperId} className="mt-1 text-sm text-text-secondary">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
