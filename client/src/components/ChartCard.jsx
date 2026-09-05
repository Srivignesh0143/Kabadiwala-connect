export default function ChartCard({ title, subtitle, values, color = '#10b981' }) {
  const max = Math.max(...values);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">{title}</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">{subtitle}</h3>
        </div>
        <div className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">Live</div>
      </div>

      <div className="flex h-44 items-end gap-3">
        {values.map((value, index) => (
          <div key={`${title}-${index}`} className="flex flex-1 flex-col items-center justify-end gap-2">
            <div
              className="w-full rounded-t-xl transition-all duration-300"
              style={{
                height: `${(value / max) * 100}%`,
                background: `linear-gradient(180deg, ${color} 0%, rgba(16,185,129,0.72) 100%)`,
                minHeight: '18px',
              }}
            />
            <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'][index] || index + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
