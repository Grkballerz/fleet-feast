/**
 * Email Templates
 * Fleet Feast - Food Truck Booking Platform
 *
 * HTML email templates for all notification types.
 */

import { EmailTemplate, EmailTemplateData } from '../notification.types';

// ============================================================================
// BASE TEMPLATE
// ============================================================================

const baseTemplate = (title: string, content: string, platformUrl: string): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #F97316;
      margin-bottom: 10px;
    }
    h1 {
      color: #1F2937;
      font-size: 24px;
      margin-bottom: 20px;
    }
    .content {
      margin-bottom: 30px;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background-color: #F97316;
      color: #ffffff;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    .button:hover {
      background-color: #EA580C;
    }
    .details {
      background-color: #F9FAFB;
      border-left: 4px solid #F97316;
      padding: 15px;
      margin: 20px 0;
    }
    .details-row {
      margin: 8px 0;
    }
    .details-label {
      font-weight: 600;
      color: #6B7280;
      margin-right: 10px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #E5E7EB;
      color: #6B7280;
      font-size: 14px;
    }
    .footer a {
      color: #F97316;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🚚 Fleet Feast</div>
    </div>
    ${content}
    <div class="footer">
      <p>
        Questions? <a href="${platformUrl}/support">Contact Support</a> |
        <a href="${platformUrl}/settings/notifications">Notification Settings</a>
      </p>
      <p>&copy; ${new Date().getFullYear()} Fleet Feast. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
};

// ============================================================================
// BOOKING REQUEST (to vendor)
// ============================================================================

export const renderBookingRequestTemplate = (data: EmailTemplateData): EmailTemplate => {
  const content = `
    <h1>New Booking Request</h1>
    <div class="content">
      <p>Hi ${data.userName},</p>
      <p>You have received a new booking request from <strong>${data.customerName}</strong>.</p>

      <div class="details">
        <div class="details-row">
          <span class="details-label">Event Date:</span>
          <span>${data.eventDate} at ${data.eventTime}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Event Type:</span>
          <span>${data.eventType}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Guest Count:</span>
          <span>${data.guestCount}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Location:</span>
          <span>${data.location}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Total Amount:</span>
          <span>$${data.totalAmount}</span>
        </div>
      </div>

      <p><strong>Please respond within 48 hours</strong> to accept or decline this booking request.</p>

      <a href="${data.platformUrl}/vendor/bookings/${data.bookingId}" class="button">View Booking Request</a>
    </div>
  `;

  return {
    subject: `New Booking Request from ${data.customerName}`,
    html: baseTemplate('New Booking Request', content, data.platformUrl),
  };
};

// ============================================================================
// BOOKING ACCEPTED (to customer)
// ============================================================================

export const renderBookingAcceptedTemplate = (data: EmailTemplateData): EmailTemplate => {
  const content = `
    <h1>Booking Accepted!</h1>
    <div class="content">
      <p>Hi ${data.userName},</p>
      <p>Great news! <strong>${data.vendorName}</strong> has accepted your booking request.</p>

      <div class="details">
        <div class="details-row">
          <span class="details-label">Event Date:</span>
          <span>${data.eventDate} at ${data.eventTime}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Vendor:</span>
          <span>${data.vendorName}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Guest Count:</span>
          <span>${data.guestCount}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Total Amount:</span>
          <span>$${data.totalAmount}</span>
        </div>
      </div>

      <p>Please proceed to complete payment to confirm your booking.</p>

      <a href="${data.platformUrl}/bookings/${data.bookingId}" class="button">Complete Payment</a>
    </div>
  `;

  return {
    subject: `Booking Accepted - ${data.vendorName}`,
    html: baseTemplate('Booking Accepted', content, data.platformUrl),
  };
};

// ============================================================================
// BOOKING DECLINED (to customer)
// ============================================================================

export const renderBookingDeclinedTemplate = (data: EmailTemplateData): EmailTemplate => {
  const content = `
    <h1>Booking Request Declined</h1>
    <div class="content">
      <p>Hi ${data.userName},</p>
      <p>Unfortunately, <strong>${data.vendorName}</strong> is unable to accommodate your booking request for ${data.eventDate}.</p>

      <p>Don't worry - there are many other great food trucks available! Browse our marketplace to find an alternative vendor for your event.</p>

      <a href="${data.platformUrl}/trucks" class="button">Browse Food Trucks</a>
    </div>
  `;

  return {
    subject: `Booking Request Declined - ${data.vendorName}`,
    html: baseTemplate('Booking Declined', content, data.platformUrl),
  };
};

// ============================================================================
// BOOKING CANCELLED
// ============================================================================

export const renderBookingCancelledTemplate = (data: EmailTemplateData): EmailTemplate => {
  const content = `
    <h1>Booking Cancelled</h1>
    <div class="content">
      <p>Hi ${data.userName},</p>
      <p>Your booking for <strong>${data.eventDate}</strong> has been cancelled.</p>

      <div class="details">
        <div class="details-row">
          <span class="details-label">Event Date:</span>
          <span>${data.eventDate}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Vendor:</span>
          <span>${data.vendorName || 'N/A'}</span>
        </div>
        ${data.refundAmount ? `
        <div class="details-row">
          <span class="details-label">Refund Amount:</span>
          <span>$${data.refundAmount}</span>
        </div>
        ` : ''}
      </div>

      ${data.refundAmount ? '<p>Your refund will be processed within 5-7 business days.</p>' : ''}

      <a href="${data.platformUrl}/bookings/${data.bookingId}" class="button">View Details</a>
    </div>
  `;

  return {
    subject: 'Booking Cancelled',
    html: baseTemplate('Booking Cancelled', content, data.platformUrl),
  };
};

// ============================================================================
// PAYMENT CONFIRMED
// ============================================================================

export const renderPaymentConfirmedTemplate = (data: EmailTemplateData): EmailTemplate => {
  const content = `
    <h1>Payment Confirmed</h1>
    <div class="content">
      <p>Hi ${data.userName},</p>
      <p>Your payment of <strong>$${data.totalAmount}</strong> has been successfully processed.</p>

      <div class="details">
        <div class="details-row">
          <span class="details-label">Event Date:</span>
          <span>${data.eventDate} at ${data.eventTime}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Vendor:</span>
          <span>${data.vendorName}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Amount Paid:</span>
          <span>$${data.totalAmount}</span>
        </div>
      </div>

      <p>Your booking is now confirmed. We'll send you a reminder 24 hours before your event.</p>

      <a href="${data.platformUrl}/bookings/${data.bookingId}" class="button">View Booking</a>
    </div>
  `;

  return {
    subject: 'Payment Confirmed - Booking Confirmed',
    html: baseTemplate('Payment Confirmed', content, data.platformUrl),
  };
};

// ============================================================================
// NEW MESSAGE
// ============================================================================

export const renderNewMessageTemplate = (data: EmailTemplateData): EmailTemplate => {
  const content = `
    <h1>New Message</h1>
    <div class="content">
      <p>Hi ${data.userName},</p>
      <p><strong>${data.senderName}</strong> sent you a message about your booking on ${data.eventDate}.</p>

      <div class="details">
        <p><em>"${data.messagePreview}"</em></p>
      </div>

      <a href="${data.platformUrl}/messages/${data.bookingId}" class="button">View Conversation</a>
    </div>
  `;

  return {
    subject: `New Message from ${data.senderName}`,
    html: baseTemplate('New Message', content, data.platformUrl),
  };
};

// ============================================================================
// EVENT REMINDER
// ============================================================================

export const renderEventReminderTemplate = (data: EmailTemplateData): EmailTemplate => {
  const content = `
    <h1>Event Reminder - Tomorrow!</h1>
    <div class="content">
      <p>Hi ${data.userName},</p>
      <p>This is a reminder that your event is happening <strong>tomorrow</strong>!</p>

      <div class="details">
        <div class="details-row">
          <span class="details-label">Event Date:</span>
          <span>${data.eventDate} at ${data.eventTime}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Vendor:</span>
          <span>${data.vendorName}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Location:</span>
          <span>${data.location}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Guest Count:</span>
          <span>${data.guestCount}</span>
        </div>
      </div>

      <p>Have questions? Message your vendor directly through the platform.</p>

      <a href="${data.platformUrl}/bookings/${data.bookingId}" class="button">View Booking Details</a>
    </div>
  `;

  return {
    subject: `Reminder: Your Event is Tomorrow at ${data.eventTime}`,
    html: baseTemplate('Event Reminder', content, data.platformUrl),
  };
};

// ============================================================================
// REVIEW PROMPT
// ============================================================================

export const renderReviewPromptTemplate = (data: EmailTemplateData): EmailTemplate => {
  const content = `
    <h1>How was your event?</h1>
    <div class="content">
      <p>Hi ${data.userName},</p>
      <p>We hope your event with <strong>${data.vendorName}</strong> was a success!</p>

      <p>Would you mind taking a moment to leave a review? Your feedback helps other customers and supports great vendors.</p>

      <a href="${data.reviewLink}" class="button">Leave a Review</a>

      <p style="margin-top: 20px; font-size: 14px; color: #6B7280;">
        Reviews can be left within 30 days of your event.
      </p>
    </div>
  `;

  return {
    subject: `How was ${data.vendorName}? Leave a Review`,
    html: baseTemplate('Leave a Review', content, data.platformUrl),
  };
};

// ============================================================================
// DISPUTE CREATED
// ============================================================================

export const renderDisputeCreatedTemplate = (data: EmailTemplateData): EmailTemplate => {
  const content = `
    <h1>Dispute Opened</h1>
    <div class="content">
      <p>Hi ${data.userName},</p>
      <p>A dispute has been opened for your booking on ${data.eventDate}.</p>

      <div class="details">
        <div class="details-row">
          <span class="details-label">Dispute ID:</span>
          <span>${data.disputeId}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Booking Date:</span>
          <span>${data.eventDate}</span>
        </div>
      </div>

      <p>Our team will review this dispute and reach out within 2-3 business days. Funds are being held until the dispute is resolved.</p>

      <a href="${data.platformUrl}/disputes/${data.disputeId}" class="button">View Dispute</a>
    </div>
  `;

  return {
    subject: 'Dispute Opened - Booking #' + data.bookingId,
    html: baseTemplate('Dispute Opened', content, data.platformUrl),
  };
};

// ============================================================================
// DISPUTE RESOLVED
// ============================================================================

export const renderDisputeResolvedTemplate = (data: EmailTemplateData): EmailTemplate => {
  const content = `
    <h1>Dispute Resolved</h1>
    <div class="content">
      <p>Hi ${data.userName},</p>
      <p>The dispute for your booking on ${data.eventDate} has been resolved.</p>

      <div class="details">
        <div class="details-row">
          <span class="details-label">Resolution:</span>
          <span>${data.resolution}</span>
        </div>
        ${data.refundAmount ? `
        <div class="details-row">
          <span class="details-label">Refund Amount:</span>
          <span>$${data.refundAmount}</span>
        </div>
        ` : ''}
      </div>

      ${data.refundAmount ? '<p>Your refund will be processed within 5-7 business days.</p>' : ''}

      <a href="${data.platformUrl}/disputes/${data.disputeId}" class="button">View Details</a>
    </div>
  `;

  return {
    subject: 'Dispute Resolved - Booking #' + data.bookingId,
    html: baseTemplate('Dispute Resolved', content, data.platformUrl),
  };
};

// ============================================================================
// VIOLATION WARNING
// ============================================================================

export const renderViolationWarningTemplate = (data: EmailTemplateData): EmailTemplate => {
  const content = `
    <h1>Account Warning</h1>
    <div class="content">
      <p>Hi ${data.userName},</p>
      <p>We've detected a potential violation of our platform terms.</p>

      <div class="details">
        <div class="details-row">
          <span class="details-label">Violation Type:</span>
          <span>${data.violationType}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Reason:</span>
          <span>${data.violationReason}</span>
        </div>
      </div>

      <p>Please review our <a href="${data.platformUrl}/terms">Terms of Service</a> to ensure future compliance. Repeated violations may result in account restrictions or suspension.</p>

      <p>If you believe this is a mistake, you can appeal this warning.</p>

      <a href="${data.platformUrl}/account/violations" class="button">View Details</a>
    </div>
  `;

  return {
    subject: 'Important: Account Warning',
    html: baseTemplate('Account Warning', content, data.platformUrl),
  };
};

// ============================================================================
// ACCOUNT STATUS CHANGED
// ============================================================================

export const renderAccountStatusChangedTemplate = (data: EmailTemplateData): EmailTemplate => {
  const content = `
    <h1>Account Status Update</h1>
    <div class="content">
      <p>Hi ${data.userName},</p>
      <p>Your account status has been updated.</p>

      <div class="details">
        <div class="details-row">
          <span class="details-label">New Status:</span>
          <span><strong>${data.newStatus}</strong></span>
        </div>
        ${data.statusReason ? `
        <div class="details-row">
          <span class="details-label">Reason:</span>
          <span>${data.statusReason}</span>
        </div>
        ` : ''}
      </div>

      <p>If you have questions about this change, please contact our support team.</p>

      <a href="${data.platformUrl}/account" class="button">View Account</a>
    </div>
  `;

  return {
    subject: 'Account Status Updated',
    html: baseTemplate('Account Status Update', content, data.platformUrl),
  };
};
