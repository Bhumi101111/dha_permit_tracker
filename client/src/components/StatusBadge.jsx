// Maps backend status -> label + Tailwind color classes.
const STYLES = {
  approved: { label: 'Approved', className: 'bg-green-100 text-green-700 ring-green-600/20' },
  processing: { label: 'In progress', className: 'bg-blue-100 text-blue-700 ring-blue-600/20' },
  pending: { label: 'Awaiting docs', className: 'bg-amber-100 text-amber-700 ring-amber-600/20' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700 ring-red-600/20' },
};

export default function StatusBadge({ status, label }) {
  const style = STYLES[status] || { label: label || status || 'Unknown', className: 'bg-slate-100 text-slate-600 ring-slate-500/20' };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${style.className}`}>
      {label || style.label}
    </span>
  );
}
