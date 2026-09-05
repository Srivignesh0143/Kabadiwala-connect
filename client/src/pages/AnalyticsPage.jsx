import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../lib/api';

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState({ lots: 0, verifiedEntities: 0, paidTransactions: 0 });

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const [lotsResponse, entitiesResponse] = await Promise.all([api.get('/lots'), api.get('/entities')]);
        const lots = lotsResponse.data.lots || [];
        const entities = entitiesResponse.data.entities || [];

        setMetrics({
          lots: lots.length,
          verifiedEntities: entities.filter((entity) => entity.verificationStatus === 'VERIFIED').length,
          paidTransactions: lots.filter((lot) => lot.paymentStatus === 'PAID').length,
        });
      } catch {
        toast.error('Unable to load analytics');
      }
    }

    void fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-600">Analytics</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Platform overview</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total lots</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{metrics.lots}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Verified entities</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{metrics.verifiedEntities}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Paid lots</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{metrics.paidTransactions}</p>
        </div>
      </div>
    </div>
  );
}
