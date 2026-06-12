const RATE = 2.5; // €2.50 flat rate per search regardless of passport count

// Live order summary for paid-tier users.
export default function OrderSummary({ passportCount }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h3 className="mb-2 text-sm font-semibold text-slate-700">Order summary</h3>
      <div className="flex justify-between text-sm text-slate-600">
        <span>Passport numbers</span>
        <span>{passportCount}</span>
      </div>
      <div className="flex justify-between text-sm text-slate-600">
        <span>Search fee (flat rate)</span>
        <span>€{RATE.toFixed(2)}</span>
      </div>
      <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 text-base font-semibold text-slate-800">
        <span>Total</span>
        <span>€{RATE.toFixed(2)}</span>
      </div>
    </div>
  );
}

export { RATE };
