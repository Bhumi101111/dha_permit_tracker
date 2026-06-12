import { useState } from 'react';
import OrderSummary from '../components/OrderSummary.jsx';
import { api } from '../api.js';

// Card fields are collected for UI realism but the actual charge happens on
// Stripe's hosted Checkout page (test mode). We never send raw card data to our server.
export default function PaymentPage({ passports, token, onBack }) {
  const [form, setForm] = useState({ name: '', number: '', expiry: '', cvv: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { url } = await api.createCheckout(passports, token);
      // Redirect to Stripe hosted checkout.
      window.location.href = url;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <button onClick={onBack} className="mb-4 text-sm text-slate-500 hover:text-slate-700">
        ← Back to search
      </button>
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Payment</h1>
      <p className="mb-6 text-sm text-slate-500">Complete your payment to view results.</p>

      <div className="mb-6">
        <OrderSummary passportCount={passports.length} />
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Cardholder name</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={update('name')}
            placeholder="Name on card"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Card number</label>
          <input
            type="text"
            required
            inputMode="numeric"
            value={form.number}
            onChange={update('number')}
            placeholder="4242 4242 4242 4242"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-slate-700">Expiry</label>
            <input
              type="text"
              required
              value={form.expiry}
              onChange={update('expiry')}
              placeholder="MM/YY"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-slate-700">CVV</label>
            <input
              type="text"
              required
              inputMode="numeric"
              value={form.cvv}
              onChange={update('cvv')}
              placeholder="123"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
        </div>

        <p className="text-xs text-slate-400">
          You'll be redirected to Stripe's secure checkout (test mode) to complete payment.
        </p>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Redirecting…' : 'Continue to Stripe'}
        </button>
      </form>
    </div>
  );
}
