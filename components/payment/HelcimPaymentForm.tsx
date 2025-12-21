"use client";

import React, { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { CreditCard, Lock } from "lucide-react";

// TypeScript declarations for Helcim.js global
declare global {
  interface Window {
    helcim?: {
      appendHelcimIframe: (config: HelcimConfig) => void;
    };
  }
}

interface HelcimConfig {
  token: string;
  onSuccess: (response: HelcimSuccessResponse) => void;
  onError: (error: HelcimErrorResponse) => void;
  onReady?: () => void;
}

interface HelcimSuccessResponse {
  cardToken: string;
  cardType?: string;
  cardNumber?: string;
}

interface HelcimErrorResponse {
  error: string;
  message?: string;
}

export interface HelcimPaymentFormProps {
  /**
   * Total amount to charge in cents (e.g., 10000 = $100.00)
   */
  amount: number;
  /**
   * Callback fired when payment tokenization succeeds
   * @param token - The card token to be used for backend payment processing
   */
  onSuccess: (token: string) => void;
  /**
   * Callback fired when payment tokenization fails
   * @param error - The error object containing details
   */
  onError: (error: Error) => void;
  /**
   * Whether the form is disabled (e.g., during submission)
   */
  disabled?: boolean;
  /**
   * Custom button text
   * @default "Process Payment"
   */
  buttonText?: string;
  /**
   * Optional CSS class for the container
   */
  className?: string;
}

/**
 * HelcimPaymentForm Component
 *
 * Securely tokenizes credit card information using Helcim.js.
 * The component loads Helcim.js dynamically, initializes the payment form,
 * and handles tokenization without exposing card data to our servers.
 *
 * @example
 * ```tsx
 * <HelcimPaymentForm
 *   amount={10000}
 *   onSuccess={(token) => handlePayment(token)}
 *   onError={(error) => showError(error.message)}
 *   buttonText="Pay $100.00"
 * />
 * ```
 *
 * Environment Variables Required:
 * - NEXT_PUBLIC_HELCIM_JS_CONFIG_TOKEN: Your Helcim.js configuration token
 *
 * @see {@link https://devdocs.helcim.com/ Helcim API Documentation}
 */
export function HelcimPaymentForm({
  amount,
  onSuccess,
  onError,
  disabled = false,
  buttonText = "Process Payment",
  className,
}: HelcimPaymentFormProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const [helcimReady, setHelcimReady] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get configuration token from environment
  const configToken = process.env.NEXT_PUBLIC_HELCIM_JS_CONFIG_TOKEN;

  /**
   * Load Helcim.js script dynamically
   */
  useEffect(() => {
    // Validate configuration token
    if (!configToken) {
      const errorMsg =
        "NEXT_PUBLIC_HELCIM_JS_CONFIG_TOKEN is not configured in environment variables";
      setScriptError(errorMsg);
      onError(new Error(errorMsg));
      return;
    }

    // Check if script is already loaded
    if (window.helcim) {
      setScriptLoaded(true);
      return;
    }

    // Check if script tag already exists
    const existingScript = document.querySelector(
      'script[src="https://myhelcim.com/js/version2.js"]'
    );
    if (existingScript) {
      existingScript.addEventListener("load", () => setScriptLoaded(true));
      return;
    }

    // Create and load script
    const script = document.createElement("script");
    script.src = "https://myhelcim.com/js/version2.js";
    script.async = true;

    script.onload = () => {
      setScriptLoaded(true);
      setScriptError(null);
    };

    script.onerror = () => {
      const errorMsg = "Failed to load Helcim.js script";
      setScriptError(errorMsg);
      onError(new Error(errorMsg));
    };

    document.body.appendChild(script);

    // Cleanup function
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [configToken, onError]);

  /**
   * Initialize Helcim payment form once script is loaded
   */
  useEffect(() => {
    if (!scriptLoaded || !configToken || !window.helcim) {
      return;
    }

    try {
      // Initialize Helcim iframe
      window.helcim.appendHelcimIframe({
        token: configToken,
        onSuccess: (response: HelcimSuccessResponse) => {
          setProcessing(false);
          setError(null);
          onSuccess(response.cardToken);
        },
        onError: (errorResponse: HelcimErrorResponse) => {
          setProcessing(false);
          const errorMsg = errorResponse.message || errorResponse.error || "Payment failed";
          setError(errorMsg);
          onError(new Error(errorMsg));
        },
        onReady: () => {
          setHelcimReady(true);
          setError(null);
        },
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to initialize Helcim";
      setScriptError(errorMsg);
      onError(new Error(errorMsg));
    }
  }, [scriptLoaded, configToken, onSuccess, onError]);

  /**
   * Format amount for display
   */
  const formatAmount = useCallback((cents: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  }, []);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!helcimReady || processing || disabled) {
        return;
      }

      setProcessing(true);
      setError(null);

      // Helcim.js handles submission automatically via iframe
      // The callbacks (onSuccess/onError) will fire when tokenization completes
    },
    [helcimReady, processing, disabled]
  );

  // Show loading state while script loads
  if (!scriptLoaded && !scriptError) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center p-8 neo-card",
          className
        )}
      >
        <Spinner size="md" className="mb-4" />
        <p className="text-sm text-white/70">Loading payment form...</p>
      </div>
    );
  }

  // Show error if script failed to load
  if (scriptError) {
    return (
      <Alert variant="error" className={className}>
        <div className="flex flex-col gap-2">
          <strong className="font-bold">Payment Form Unavailable</strong>
          <p className="text-sm">{scriptError}</p>
          <p className="text-xs text-white/60 mt-2">
            Please contact support if this issue persists.
          </p>
        </div>
      </Alert>
    );
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Amount Display */}
      <div className="mb-6 neo-card p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white/70">
            Amount to Pay
          </span>
          <span className="text-2xl font-bold text-white">
            {formatAmount(amount)}
          </span>
        </div>
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Security Badge */}
        <div className="flex items-center gap-2 text-sm text-white/60">
          <Lock className="h-4 w-4" aria-hidden="true" />
          <span>Secure payment powered by Helcim</span>
        </div>

        {/* Helcim iframe container */}
        <div
          id="helcim-iframe-container"
          className={cn(
            "min-h-[280px] neo-card p-6 transition-opacity duration-normal",
            !helcimReady && "opacity-50"
          )}
          aria-live="polite"
          aria-busy={!helcimReady}
        >
          {!helcimReady && (
            <div className="flex flex-col items-center justify-center h-full">
              <Spinner size="sm" className="mb-2" />
              <p className="text-sm text-white/60">Initializing secure form...</p>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="error">
            <strong className="font-bold">Payment Error</strong>
            <p className="text-sm mt-1">{error}</p>
          </Alert>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={!helcimReady || processing || disabled}
          loading={processing}
          iconLeft={<CreditCard className="h-5 w-5" aria-hidden="true" />}
          className="w-full"
        >
          {processing
            ? "Processing..."
            : buttonText || `Pay ${formatAmount(amount)}`}
        </Button>

        {/* Info Text */}
        <p className="text-xs text-center text-white/50">
          Your payment information is encrypted and secure.
          <br />
          We never see or store your card details.
        </p>
      </form>
    </div>
  );
}

HelcimPaymentForm.displayName = "HelcimPaymentForm";
