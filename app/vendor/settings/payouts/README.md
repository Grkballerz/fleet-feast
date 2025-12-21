# Vendor Payout Settings Page

**Route**: `/vendor/settings/payouts`
**Access**: Vendor role required
**Created**: 2025-12-20
**Agent**: Parker_Pages

## Overview

This page allows vendors to manage their payout bank account information and view payout history. It provides a secure interface for:

- Adding/updating bank account details
- Viewing bank account verification status
- Seeing pending earnings (in 7-day escrow)
- Viewing payout history with status tracking

## Features

### 1. Bank Account Management
- **Add Bank Account**: Uses `VendorBankAccountForm` component
- **Update Account**: Edit existing bank account details
- **Remove Account**: Delete bank account with confirmation modal
- **Verification Status**: Visual badge showing if account is verified

### 2. Pending Earnings
- Shows bookings awaiting payout (7-day escrow period)
- Displays total pending amount
- Lists individual bookings with event dates and payout dates
- Calculates expected payout dates

### 3. Payout History
- Table view of all payouts (past and pending)
- Columns: Date, Amount, Status, Bookings, Reference
- Status badges: Pending, Processing, Completed, Failed
- Responsive design (card layout on mobile, table on desktop)

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/vendor/bank-account` | GET | Fetch bank account details (masked) |
| `/api/vendor/bank-account` | POST | Add/update bank account |
| `/api/vendor/bank-account` | DELETE | Remove bank account |
| `/api/vendor/payouts` | GET | Fetch payout history |

## Components Used

### External Components
- `VendorBankAccountForm` - Bank account form with validation
- `Card` - Neo-brutalist card container
- `Button` - Action buttons
- `Badge` - Status indicators
- `Spinner` - Loading states
- `Alert` - Info/warning/error messages
- `Modal` - Confirmation dialogs

### Icons (lucide-react)
- `Building2` - Bank account section
- `DollarSign` - Money/payouts
- `Clock` - Pending status
- `CheckCircle` - Success/verified
- `AlertCircle` - Warning/error
- `Calendar` - Dates
- `CreditCard` - Payment method
- `Edit` - Update action
- `Trash2` - Delete action
- `FileText` - Payout history
- `TrendingUp` - Earnings
- `Shield` - Security

## Data Flow

```
User visits /vendor/settings/payouts
  ↓
fetchPayoutSettings()
  ├─ GET /api/vendor/bank-account → setBankAccount()
  ├─ GET /api/vendor/payouts → setPayouts()
  └─ Calculate pending earnings → setPendingEarnings()
  ↓
Display page with sections:
  ├─ Payout info banner
  ├─ Pending earnings summary (if any)
  ├─ Bank account section
  └─ Payout history table
```

## User Flows

### Add Bank Account
1. Click "Add Bank Account" button
2. Fill out `VendorBankAccountForm`
3. Submit form → POST /api/vendor/bank-account
4. Success → Close form, refresh data
5. Show verification pending alert

### Update Bank Account
1. Click "Update Account" button
2. Form opens with existing data
3. Modify fields
4. Submit → POST /api/vendor/bank-account
5. Success → Close form, refresh data

### Remove Bank Account
1. Click "Remove Account" button
2. Confirmation modal appears
3. Confirm deletion → DELETE /api/vendor/bank-account
4. Success → Clear bank account state

## Security

- Bank account numbers are **masked** (last 4 digits only)
- All sensitive data encrypted server-side (AES-256-GCM)
- Vendor authentication required (middleware)
- Deletion requires confirmation modal

## Responsive Design

- **Mobile**: Stacked layout, card-based payout history
- **Tablet**: 2-column grid for bank account details
- **Desktop**: Full table view for payout history, 2-column grid

## Future Enhancements

1. **Pending Earnings Endpoint**: Replace calculated pending earnings with dedicated API
2. **Payout Details Modal**: Click on payout row to see booking breakdown
3. **Export Functionality**: Download payout history as CSV/PDF
4. **Real-time Verification**: Webhook updates for bank verification status
5. **Multiple Bank Accounts**: Support for multiple payout destinations
6. **Payout Filters**: Filter by date range, status, amount

## Testing Checklist

- [ ] Page loads without errors
- [ ] Bank account form displays correctly
- [ ] Can add new bank account
- [ ] Can update existing bank account
- [ ] Can delete bank account (with confirmation)
- [ ] Payout history displays correctly
- [ ] Pending earnings shows correct data
- [ ] Status badges display correct colors
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Loading states display properly
- [ ] Error states are handled gracefully

## Related Files

- `components/vendor/VendorBankAccountForm.tsx` - Bank account form component
- `app/api/vendor/bank-account/route.ts` - Bank account API
- `app/api/vendor/payouts/route.ts` - Payouts API
- `modules/payout/payout.service.ts` - Payout service layer
- `modules/payout/payout.types.ts` - TypeScript types

## Notes

- 7-day escrow period is a business rule (defined in `payout.service.ts`)
- Bank verification is currently simulated (production would use payment gateway)
- Payout processing is stubbed (production would integrate with Helcim/Stripe)
