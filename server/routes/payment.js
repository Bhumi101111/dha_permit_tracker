import { Router } from 'express';
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';

import { authMiddleware } from '../middleware/authMiddleware.js';
import { sendReceiptEmail } from '../services/emailService.js';

const router = Router();

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

function searchRate() {
  return Number(process.env.SEARCH_RATE_EUR || '2.50');
}

// In-memory record of checkout sessions: sessionId -> { email, tier, passports, paid, paymentIntentId, amount }
const sessions = new Map();

// POST /payment/create-checkout  (Bearer JWT)  body: { passports[] }
router.post('/create-checkout', authMiddleware, async (req, res, next) => {
  try {
    if (req.user.tier !== 'paid') {
      return res.status(403).json({ error: 'Payment is only required for paid-tier users' });
    }

    const passports = Array.isArray(req.body?.passports)
      ? req.body.passports.map((p) => String(p).trim().toUpperCase()).filter(Boolean).slice(0, 10)
      : [];

    if (passports.length === 0) {
      return res.status(400).json({ error: 'Provide at least one passport number' });
    }

    const stripe = getStripe();
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe is not configured. Set STRIPE_SECRET_KEY.' });
    }

    // Flat rate per search regardless of how many passports are included.
    const amountEur = searchRate();
    const unitAmount = Math.round(amountEur * 100);

    const serverUrl = process.env.SERVER_URL || `${req.protocol}://${req.get('host')}`;
    // In a single-service deploy the client is served from the same origin.
    const clientUrl = process.env.CLIENT_URL || serverUrl;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'eur',
            unit_amount: unitAmount,
            product_data: {
              name: 'eVisa application search',
              description: `${passports.length} passport(s)`,
            },
          },
        },
      ],
      customer_email: req.user.email,
      success_url: `${serverUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/?canceled=1`,
      metadata: {
        email: req.user.email,
        tier: req.user.tier,
        passports: passports.join(','),
      },
    });

    sessions.set(session.id, {
      email: req.user.email,
      tier: req.user.tier,
      passports,
      paid: false,
      amount: amountEur.toFixed(2),
      paymentIntentId: null,
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    next(err);
  }
});

// GET /payment/success?session_id=xxx  (Stripe redirect target)
router.get('/success', async (req, res, next) => {
  try {
    const sessionId = String(req.query.session_id ?? '');
    const clientUrl = process.env.CLIENT_URL || `${req.protocol}://${req.get('host')}`;

    if (!sessionId) return res.redirect(`${clientUrl}/?error=missing_session`);

    const stripe = getStripe();
    if (!stripe) return res.redirect(`${clientUrl}/?error=stripe_unconfigured`);

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent'],
    });

    if (session.payment_status !== 'paid') {
      return res.redirect(`${clientUrl}/?error=not_paid`);
    }

    const paymentIntent = session.payment_intent;
    const paymentIntentId = typeof paymentIntent === 'string' ? paymentIntent : paymentIntent?.id;
    const amount = (session.amount_total ?? 0) / 100;

    // Reconstruct/refresh the in-memory record (survives even if created on another process restart).
    const passports = String(session.metadata?.passports ?? '')
      .split(',')
      .map((p) => p.trim().toUpperCase())
      .filter(Boolean);

    const record = {
      email: session.metadata?.email || session.customer_email,
      tier: session.metadata?.tier || 'paid',
      passports,
      paid: true,
      amount: amount.toFixed(2),
      paymentIntentId,
    };
    sessions.set(sessionId, record);

    // Send receipt email (best-effort).
    try {
      await sendReceiptEmail(record.email, {
        transactionId: paymentIntentId,
        amount: record.amount,
        passportCount: passports.length,
      });
    } catch (mailErr) {
      console.error('[payment] Receipt email failed:', mailErr.message);
    }

    // Redirect the browser back into the SPA confirmation flow.
    res.redirect(`${clientUrl}/?session_id=${encodeURIComponent(sessionId)}&paid=1`);
  } catch (err) {
    next(err);
  }
});

// GET /payment/status?session_id=xxx
// Returns confirmation details + a fresh JWT so the SPA can fetch results
// (React memory state is lost across the Stripe redirect round-trip).
router.get('/status', (req, res) => {
  const sessionId = String(req.query.session_id ?? '');
  const record = sessions.get(sessionId);

  if (!record || !record.paid) {
    return res.status(404).json({ error: 'No paid session found' });
  }

  const token = jwt.sign(
    { email: record.email, tier: record.tier },
    process.env.JWT_SECRET || 'dev-secret-change-me',
    { expiresIn: '1h' }
  );

  res.json({
    paid: true,
    transactionId: record.paymentIntentId,
    amount: record.amount,
    email: record.email,
    passports: record.passports,
    token,
  });
});

export default router;
