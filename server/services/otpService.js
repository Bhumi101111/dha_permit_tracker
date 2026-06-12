// In-memory OTP store with 10-minute TTL.
const OTP_TTL_MS = 10 * 60 * 1000;

// email -> { otp, expiresAt }
const store = new Map();

export function generateOtp(email) {
  const otp = String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
  const expiresAt = Date.now() + OTP_TTL_MS;
  store.set(email.toLowerCase(), { otp, expiresAt });
  return otp;
}

export function verifyOtp(email, otp) {
  const key = email.toLowerCase();
  const entry = store.get(key);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return false;
  }
  if (entry.otp !== String(otp).trim()) return false;
  // One-time use
  store.delete(key);
  return true;
}

// Periodically purge expired entries.
const cleanup = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.expiresAt) store.delete(key);
  }
}, 60_000);
if (typeof cleanup.unref === 'function') cleanup.unref();
