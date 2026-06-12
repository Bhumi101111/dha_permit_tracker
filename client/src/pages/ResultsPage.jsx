import StatusBadge from '../components/StatusBadge.jsx';

function toCsv(results) {
  const header = ['#', 'Passport number', 'Visa type', 'Applicant name', 'Status', 'Decision date'];
  const rows = results.map((r, i) => [
    i + 1,
    r.passport_number,
    r.found ? r.visa_type : '',
    r.found ? r.applicant_name : 'Not found',
    r.found ? r.status_label : 'Not found',
    r.found ? r.decision_date : '',
  ]);
  return [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\r\n');
}

export default function ResultsPage({ results, onReset }) {
  const exportCsv = () => {
    const blob = new Blob([toCsv(results)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'evisa-results.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Search results</h1>
        <div className="flex gap-2 print:hidden">
          <button onClick={exportCsv} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
            Export CSV
          </button>
          <button onClick={() => window.print()} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
            Print
          </button>
          <button onClick={onReset} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700">
            New search
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Passport number</th>
              <th className="px-4 py-3">Visa type</th>
              <th className="px-4 py-3">Applicant name</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Decision date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {results.map((r, i) => (
              <tr key={`${r.passport_number}-${i}`} className={r.found ? '' : 'bg-slate-50/60'}>
                <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                <td className="px-4 py-3 font-mono font-medium text-slate-800">{r.passport_number}</td>
                {r.found ? (
                  <>
                    <td className="px-4 py-3 text-slate-600">{r.visa_type}</td>
                    <td className="px-4 py-3 text-slate-600">{r.applicant_name}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} label={r.status_label} />
                    </td>
                    <td className="px-4 py-3 text-slate-600">{r.decision_date || '—'}</td>
                  </>
                ) : (
                  <td colSpan={4} className="px-4 py-3 italic text-slate-400">
                    Not found
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
