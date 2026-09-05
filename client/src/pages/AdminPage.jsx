/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../lib/api';

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [entities, setEntities] = useState([]);

  const fetchData = async () => {
    try {
      const [usersResponse, entitiesResponse] = await Promise.all([
        api.get('/users'),
        api.get('/entities'),
      ]);
      setUsers(usersResponse.data.users || []);
      setEntities(entitiesResponse.data.entities || []);
    } catch {
      toast.error('Unable to load admin data');
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const updateUserStatus = async (userId, verificationStatus) => {
    try {
      await api.patch(`/users/${userId}/verify`, { verificationStatus });
      toast.success('Verification status updated');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update user status');
    }
  };

  const updateEntityStatus = async (entityId, verificationStatus) => {
    try {
      await api.patch(`/entities/${entityId}/verify`, { verificationStatus });
      toast.success('Buyer verification updated');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update entity status');
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-600">Admin control</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">User and buyer verification</h1>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">Users</h2>
        <div className="space-y-3">
          {users.map((user) => (
            <div key={user._id} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-medium text-slate-900">{user.name}</div>
                <div className="text-sm text-slate-500">{user.role} • {user.email}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-1 text-[11px] ${user.verificationStatus === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                  {user.verificationStatus}
                </span>
                <button onClick={() => updateUserStatus(user._id, 'VERIFIED')} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Approve</button>
                <button onClick={() => updateUserStatus(user._id, 'PENDING')} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">Pending</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">Verified buyers</h2>
        <div className="space-y-3">
          {entities.map((entity) => (
            <div key={entity._id} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-medium text-slate-900">{entity.name}</div>
                <div className="text-sm text-slate-500">{entity.type} • {entity.location}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-1 text-[11px] ${entity.verificationStatus === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                  {entity.verificationStatus}
                </span>
                <button onClick={() => updateEntityStatus(entity._id, 'VERIFIED')} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Verify</button>
                <button onClick={() => updateEntityStatus(entity._id, 'PENDING')} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">Hold</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
