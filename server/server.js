import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { loadExcel, startExcelRefresh } from './services/excelService.js';
import authRoutes from './routes/auth.js';
import searchRoutes from './routes/search.js';
import paymentRoutes from './routes/payment.js';

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/auth', authRoutes);
app.use('/data', searchRoutes);
app.use('/payment', paymentRoutes);

// Centralized error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 4000;

// Load Excel data into memory before accepting traffic, then refresh every 60s.
loadExcel();
startExcelRefresh(60_000);

app.listen(PORT, () => {
  console.log(`eVisa Tracker server listening on http://localhost:${PORT}`);
});
