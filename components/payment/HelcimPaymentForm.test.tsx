import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { HelcimPaymentForm } from "./HelcimPaymentForm";

// Mock environment variable
const MOCK_CONFIG_TOKEN = "test-config-token-123";

describe("HelcimPaymentForm", () => {
  const mockOnSuccess = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Set up environment variable
    process.env.NEXT_PUBLIC_HELCIM_JS_CONFIG_TOKEN = MOCK_CONFIG_TOKEN;
    // Clean up any existing scripts
    const existingScripts = document.querySelectorAll(
      'script[src*="helcim"]'
    );
    existingScripts.forEach((script) => script.remove());
    // Reset window.helcim
    delete (window as any).helcim;
  });

  afterEach(() => {
    // Clean up
    const scripts = document.querySelectorAll('script[src*="helcim"]');
    scripts.forEach((script) => script.remove());
    delete (window as any).helcim;
  });

  describe("Script Loading", () => {
    it("should render loading state initially", () => {
      render(
        <HelcimPaymentForm
          amount={10000}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      expect(screen.getByText(/loading payment form/i)).toBeInTheDocument();
    });

    it("should show error when NEXT_PUBLIC_HELCIM_JS_CONFIG_TOKEN is missing", () => {
      delete process.env.NEXT_PUBLIC_HELCIM_JS_CONFIG_TOKEN;

      render(
        <HelcimPaymentForm
          amount={10000}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      expect(
        screen.getByText(/NEXT_PUBLIC_HELCIM_JS_CONFIG_TOKEN is not configured/i)
      ).toBeInTheDocument();
      expect(mockOnError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining("NEXT_PUBLIC_HELCIM_JS_CONFIG_TOKEN"),
        })
      );
    });

    it("should add Helcim script to document body", () => {
      render(
        <HelcimPaymentForm
          amount={10000}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      const script = document.querySelector(
        'script[src="https://myhelcim.com/js/version2.js"]'
      );
      expect(script).toBeInTheDocument();
      expect(script).toHaveAttribute("async");
    });

    it("should not add duplicate scripts if already loaded", () => {
      // Pre-load script
      const existingScript = document.createElement("script");
      existingScript.src = "https://myhelcim.com/js/version2.js";
      document.body.appendChild(existingScript);

      render(
        <HelcimPaymentForm
          amount={10000}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      const scripts = document.querySelectorAll(
        'script[src="https://myhelcim.com/js/version2.js"]'
      );
      expect(scripts).toHaveLength(1);
    });

    it("should call onError when script fails to load", async () => {
      render(
        <HelcimPaymentForm
          amount={10000}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      // Simulate script load error
      const script = document.querySelector(
        'script[src="https://myhelcim.com/js/version2.js"]'
      );
      fireEvent.error(script!);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expect.stringContaining("Failed to load Helcim.js"),
          })
        );
      });
    });
  });

  describe("Component Rendering", () => {
    beforeEach(() => {
      // Mock successful script load
      (window as any).helcim = {
        appendHelcimIframe: jest.fn(),
      };
    });

    it("should display the correct amount", async () => {
      render(
        <HelcimPaymentForm
          amount={15000}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      // Simulate script load
      const script = document.querySelector('script[src*="helcim"]');
      fireEvent.load(script!);

      await waitFor(() => {
        expect(screen.getByText("$150.00")).toBeInTheDocument();
      });
    });

    it("should display custom button text when provided", async () => {
      render(
        <HelcimPaymentForm
          amount={10000}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
          buttonText="Pay Now"
        />
      );

      const script = document.querySelector('script[src*="helcim"]');
      fireEvent.load(script!);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /pay now/i })).toBeInTheDocument();
      });
    });

    it("should show security badge", async () => {
      render(
        <HelcimPaymentForm
          amount={10000}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      const script = document.querySelector('script[src*="helcim"]');
      fireEvent.load(script!);

      await waitFor(() => {
        expect(
          screen.getByText(/secure payment powered by helcim/i)
        ).toBeInTheDocument();
      });
    });

    it("should apply custom className", () => {
      const { container } = render(
        <HelcimPaymentForm
          amount={10000}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
          className="custom-class"
        />
      );

      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  describe("Helcim Initialization", () => {
    it("should call appendHelcimIframe with correct config", async () => {
      const mockAppendHelcimIframe = jest.fn();
      (window as any).helcim = {
        appendHelcimIframe: mockAppendHelcimIframe,
      };

      render(
        <HelcimPaymentForm
          amount={10000}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      const script = document.querySelector('script[src*="helcim"]');
      fireEvent.load(script!);

      await waitFor(() => {
        expect(mockAppendHelcimIframe).toHaveBeenCalledWith(
          expect.objectContaining({
            token: MOCK_CONFIG_TOKEN,
            onSuccess: expect.any(Function),
            onError: expect.any(Function),
            onReady: expect.any(Function),
          })
        );
      });
    });

    it("should handle initialization errors", async () => {
      const mockAppendHelcimIframe = jest.fn(() => {
        throw new Error("Initialization failed");
      });
      (window as any).helcim = {
        appendHelcimIframe: mockAppendHelcimIframe,
      };

      render(
        <HelcimPaymentForm
          amount={10000}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      const script = document.querySelector('script[src*="helcim"]');
      fireEvent.load(script!);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expect.stringContaining("Initialization failed"),
          })
        );
      });
    });
  });

  describe("Payment Flow", () => {
    let mockAppendHelcimIframe: jest.Mock;
    let onSuccessCallback: (response: any) => void;
    let onErrorCallback: (error: any) => void;
    let onReadyCallback: () => void;

    beforeEach(() => {
      mockAppendHelcimIframe = jest.fn((config) => {
        onSuccessCallback = config.onSuccess;
        onErrorCallback = config.onError;
        onReadyCallback = config.onReady;
      });
      (window as any).helcim = {
        appendHelcimIframe: mockAppendHelcimIframe,
      };
    });

    it("should call onSuccess when tokenization succeeds", async () => {
      render(
        <HelcimPaymentForm
          amount={10000}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      const script = document.querySelector('script[src*="helcim"]');
      fireEvent.load(script!);

      await waitFor(() => {
        expect(mockAppendHelcimIframe).toHaveBeenCalled();
      });

      // Simulate successful tokenization
      onSuccessCallback({ cardToken: "tok_test_123" });

      expect(mockOnSuccess).toHaveBeenCalledWith("tok_test_123");
    });

    it("should call onError when tokenization fails", async () => {
      render(
        <HelcimPaymentForm
          amount={10000}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      const script = document.querySelector('script[src*="helcim"]');
      fireEvent.load(script!);

      await waitFor(() => {
        expect(mockAppendHelcimIframe).toHaveBeenCalled();
      });

      // Simulate tokenization error
      onErrorCallback({ error: "CARD_DECLINED", message: "Card was declined" });

      expect(mockOnError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Card was declined",
        })
      );
    });

    it("should disable button when disabled prop is true", async () => {
      render(
        <HelcimPaymentForm
          amount={10000}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
          disabled={true}
        />
      );

      const script = document.querySelector('script[src*="helcim"]');
      fireEvent.load(script!);

      await waitFor(() => {
        onReadyCallback();
      });

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });
  });

  describe("Accessibility", () => {
    beforeEach(() => {
      (window as any).helcim = {
        appendHelcimIframe: jest.fn(),
      };
    });

    it("should have proper ARIA labels", async () => {
      render(
        <HelcimPaymentForm
          amount={10000}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      const script = document.querySelector('script[src*="helcim"]');
      fireEvent.load(script!);

      await waitFor(() => {
        const container = screen.getByRole("form");
        expect(container).toBeInTheDocument();
      });
    });

    it("should have aria-live region for iframe container", async () => {
      render(
        <HelcimPaymentForm
          amount={10000}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      const script = document.querySelector('script[src*="helcim"]');
      fireEvent.load(script!);

      await waitFor(() => {
        const container = document.getElementById("helcim-iframe-container");
        expect(container).toHaveAttribute("aria-live", "polite");
      });
    });
  });

  describe("Amount Formatting", () => {
    beforeEach(() => {
      (window as any).helcim = {
        appendHelcimIframe: jest.fn(),
      };
    });

    it("should format amounts correctly", async () => {
      const { rerender } = render(
        <HelcimPaymentForm
          amount={10000}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      const script = document.querySelector('script[src*="helcim"]');
      fireEvent.load(script!);

      await waitFor(() => {
        expect(screen.getByText("$100.00")).toBeInTheDocument();
      });

      rerender(
        <HelcimPaymentForm
          amount={25050}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      await waitFor(() => {
        expect(screen.getByText("$250.50")).toBeInTheDocument();
      });
    });
  });
});
