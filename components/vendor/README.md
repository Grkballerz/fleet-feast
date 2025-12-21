# Vendor Components

React components specifically designed for vendor-facing features in Fleet-Feast.

## Components

### VendorBankAccountForm

Secure form for vendors to enter or update their bank account details for receiving payouts.

#### Features

- **Account Number Masking**: Password-style fields with show/hide toggle for security
- **Validation**:
  - Account holder name (min 2 characters)
  - Account number (4-17 digits)
  - Routing number (9 digits for US banks)
  - Account number confirmation (must match)
- **Confirmation Step**: Modal confirmation before final submission
- **Security Messaging**: Clear communication about encryption and PCI compliance
- **Loading States**: Visual feedback during submission
- **Error Handling**: Toast notifications for errors
- **Success Feedback**: Confirmation message on successful save
- **Responsive Design**: Works on all screen sizes
- **Accessibility**: ARIA labels, keyboard navigation, proper error announcements

#### Props

```typescript
interface VendorBankAccountFormProps {
  existingAccount?: {
    holderName: string;
    accountNumberMasked: string; // e.g., "****1234"
    routingNumber: string;
    accountType: 'CHECKING' | 'SAVINGS';
    bankName?: string;
    verified: boolean;
  };
  onSuccess: () => void;
  onCancel?: () => void;
}
```

#### Usage

**Add New Bank Account**

```tsx
import { VendorBankAccountForm } from '@/components/vendor/VendorBankAccountForm';

export default function BankSetupPage() {
  return (
    <VendorBankAccountForm
      onSuccess={() => router.push('/vendor/dashboard')}
      onCancel={() => router.back()}
    />
  );
}
```

**Update Existing Account**

```tsx
import { VendorBankAccountForm } from '@/components/vendor/VendorBankAccountForm';

export default function BankSettingsPage({ vendorAccount }) {
  return (
    <VendorBankAccountForm
      existingAccount={vendorAccount}
      onSuccess={() => {
        toast.success('Bank account updated!');
        router.refresh();
      }}
    />
  );
}
```

**Required Flow (No Cancel)**

```tsx
import { VendorBankAccountForm } from '@/components/vendor/VendorBankAccountForm';

export default function OnboardingBankPage() {
  return (
    <VendorBankAccountForm
      onSuccess={() => router.push('/vendor/onboarding/verification')}
    />
  );
}
```

#### API Integration

The component expects a POST endpoint at `/api/vendor/bank-account` with the following request body:

```typescript
{
  holderName: string;
  accountNumber: string; // digits only, no formatting
  routingNumber: string; // 9 digits
  accountType: 'CHECKING' | 'SAVINGS';
  bankName?: string;
}
```

Expected response:

```typescript
// Success (200)
{
  success: true;
  message: string;
}

// Error (4xx/5xx)
{
  success: false;
  message: string;
}
```

#### Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| Account Holder Name | Required, min 2 chars | "Account holder name is required" |
| Account Number | Required, 4-17 digits | "Account number must be 4-17 digits" |
| Confirm Account Number | Must match account number | "Account numbers do not match" |
| Routing Number | Required, exactly 9 digits | "Routing number must be 9 digits" |
| Account Type | Required, CHECKING or SAVINGS | N/A (selection required) |

#### Security Features

1. **Encryption**: All data transmitted over HTTPS with TLS 1.3
2. **Input Masking**: Account numbers displayed as password fields by default
3. **No Plain Text Storage**: Backend should hash/encrypt sensitive data
4. **PCI Compliance**: Component follows PCI DSS guidelines
5. **Confirmation Step**: Prevents accidental submissions
6. **Visual Security Indicators**: Shield icons and security messaging

#### Accessibility

- ARIA labels on all form fields
- Password visibility toggles with proper announcements
- Error messages announced to screen readers
- Keyboard navigation support
- Focus management in modal dialogs
- Required fields clearly marked with asterisks
- Helper text for guidance

#### Styling

Follows Fleet-Feast's neo-brutalist design system:
- Neo-bordered cards with shadows
- Bold typography
- High-contrast colors
- Hover and focus states
- Smooth transitions

#### Testing Checklist

- [ ] Can submit valid bank account
- [ ] Validation errors display correctly
- [ ] Account numbers must match
- [ ] Routing number must be 9 digits
- [ ] Account type selection works
- [ ] Show/hide password toggles work
- [ ] Confirmation modal displays all details
- [ ] Success message appears after submission
- [ ] Error handling works for API failures
- [ ] Cancel button works (when provided)
- [ ] Loading states display during submission
- [ ] Keyboard navigation works
- [ ] Screen reader announces errors
- [ ] Mobile responsive layout works

#### Future Enhancements

- [ ] Bank name auto-lookup by routing number
- [ ] Micro-deposit verification flow
- [ ] Support for international bank accounts
- [ ] Plaid integration for instant verification
- [ ] Save multiple bank accounts
- [ ] Bank logo display
