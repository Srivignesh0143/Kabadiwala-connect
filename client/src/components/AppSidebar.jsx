import { BarChart3, FileBadge, Gauge, LayoutDashboard, Package, ShieldCheck, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const roleNavMap = {
  COLLECTOR: [
    { title: 'Overview', items: [{ label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard }] },
    { title: 'Operations', items: [{ label: 'My Lots', to: '/lots', icon: Package }, { label: 'Find Buyers', to: '/buyers', icon: Users }] },
    { title: 'Traceability', items: [{ label: 'Traceability', to: '/traceability', icon: FileBadge }] },
  ],
  AGGREGATOR: [
    { title: 'Overview', items: [{ label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard }] },
    { title: 'Operations', items: [{ label: 'Incoming Lots', to: '/lots', icon: Package }, { label: 'Create Consolidated Lot', to: '/lots/new', icon: Package }, { label: 'Recycler Network', to: '/buyers', icon: Users }] },
    { title: 'Insights', items: [{ label: 'Analytics', to: '/analytics', icon: BarChart3 }, { label: 'Traceability', to: '/traceability', icon: FileBadge }] },
  ],
  RECYCLER: [
    { title: 'Overview', items: [{ label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard }] },
    { title: 'Operations', items: [{ label: 'Incoming Materials', to: '/lots', icon: Package }, { label: 'Processing', to: '/lots', icon: Package }] },
    { title: 'Traceability', items: [{ label: 'Recycling Records', to: '/traceability', icon: FileBadge }] },
  ],
  ADMIN: [
    { title: 'Overview', items: [{ label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard }] },
   { title: 'Management', items: [{ label: 'Users', to: '/users', icon: ShieldCheck }, { label: 'Entities', to: '/buyers', icon: Users }, { label: 'All Lots', to: '/lots', icon: Package }] },
    { title: 'Insights', items: [{ label: 'Analytics', to: '/analytics', icon: BarChart3 }, { label: 'Traceability', to: '/traceability', icon: FileBadge }] },
  ],
};

export default function AppSidebar({ user }) {
  const navGroups = roleNavMap[user?.role] || roleNavMap.COLLECTOR;

  return (
    <aside className="flex w-[280px] flex-col border-r border-emerald-900/40 bg-[#102A24] text-slate-100">
      <div className="border-b border-emerald-900/40 px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30">
            <Gauge className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] font-medium uppercase tracking-[0.28em] text-emerald-300">Kabadiwala</div>
            <div className="text-lg font-semibold tracking-[-0.04em]">Connect</div>
          </div>
        </div>
        <p className="mt-4 text-xs leading-5 text-emerald-100/70">AI-Powered Circular Economy Platform</p>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-5">
        {navGroups.map((group) => (
          <div key={group.title}>
            <p className="mb-2 px-3 text-[10px] font-medium uppercase tracking-[0.28em] text-emerald-200/60">{group.title}</p>
            <nav className="space-y-1">
              {group.items.map(({ label, to, icon: Icon }) => (
                <NavLink
                  key={label}
                  to={to}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-emerald-500/12 text-white ring-1 ring-emerald-400/25 before:absolute before:left-0 before:top-1 before:h-6 before:w-1 before:rounded-r-full before:bg-emerald-400'
                        : 'text-slate-300 hover:bg-emerald-500/8 hover:text-white'
                    }`
                  }
                >
                  <Icon className="h-4 w-4 text-emerald-300" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        ))}
      </div>

      <div className="border-t border-emerald-900/40 p-4">
        <div className="flex items-center gap-3 rounded-2xl bg-[#163C33] p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15 text-sm font-semibold text-emerald-200">
            {user?.name?.split(' ').map((x) => x[0]).join('').slice(0, 2).toUpperCase() || 'AN'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-white">{user?.name || 'Asha Nair'}</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-200/80">{user?.role || 'ADMIN'}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
