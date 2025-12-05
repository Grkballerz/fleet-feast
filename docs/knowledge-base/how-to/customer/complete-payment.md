# How to Complete Payment

Understanding Fleet Feast's payment process ensures smooth transactions for your food truck bookings.

## Payment Overview

Fleet Feast uses a two-stage payment process:
1. **Deposit**: Charged when vendor accepts (typically 50%)
2. **Final Payment**: Charged 72 hours before event (remaining balance)

All payments are processed securely through Stripe.

## Payment Timeline

```
Booking Request → Vendor Accepts → Deposit Charged
                                   ↓
                            [Time passes]
                                   ↓
                 72 Hours Before Event → Final Payment Charged
                                   ↓
                            Event Happens
                                   ↓
                   7 Days After Event → Vendor Receives Payment
```

## Step-by-Step: Adding a Payment Method

### 1. Access Payment Settings

**During Booking:**
- Payment section appears in booking request form
- Add card before submitting request

**From Account Settings:**
- Log in to your account
- Click "Settings" in top menu
- Select "Payment Methods"
- Click "Add Payment Method"

### 2. Enter Card Information

**Required Information:**
- **Card Number**: 16-digit number on front of card
- **Expiration Date**: MM/YY format
- **CVV/CVC**: 3-4 digit security code on back
- **Cardholder Name**: Name as it appears on card

**Billing Address:**
- Street address
- City, State, ZIP
- Country

### 3. Save Card (Optional)

- Check "Save this card for future bookings"
- Securely stored by Stripe (PCI compliant)
- Easy checkout for future bookings
- Can be removed anytime

### 4. Set as Default (Optional)

- Check "Make this my default payment method"
- Used automatically for future bookings
- Can be changed anytime

### 5. Verify and Save

- Click "Add Payment Method"
- May require 3D Secure verification (popup window)
- Follow prompts from your bank if needed
- Confirmation message appears when successful

## Payment Process Details

### Deposit Payment (50%)

**When It's Charged:**
- Immediately when vendor accepts your booking request
- Authorization hold may appear earlier (not a charge)

**Amount:**
- Typically 50% of total booking cost
- Includes 50% of all fees
- Exact amount shown in booking summary

**Confirmation:**
- Email receipt sent immediately
- Available in "My Bookings" → "Payment History"
- Invoice generated with booking details

### Final Payment (Remaining 50%)

**When It's Charged:**
- Automatically 72 hours (3 days) before event
- Uses your saved payment method
- Cannot be processed manually earlier

**Amount:**
- Remaining 50% of total booking cost
- Includes remaining fees
- Total minus deposit already paid

**Confirmation:**
- Email notification sent
- Receipt available in account
- Final invoice updated

**What If Card Is Declined:**
- You'll receive immediate email notification
- 24-hour grace period to update payment method
- Booking may be cancelled if payment not resolved
- Deposit may be forfeited per cancellation policy

### Payment Holds vs. Charges

**Authorization Hold (Pending):**
- Temporary hold when request submitted
- Verifies card validity
- Released if vendor declines
- Converted to charge if vendor accepts

**Actual Charge (Posted):**
- Real charge to your account
- Appears after vendor acceptance
- Cannot be reversed (except via refund)

## Accepted Payment Methods

### Credit Cards
✅ Visa
✅ Mastercard
✅ American Express
✅ Discover

### Debit Cards
✅ Visa Debit
✅ Mastercard Debit
✅ Most bank debit cards

### Not Currently Accepted
❌ PayPal
❌ Venmo
❌ Cash App
❌ Cryptocurrency
❌ Bank transfers
❌ Checks
❌ Cash

## Managing Payment Methods

### View Saved Cards

1. Go to Settings → Payment Methods
2. See all saved cards (last 4 digits shown)
3. Default method marked with star icon

### Update Card Information

**Can Update:**
- Expiration date
- Billing address
- Default status

**Cannot Update:**
- Card number (must add new card)
- Cardholder name (must add new card)

**How to Update:**
1. Settings → Payment Methods
2. Click "Edit" next to the card
3. Make changes
4. Click "Update"

### Remove a Payment Method

**Important**: Cannot remove default card if you have active bookings

**Steps:**
1. Settings → Payment Methods
2. Click "Remove" next to the card
3. Confirm removal
4. Card immediately deleted from system

### Change Default Payment Method

1. Settings → Payment Methods
2. Click "Set as Default" next to desired card
3. Previous default reverts to regular saved card

## Viewing Payment History

### Access Transaction History

1. Log in to your account
2. Go to "My Bookings"
3. Click "Payment History" tab

**You'll See:**
- All transactions (deposits and final payments)
- Date and time of each charge
- Amount charged
- Payment method used (last 4 digits)
- Associated booking ID
- Transaction status

### Download Receipts/Invoices

**For Individual Booking:**
1. Go to "My Bookings"
2. Click on specific booking
3. Click "Download Invoice" button
4. PDF downloads automatically

**For All Transactions:**
1. Payment History page
2. Select date range
3. Click "Export to PDF" or "Export to CSV"
4. Download comprehensive report

## Understanding Fees

### Fleet Feast Service Fee

**What It Is:**
- Platform usage fee (typically 5-8% of booking total)
- Covers platform maintenance, support, payment processing

**When Charged:**
- Included in total booking amount
- Split between deposit and final payment

**Example:**
```
Food Truck Cost:        $500
Service Fee (7%):       $35
Payment Processing:     $15
------------------------
Total Booking:          $550

Deposit (50%):          $275
Final Payment (50%):    $275
```

### Payment Processing Fee

**What It Is:**
- Stripe's fee for processing credit cards
- Typically 2.9% + $0.30 per transaction

**When Charged:**
- Included in booking total
- You see the all-in price

**Transparency:**
- All fees disclosed before booking
- No hidden charges
- Breakdown available in invoice

## Refund Process

### How Refunds Work

When you cancel according to policy:

**7+ Days Before Event:**
- 100% refund of total booking cost
- Includes all fees

**3-6 Days Before Event:**
- 50% refund of total booking cost
- Reduced fee refund

**Less Than 3 Days:**
- No refund
- Full amount retained by vendor

### Refund Timeline

**Processing:**
- Refund initiated immediately upon cancellation approval
- Appears as pending in 1-3 business days
- Fully credited in 5-10 business days

**Where It Goes:**
- Refunded to original payment method
- Cannot redirect to different card
- Separate refunds for deposit and final payment (if both charged)

**Notification:**
- Email confirmation when refund initiated
- Email when refund posted to your account

### Partial Refunds

May occur when:
- Vendor modifies booking (reduces services)
- Discount applied after booking
- Booking downgraded

**Process:**
- Difference calculated
- Refund processed automatically
- Email notification sent

## Troubleshooting Payment Issues

### Payment Declined

**Common Reasons:**
1. Insufficient funds
2. Incorrect card details
3. Expired card
4. Bank fraud protection triggered
5. International card restrictions

**Solutions:**
1. Verify all card details correct
2. Contact your bank to authorize the charge
3. Try a different card
4. Ensure billing address matches bank records
5. Check if card accepts online purchases

### Authorization Failed

**What This Means:**
- Bank won't authorize the hold
- Card cannot be used for booking

**Fix It:**
1. Contact your bank
2. Ask them to allow the charge
3. Verify your card allows online purchases
4. Use a different card

### Payment Processing Delayed

**If Deposit Doesn't Process:**
- Allow up to 24 hours for processing
- Check email for verification requests
- Contact support if still pending after 24 hours

**If Final Payment Delayed:**
- System retries once if initial attempt fails
- You'll be notified to update payment method
- Must resolve within 24 hours

### Card Expired Before Event

**Proactive Steps:**
1. Update card before expiration
2. Add new card with future expiration
3. Set as default payment method
4. Remove expired card

**If Already Expired:**
- System will email you 5 days before final payment
- Update immediately to avoid booking cancellation

### Refund Not Received

**First:**
1. Check original payment method (same card)
2. Allow full 5-10 business days
3. Contact your bank to trace the refund

**Then:**
1. Check your Fleet Feast payment history
2. Verify refund shows as "Completed"
3. Contact Fleet Feast support with:
   - Booking ID
   - Refund date
   - Bank statement showing no refund
   - We'll trace payment and re-issue if needed

### Double Charged

This is rare but if it happens:

1. Check if both charges are for different bookings
2. Verify one isn't an authorization hold (will drop off)
3. Contact support immediately if truly duplicate
4. Include:
   - Both transaction IDs
   - Screenshots of charges
   - Booking ID

**Resolution:**
- Duplicate charge refunded within 24-48 hours
- Full investigation completed
- Prevention measures implemented

## Security & Protection

### Your Information Is Safe

**Stripe Security:**
- PCI DSS Level 1 certified (highest security)
- Bank-level encryption
- Fraud detection algorithms
- 3D Secure support

**We Never Store:**
- Full credit card numbers
- CVV/CVC codes
- PIN numbers

**We Store Securely:**
- Last 4 digits (for display only)
- Card brand and expiration
- Tokenized card reference (for charging)

### Fraud Protection

**What We Do:**
- Monitor for suspicious activity
- Require verification for high-value bookings
- Flag unusual patterns
- Partner with Stripe's fraud detection

**What You Can Do:**
- Use strong passwords
- Enable two-factor authentication
- Monitor your account regularly
- Report unauthorized charges immediately

### Dispute a Charge

If you see an unauthorized charge:

**Immediate Steps:**
1. Log in and check "My Bookings"
2. Verify you didn't make the booking
3. Change your password immediately
4. Contact Fleet Feast support urgently

**Official Dispute:**
1. Email: disputes@fleetfeast.com
2. Include:
   - Transaction ID
   - Date of charge
   - Amount
   - Why you're disputing
3. We'll investigate within 48 hours

**Chargeback:**
- Contact your bank to dispute charge
- Provide documentation
- Fleet Feast will respond to chargeback
- Resolution typically takes 30-60 days

## International Payments

### Accepted Currencies

Currently, Fleet Feast operates in USD only:
- All prices shown in US Dollars ($)
- All charges processed in USD

### International Cards

**Generally Accepted:**
- Visa and Mastercard from most countries
- American Express (may have higher fees)

**May Be Declined:**
- Some international debit cards
- Prepaid cards from certain countries
- Cards requiring phone verification

**Tips for International Users:**
1. Notify your bank you're making US purchases
2. Verify card allows international online transactions
3. Account for currency conversion fees from your bank
4. Use a card without foreign transaction fees if possible

## Payment Best Practices

### For Customers

✅ **Add backup payment method**: In case primary card fails
✅ **Update expiring cards early**: Don't wait until last minute
✅ **Monitor email notifications**: Stay informed about charges
✅ **Save receipts**: Download and file for your records
✅ **Review charges**: Check statement matches booking
✅ **Use secure connections**: Avoid public Wi-Fi for payment updates

### Budget Planning

**For Events:**
```
Food Truck Cost:           $_____
Fleet Feast Fee (7%):      $_____
Deposit (50% at booking):  $_____
Final (50% 3 days before): $_____
Tips for vendor (15-20%):  $_____
------------------------
Total Event Food Cost:     $_____
```

### Timing Considerations

- **Book early, pay later**: Secure your date with deposit only
- **Budget for final payment**: Remember 72-hour auto-charge
- **Plan for gratuity**: Not included in booking
- **Consider travel fees**: May apply for distant locations

## Need Help?

### Contact Support

**Payment Issues (Urgent):**
- Email: payments@fleetfeast.com
- Response time: 2-4 hours during business hours

**General Questions:**
- Email: support@fleetfeast.com
- Live chat: Mon-Fri 9am-6pm EST

**Dispute/Fraud:**
- Email: disputes@fleetfeast.com
- Phone: 1-888-FLEET-FEAST

### Additional Resources

- [FAQ](../FAQ.md)
- [Troubleshooting Guide](../Troubleshooting.md)
- [Contact Support](../Contact_Support.md)

---

**Last Updated**: December 2025
