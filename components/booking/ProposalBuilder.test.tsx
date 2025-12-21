import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProposalBuilder } from "./ProposalBuilder";
import { EventType } from "@prisma/client";

describe("ProposalBuilder", () => {
  const mockInquiry = {
    eventDate: "2025-01-15",
    eventTime: "18:00",
    guestCount: 100,
    eventType: "CORPORATE" as EventType,
    location: "123 Main St, New York, NY",
    specialRequests: "Vegetarian options needed",
  };

  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render inquiry details correctly", () => {
      render(<ProposalBuilder inquiry={mockInquiry} onSubmit={mockOnSubmit} />);

      expect(screen.getByText(/Event Details/i)).toBeInTheDocument();
      expect(screen.getByText(/100/)).toBeInTheDocument();
      expect(screen.getByText(/Corporate/i)).toBeInTheDocument();
      expect(screen.getByText(/123 Main St, New York, NY/)).toBeInTheDocument();
      expect(screen.getByText(/Vegetarian options needed/)).toBeInTheDocument();
    });

    it("should render with one default line item", () => {
      render(<ProposalBuilder inquiry={mockInquiry} onSubmit={mockOnSubmit} />);

      const nameInputs = screen.getAllByPlaceholderText(/e.g., Taco Bar Package/i);
      expect(nameInputs).toHaveLength(1);
    });

    it("should render all predefined inclusions", () => {
      render(<ProposalBuilder inquiry={mockInquiry} onSubmit={mockOnSubmit} />);

      expect(screen.getByText("Delivery")).toBeInTheDocument();
      expect(screen.getByText("Setup")).toBeInTheDocument();
      expect(screen.getByText("Cleanup")).toBeInTheDocument();
      expect(screen.getByText("Staff")).toBeInTheDocument();
      expect(screen.getByText("Equipment")).toBeInTheDocument();
    });

    it("should render fee breakdown with initial zero values", () => {
      render(<ProposalBuilder inquiry={mockInquiry} onSubmit={mockOnSubmit} />);

      expect(screen.getByText(/Fee Breakdown/i)).toBeInTheDocument();
      expect(screen.getByText(/Platform Fee \(5%\)/i)).toBeInTheDocument();
      expect(screen.getByText(/You Receive:/i)).toBeInTheDocument();
    });
  });

  describe("Line Items", () => {
    it("should add a new line item when Add Item is clicked", async () => {
      const user = userEvent.setup();
      render(<ProposalBuilder inquiry={mockInquiry} onSubmit={mockOnSubmit} />);

      const addButton = screen.getByRole("button", { name: /Add Item/i });
      await user.click(addButton);

      const nameInputs = screen.getAllByPlaceholderText(/e.g., Taco Bar Package/i);
      expect(nameInputs).toHaveLength(2);
    });

    it("should remove a line item when delete is clicked", async () => {
      const user = userEvent.setup();
      render(<ProposalBuilder inquiry={mockInquiry} onSubmit={mockOnSubmit} />);

      // Add a second item first
      const addButton = screen.getByRole("button", { name: /Add Item/i });
      await user.click(addButton);

      // Now remove one
      const deleteButtons = screen.getAllByLabelText(/Remove line item/i);
      await user.click(deleteButtons[0]);

      const nameInputs = screen.getAllByPlaceholderText(/e.g., Taco Bar Package/i);
      expect(nameInputs).toHaveLength(1);
    });

    it("should not allow removing the last line item", async () => {
      const user = userEvent.setup();
      render(<ProposalBuilder inquiry={mockInquiry} onSubmit={mockOnSubmit} />);

      const deleteButton = screen.getByLabelText(/Remove line item/i);
      expect(deleteButton).toBeDisabled();
    });

    it("should update line item values", async () => {
      const user = userEvent.setup();
      render(<ProposalBuilder inquiry={mockInquiry} onSubmit={mockOnSubmit} />);

      const nameInput = screen.getByPlaceholderText(/e.g., Taco Bar Package/i);
      const quantityInput = screen.getAllByRole("spinbutton")[0];
      const priceInput = screen.getAllByRole("spinbutton")[1];

      await user.type(nameInput, "Taco Bar Package");
      await user.clear(quantityInput);
      await user.type(quantityInput, "2");
      await user.clear(priceInput);
      await user.type(priceInput, "500");

      expect(nameInput).toHaveValue("Taco Bar Package");
      expect(quantityInput).toHaveValue(2);
      expect(priceInput).toHaveValue(500);
    });

    it("should calculate line item totals correctly", async () => {
      const user = userEvent.setup();
      render(<ProposalBuilder inquiry={mockInquiry} onSubmit={mockOnSubmit} />);

      const quantityInput = screen.getAllByRole("spinbutton")[0];
      const priceInput = screen.getAllByRole("spinbutton")[1];

      await user.clear(quantityInput);
      await user.type(quantityInput, "10");
      await user.clear(priceInput);
      await user.type(priceInput, "25");

      expect(screen.getByText("$250.00")).toBeInTheDocument();
    });
  });

  describe("Fee Calculations", () => {
    it("should calculate fees correctly with 5% platform fee", async () => {
      const user = userEvent.setup();
      render(<ProposalBuilder inquiry={mockInquiry} onSubmit={mockOnSubmit} />);

      const priceInput = screen.getAllByRole("spinbutton")[1];
      await user.clear(priceInput);
      await user.type(priceInput, "1000");

      // Subtotal: $1000
      expect(screen.getByText(/Subtotal:/)).toBeInTheDocument();

      // Platform fee: $50 (5%)
      await waitFor(() => {
        expect(screen.getByText(/-\$50\.00/)).toBeInTheDocument();
      });

      // Vendor receives: $950
      await waitFor(() => {
        expect(screen.getByText(/\$950\.00/)).toBeInTheDocument();
      });

      // Customer total: $1050 (subtotal + 5%)
      await waitFor(() => {
        expect(screen.getByText(/\$1050\.00/)).toBeInTheDocument();
      });
    });

    it("should update calculations when line items change", async () => {
      const user = userEvent.setup();
      render(<ProposalBuilder inquiry={mockInquiry} onSubmit={mockOnSubmit} />);

      const priceInput = screen.getAllByRole("spinbutton")[1];

      // Set initial price
      await user.clear(priceInput);
      await user.type(priceInput, "500");

      await waitFor(() => {
        expect(screen.getByText(/\$475\.00/)).toBeInTheDocument(); // Vendor receives
      });

      // Update price
      await user.clear(priceInput);
      await user.type(priceInput, "1000");

      await waitFor(() => {
        expect(screen.getByText(/\$950\.00/)).toBeInTheDocument(); // Updated vendor receives
      });
    });
  });

  describe("Inclusions", () => {
    it("should toggle predefined inclusions", async () => {
      const user = userEvent.setup();
      render(<ProposalBuilder inquiry={mockInquiry} onSubmit={mockOnSubmit} />);

      const deliveryCheckbox = screen.getByRole("checkbox", { name: /Delivery/i });

      expect(deliveryCheckbox).not.toBeChecked();
      await user.click(deliveryCheckbox);
      expect(deliveryCheckbox).toBeChecked();
      await user.click(deliveryCheckbox);
      expect(deliveryCheckbox).not.toBeChecked();
    });

    it("should add custom inclusions", async () => {
      const user = userEvent.setup();
      render(<ProposalBuilder inquiry={mockInquiry} onSubmit={mockOnSubmit} />);

      const customInput = screen.getByPlaceholderText(/Add a custom inclusion.../i);
      const addButton = screen.getByRole("button", { name: /^Add$/i });

      await user.type(customInput, "Custom Item");
      await user.click(addButton);

      expect(screen.getByText("Custom Item")).toBeInTheDocument();
      expect(customInput).toHaveValue("");
    });

    it("should add custom inclusion on Enter key", async () => {
      const user = userEvent.setup();
      render(<ProposalBuilder inquiry={mockInquiry} onSubmit={mockOnSubmit} />);

      const customInput = screen.getByPlaceholderText(/Add a custom inclusion.../i);

      await user.type(customInput, "Custom Item{Enter}");

      expect(screen.getByText("Custom Item")).toBeInTheDocument();
      expect(customInput).toHaveValue("");
    });

    it("should remove custom inclusions", async () => {
      const user = userEvent.setup();
      render(<ProposalBuilder inquiry={mockInquiry} onSubmit={mockOnSubmit} />);

      const customInput = screen.getByPlaceholderText(/Add a custom inclusion.../i);
      const addButton = screen.getByRole("button", { name: /^Add$/i });

      await user.type(customInput, "Custom Item");
      await user.click(addButton);

      const removeButton = screen.getByLabelText(/Remove Custom Item/i);
      await user.click(removeButton);

      expect(screen.queryByText("Custom Item")).not.toBeInTheDocument();
    });

    it("should not add duplicate custom inclusions", async () => {
      const user = userEvent.setup();
      render(<ProposalBuilder inquiry={mockInquiry} onSubmit={mockOnSubmit} />);

      const customInput = screen.getByPlaceholderText(/Add a custom inclusion.../i);
      const addButton = screen.getByRole("button", { name: /^Add$/i });

      await user.type(customInput, "Custom Item");
      await user.click(addButton);
      await user.type(customInput, "Custom Item");
      await user.click(addButton);

      const customItems = screen.getAllByText("Custom Item");
      expect(customItems).toHaveLength(1);
    });
  });

  describe("Terms", () => {
    it("should update terms text", async () => {
      const user = userEvent.setup();
      render(<ProposalBuilder inquiry={mockInquiry} onSubmit={mockOnSubmit} />);

      const termsTextarea = screen.getByPlaceholderText(
        /Enter any terms and conditions.../i
      );

      await user.type(termsTextarea, "50% deposit required");

      expect(termsTextarea).toHaveValue("50% deposit required");
    });
  });

  describe("Expiration", () => {
    it("should default to 7 days expiration", () => {
      render(<ProposalBuilder inquiry={mockInquiry} onSubmit={mockOnSubmit} />);

      const sevenDayButton = screen.getByRole("button", { name: /^7 days$/i });
      expect(sevenDayButton).toHaveClass("border-primary");
    });

    it("should change expiration days", async () => {
      const user = userEvent.setup();
      render(<ProposalBuilder inquiry={mockInquiry} onSubmit={mockOnSubmit} />);

      const fourteenDayButton = screen.getByRole("button", { name: /^14 days$/i });
      await user.click(fourteenDayButton);

      expect(fourteenDayButton).toHaveClass("border-primary");
    });
  });

  describe("Validation", () => {
    it("should show error when line item has no name", async () => {
      const user = userEvent.setup();
      render(<ProposalBuilder inquiry={mockInquiry} onSubmit={mockOnSubmit} />);

      const priceInput = screen.getAllByRole("spinbutton")[1];
      await user.clear(priceInput);
      await user.type(priceInput, "100");

      const submitButton = screen.getByRole("button", { name: /Send Proposal/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Item name is required/i)).toBeInTheDocument();
      });
    });

    it("should show error when line item has zero or negative price", async () => {
      const user = userEvent.setup();
      render(<ProposalBuilder inquiry={mockInquiry} onSubmit={mockOnSubmit} />);

      const nameInput = screen.getByPlaceholderText(/e.g., Taco Bar Package/i);
      await user.type(nameInput, "Test Item");

      const submitButton = screen.getByRole("button", { name: /Send Proposal/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Price must be greater than 0/i)).toBeInTheDocument();
      });
    });

    it("should show error when total is zero", async () => {
      const user = userEvent.setup();
      render(<ProposalBuilder inquiry={mockInquiry} onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole("button", { name: /Send Proposal/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Total must be greater than \$0/i)).toBeInTheDocument();
      });
    });

    it("should clear validation errors when fields are corrected", async () => {
      const user = userEvent.setup();
      render(<ProposalBuilder inquiry={mockInquiry} onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole("button", { name: /Send Proposal/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Item name is required/i)).toBeInTheDocument();
      });

      const nameInput = screen.getByPlaceholderText(/e.g., Taco Bar Package/i);
      await user.type(nameInput, "Test Item");

      expect(screen.queryByText(/Item name is required/i)).not.toBeInTheDocument();
    });
  });

  describe("Submission", () => {
    it("should open confirmation modal on valid submission", async () => {
      const user = userEvent.setup();
      render(<ProposalBuilder inquiry={mockInquiry} onSubmit={mockOnSubmit} />);

      const nameInput = screen.getByPlaceholderText(/e.g., Taco Bar Package/i);
      const priceInput = screen.getAllByRole("spinbutton")[1];

      await user.type(nameInput, "Taco Bar Package");
      await user.clear(priceInput);
      await user.type(priceInput, "1000");

      const submitButton = screen.getByRole("button", { name: /Send Proposal/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Confirm Proposal/i)).toBeInTheDocument();
        expect(screen.getByText(/Proposal Summary/i)).toBeInTheDocument();
      });
    });

    it("should call onSubmit with correct data when confirmed", async () => {
      const user = userEvent.setup();
      render(<ProposalBuilder inquiry={mockInquiry} onSubmit={mockOnSubmit} />);

      const nameInput = screen.getByPlaceholderText(/e.g., Taco Bar Package/i);
      const quantityInput = screen.getAllByRole("spinbutton")[0];
      const priceInput = screen.getAllByRole("spinbutton")[1];

      await user.type(nameInput, "Taco Bar");
      await user.clear(quantityInput);
      await user.type(quantityInput, "2");
      await user.clear(priceInput);
      await user.type(priceInput, "500");

      const deliveryCheckbox = screen.getByRole("checkbox", { name: /Delivery/i });
      await user.click(deliveryCheckbox);

      const termsTextarea = screen.getByPlaceholderText(
        /Enter any terms and conditions.../i
      );
      await user.type(termsTextarea, "Test terms");

      const submitButton = screen.getByRole("button", { name: /Send Proposal/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Confirm Proposal/i)).toBeInTheDocument();
      });

      const confirmButton = screen.getAllByRole("button", { name: /Send Proposal/i })[1];
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            lineItems: expect.arrayContaining([
              expect.objectContaining({
                name: "Taco Bar",
                quantity: 2,
                unitPrice: 500,
              }),
            ]),
            inclusions: expect.arrayContaining(["Delivery"]),
            terms: "Test terms",
            expirationDays: 7,
            subtotal: 1000,
            platformFee: 50,
            customerTotal: 1050,
            vendorReceives: 950,
          })
        );
      });
    });

    it("should disable submit button when loading", () => {
      render(
        <ProposalBuilder inquiry={mockInquiry} onSubmit={mockOnSubmit} isLoading={true} />
      );

      const submitButton = screen.getByRole("button", { name: /Loading.../i });
      expect(submitButton).toBeDisabled();
    });

    it("should disable submit button when total is zero", () => {
      render(<ProposalBuilder inquiry={mockInquiry} onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole("button", { name: /Send Proposal/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      render(<ProposalBuilder inquiry={mockInquiry} onSubmit={mockOnSubmit} />);

      expect(screen.getByLabelText(/Remove line item/i)).toBeInTheDocument();
    });

    it("should support keyboard navigation for inclusions", async () => {
      const user = userEvent.setup();
      render(<ProposalBuilder inquiry={mockInquiry} onSubmit={mockOnSubmit} />);

      const deliveryCheckbox = screen.getByRole("checkbox", { name: /Delivery/i });

      deliveryCheckbox.focus();
      expect(deliveryCheckbox).toHaveFocus();

      await user.keyboard(" ");
      expect(deliveryCheckbox).toBeChecked();
    });
  });
});
