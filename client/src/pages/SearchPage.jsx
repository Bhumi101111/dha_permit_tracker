import { useState } from 'react';
import PassportRow from '../components/PassportRow.jsx';
import OrderSummary from '../components/OrderSummary.jsx';

const MAX_BULK = 10;

export default function SearchPage({ tier, loading, error, onSearch }) {
  const [mode, setMode] = useState('single'); // 'single' | 'bulk'
  const [single, setSingle] = useState('');
  const [rows, setRows] = useState(['']);

  const passports =
    mode === 'single'
      ? [single.trim().toUpperCase()].filter(Boolean)
      : rows.map((r) => r.trim().toUpperCase()).filter(Boolean);

  const addRow = () => {
    if (rows.length < MAX_BULK) setRows([...rows, '']);
  };
  const removeRow = (i) => setRows(rows.filter((_, idx) => idx !== i));
  const updateRow = (i, val) => setRows(rows.map((r, idx) => (idx === i ? val : r)));

  const submit = (e) => {
    e.preventDefault();
    if (passports.length === 0) return;
    onSearch(passports);
  };

  const buttonLabel = tier === 'paid' ? 'Proceed to payment' : 'Search';

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Search applications</h1>
      <p className="mb-6 text-sm text-slate-500">
        Look up application status by passport number.{' '}
        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs uppercase tracking-wide">{tier} tier</span>
      </p>

      {/* Mode toggle */}
      <div className="mb-6 inline-flex rounded-lg border border-slate-300 p-1">
        <button
          type="button"
          onClick={() => setMode('single')}
          className={`rounded-md px-4 py-1.5 text-sm font-medium ${mode === 'single' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}
        >
          Single
        </button>
        <button
          type="button"
          onClick={() => setMode('bulk')}
          className={`rounded-md px-4 py-1.5 text-sm font-medium ${mode === 'bulk' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}
        >
          Bulk (max {MAX_BULK})
        </button>
      </div>

      <form onSubmit={submit} className="space-y-4">
        {mode === 'single' ? (
          <div>
            <label htmlFor="passport" className="mb-1 block text-sm font-medium text-slate-700">
              Passport number
            </label>
            <input
              id="passport"
              type="text"
              value={single}
              onChange={(e) => setSingle(e.target.value.toUpperCase())}
              placeholder="Passport number"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 uppercase focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <span className="block text-sm font-medium text-slate-700">Passport number</span>
            {rows.map((value, i) => (
              <PassportRow
                key={i}
                index={i}
                value={value}
                onChange={(val) => updateRow(i, val)}
                onRemove={() => removeRow(i)}
                canRemove={rows.length > 1}
              />
            ))}
            <button
              type="button"
              onClick={addRow}
              disabled={rows.length >= MAX_BULK}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 disabled:opacity-40"
            >
              + Add passport ({rows.length}/{MAX_BULK})
            </button>
          </div>
        )}

        {tier === 'paid' && <OrderSummary passportCount={passports.length} />}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading || passports.length === 0}
          className="w-full rounded-lg bg-indigo-600 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Please wait…' : buttonLabel}
        </button>
      </form>
    </div>
  );
}
