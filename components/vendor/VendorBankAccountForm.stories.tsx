import type { Meta, StoryObj } from "@storybook/react";
import { VendorBankAccountForm } from "./VendorBankAccountForm";

const meta: Meta<typeof VendorBankAccountForm> = {
  title: "Vendor/VendorBankAccountForm",
  component: VendorBankAccountForm,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Secure form for vendors to enter or update bank account details for payouts. Features account number masking, validation, confirmation step, and comprehensive security messaging.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    existingAccount: {
      description: "Existing bank account details (if updating)",
      control: "object",
    },
    onSuccess: {
      description: "Callback when form is successfully submitted",
      action: "success",
    },
    onCancel: {
      description: "Optional callback when form is cancelled",
      action: "cancel",
    },
  },
};

export default meta;
type Story = StoryObj<typeof VendorBankAccountForm>;

/**
 * Default state for adding a new bank account
 */
export const Default: Story = {
  args: {
    onSuccess: () => console.log("Success!"),
    onCancel: () => console.log("Cancelled"),
  },
};

/**
 * Form with existing account data (update mode)
 */
export const WithExistingAccount: Story = {
  args: {
    existingAccount: {
      holderName: "John's Food Truck LLC",
      accountNumberMasked: "****5678",
      routingNumber: "123456789",
      accountType: "CHECKING",
      bankName: "Chase Bank",
      verified: true,
    },
    onSuccess: () => console.log("Account updated!"),
    onCancel: () => console.log("Cancelled"),
  },
};

/**
 * Form without cancel button (required flow)
 */
export const WithoutCancel: Story = {
  args: {
    onSuccess: () => console.log("Success!"),
  },
};

/**
 * Form with savings account type pre-selected
 */
export const SavingsAccount: Story = {
  args: {
    existingAccount: {
      holderName: "Jane's Tacos",
      accountNumberMasked: "****9012",
      routingNumber: "987654321",
      accountType: "SAVINGS",
      bankName: "Bank of America",
      verified: true,
    },
    onSuccess: () => console.log("Success!"),
    onCancel: () => console.log("Cancelled"),
  },
};

/**
 * Unverified existing account
 */
export const UnverifiedAccount: Story = {
  args: {
    existingAccount: {
      holderName: "Bob's BBQ",
      accountNumberMasked: "****3456",
      routingNumber: "111222333",
      accountType: "CHECKING",
      verified: false,
    },
    onSuccess: () => console.log("Success!"),
    onCancel: () => console.log("Cancelled"),
  },
};
