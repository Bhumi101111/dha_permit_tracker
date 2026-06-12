export default function ConfirmPage({ confirmation, onViewResults }) {
  const { transactionId, amount, email } = confirmation;

  return (
    <div className="mx-auto max-w-md text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
        ✓
      </div>
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Payment successful</h1>
      <p className="mb-6 text-sm text-slate-500">Your search is ready to view.</p>

      <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 text-left">
        <div className="flex justify-between border-b border-slate-100 py-2 text-sm">
          <span className="text-slate-500">Transaction ID</span>
          <span className="font-mono font-medium text-slate-800">{transactionId}</span>
        </div>
        <div className="flex justify-between border-b border-slate-100 py-2 text-sm">
          <span className="text-slate-500">Amount charged</span>
          <span className="font-medium text-slate-800">€{amount}</span>
        </div>
        <div className="flex justify-between py-2 text-sm">
          <span className="text-slate-500">Email</span>
          <span className="font-medium text-slate-800">{email}</span>
        </div>
      </div>

      <p className="mb-6 text-sm text-slate-500">📧 Receipt sent to your email.</p>

      <button
        onClick={onViewResults}
        className="w-full rounded-lg bg-indigo-600 py-2.5 font-medium text-white hover:bg-indigo-700"
      >
        View search results
      </button>
    </div>
  );
}
