export default function StatusBadge({ status }) {
  const normalised = (status || '').toUpperCase();
  const palette = {
    RECYCLED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    MATCHED: 'bg-blue-50 text-blue-700 border-blue-200',
    'LOT CREATED': 'bg-slate-100 text-slate-700 border-slate-200',
    'IN TRANSIT': 'bg-amber-50 text-amber-700 border-amber-200',
    PROCESSING: 'bg-violet-50 text-violet-700 border-violet-200',
    HANDED_OVER: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    DEFAULT: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const chip = palette[normalised] || palette.DEFAULT;

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-medium ${chip}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {normalised}
    </span>
  );
}
