import { ArrowRight, Bell, Search, SlidersHorizontal } from 'lucide-react';

export default function TopHeader({ breadcrumb, user, onLogout }) {
  return (
    <header className="flex h-[72px] items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <SlidersHorizontal size={16} />
        </div>
        <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-slate-500">
          {breadcrumb}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 md:flex">
          <Search size={15} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search ecosystem"
            className="w-44 border-0 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        <button type="button" className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100">
          <Bell size={16} />
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
        </button>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
            {user?.name?.split(' ').map((x) => x[0]).join('').slice(0, 2).toUpperCase() || 'AN'}
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-semibold text-slate-800">{user?.name || 'Asha Nair'}</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">{user?.role || 'ADMIN'}</div>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-900 px-3 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
        >
          <span>Logout</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </header>
  );
}
