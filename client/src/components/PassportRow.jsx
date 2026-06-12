// A single passport-number row used in bulk search mode.
export default function PassportRow({ index, value, onChange, onRemove, canRemove }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-6 text-sm text-slate-400">{index + 1}.</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        placeholder="Passport number"
        className="flex-1 rounded-lg border border-slate-300 px-3 py-2 uppercase focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
      />
      <button
        type="button"
        onClick={onRemove}
        disabled={!canRemove}
        className="rounded-lg border border-slate-300 px-3 py-2 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
        aria-label="Remove row"
      >
        ✕
      </button>
    </div>
  );
}
