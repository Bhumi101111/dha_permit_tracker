import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import xlsx from 'xlsx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXCEL_PATH = path.resolve(__dirname, '../../data/applications.xlsx');

// In-memory stores
let applications = new Map(); // passport_number (UPPER) -> record
let freeUsers = new Set(); // lowercased emails
let lastLoaded = null;
let refreshTimer = null;

// Always-free accounts used for demos/support access.
const ALWAYS_FREE_USERS = new Set(['agent@embassy.gov']);

function normalizePassport(value) {
  return String(value ?? '').trim().toUpperCase();
}

function normalizeEmail(value) {
  return String(value ?? '').trim().toLowerCase();
}

export function loadExcel() {
  try {
    if (!fs.existsSync(EXCEL_PATH)) {
      console.warn(`[excelService] Excel file not found at ${EXCEL_PATH}. Run "npm run seed" to generate a sample.`);
      return;
    }

    const workbook = xlsx.readFile(EXCEL_PATH);

    // Sheet 1: applications (first sheet)
    const appsSheetName = workbook.SheetNames[0];
    const appsRows = xlsx.utils.sheet_to_json(workbook.Sheets[appsSheetName], { defval: '' });

    const nextApps = new Map();
    for (const row of appsRows) {
      const passport = normalizePassport(row.passport_number);
      if (!passport) continue;
      nextApps.set(passport, {
        passport_number: passport,
        applicant_name: String(row.applicant_name ?? '').trim(),
        visa_type: String(row.visa_type ?? '').trim(),
        status: String(row.status ?? '').trim().toLowerCase(),
        decision_date: String(row.decision_date ?? '').trim(),
      });
    }

    // Sheet: free_users
    const nextFree = new Set();
    if (workbook.Sheets['free_users']) {
      const freeRows = xlsx.utils.sheet_to_json(workbook.Sheets['free_users'], { defval: '' });
      for (const row of freeRows) {
        const email = normalizeEmail(row.email);
        if (email) nextFree.add(email);
      }
    }

    applications = nextApps;
    freeUsers = nextFree;
    lastLoaded = new Date();
    console.log(`[excelService] Loaded ${applications.size} applications and ${freeUsers.size} free users at ${lastLoaded.toISOString()}`);
  } catch (err) {
    console.error('[excelService] Failed to load Excel:', err.message);
  }
}

export function startExcelRefresh(intervalMs = 60_000) {
  if (refreshTimer) clearInterval(refreshTimer);
  refreshTimer = setInterval(loadExcel, intervalMs);
  // Don't keep the process alive solely for the refresh timer.
  if (typeof refreshTimer.unref === 'function') refreshTimer.unref();
}

export function isFreeUser(email) {
  const normalized = normalizeEmail(email);
  return ALWAYS_FREE_USERS.has(normalized) || freeUsers.has(normalized);
}

export function lookupPassport(passport) {
  return applications.get(normalizePassport(passport)) || null;
}

export function getStats() {
  return { applications: applications.size, freeUsers: freeUsers.size, lastLoaded };
}
