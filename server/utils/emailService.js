// ============================================================
// CENTRALIZED EMAIL NOTIFICATION SERVICE
// ============================================================
// This service reuses the same Brevo/SMTP configuration used
// by the OTP email function in authController.js.
// It reads the same environment variables from .env:
//   BREVO_API_KEY, EMAIL_FROM, EMAIL_HOST, EMAIL_PORT,
//   EMAIL_USER, EMAIL_PASS, CLIENT_URL
//
// IMPORTANT: Email failures are logged and swallowed.
// The caller's main operation (certificate upload, verification,
// rejection, verifier approval) must NEVER fail because of an
// email error.
// ============================================================

import SibApiV3Sdk from 'sib-api-v3-sdk'
import nodemailer from 'nodemailer'

const SENDER_EMAIL = process.env.EMAIL_FROM || 'pdpu1234@gmail.com'

// Helper: build a simple professional email HTML document.
// We use a shared layout so all notifications look consistent.
const buildEmailHtml = (title, bodyHtml) => `
  <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
    <div style="text-align: center; margin-bottom: 20px;">
      <div style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; background: #4f46e5; color: white; border-radius: 10px; font-size: 24px;">🎓</div>
    </div>
    <h2 style="text-align: center; color: #111827; margin: 0 0 16px;">${title}</h2>
    <div style="color: #374151; line-height: 1.6;">
      ${bodyHtml}
    </div>
    <p style="color: #9ca3af; text-align: center; font-size: 12px; margin-top: 24px;">
      This is an automated message from CredCheck. Please do not reply to this email.
    </p>
  </div>
`

// Helper: send an email using the same Brevo logic as sendOtpEmail.
// This is a NEW function (not overriding the original) so the OTP flow stays untouched.
const sendEmail = async (toEmail, subject, htmlContent) => {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) {
    console.error('[EMAIL SERVICE] BREVO_API_KEY is not configured in .env file')
    return
  }

  // ---- Path 1: Brevo HTTP API v3 (the standard production setup) ----
  if (apiKey.startsWith('xkeysib-')) {
    try {
      SibApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey = apiKey
      const defaultApiInstance = new SibApiV3Sdk.TransactionalEmailsApi()

      const sendSmtpEmail = SibApiV3Sdk.SendSmtpEmail.constructFromObject({
        to: [{ email: to }],
        sender: { email: SENDER_EMAIL, name: 'CredCheck' },
        subject,
        htmlContent,
      })

      const data = await defaultApiInstance.sendTransacEmail(sendSmtpEmail)
      console.log(`[Email Service] Sent "${subject}" to ${to} via Brevo API. Message ID: ${data.messageId}`)
    } catch (error) {
      console.error(`[Email Service] Brevo API FAILED for "${subject}" to ${to}:`, error.message)
    }
    return
  }

  // ---- Path 2: Brevo SMTP relay (nodemailer) ----
  if (apiKey.startsWith('xsmtpsib-')) {
    try {
      const smtpHost = process.env.EMAIL_HOST || 'smtp-relay.brevo.com'
      const smtpPort = parseInt(process.env.EMAIL_PORT || '587', 10)
      const smtpUser = process.env.EMAIL_USER || SENDER_EMAIL
      const smtpPass = process.env.EMAIL_PASS || apiKey

      if (!smtpUser || !smtpPass) {
        console.error('[Email Service] SMTP credentials are not configured (EMAIL_USER / EMAIL_PASS)')
        return
      }

      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        connectionTimeout: 30000,
      })

      const info = await transporter.sendMail({
        from: `"CredCheck" <${SENDER_EMAIL}>`,
        to,
        subject,
        html: htmlContent,
      })

      console.log(`[Email Service] Notification "${subject}" sent to ${to} via SMTP (messageId: ${info.messageId})`)
    } catch (error) {
      console.error(`[Email Service] SMTP FAILED for "${subject}" to ${to}:`, error.message)
    }
    return
  }

  console.error('[Email Service] Unsupported BREVO_API_KEY format. Expected "xkeysib-" or "xsmtpsib-" prefix.')
}

// ============================================================
// 1. CERTIFICATE UPLOADED → notify the verifier
// ============================================================
export const sendCertificateUploadedEmail = async ({ verifierEmail, studentName, certificateTitle, organization }) => {
  const subject = 'New certificate pending verification on CredCheck'
  const bodyHtml = `
    <p>Hello,</p>
    <p>A new certificate has been submitted and is now <strong>pending your verification</strong>.</p>
    <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <p style="margin: 4px 0;"><strong>Student:</strong> ${studentName || 'N/A'}</p>
      <p style="margin: 4px 0;"><strong>Certificate:</strong> ${certificateTitle || 'N/A'}</p>
      <p style="margin: 4px 0;"><strong>Organization:</strong> ${organization || 'N/A'}</p>
      <p style="margin: 4px 0;"><strong>Status:</strong> <span style="color: #d97706;">Pending Verification</span></p>
    </div>
    <p>Please log in to your CredCheck verifier dashboard to review this certificate.</p>
    <p>Thank you for helping keep credential integrity high.</p>
  `

  await sendEmail(verifierEmail, subject, buildEmailHtml(subject, bodyHtml))
}

// ============================================================
// 2. CERTIFICATE VERIFIED → notify the student
// ============================================================
export const sendCertificateVerifiedEmail = async ({ studentEmail, certificateTitle, organization, publicLinkId, qrCodeUrl }) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
  const publicLink = publicLinkId ? `${clientUrl}/cert/${publicLinkId}` : null

  const subject = 'Your certificate has been verified'
  const bodyHtml = `
    <p>Congratulations! 🎉</p>
    <p>Your certificate has been <strong style="color: #16a34a;">successfully verified</strong>.</p>
    <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <p style="margin: 4px 0;"><strong>Certificate:</strong> ${certificateTitle || 'N/A'}</p>
      <p style="margin: 4px 0;"><strong>Organization:</strong> ${organization || 'N/A'}</p>
      <p style="margin: 4px 0;"><strong>Status:</strong> <span style="color: #16a34a;">Verified</span></p>
    </div>
    ${publicLink ? `
      <p>You can share the public verification link:</p>
      <p style="text-align: center;">
        <a href="${publicLink}" style="display: inline-block; background: #4f46e5; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none;">View Public Verification</a>
      </p>
    ` : ''}
    ${qrCodeUrl ? '<p>A QR code has also been generated for quick verification when you open your dashboard.</p>' : ''}
    <p>Log in to your CredCheck account to view and manage your verified certificates.</p>
  `
  await sendEmail(studentEmail, subject, buildEmailHtml(subject, bodyHtml))
}

// ============================================================
// 3. CERTIFICATE REJECTED → notify the student
// ============================================================
export const sendCertificateRejectedEmail = async ({ studentEmail, certificateTitle, organization, comments }) => {
  const subject = 'Your certificate was not approved'
  const bodyHtml = `
    <p>Hello,</p>
    <p>We regret to inform you that your certificate has been <strong style="color: #dc2626;">rejected</strong>.</p>
    <div style="background: #fef2f2; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <p style="margin: 4px 0;"><strong>Certificate:</strong> ${certificateTitle || 'N/A'}</p>
      <p style="margin: 4px 0;"><strong>Organization:</strong> ${organization || 'N/A'}</p>
      <p style="margin: 4px 0;"><strong>Status:</strong> <span style="color: #dc2626;">Rejected</span></p>
      ${comments ? `<p style="margin: 8px 0 0;"><strong>Reason given by verifier:</strong></p><p style="margin: 4px 0; font-style: italic;">"${comments}"</p>` : ''}
    </div>
    ${comments ? '' : '<p>Please log in to your dashboard to see the feedback from the verifier.</p>'}
    <p>If you believe this is a mistake, you can try uploading the certificate again or contact support.</p>
  `
  await sendEmail(studentEmail, subject, buildEmailHtml(subject, bodyHtml))
}

// ============================================================
// 4. VERIFIER APPROVED → notify the verifier
// ============================================================
export const sendVerifierApprovedEmail = async ({ verifierEmail, verifierName }) => {
  const subject = 'Your verifier account has been approved'
  const bodyHtml = `
    <p>Hello${verifierName ? ` ${verifierName}` : ''},</p>
    <p>Great news! 🎉</p>
    <p>Your <strong>verifier account</strong> for <strong>CredCheck</strong> has been <strong style="color: #16a34a;">approved</strong> by an administrator.</p>
    <p>You can now log in to your verifier dashboard and start reviewing pending certificates.</p>
    <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <p style="margin: 4px 0;"><strong>What you can do now:</strong></p>
      <p style="margin: 4px 0;">• Review and verify certificates assigned to you</p>
      <p style="margin: 4px 0;">• Approve or reject certificates</p>
      <p style="margin: 4px 0;">• Track your verification history</p>
    </div>
    <p>Log in at your CredCheck verifier dashboard to get started.</p>
  `
  await sendEmail(verifierEmail, subject, buildEmailHtml(subject, bodyHtml))
}