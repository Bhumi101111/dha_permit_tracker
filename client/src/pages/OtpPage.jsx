import { useState, useEffect } from 'react';
import OtpInput from '../components/OtpInput.jsx';
import { api } from '../api.js';

export default function OtpPage({ email, tier, onVerified, onBack }) {
  const [otp, setOtp] = useState('');
  const [seconds, setSeconds] = useState(60);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (seconds <= 0) return undefined;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const verify = async (e) => {
    e.preventDefault();
    setError('');
    if (otp.length !== 6) {
      setError('Enter all 6 digits.');
      return;
    }
    setLoading(true);
    try {
      const { token, tier: verifiedTier } = await api.verifyOtp(email, otp);
      onVerified({ token, tier: verifiedTier, email });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setError('');
    setResending(true);
    try {
      await api.sendOtp(email);
      setOtp('');
      setSeconds(60);
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <button onClick={onBack} className="mb-4 text-sm text-slate-500 hover:text-slate-700">
        ← Back
      </button>
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Verify your email</h1>
      <p className="mb-6 text-sm text-slate-500">
        We sent a 6-digit code to <span className="font-medium text-slate-700">{email}</span>{' '}
        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs uppercase tracking-wide">{tier} tier</span>
      </p>

      <form onSubmit={verify} className="space-y-5">
        <OtpInput value={otp} onChange={setOtp} disabled={loading} />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="text-center text-sm text-slate-500">
          {seconds > 0 ? (
            <span>Code expires in {seconds}s</span>
          ) : (
            <button
              type="button"
              onClick={resend}
              disabled={resending}
              className="font-medium text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
            >
              {resending ? 'Resending…' : 'Resend code'}
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Verifying…' : 'Verify'}
        </button>
      </form>
    </div>
  );
}
