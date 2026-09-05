import { ArrowUpRight } from 'lucide-react';

export default function StatCard({ label, value, caption, icon: Icon, accent = 'emerald' }) {
  const accentClass = {
    emerald: 'bg-emerald-50 text-emerald-600',
    teal: 'bg-teal-50 text-teal-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
  }[accent] || 'bg-emerald-50 text-emerald-600';

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">{label}</p>
          <h3 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-slate-900">{value}</h3>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${accentClass}`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700">
          <ArrowUpRight size={12} />
          {caption}
        </span>
      </div>
    </div>
  );
}
