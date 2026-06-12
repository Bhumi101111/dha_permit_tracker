import { Router } from 'express';

import { authMiddleware } from '../middleware/authMiddleware.js';
import { lookupPassport } from '../services/excelService.js';

const router = Router();

const STATUS_LABELS = {
  approved: 'Approved',
  processing: 'In progress',
  pending: 'Awaiting docs',
  rejected: 'Rejected',
};

// GET /data/search?passports=GB123,GB456   (Bearer JWT required)
router.get('/search', authMiddleware, (req, res) => {
  const raw = String(req.query.passports ?? '').trim();
  if (!raw) {
    return res.status(400).json({ error: 'Provide at least one passport number' });
  }

  const passports = raw
    .split(',')
    .map((p) => p.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, 10); // hard cap at 10

  const results = passports.map((passport) => {
    const record = lookupPassport(passport);
    if (!record) {
      return { passport_number: passport, found: false };
    }
    return {
      passport_number: record.passport_number,
      applicant_name: record.applicant_name,
      visa_type: record.visa_type,
      status: record.status,
      status_label: STATUS_LABELS[record.status] || record.status,
      decision_date: record.decision_date,
      found: true,
    };
  });

  res.json({ tier: req.user.tier, count: results.length, results });
});

export default router;
