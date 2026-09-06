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

  // Verify User
  const updateUserStatus = async (userId, verificationStatus) => {
    try {
      await api.patch(`/users/${userId}/verify`, {
        verificationStatus,
      });

      toast.success('User verification updated');
      await fetchData();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Unable to update user status'
      );
    }
  };

  // Verify Buyer Entity
  const updateEntityStatus = async (entityId, verificationStatus) => {
    try {
      await api.patch(`/entities/${entityId}/verify`, {
        verificationStatus,
      });

      toast.success('Buyer verification updated');
      await fetchData();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Unable to update entity status'
      );
    }
  };

  return (
    <div className="space-y-10">

      {/* HEADER */}
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-600">
          Admin Control
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Platform Verification Center
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Verify Aggregators and Recyclers before they participate in
          the Kabadiwala Connect marketplace.
        </p>
      </div>


      {/* USERS */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="mb-4">
          <h2 className="text-xl font-semibold text-slate-900">
            User Accounts
          </h2>

          <p className="text-sm text-slate-500">
            Manage participant account verification.
          </p>
        </div>

        <div className="space-y-3">

          {users.map((user) => (

            <div
              key={user._id}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
            >

              <div>

                <div className="font-medium text-slate-900">
                  {user.name}
                </div>

                <div className="text-sm text-slate-500">
                  {user.role} • {user.email}
                </div>

              </div>


              <div className="flex items-center gap-2">

                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                    user.verificationStatus === 'VERIFIED'
                      ? 'bg-emerald-50 text-emerald-700'
                      : user.verificationStatus === 'REJECTED'
                      ? 'bg-red-50 text-red-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {user.verificationStatus}
                </span>


                {/* Only verify Aggregator and Recycler */}
                {(user.role === 'AGGREGATOR' ||
                  user.role === 'RECYCLER') && (

                  <button
                    onClick={() =>
                      updateUserStatus(
                        user._id,
                        'VERIFIED'
                      )
                    }
                    className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
                  >
                    Approve
                  </button>

                )}

              </div>

            </div>

          ))}

        </div>

      </div>


      {/* BUYER ENTITIES */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="mb-4">

          <h2 className="text-xl font-semibold text-slate-900">
            Buyer Verification
          </h2>

          <p className="text-sm text-slate-500">
            Only verified Aggregators and Recyclers are visible to
            Collectors for buyer matching.
          </p>

        </div>


        <div className="space-y-3">

          {entities.map((entity) => (

            <div
              key={entity._id}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
            >

              <div>

                <div className="font-medium text-slate-900">
                  {entity.name}
                </div>

                <div className="text-sm text-slate-500">
                  {entity.type} • {entity.location}
                </div>

                {entity.materialsAccepted?.length > 0 && (

                  <div className="mt-1 text-xs text-slate-400">
                    Accepts: {entity.materialsAccepted.join(', ')}
                  </div>

                )}

              </div>


              <div className="flex items-center gap-2">

                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                    entity.verificationStatus === 'VERIFIED'
                      ? 'bg-emerald-50 text-emerald-700'
                      : entity.verificationStatus === 'REJECTED'
                      ? 'bg-red-50 text-red-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {entity.verificationStatus}
                </span>


                <button
                  onClick={() =>
                    updateEntityStatus(
                      entity._id,
                      'VERIFIED'
                    )
                  }
                  className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
                >
                  Verify
                </button>


                <button
                  onClick={() =>
                    updateEntityStatus(
                      entity._id,
                      'PENDING'
                    )
                  }
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Hold
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}