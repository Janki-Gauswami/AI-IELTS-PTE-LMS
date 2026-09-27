const nodemailer = require("nodemailer");

/**
 * Creates and returns a Nodemailer transporter.
 * Uses environment variables if configured, with support for Gmail or custom SMTP.
 */
const getTransporter = () => {
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  if (user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  return null;
};

/**
 * Send Password Reset OTP to User's Email
 */
const sendPasswordResetOTPEmail = async ({ to, userName, role, otp }) => {
  const fromAddress =
    process.env.EMAIL_FROM ||
    `"AI IELTS & PTE LMS" <${process.env.SMTP_USER || process.env.EMAIL_USER || "no-reply@lms.com"}>`;

  const subject = "Password Reset Request - Your Verification OTP";

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
          .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 36px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
          .header { text-align: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 24px; }
          .title { font-size: 20px; font-weight: 800; color: #1e40af; margin: 0; }
          .badge { display: inline-block; background: #eff6ff; color: #2563eb; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 10px; border-radius: 9999px; margin-top: 8px; }
          .content { line-height: 1.6; font-size: 14px; color: #334155; }
          .otp-box { text-align: center; background: #f0fdf4; border: 2px dashed #22c55e; border-radius: 12px; padding: 20px; margin: 24px 0; }
          .otp-code { font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #15803d; margin: 0; font-family: monospace; }
          .otp-expiry { font-size: 12px; color: #166534; margin-top: 6px; font-weight: 600; }
          .alert { background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; border-radius: 6px; font-size: 12px; color: #991b1b; margin-top: 24px; }
          .footer { font-size: 11px; color: #94a3b8; text-align: center; margin-top: 28px; border-top: 1px solid #f1f5f9; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="title">AI IELTS & PTE LMS</h1>
            <span class="badge">Security Notification</span>
          </div>
          <div class="content">
            <p>Hello <strong>${userName || "User"}</strong>,</p>
            <p>An administrator has initiated a password reset for your <strong>${(role || "user").toUpperCase()}</strong> account upon request.</p>
            <p>Please use the following <strong>One-Time Password (OTP)</strong> to verify and complete the password change:</p>
            
            <div class="otp-box">
              <p class="otp-code">${otp}</p>
              <p class="otp-expiry">Valid for 10 minutes only</p>
            </div>

            <p>Provide this OTP to your administrator to verify your identity and finalize your new password.</p>
            
            <div class="alert">
              <strong>Security Notice:</strong> If you did not request a password reset, please contact your administrator or institution immediately.
            </div>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} AI IELTS & PTE LMS. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Hello ${userName || "User"},

An administrator has initiated a password reset for your ${(role || "user").toUpperCase()} account upon request.
Your Verification OTP is: ${otp}

This OTP is valid for 10 minutes.

If you did not request this, please notify your administrator immediately.

AI IELTS & PTE LMS
  `;

  // Always log OTP to server console for testing & auditing
  console.log(`\n======================================================`);
  console.log(`🔑 [EMAIL SERVICE] PASSWORD RESET OTP GENERATED`);
  console.log(`📧 Sent To: ${to} (${userName || "User"}, Role: ${role || "user"})`);
  console.log(`🔢 OTP CODE: [ ${otp} ] (Expires in 10 minutes)`);
  console.log(`======================================================\n`);

  const transporter = getTransporter();

  if (!transporter) {
    console.warn(
      `⚠️ [EMAIL SERVICE] SMTP credentials (SMTP_USER/SMTP_PASS) not configured in .env. Real email delivery skipped, OTP logged above.`
    );
    return {
      sent: false,
      reason: "SMTP credentials not configured in backend/.env",
      otp,
    };
  }

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      text,
      html,
    });

    console.log(`✅ [EMAIL SERVICE] OTP successfully sent to ${to}. MessageId: ${info.messageId}`);
    return { sent: true, messageId: info.messageId, otp };
  } catch (error) {
    console.error(`❌ [EMAIL SERVICE] Failed to send email to ${to}:`, error.message);
    return { sent: false, error: error.message, otp };
  }
};

/**
 * Send Password Reset Confirmation Email
 */
const sendPasswordChangedConfirmation = async ({ to, userName }) => {
  const fromAddress =
    process.env.EMAIL_FROM ||
    `"AI IELTS & PTE LMS" <${process.env.SMTP_USER || process.env.EMAIL_USER || "no-reply@lms.com"}>`;

  const subject = "Your Password Has Been Successfully Changed";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #1e40af; margin-top: 0;">Password Successfully Changed</h2>
      <p>Hello <strong>${userName || "User"}</strong>,</p>
      <p>This is to confirm that the password for your AI IELTS & PTE LMS account has been updated by the administrator upon OTP verification.</p>
      <p>You can now log in using your new password.</p>
      <p style="font-size: 12px; color: #64748b; margin-top: 24px;">If you did not authorize this change, please contact support immediately.</p>
    </div>
  `;

  const transporter = getTransporter();
  if (!transporter) return { sent: false };

  try {
    await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      html,
    });
    return { sent: true };
  } catch (err) {
    console.error("Failed to send confirmation email:", err.message);
    return { sent: false };
  }
};

/**
 * Send Landing Page Contact Form Submission to gjanki410@gmail.com
 */
const sendContactFormEmail = async ({ name, email, subject, message }) => {
  const targetEmail = "gjanki410@gmail.com";
  const fromAddress =
    process.env.EMAIL_FROM ||
    `"AI IELTS & PTE LMS Contact" <${process.env.SMTP_USER || process.env.EMAIL_USER || "no-reply@lms.com"}>`;

  const emailSubject = `[LMS Contact Form] ${subject || "New Inquiry from " + name}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0; }
          .header { border-bottom: 2px solid #3b82f6; padding-bottom: 16px; margin-bottom: 20px; }
          .title { font-size: 20px; font-weight: 800; color: #1e3a8a; margin: 0; }
          .field { margin-bottom: 16px; }
          .label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
          .value { font-size: 15px; font-weight: 600; color: #0f172a; margin-top: 4px; }
          .message-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 18px; font-size: 14px; line-height: 1.6; color: #334155; white-space: pre-wrap; }
          .footer { margin-top: 24px; font-size: 12px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="title">📬 New Contact Form Submission</h1>
          </div>
          <div class="field">
            <div class="label">Sender Name</div>
            <div class="value">${name}</div>
          </div>
          <div class="field">
            <div class="label">Sender Email</div>
            <div class="value"><a href="mailto:${email}">${email}</a></div>
          </div>
          <div class="field">
            <div class="label">Subject</div>
            <div class="value">${subject || "N/A"}</div>
          </div>
          <div class="field">
            <div class="label">Message</div>
            <div class="message-box">${message}</div>
          </div>
          <div class="footer">
            Submitted from AI IELTS & PTE LMS Landing Page &bull; Delivered to ${targetEmail}
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
New Contact Form Submission on AI IELTS & PTE LMS

From: ${name} (${email})
Subject: ${subject || "N/A"}

Message:
${message}
  `;

  console.log(`\n======================================================`);
  console.log(`📬 [CONTACT FORM] NEW INQUIRY RECEIVED FOR ${targetEmail}`);
  console.log(`👤 Name: ${name}`);
  console.log(`📧 Email: ${email}`);
  console.log(`📌 Subject: ${subject}`);
  console.log(`💬 Message: ${message}`);
  console.log(`======================================================\n`);

  const transporter = getTransporter();

  if (!transporter) {
    console.warn(
      `⚠️ [EMAIL SERVICE] SMTP credentials not configured in backend/.env. Contact inquiry logged to console above.`
    );
    return {
      sent: false,
      reason: "SMTP credentials not configured in backend/.env",
      targetEmail,
    };
  }

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to: targetEmail,
      replyTo: email,
      subject: emailSubject,
      text,
      html,
    });

    console.log(`✅ [CONTACT FORM] Email successfully delivered to ${targetEmail}. MessageId: ${info.messageId}`);
    return { sent: true, messageId: info.messageId, targetEmail };
  } catch (error) {
    console.error(`❌ [CONTACT FORM] Failed to deliver email to ${targetEmail}:`, error.message);
    return { sent: false, error: error.message, targetEmail };
  }
};

module.exports = {
  sendPasswordResetOTPEmail,
  sendPasswordChangedConfirmation,
  sendContactFormEmail,
};
