/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, CircleDollarSign, MapPin, PackageCheck, Truck } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function LotsPage() {
  const { user } = useAuth();
  const [lots, setLots] = useState([]);

  const fetchLots = async () => {
    try {
      const response = await api.get('/lots');
      setLots(response.data.lots || []);
    } catch {
      toast.error('Unable to load lots');
    }
  };

  useEffect(() => {
    void fetchLots();
  }, []);

  const handleStatusUpdate = async (lotId, status) => {
    try {
      await api.patch(`/lots/${lotId}/status`, { status });
      toast.success(`Status updated to ${status}`);
      fetchLots();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update status');
    }
  };

  const isCollector = user?.role === 'COLLECTOR';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-600">Inventory</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{isCollector ? 'Lot management' : 'Operational queue'}</h1>
        </div>
        {isCollector ? (
          <Link to="/lots/new" className="rounded-xl bg-emerald-600 px-4 py-2.5 font-medium text-white transition hover:bg-emerald-500">
            + New lot
          </Link>
        ) : null}
      </div>

      <div className="grid gap-4">
        {lots.map((lot) => (
          <div key={lot._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <img src={lot.image} alt={lot.materialType} className="h-20 w-20 rounded-xl object-cover" />
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-slate-900">{lot.lotId}</h2>
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] text-emerald-700">{lot.status}</span>
                  </div>
                  <div className="mt-1 text-sm text-slate-500">{lot.materialType} • {lot.estimatedWeight} kg</div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                    <MapPin size={14} />
                    {lot.location}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {isCollector ? (
                  <>
                    <button onClick={() => handleStatusUpdate(lot._id, 'MATCHED')} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                      <PackageCheck size={14} /> Match
                    </button>
                    <button onClick={() => handleStatusUpdate(lot._id, 'HANDED_OVER')} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                      <Truck size={14} /> Handover
                    </button>
                    <button onClick={() => handleStatusUpdate(lot._id, 'PAID')} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                      <CircleDollarSign size={14} /> Payment
                    </button>
                  </>
                ) : (
                  <button onClick={() => handleStatusUpdate(lot._id, 'RECYCLED')} className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    <CheckCircle2 size={14} /> Recycled
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
