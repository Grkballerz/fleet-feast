/**
 * Email Service - SendGrid Integration
 * Fleet Feast - Food Truck Booking Platform
 *
 * Handles sending transactional emails via SendGrid.
 */

import sgMail from '@sendgrid/mail';
import { NotificationType } from '@prisma/client';
import {
  EmailTemplate,
  EmailTemplateData,
  SendEmailParams,
  NotificationError,
} from './notification.types';
import {
  renderBookingRequestTemplate,
  renderBookingAcceptedTemplate,
  renderBookingDeclinedTemplate,
  renderBookingCancelledTemplate,
  renderPaymentConfirmedTemplate,
  renderNewMessageTemplate,
  renderEventReminderTemplate,
  renderReviewPromptTemplate,
  renderDisputeCreatedTemplate,
  renderDisputeResolvedTemplate,
  renderViolationWarningTemplate,
  renderAccountStatusChangedTemplate,
} from './templates/email-templates';

// ============================================================================
// SENDGRID CONFIGURATION
// ============================================================================

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'notifications@fleetfeast.com';
const FROM_NAME = process.env.SENDGRID_FROM_NAME || 'Fleet Feast';

if (!SENDGRID_API_KEY) {
  console.warn('⚠️  SENDGRID_API_KEY not configured. Email notifications will be logged but not sent.');
} else {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

// ============================================================================
// EMAIL TEMPLATE MAPPING
// ============================================================================

const EMAIL_TEMPLATE_RENDERERS: Record<
  NotificationType,
  (data: EmailTemplateData) => EmailTemplate
> = {
  BOOKING_REQUEST: renderBookingRequestTemplate,
  BOOKING_ACCEPTED: renderBookingAcceptedTemplate,
  BOOKING_DECLINED: renderBookingDeclinedTemplate,
  BOOKING_CANCELLED: renderBookingCancelledTemplate,
  PAYMENT_CONFIRMED: renderPaymentConfirmedTemplate,
  NEW_MESSAGE: renderNewMessageTemplate,
  EVENT_REMINDER: renderEventReminderTemplate,
  REVIEW_PROMPT: renderReviewPromptTemplate,
  DISPUTE_CREATED: renderDisputeCreatedTemplate,
  DISPUTE_RESOLVED: renderDisputeResolvedTemplate,
  VIOLATION_WARNING: renderViolationWarningTemplate,
  ACCOUNT_STATUS_CHANGED: renderAccountStatusChangedTemplate,
};

// ============================================================================
// EMAIL SERVICE
// ============================================================================

export class EmailService {
  /**
   * Send email with SendGrid
   */
  async sendEmail(params: SendEmailParams): Promise<void> {
    const { to, subject, html } = params;

    if (!SENDGRID_API_KEY) {
      console.log('[EMAIL] Would send email (SendGrid not configured):');
      console.log(`  To: ${to}`);
      console.log(`  Subject: ${subject}`);
      console.log(`  HTML: ${html.substring(0, 100)}...`);
      return;
    }

    try {
      await sgMail.send({
        to,
        from: {
          email: FROM_EMAIL,
          name: FROM_NAME,
        },
        subject,
        html,
      });

      console.log(`[EMAIL] Sent to ${to}: ${subject}`);
    } catch (error) {
      console.error('[EMAIL] SendGrid error:', error);
      throw new NotificationError(
        'Failed to send email',
        'EMAIL_SEND_FAILED',
        500
      );
    }
  }

  /**
   * Send templated email based on notification type
   */
  async sendTemplatedEmail(
    to: string,
    type: NotificationType,
    data: EmailTemplateData
  ): Promise<void> {
    const renderer = EMAIL_TEMPLATE_RENDERERS[type];

    if (!renderer) {
      throw new NotificationError(
        `No email template for notification type: ${type}`,
        'TEMPLATE_NOT_FOUND',
        500
      );
    }

    // Add platform URL if not provided
    const templateData: EmailTemplateData = {
      ...data,
      platformUrl: data.platformUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    };

    const { subject, html } = renderer(templateData);

    await this.sendEmail({ to, subject, html });
  }
}

// Singleton instance
export const emailService = new EmailService();
