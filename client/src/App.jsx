import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth.js';
import { api } from './api.js';

import EmailPage from './pages/EmailPage.jsx';
import OtpPage from './pages/OtpPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import PaymentPage from './pages/PaymentPage.jsx';
import ConfirmPage from './pages/ConfirmPage.jsx';
import ResultsPage from './pages/ResultsPage.jsx';

export default function App() {
  const { auth, login, logout } = useAuth();
  const [step, setStep] = useState('email'); // email | otp | search | payment | confirm | results
  const [pending, setPending] = useState({ email: '', tier: null });
  const [passports, setPassports] = useState([]);
  const [results, setResults] = useState([]);
  const [confirmation, setConfirmation] = useState(null);
  const [token, setToken] = useState(null); // active token (may come from auth or payment status)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle return from Stripe Checkout (?session_id=...&paid=1).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    const paid = params.get('paid');

    if (sessionId && paid === '1') {
      (async () => {
        try {
          const status = await api.paymentStatus(sessionId);
          setConfirmation({
            transactionId: status.transactionId,
            amount: status.amount,
            email: status.email,
          });
          setPassports(status.passports);
          setToken(status.token); // fresh token to fetch results after the redirect
          setStep('confirm');
        } catch {
          setError('Could not verify your payment. Please try again.');
          setStep('email');
        } finally {
          // Clean the URL so a refresh doesn't re-trigger.
          window.history.replaceState({}, '', window.location.pathname);
        }
      })();
    }
  }, []);

  const handleEmailSubmitted = ({ email, tier }) => {
    setPending({ email, tier });
    setStep('otp');
  };

  const handleVerified = ({ token: jwt, tier, email }) => {
    login({ token: jwt, tier, email });
    setToken(jwt);
    setStep('search');
  };

  const runSearch = async (list, authToken) => {
    setError('');
    setLoading(true);
    try {
      const { results: r } = await api.search(list, authToken);
      setResults(r);
      setStep('results');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (list) => {
    setPassports(list);
    if (auth.tier === 'paid') {
      setStep('payment');
    } else {
      await runSearch(list, token);
    }
  };

  const handleViewResults = async () => {
    await runSearch(passports, token);
  };

  const reset = () => {
    logout();
    setToken(null);
    setPassports([]);
    setResults([]);
    setConfirmation(null);
    setError('');
    setStep('email');
  };

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm print:shadow-none">
        {step === 'email' && <EmailPage onSubmitted={handleEmailSubmitted} />}

        {step === 'otp' && (
          <OtpPage
            email={pending.email}
            tier={pending.tier}
            onVerified={handleVerified}
            onBack={() => setStep('email')}
          />
        )}

        {step === 'search' && (
          <SearchPage tier={auth.tier} loading={loading} error={error} onSearch={handleSearch} />
        )}

        {step === 'payment' && (
          <PaymentPage passports={passports} token={token} onBack={() => setStep('search')} />
        )}

        {step === 'confirm' && confirmation && (
          <ConfirmPage confirmation={confirmation} onViewResults={handleViewResults} />
        )}

        {step === 'results' && <ResultsPage results={results} onReset={reset} />}
      </div>
    </div>
  );
}
