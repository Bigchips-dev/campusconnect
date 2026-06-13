/**
 * Email utility — placeholder implementation.
 * Replace the console.log calls with an actual email service
 * (SendGrid, Resend, Nodemailer, etc.) when ready.
 *
 * All functions are async and wrapped so callers can
 * fire-and-forget with try/catch/finally.
 */

async function sendVerificationEmail(email, token) {
  const url = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
  console.log(`📧 [Verify] To: ${email}  Link: ${url}`);
  // TODO: integrate real email provider
}

async function sendPasswordResetEmail(email, token) {
  const url = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
  console.log(`📧 [Reset]  To: ${email}  Link: ${url}`);
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
