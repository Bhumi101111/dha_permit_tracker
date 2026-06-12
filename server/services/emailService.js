import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn('[emailService] SMTP env vars missing — emails will be logged to console instead of sent.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  return transporter;
}

async function send({ to, subject, html, text }) {
  const from = process.env.SMTP_FROM || 'eVisa Tracker <no-reply@evisa.example>';
  const tx = getTransporter();

  if (!tx) {
    console.log(`\n[emailService:DEV] To: ${to}\nSubject: ${subject}\n${text || html}\n`);
    return { dev: true };
  }

  return tx.sendMail({ from, to, subject, html, text });
}

export async function sendOtpEmail(to, otp) {
  const subject = 'Your eVisa Tracker verification code';
  const text = `Your verification code is ${otp}. It expires in 10 minutes.`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
      <h2>eVisa Application Tracker</h2>
      <p>Your verification code is:</p>
      <p style="font-size:32px;font-weight:bold;letter-spacing:8px">${otp}</p>
      <p style="color:#666">This code expires in 10 minutes.</p>
    </div>`;
  return send({ to, subject, html, text });
}

export async function sendReceiptEmail(to, { transactionId, amount, passportCount }) {
  const subject = 'Your eVisa Tracker payment receipt';
  const text = `Payment received. Transaction ID: ${transactionId}. Amount: €${amount}. Searches: ${passportCount}.`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
      <h2>Payment Receipt</h2>
      <p>Thank you for your payment.</p>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:6px 0;color:#666">Transaction ID</td><td style="padding:6px 0;text-align:right"><strong>${transactionId}</strong></td></tr>
        <tr><td style="padding:6px 0;color:#666">Amount charged</td><td style="padding:6px 0;text-align:right"><strong>€${amount}</strong></td></tr>
        <tr><td style="padding:6px 0;color:#666">Searches</td><td style="padding:6px 0;text-align:right"><strong>${passportCount}</strong></td></tr>
      </table>
    </div>`;
  return send({ to, subject, html, text });
}
