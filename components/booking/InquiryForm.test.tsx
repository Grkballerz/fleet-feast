import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InquiryForm, InquiryFormProps, InquiryRequestData } from "./InquiryForm";
import { CuisineType } from "@/types";

describe("InquiryForm", () => {
  const mockVendor = {
    id: "vendor-123",
    businessName: "Taco Truck Supreme",
    cuisineType: CuisineType.MEXICAN,
    capacityMin: 25,
    capacityMax: 150,
  };

  const mockOnSubmit = jest.fn();

  const defaultProps: InquiryFormProps = {
    vendor: mockVendor,
    onSubmit: mockOnSubmit,
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all form fields", () => {
    render(<InquiryForm {...defaultProps} />);

    expect(screen.getByLabelText(/event date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/event time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/event type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/guest count/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/event address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/additional details/i)).toBeInTheDocument();
  });

  it("displays vendor name in info alert", () => {
    render(<InquiryForm {...defaultProps} />);

    expect(screen.getByText(/Taco Truck Supreme/i)).toBeInTheDocument();
    expect(screen.getByText(/request a quote/i)).toBeInTheDocument();
  });

  it("shows required field indicators", () => {
    render(<InquiryForm {...defaultProps} />);

    const requiredFields = screen.getAllByText("*");
    expect(requiredFields.length).toBeGreaterThan(0);
  });

  it("displays capacity range helper text", () => {
    render(<InquiryForm {...defaultProps} />);

    expect(screen.getByText(/Min: 25, Max: 150/i)).toBeInTheDocument();
  });

  describe("Validation", () => {
    it("validates event date is required", async () => {
      const user = userEvent.setup();
      render(<InquiryForm {...defaultProps} />);

      const submitButton = screen.getByRole("button", { name: /request a quote/i });
      await user.click(submitButton);

      expect(await screen.findByText(/event date is required/i)).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("validates event date must be in the future", async () => {
      const user = userEvent.setup();
      render(<InquiryForm {...defaultProps} />);

      const today = new Date();
      const dateInput = screen.getByLabelText(/event date/i);
      await user.type(dateInput, today.toISOString().split("T")[0]);

      const submitButton = screen.getByRole("button", { name: /request a quote/i });
      await user.click(submitButton);

      expect(await screen.findByText(/must be at least 1 day in advance/i)).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("validates event time is required", async () => {
      const user = userEvent.setup();
      render(<InquiryForm {...defaultProps} />);

      const submitButton = screen.getByRole("button", { name: /request a quote/i });
      await user.click(submitButton);

      expect(await screen.findByText(/event time is required/i)).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("validates location is required", async () => {
      const user = userEvent.setup();
      render(<InquiryForm {...defaultProps} />);

      const submitButton = screen.getByRole("button", { name: /request a quote/i });
      await user.click(submitButton);

      expect(await screen.findByText(/event location is required/i)).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("validates guest count minimum", async () => {
      const user = userEvent.setup();
      render(<InquiryForm {...defaultProps} />);

      const guestInput = screen.getByLabelText(/guest count/i);
      await user.clear(guestInput);
      await user.type(guestInput, "10");

      const submitButton = screen.getByRole("button", { name: /request a quote/i });
      await user.click(submitButton);

      expect(await screen.findByText(/minimum 25 guests required/i)).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("validates guest count maximum", async () => {
      const user = userEvent.setup();
      render(<InquiryForm {...defaultProps} />);

      const guestInput = screen.getByLabelText(/guest count/i);
      await user.clear(guestInput);
      await user.type(guestInput, "200");

      const submitButton = screen.getByRole("button", { name: /request a quote/i });
      await user.click(submitButton);

      expect(await screen.findByText(/maximum 150 guests allowed/i)).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("clears field error when user corrects input", async () => {
      const user = userEvent.setup();
      render(<InquiryForm {...defaultProps} />);

      const guestInput = screen.getByLabelText(/guest count/i);
      await user.clear(guestInput);
      await user.type(guestInput, "10");

      const submitButton = screen.getByRole("button", { name: /request a quote/i });
      await user.click(submitButton);

      expect(await screen.findByText(/minimum 25 guests required/i)).toBeInTheDocument();

      await user.clear(guestInput);
      await user.type(guestInput, "50");

      expect(screen.queryByText(/minimum 25 guests required/i)).not.toBeInTheDocument();
    });
  });

  describe("Form Submission", () => {
    const getTomorrowDate = () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 2);
      return tomorrow.toISOString().split("T")[0];
    };

    it("submits valid form data", async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockResolvedValue(undefined);

      render(<InquiryForm {...defaultProps} />);

      await user.type(screen.getByLabelText(/event date/i), getTomorrowDate());
      await user.type(screen.getByLabelText(/event time/i), "14:00");
      await user.selectOptions(screen.getByLabelText(/event type/i), "WEDDING");
      await user.clear(screen.getByLabelText(/guest count/i));
      await user.type(screen.getByLabelText(/guest count/i), "75");
      await user.type(screen.getByLabelText(/event address/i), "123 Main St, City, State 12345");
      await user.type(screen.getByLabelText(/additional details/i), "Vegetarian options needed");

      const submitButton = screen.getByRole("button", { name: /request a quote/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          eventDate: getTomorrowDate(),
          eventTime: "14:00",
          eventType: "WEDDING",
          location: "123 Main St, City, State 12345",
          guestCount: 75,
          specialRequests: "Vegetarian options needed",
        });
      });
    });

    it("shows success message after successful submission", async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockResolvedValue(undefined);

      render(<InquiryForm {...defaultProps} />);

      await user.type(screen.getByLabelText(/event date/i), getTomorrowDate());
      await user.type(screen.getByLabelText(/event time/i), "14:00");
      await user.type(screen.getByLabelText(/event address/i), "123 Main St");

      const submitButton = screen.getByRole("button", { name: /request a quote/i });
      await user.click(submitButton);

      expect(await screen.findByText(/inquiry submitted!/i)).toBeInTheDocument();
      expect(screen.getByText(/they will respond within 24-48 hours/i)).toBeInTheDocument();
    });

    it("resets form after successful submission", async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockResolvedValue(undefined);

      render(<InquiryForm {...defaultProps} />);

      const dateInput = screen.getByLabelText(/event date/i) as HTMLInputElement;
      const locationInput = screen.getByLabelText(/event address/i) as HTMLInputElement;

      await user.type(dateInput, getTomorrowDate());
      await user.type(screen.getByLabelText(/event time/i), "14:00");
      await user.type(locationInput, "123 Main St");

      const submitButton = screen.getByRole("button", { name: /request a quote/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(dateInput.value).toBe("");
        expect(locationInput.value).toBe("");
      });
    });

    it("displays error message on submission failure", async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockRejectedValue(new Error("Network error"));

      render(<InquiryForm {...defaultProps} />);

      await user.type(screen.getByLabelText(/event date/i), getTomorrowDate());
      await user.type(screen.getByLabelText(/event time/i), "14:00");
      await user.type(screen.getByLabelText(/event address/i), "123 Main St");

      const submitButton = screen.getByRole("button", { name: /request a quote/i });
      await user.click(submitButton);

      expect(await screen.findByText(/network error/i)).toBeInTheDocument();
    });

    it("dismisses error alert when user clicks dismiss", async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockRejectedValue(new Error("Network error"));

      render(<InquiryForm {...defaultProps} />);

      await user.type(screen.getByLabelText(/event date/i), getTomorrowDate());
      await user.type(screen.getByLabelText(/event time/i), "14:00");
      await user.type(screen.getByLabelText(/event address/i), "123 Main St");

      const submitButton = screen.getByRole("button", { name: /request a quote/i });
      await user.click(submitButton);

      expect(await screen.findByText(/network error/i)).toBeInTheDocument();

      const dismissButton = screen.getByLabelText(/dismiss alert/i);
      await user.click(dismissButton);

      expect(screen.queryByText(/network error/i)).not.toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    it("disables submit button when loading", () => {
      render(<InquiryForm {...defaultProps} isLoading={true} />);

      const submitButton = screen.getByRole("button", { name: /submitting/i });
      expect(submitButton).toBeDisabled();
    });

    it("shows loading text on submit button when loading", () => {
      render(<InquiryForm {...defaultProps} isLoading={true} />);

      expect(screen.getByText(/submitting/i)).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels for required fields", () => {
      render(<InquiryForm {...defaultProps} />);

      const dateInput = screen.getByLabelText(/event date/i);
      const timeInput = screen.getByLabelText(/event time/i);
      const locationInput = screen.getByLabelText(/event address/i);

      expect(dateInput).toBeRequired();
      expect(timeInput).toBeRequired();
      expect(locationInput).toBeRequired();
    });

    it("marks invalid fields with aria-invalid", async () => {
      const user = userEvent.setup();
      render(<InquiryForm {...defaultProps} />);

      const guestInput = screen.getByLabelText(/guest count/i);
      await user.clear(guestInput);
      await user.type(guestInput, "10");

      const submitButton = screen.getByRole("button", { name: /request a quote/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(guestInput).toHaveAttribute("aria-invalid", "true");
      });
    });

    it("provides helper text via aria-describedby", () => {
      render(<InquiryForm {...defaultProps} />);

      const guestInput = screen.getByLabelText(/guest count/i);
      expect(guestInput).toHaveAttribute("aria-describedby", "guestCount-helper");
    });

    it("announces errors with role=alert", async () => {
      const user = userEvent.setup();
      render(<InquiryForm {...defaultProps} />);

      const submitButton = screen.getByRole("button", { name: /request a quote/i });
      await user.click(submitButton);

      const alerts = await screen.findAllByRole("alert");
      expect(alerts.length).toBeGreaterThan(0);
    });
  });

  describe("Event Type Selection", () => {
    it("defaults to CORPORATE event type", () => {
      render(<InquiryForm {...defaultProps} />);

      const select = screen.getByLabelText(/event type/i) as HTMLSelectElement;
      expect(select.value).toBe("CORPORATE");
    });

    it("allows selecting different event types", async () => {
      const user = userEvent.setup();
      render(<InquiryForm {...defaultProps} />);

      const select = screen.getByLabelText(/event type/i);
      await user.selectOptions(select, "WEDDING");

      expect((select as HTMLSelectElement).value).toBe("WEDDING");
    });

    it("includes all event type options", () => {
      render(<InquiryForm {...defaultProps} />);

      expect(screen.getByRole("option", { name: /corporate event/i })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: /wedding/i })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: /birthday party/i })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: /festival/i })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: /private party/i })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: /other/i })).toBeInTheDocument();
    });
  });

  describe("Special Requests", () => {
    it("is optional and allows empty value", async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockResolvedValue(undefined);

      render(<InquiryForm {...defaultProps} />);

      const getTomorrowDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 2);
        return tomorrow.toISOString().split("T")[0];
      };

      await user.type(screen.getByLabelText(/event date/i), getTomorrowDate());
      await user.type(screen.getByLabelText(/event time/i), "14:00");
      await user.type(screen.getByLabelText(/event address/i), "123 Main St");

      const submitButton = screen.getByRole("button", { name: /request a quote/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            specialRequests: "",
          })
        );
      });
    });

    it("shows character count for special requests", () => {
      render(<InquiryForm {...defaultProps} />);

      expect(screen.getByText(/0\/1000/i)).toBeInTheDocument();
    });

    it("updates character count as user types", async () => {
      const user = userEvent.setup();
      render(<InquiryForm {...defaultProps} />);

      const textarea = screen.getByLabelText(/additional details/i);
      await user.type(textarea, "Test");

      expect(screen.getByText(/4\/1000/i)).toBeInTheDocument();
    });
  });
});
