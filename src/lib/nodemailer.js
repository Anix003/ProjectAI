import nodemailer from 'nodemailer';

const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

let transporter = null;

if (smtpUser && smtpPass) {
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
}

export async function sendOTPEmail(email, otp) {
  const mailOptions = {
    from: `"Civic AI" <${smtpUser || 'no-reply@civicai.gov.in'}>`,
    to: email,
    subject: 'Verification Code - Civic AI Sign Up',
    text: `Your OTP verification code for Civic AI sign up is: ${otp}. It is valid for 5 minutes.`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
        <h2 style="color: #2563eb; text-align: center; margin-bottom: 24px;">Civic AI Verification</h2>
        <p>Hello,</p>
        <p>Thank you for registering with Civic AI. Please use the following 6-digit One-Time Password (OTP) to verify your email and complete your registration:</p>
        <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 15px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #1e293b; margin: 24px 0;">
          ${otp}
        </div>
        <p>This OTP is valid for <strong>5 minutes</strong>. Do not share this code with anyone.</p>
        <p style="color: #64748b; font-size: 12px; text-align: center; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
          If you did not request this, please ignore this email.
        </p>
      </div>
    `,
  };

  if (transporter) {
    try {
      await transporter.sendMail(mailOptions);
      return { sent: true };
    } catch (error) {
      console.error('Error sending email via Nodemailer:', error);
      throw error;
    }
  } else {
    console.log('\n============================================================');
    console.log(`[MOCK EMAIL] OTP for ${email}: ${otp}`);
    console.log('To send real emails, please configure SMTP credentials (SMTP_USER, SMTP_PASS) in .env.local');
    console.log('============================================================\n');
    return { sent: false, mock: true };
  }
}
