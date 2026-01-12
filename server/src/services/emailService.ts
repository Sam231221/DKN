import nodemailer from "nodemailer";

/**
 * Email Service using Gmail SMTP
 * 
 * Environment variables required:
 * - EMAIL_HOST: Gmail SMTP host (default: smtp.gmail.com)
 * - EMAIL_PORT: SMTP port (default: 587)
 * - EMAIL_SECURE: Use TLS (default: false, use true for port 465)
 * - EMAIL_USER: Gmail email address
 * - EMAIL_PASSWORD: Gmail app password (NOT regular password - generate app password in Google Account settings)
 * - EMAIL_FROM: Email address to send from (default: EMAIL_USER)
 * - FRONTEND_URL: Frontend URL for invitation links
 */

// Create reusable transporter
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn("⚠️  EMAIL_USER or EMAIL_PASSWORD not set. Email service will log to console only.");
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_SECURE === "true" || process.env.EMAIL_PORT === "465", // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD, // Gmail app password
    },
  });
};

const transporter = createTransporter();
const emailFrom = process.env.EMAIL_FROM || process.env.EMAIL_USER || "noreply@dkn.com";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email using Gmail SMTP
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  // If transporter is not configured, log to console
  if (!transporter) {
    console.log("📧 Email would be sent (email service not configured):");
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body: ${options.text || options.html}`);
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: emailFrom,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    console.log(`✅ Email sent successfully to ${options.to}`);
    console.log(`Message ID: ${info.messageId}`);
  } catch (error: any) {
    console.error("❌ Error sending email:", error.message);
    // Don't throw error - we don't want email failures to break the application
    // But log it for debugging
    if (error.code === "EAUTH") {
      console.error("⚠️  Authentication failed. Check EMAIL_USER and EMAIL_PASSWORD.");
      console.error("⚠️  For Gmail, you need to use an App Password, not your regular password.");
      console.error("⚠️  Generate one at: https://myaccount.google.com/apppasswords");
    }
  }
}

/**
 * Send invitation email
 */
export async function sendInvitationEmail(
  email: string,
  invitationToken: string,
  organizationName?: string,
  inviterName?: string
): Promise<void> {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const invitationUrl = `${frontendUrl}/invite/${invitationToken}`;
  
  const subject = organizationName
    ? `Invitation to join ${organizationName} on DKN Knowledge Network`
    : "Invitation to join DKN Knowledge Network";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
          background-color: white;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h2 { 
          color: #2563eb;
          margin-top: 0;
        }
        .button { 
          display: inline-block; 
          padding: 14px 28px; 
          background-color: #2563eb; 
          color: white; 
          text-decoration: none; 
          border-radius: 6px; 
          margin: 20px 0;
          font-weight: 500;
        }
        .button:hover {
          background-color: #1d4ed8;
        }
        .footer { 
          margin-top: 40px; 
          padding-top: 20px; 
          border-top: 1px solid #e5e7eb; 
          font-size: 12px; 
          color: #6b7280; 
        }
        .url-box {
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          padding: 12px;
          margin: 20px 0;
          word-break: break-all;
          font-family: monospace;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>You've been invited! 🎉</h2>
        ${organizationName ? `<p><strong>${inviterName || "An administrator"}</strong> has invited you to join <strong>${organizationName}</strong> on the DKN Knowledge Network platform.</p>` : "<p>You've been invited to join the DKN Knowledge Network platform.</p>"}
        <p>Click the button below to accept the invitation and create your account:</p>
        <div style="text-align: center;">
          <a href="${invitationUrl}" class="button">Accept Invitation</a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <div class="url-box">${invitationUrl}</div>
        <p><strong>This invitation will expire in 7 days.</strong></p>
        <div class="footer">
          <p>If you didn't expect this invitation, you can safely ignore this email.</p>
          <p>This is an automated message from DKN Knowledge Network.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
You've been invited!
${organizationName ? `${inviterName || "An administrator"} has invited you to join ${organizationName} on the DKN Knowledge Network platform.` : "You've been invited to join the DKN Knowledge Network platform."}

Click this link to accept the invitation and create your account:
${invitationUrl}

This invitation will expire in 7 days.

If you didn't expect this invitation, you can safely ignore this email.
This is an automated message from DKN Knowledge Network.
  `;

  await sendEmail({
    to: email,
    subject,
    html,
    text,
  });
}

/**
 * Send email verification email
 */
export async function sendVerificationEmail(
  email: string,
  token: string,
  firstName?: string
): Promise<void> {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;
  
  const subject = "Verify your email address - DKN Knowledge Network";
  const greeting = firstName ? `Hi ${firstName},` : "Hi there,";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
          background-color: white;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h2 { 
          color: #2563eb;
          margin-top: 0;
        }
        .button { 
          display: inline-block; 
          padding: 14px 28px; 
          background-color: #2563eb; 
          color: white; 
          text-decoration: none; 
          border-radius: 6px; 
          margin: 20px 0;
          font-weight: 500;
        }
        .button:hover {
          background-color: #1d4ed8;
        }
        .footer { 
          margin-top: 40px; 
          padding-top: 20px; 
          border-top: 1px solid #e5e7eb; 
          font-size: 12px; 
          color: #6b7280; 
        }
        .url-box {
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          padding: 12px;
          margin: 20px 0;
          word-break: break-all;
          font-family: monospace;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Verify your email address</h2>
        <p>${greeting}</p>
        <p>Thank you for signing up for DKN Knowledge Network! Please verify your email address by clicking the button below:</p>
        <div style="text-align: center;">
          <a href="${verificationUrl}" class="button">Verify Email Address</a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <div class="url-box">${verificationUrl}</div>
        <p><strong>This verification link will expire in 24 hours.</strong></p>
        <div class="footer">
          <p>If you didn't create an account, you can safely ignore this email.</p>
          <p>This is an automated message from DKN Knowledge Network.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Verify your email address

${greeting}

Thank you for signing up for DKN Knowledge Network! Please verify your email address by clicking the link below:

${verificationUrl}

This verification link will expire in 24 hours.

If you didn't create an account, you can safely ignore this email.
This is an automated message from DKN Knowledge Network.
  `;

  await sendEmail({
    to: email,
    subject,
    html,
    text,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string,
  firstName?: string
): Promise<void> {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
  
  const subject = "Reset your password - DKN Knowledge Network";
  const greeting = firstName ? `Hi ${firstName},` : "Hi there,";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
          background-color: white;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h2 { 
          color: #2563eb;
          margin-top: 0;
        }
        .button { 
          display: inline-block; 
          padding: 14px 28px; 
          background-color: #2563eb; 
          color: white; 
          text-decoration: none; 
          border-radius: 6px; 
          margin: 20px 0;
          font-weight: 500;
        }
        .button:hover {
          background-color: #1d4ed8;
        }
        .footer { 
          margin-top: 40px; 
          padding-top: 20px; 
          border-top: 1px solid #e5e7eb; 
          font-size: 12px; 
          color: #6b7280; 
        }
        .url-box {
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          padding: 12px;
          margin: 20px 0;
          word-break: break-all;
          font-family: monospace;
          font-size: 12px;
        }
        .warning {
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 12px;
          margin: 20px 0;
          border-radius: 4px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Reset your password</h2>
        <p>${greeting}</p>
        <p>We received a request to reset your password for your DKN Knowledge Network account. Click the button below to create a new password:</p>
        <div style="text-align: center;">
          <a href="${resetUrl}" class="button">Reset Password</a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <div class="url-box">${resetUrl}</div>
        <div class="warning">
          <p><strong>This link will expire in 1 hour.</strong></p>
          <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
        </div>
        <div class="footer">
          <p>This is an automated message from DKN Knowledge Network.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Reset your password

${greeting}

We received a request to reset your password for your DKN Knowledge Network account. Click the link below to create a new password:

${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.

This is an automated message from DKN Knowledge Network.
  `;

  await sendEmail({
    to: email,
    subject,
    html,
    text,
  });
}
