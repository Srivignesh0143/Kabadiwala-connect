import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Boxes, BriefcaseBusiness, Building2, CreditCard, PackageCheck, ShieldCheck, Truck } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import DataTable from '../components/DataTable';
import ActionPanel from '../components/ActionPanel';

export default function DashboardPage() {
  const { user } = useAuth();
  const [lots, setLots] = useState([]);
  const [entities, setEntities] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const requests = [
          api.get('/lots'),
          api.get('/entities'),
        ];

        if (user?.role === 'ADMIN') {
          requests.push(api.get('/users'));
        }

        const responses = await Promise.all(requests);

        setLots(responses[0].data.lots || []);
        setEntities(responses[1].data.entities || []);
        setUsers(user?.role === 'ADMIN' ? (responses[2]?.data?.users || []) : []);
      } catch (error) {
        console.error('Dashboard fetch failed', error);
      }
    }

    if (user) {
      fetchData();
    }
  }, [user]);

  const roleConfig = useMemo(() => {
    const role = user?.role || 'COLLECTOR';
    const userLots = lots.filter((lot) => lot.collector === user?._id);
    const pendingEntities = entities.filter((entity) => entity.verificationStatus === 'PENDING').length;
    const pendingLots = lots.filter((lot) => ['LOT_CREATED', 'MATCHED'].includes(lot.status) && (!lot.buyer || lot.buyer === null)).length;
    const pendingPayments = lots.filter((lot) => lot.paymentStatus === 'PENDING').length;

    const configs = {
      COLLECTOR: {
        kicker: 'Collector dashboard',
        title: 'Good morning, ' + (user?.name?.split(' ')[0] || 'collector') + '.',
        subtitle: 'Here is what is happening across your circular supply network today.',
        action: { to: '/lots/new', label: 'Create lot' },
        metrics: [
          { label: 'Total lots', value: userLots.length, caption: userLots.length ? 'Live data' : 'No lots yet', icon: Boxes, accent: 'emerald' },
          { label: 'Ready to sell', value: userLots.filter((lot) => ['LOT_CREATED', 'MATCHED'].includes(lot.status)).length, caption: 'Current queue', icon: PackageCheck, accent: 'teal' },
          { label: 'Matched buyers', value: userLots.filter((lot) => lot.buyer).length, caption: 'Active matches', icon: BriefcaseBusiness, accent: 'blue' },
          { label: 'Payments', value: userLots.filter((lot) => lot.paymentStatus === 'PAID').length, caption: 'Settled', icon: CreditCard, accent: 'amber' },
        ],
        pending: pendingEntities || pendingLots || pendingPayments
          ? [
              pendingEntities ? { label: `${pendingEntities} entity verifications pending`, meta: 'KYC review queue', action: 'Review' } : null,
              pendingLots ? { label: `${pendingLots} lot${pendingLots > 1 ? 's' : ''} require buyer confirmation`, meta: 'Awaiting final match', action: 'Resolve' } : null,
              pendingPayments ? { label: `${pendingPayments} payment${pendingPayments > 1 ? 's' : ''} require confirmation`, meta: 'Settlement check', action: 'Confirm' } : null,
            ].filter(Boolean)
          : [{ label: 'No pending actions', meta: 'Your queue is clear', action: 'View' }],
      },
      AGGREGATOR: {
        kicker: 'Aggregator dashboard',
        title: 'Operations are on track across the collection network.',
        subtitle: 'Balance incoming material, inventory, and transparent settlements.',
        action: { to: '/buyers', label: 'Review buyers' },
        metrics: [
          { label: 'Incoming lots', value: lots.filter((lot) => ['LOT_CREATED', 'MATCHED'].includes(lot.status)).length, caption: 'Live intake', icon: Boxes, accent: 'emerald' },
          { label: 'Handover ready', value: lots.filter((lot) => lot.status === 'HANDED_OVER').length, caption: 'In transit', icon: Truck, accent: 'teal' },
          { label: 'Verified partners', value: entities.filter((entity) => entity.verificationStatus === 'VERIFIED').length, caption: 'Active network', icon: ShieldCheck, accent: 'blue' },
          { label: 'Settlements', value: lots.filter((lot) => lot.paymentStatus === 'PAID').length, caption: 'Cleared', icon: CreditCard, accent: 'amber' },
        ],
        pending: pendingLots || pendingPayments
          ? [
              pendingLots ? { label: `${pendingLots} lots awaiting intake`, meta: 'From collectors', action: 'Accept' } : null,
              { label: `${lots.filter((lot) => lot.status === 'HANDED_OVER').length} transfers ready for dispatch`, meta: 'Inventory movement', action: 'Dispatch' },
              pendingPayments ? { label: `${pendingPayments} payments due`, meta: 'Collector payouts', action: 'Review' } : null,
            ].filter(Boolean)
          : [{ label: 'No pending actions', meta: 'Network is balanced', action: 'View' }],
      },
      RECYCLER: {
        kicker: 'Recycler dashboard',
        title: 'Processing and recovery pipeline is live.',
        subtitle: 'Track intake, processing, and final recovery outcomes.',
        action: { to: '/lots', label: 'Open queue' },
        metrics: [
          { label: 'Available lots', value: lots.filter((lot) => ['MATCHED', 'HANDED_OVER'].includes(lot.status)).length, caption: 'Intake queue', icon: Boxes, accent: 'emerald' },
          { label: 'Processing', value: lots.filter((lot) => lot.status === 'PROCESSING').length, caption: 'Active batches', icon: PackageCheck, accent: 'teal' },
          { label: 'Recovered', value: lots.filter((lot) => lot.status === 'RECYCLED').length, caption: 'Yield', icon: ShieldCheck, accent: 'blue' },
          { label: 'Inventory', value: lots.length, caption: 'Total lots', icon: Building2, accent: 'amber' },
        ],
        pending: lots.filter((lot) => ['MATCHED', 'HANDED_OVER'].includes(lot.status)).length || pendingPayments
          ? [
              lots.filter((lot) => ['MATCHED', 'HANDED_OVER'].includes(lot.status)).length
                ? { label: `${lots.filter((lot) => ['MATCHED', 'HANDED_OVER'].includes(lot.status)).length} material intake checks`, meta: 'Awaiting acceptance', action: 'Inspect' }
                : null,
              lots.filter((lot) => lot.status === 'PROCESSING').length
                ? { label: `${lots.filter((lot) => lot.status === 'PROCESSING').length} processing batches active`, meta: 'In progress', action: 'Review' }
                : null,
              pendingPayments
                ? { label: `${pendingPayments} recycling confirmation${pendingPayments > 1 ? 's' : ''}`, meta: 'Final output approval', action: 'Confirm' }
                : null,
            ].filter(Boolean)
          : [{ label: 'No pending actions', meta: 'Everything is current', action: 'View' }],
      },
      ADMIN: {
        kicker: 'Admin dashboard',
        title: 'Good morning, ' + (user?.name?.split(' ')[0] || 'Asha') + '.',
        subtitle: 'Here’s what’s happening across the Kabadiwala Connect ecosystem today.',
        action: { to: '/admin', label: 'Review pending verifications' },
        metrics: [
          { label: 'Total lots', value: lots.length, caption: 'Live database', icon: Boxes, accent: 'emerald' },
          { label: 'Verified entities', value: entities.filter((entity) => entity.verificationStatus === 'VERIFIED').length, caption: 'Active partners', icon: ShieldCheck, accent: 'teal' },
          { label: 'Payments settled', value: lots.filter((lot) => lot.paymentStatus === 'PAID').length, caption: 'Total cleared', icon: CreditCard, accent: 'blue' },
          { label: 'Lots in transit', value: lots.filter((lot) => ['MATCHED', 'HANDED_OVER'].includes(lot.status)).length, caption: 'Current flow', icon: Truck, accent: 'amber' },
        ],
        pending: pendingEntities || pendingLots || pendingPayments
          ? [
              pendingEntities ? { label: `${pendingEntities} entity verifications pending`, meta: 'Partner network review', action: 'Review' } : null,
              pendingLots ? { label: `${pendingLots} lots require review`, meta: 'Material validation', action: 'Resolve' } : null,
              pendingPayments ? { label: `${pendingPayments} payment${pendingPayments > 1 ? 's' : ''} require confirmation`, meta: 'Settlement check', action: 'Confirm' } : null,
            ].filter(Boolean)
          : [{ label: 'No pending actions', meta: 'Everything is current', action: 'View' }],
      },
    };

    return configs[role] || configs.COLLECTOR;
  }, [lots, entities, user]);

  const rows = lots.slice(0, 5).map((lot) => ({
    lotId: lot.lotId,
    material: lot.materialType,
    location: lot.location,
    status: lot.status,
    updated: lot.updatedAt || lot.createdAt ? new Date(lot.updatedAt || lot.createdAt).toLocaleDateString() : '—',
  }));

  const ecosystem = useMemo(() => {
    const verifiedCollectors = users.filter((entry) => entry.role === 'COLLECTOR' && entry.verificationStatus === 'VERIFIED').length;
    const verifiedAggregators = users.filter((entry) => entry.role === 'AGGREGATOR' && entry.verificationStatus === 'VERIFIED').length;
    const verifiedRecyclers = users.filter((entry) => entry.role === 'RECYCLER' && entry.verificationStatus === 'VERIFIED').length;
    const totalVerified = verifiedCollectors + verifiedAggregators + verifiedRecyclers;
    const totalUsers = users.length || 1;
    const coverage = totalVerified ? Math.min(100, Math.round((totalVerified / totalUsers) * 100)) : 0;

    return [
      { label: 'Verified collectors', value: String(verifiedCollectors), percent: totalUsers ? Math.min(100, Math.round((verifiedCollectors / totalUsers) * 100)) : 0 },
      { label: 'Verified aggregators', value: String(verifiedAggregators), percent: totalUsers ? Math.min(100, Math.round((verifiedAggregators / totalUsers) * 100)) : 0 },
      { label: 'Verified recyclers', value: String(verifiedRecyclers), percent: totalUsers ? Math.min(100, Math.round((verifiedRecyclers / totalUsers) * 100)) : 0 },
      { label: 'Material coverage', value: `${coverage}%`, percent: coverage },
    ];
  }, [users]);

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-emerald-100 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.15),_transparent_35%),linear-gradient(135deg,#ffffff_0%,#f6faf8_100%)] p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-emerald-700">{roleConfig.kicker}</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-slate-900 md:text-4xl">{roleConfig.title}</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">{roleConfig.subtitle}</p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-white/70 p-4 shadow-sm">
            <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">Priority action</div>
            <div className="mt-3 text-base font-semibold text-slate-900">{roleConfig.pending[0].label}</div>
            <Link to={roleConfig.action.to} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500">
              {roleConfig.action.label}
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {roleConfig.metrics.map((item) => (
          <StatCard
            key={item.label}
            label={item.label}
            value={item.value}
            caption={item.caption}
            icon={item.icon}
            accent={item.accent}
          />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <ChartCard title="Lot activity" subtitle="Flow overview" values={[48, 62, 58, 80, 72, 90, 96]} color="#10b981" />
        <ActionPanel title="Pending actions" items={roleConfig.pending} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.7fr_0.9fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">Recent lot activity</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">Operational updates</h2>
            </div>
            <Link to="/lots" className="text-sm font-medium text-emerald-700 hover:text-emerald-600">View all</Link>
          </div>
          <DataTable rows={rows} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">Ecosystem overview</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">Network health</h2>

          <div className="mt-5 space-y-4">
            {ecosystem.map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-700">
                  <span>{item.label}</span>
                  <span className="font-medium text-slate-900">{item.value}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-800">Material coverage</div>
                <div className="text-xs text-slate-500">Across verified entities</div>
              </div>
              <div className="text-xl font-semibold text-slate-900">88%</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

