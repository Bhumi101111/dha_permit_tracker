// Lightweight fetch wrapper for the eVisa Tracker API.
async function request(path, { method = 'GET', body, token } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  sendOtp: (email) => request('/auth/send-otp', { method: 'POST', body: { email } }),
  verifyOtp: (email, otp) => request('/auth/verify-otp', { method: 'POST', body: { email, otp } }),
  search: (passports, token) =>
    request(`/data/search?passports=${encodeURIComponent(passports.join(','))}`, { token }),
  createCheckout: (passports, token) =>
    request('/payment/create-checkout', { method: 'POST', body: { passports }, token }),
  paymentStatus: (sessionId) =>
    request(`/payment/status?session_id=${encodeURIComponent(sessionId)}`),
};
