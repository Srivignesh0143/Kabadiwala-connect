import { useEffect, useMemo, useState } from 'react';
import { Search, ShieldCheck, Users as UsersIcon } from 'lucide-react';
import api from '../lib/api';

const verificationStyles = {
  VERIFIED: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  PENDING: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  REJECTED: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await api.get('/users');
        setUsers(response.data.users || []);
      } catch (error) {
        console.error('Unable to load users', error);
      } finally {
        setLoading(false);
      }
    }

    void fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return users.filter((user) => {
      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
      const searchableText = `${user.name} ${user.email} ${user.role} ${user.location}`.toLowerCase();
      const matchesQuery = !normalizedQuery || searchableText.includes(normalizedQuery);
      return matchesRole && matchesQuery;
    });
  }, [query, roleFilter, users]);

  const summary = useMemo(() => {
    const total = users.length;
    const verified = users.filter((user) => user.verificationStatus === 'VERIFIED').length;
    const pending = users.filter((user) => user.verificationStatus === 'PENDING').length;

    return { total, verified, pending };
  }, [users]);

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_45px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-emerald-700">Network directory</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-slate-900">Users</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              <UsersIcon size={16} className="text-emerald-600" />
              <span>{summary.total} total</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              <ShieldCheck size={16} />
              <span>{summary.verified} verified</span>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_45px_rgba(15,23,42,0.06)]">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search users by name, email or role"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-300 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Role</label>
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:border-emerald-300 focus:outline-none"
            >
              <option value="ALL">All</option>
              <option value="COLLECTOR">Collector</option>
              <option value="AGGREGATOR">Aggregator</option>
              <option value="RECYCLER">Recycler</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.16em] text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-12 text-center text-slate-500">Loading user list...</td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-12 text-center text-slate-500">No users match the current filter.</td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="border-t border-slate-200 bg-white hover:bg-slate-50/80">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800">{user.name}</div>
                        <div className="text-xs text-slate-500">{user.phone}</div>
                      </td>
                      <td className="px-4 py-3">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-700">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">{user.location}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${verificationStyles[user.verificationStatus] || verificationStyles.PENDING}`}>
                          {user.verificationStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
