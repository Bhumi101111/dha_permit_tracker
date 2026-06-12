import { Router } from 'express';
import jwt from 'jsonwebtoken';

import { isFreeUser } from '../services/excelService.js';
import { generateOtp, verifyOtp } from '../services/otpService.js';
import { sendOtpEmail } from '../services/emailService.js';

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /auth/send-otp  body: { email }
router.post('/send-otp', async (req, res, next) => {
  try {
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'A valid email address is required' });
    }

    // free_users sheet membership decides tier
    const tier = isFreeUser(email) ? 'free' : 'paid';

    const otp = generateOtp(email);
    await sendOtpEmail(email, otp);

    res.json({ tier, email });
  } catch (err) {
    next(err);
  }
});

// POST /auth/verify-otp  body: { email, otp } -> { token, tier }
router.post('/verify-otp', (req, res, next) => {
  try {
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const otp = String(req.body?.otp ?? '').trim();

    if (!EMAIL_RE.test(email) || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({ error: 'Valid email and 6-digit code are required' });
    }

    if (!verifyOtp(email, otp)) {
      return res.status(401).json({ error: 'Invalid or expired verification code' });
    }

    const tier = isFreeUser(email) ? 'free' : 'paid';
    const token = jwt.sign(
      { email, tier },
      process.env.JWT_SECRET || 'dev-secret-change-me',
      { expiresIn: '1h' }
    );

    res.json({ token, tier });
  } catch (err) {
    next(err);
  }
});

export default router;
