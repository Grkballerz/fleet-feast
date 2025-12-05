/**
 * Email Service using SendGrid
 * Handles transactional emails for Fleet Feast
 */

import sgMail from "@sendgrid/mail";
import crypto from "crypto";

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "noreply@fleetfeast.com";
const APP_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

/**
 * Generate a secure random token
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Send email verification email
 */
export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const verificationUrl = `${APP_URL}/verify-email?token=${token}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #B91C1C;
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background-color: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 8px 8px;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #B91C1C;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Welcome to Fleet Feast!</h1>
        </div>
        <div class="content">
          <p>Thank you for signing up for Fleet Feast.</p>
          <p>Please verify your email address to activate your account:</p>
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account with Fleet Feast, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Fleet Feast. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;

  const textContent = `
Welcome to Fleet Feast!

Thank you for signing up. Please verify your email address by clicking the link below:

${verificationUrl}

This link will expire in 24 hours.

If you didn't create an account with Fleet Feast, you can safely ignore this email.

© ${new Date().getFullYear()} Fleet Feast. All rights reserved.
  `;

  const message = {
    to: email,
    from: FROM_EMAIL,
    subject: "Verify your Fleet Feast account",
    text: textContent,
    html: htmlContent,
  };

  try {
    await sgMail.send(message);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<void> {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #B91C1C;
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background-color: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 8px 8px;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #B91C1C;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
          }
          .warning {
            background-color: #FEF3C7;
            border-left: 4px solid #D97706;
            padding: 15px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <p>We received a request to reset your Fleet Feast password.</p>
          <p>Click the button below to create a new password:</p>
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <div class="warning">
            <strong>Important:</strong> If you didn't request a password reset, please ignore this email or contact support if you have concerns.
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Fleet Feast. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;

  const textContent = `
Password Reset Request

We received a request to reset your Fleet Feast password.

Click the link below to create a new password:

${resetUrl}

This link will expire in 1 hour.

IMPORTANT: If you didn't request a password reset, please ignore this email or contact support if you have concerns.

© ${new Date().getFullYear()} Fleet Feast. All rights reserved.
  `;

  const message = {
    to: email,
    from: FROM_EMAIL,
    subject: "Reset your Fleet Feast password",
    text: textContent,
    html: htmlContent,
  };

  try {
    await sgMail.send(message);
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
}

/**
 * Send welcome email after successful verification
 */
export async function sendWelcomeEmail(
  email: string,
  role: string
): Promise<void> {
  const dashboardUrl = `${APP_URL}/${role.toLowerCase()}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #B91C1C;
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background-color: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 8px 8px;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #B91C1C;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Welcome to Fleet Feast!</h1>
        </div>
        <div class="content">
          <p>Your email has been verified successfully!</p>
          <p>You're all set to start ${
            role === "CUSTOMER" ? "booking food trucks" : "accepting bookings"
          } on Fleet Feast.</p>
          <div style="text-align: center;">
            <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
          </div>
          <p>Need help getting started? Check out our <a href="${APP_URL}/help">Help Center</a> or contact our support team.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Fleet Feast. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;

  const textContent = `
Welcome to Fleet Feast!

Your email has been verified successfully!

You're all set to start ${
    role === "CUSTOMER" ? "booking food trucks" : "accepting bookings"
  } on Fleet Feast.

Go to your dashboard: ${dashboardUrl}

Need help getting started? Check out our Help Center at ${APP_URL}/help or contact our support team.

© ${new Date().getFullYear()} Fleet Feast. All rights reserved.
  `;

  const message = {
    to: email,
    from: FROM_EMAIL,
    subject: "Welcome to Fleet Feast!",
    text: textContent,
    html: htmlContent,
  };

  try {
    await sgMail.send(message);
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error("Error sending welcome email:", error);
    // Don't throw - welcome email is not critical
  }
}
