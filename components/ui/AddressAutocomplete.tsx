"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { MapPin, Loader2 } from "lucide-react";

declare global {
  interface Window {
    google: typeof google;
    initGoogleMapsCallback?: () => void;
  }
}

export interface AddressAutocompleteProps {
  /**
   * Label text to display above the input
   */
  label?: string;
  /**
   * Current value of the input
   */
  value: string;
  /**
   * Callback when address is selected or input changes
   */
  onChange: (value: string) => void;
  /**
   * Callback when a place is selected from suggestions
   */
  onPlaceSelect?: (place: google.maps.places.PlaceResult) => void;
  /**
   * Error message to display below the input
   */
  error?: string;
  /**
   * Helper text to display below the input (when no error)
   */
  helperText?: string;
  /**
   * Placeholder text for the input
   */
  placeholder?: string;
  /**
   * Whether the field is required
   */
  required?: boolean;
  /**
   * Whether the input is disabled
   */
  disabled?: boolean;
  /**
   * Additional class name for the container
   */
  className?: string;
  /**
   * Country restriction for suggestions (ISO 3166-1 alpha-2 codes)
   */
  country?: string | string[];
}

let googleMapsLoaded = false;
let googleMapsLoadPromise: Promise<void> | null = null;

function loadGoogleMaps(): Promise<void> {
  if (googleMapsLoaded) {
    return Promise.resolve();
  }

  if (googleMapsLoadPromise) {
    return googleMapsLoadPromise;
  }

  googleMapsLoadPromise = new Promise((resolve, reject) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.warn("Google Maps API key not configured. Address autocomplete disabled.");
      reject(new Error("Google Maps API key not configured"));
      return;
    }

    // Check if already loaded
    if (window.google?.maps?.places) {
      googleMapsLoaded = true;
      resolve();
      return;
    }

    // Create callback
    window.initGoogleMapsCallback = () => {
      googleMapsLoaded = true;
      resolve();
    };

    // Load script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMapsCallback`;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });

  return googleMapsLoadPromise;
}

/**
 * AddressAutocomplete Component
 *
 * Input with Google Places autocomplete for address selection.
 * Shows address suggestions as user types.
 *
 * @example
 * ```tsx
 * <AddressAutocomplete
 *   label="Event Address"
 *   value={address}
 *   onChange={setAddress}
 *   onPlaceSelect={(place) => console.log(place)}
 *   placeholder="Enter address"
 *   required
 * />
 * ```
 */
export function AddressAutocomplete({
  label,
  value,
  onChange,
  onPlaceSelect,
  error,
  helperText,
  placeholder = "Start typing an address...",
  required = false,
  disabled = false,
  className,
  country = "us",
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApiAvailable, setIsApiAvailable] = useState(true);

  const inputId = `address-${label?.toLowerCase().replace(/\s+/g, "-") || "input"}`;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  // Initialize autocomplete
  const initAutocomplete = useCallback(() => {
    if (!inputRef.current || !window.google?.maps?.places) return;

    const options: google.maps.places.AutocompleteOptions = {
      types: ["address"],
      fields: ["formatted_address", "geometry", "name", "place_id", "address_components"],
    };

    if (country) {
      options.componentRestrictions = {
        country: Array.isArray(country) ? country : [country],
      };
    }

    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      inputRef.current,
      options
    );

    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current?.getPlace();
      if (place) {
        const formattedAddress = place.formatted_address || place.name || "";
        onChange(formattedAddress);
        onPlaceSelect?.(place);
      }
    });
  }, [country, onChange, onPlaceSelect]);

  // Load Google Maps API
  useEffect(() => {
    let mounted = true;

    loadGoogleMaps()
      .then(() => {
        if (mounted) {
          setIsLoading(false);
          setIsApiAvailable(true);
          initAutocomplete();
        }
      })
      .catch(() => {
        if (mounted) {
          setIsLoading(false);
          setIsApiAvailable(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [initAutocomplete]);

  // Handle manual input changes (fallback when no suggestion selected)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className="mb-2 block text-sm font-bold text-text-primary"
        >
          {label}
          {required && (
            <span className="ml-1 text-red-500" aria-label="required">
              *
            </span>
          )}
        </label>
      )}

      {/* Input container */}
      <div className="relative">
        {/* Map pin icon */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {isLoading ? (
            <Loader2 className="h-5 w-5 text-gray-400 animate-spin" aria-hidden="true" />
          ) : (
            <MapPin className="h-5 w-5 text-gray-400" aria-hidden="true" />
          )}
        </div>

        <input
          ref={inputRef}
          id={inputId}
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={isApiAvailable ? placeholder : "Enter address manually"}
          disabled={disabled || isLoading}
          required={required}
          className={cn(
            "neo-input w-full pl-10 pr-4 py-2.5 text-gray-900 transition-all duration-normal placeholder:text-gray-400",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100",
            error && "border-error focus:border-error focus:neo-shadow-primary"
          )}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          autoComplete="off"
        />
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

      {/* Helper text */}
      {!error && helperText && (
        <p id={helperId} className="mt-1 text-sm text-text-secondary">
          {helperText}
        </p>
      )}

      {/* API unavailable notice */}
      {!isLoading && !isApiAvailable && (
        <p className="mt-1 text-sm text-text-secondary">
          Address suggestions unavailable. Please type full address manually.
        </p>
      )}
    </div>
  );
}
