export default function ActionPanel({ title, items }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">Review</span>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div>
              <div className="text-sm font-medium text-slate-800">{item.label}</div>
              <div className="text-xs text-slate-500">{item.meta}</div>
            </div>
            <button className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100">
              {item.action}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
