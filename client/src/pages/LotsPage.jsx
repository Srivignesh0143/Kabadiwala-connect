/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  MapPin,
  PackageCheck,
  Play,
  Warehouse,
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function LotsPage() {
  const { user } = useAuth();

  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);

  /*
  =============================================
  FETCH LOTS
  =============================================
  */

  const fetchLots = async () => {
    try {
      setLoading(true);

      const response = await api.get('/lots');

      setLots(response.data.lots || []);
    } catch (error) {
      console.error(error);
      toast.error('Unable to load lots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchLots();
  }, []);

  /*
  =============================================
  ACCEPT LOT - AGGREGATOR

  MATCHED → IN_INVENTORY
  =============================================
  */

  const handleAcceptLot = async (lotId) => {
    try {
      await api.post(`/lots/${lotId}/accept`);

      toast.success('Lot accepted and added to inventory');

      fetchLots();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Unable to accept lot'
      );
    }
  };

  /*
  =============================================
  START PROCESSING - RECYCLER

  Direct:
  MATCHED → PROCESSING

  Via Aggregator:
  TRANSFERRED_TO_RECYCLER → PROCESSING
  =============================================
  */

  const handleStartProcessing = async (lotId) => {
    try {
      await api.post(`/lots/${lotId}/start-processing`);

      toast.success('Recycling process started');

      fetchLots();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Unable to start processing'
      );
    }
  };

  /*
  =============================================
  MARK AS RECYCLED - RECYCLER

  PROCESSING → RECYCLED
  =============================================
  */

  const handleRecycle = async (lotId) => {
    try {
      await api.post(`/lots/${lotId}/recycle`);

      toast.success('Lot successfully recycled');

      fetchLots();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Unable to recycle lot'
      );
    }
  };

  /*
  =============================================
  ROLE CHECKS
  =============================================
  */

  const isCollector = user?.role === 'COLLECTOR';
  const isAggregator = user?.role === 'AGGREGATOR';
  const isRecycler = user?.role === 'RECYCLER';
  const isAdmin = user?.role === 'ADMIN';

  /*
  =============================================
  STATUS STYLE
  =============================================
  */

  const getStatusStyle = (status) => {
    switch (status) {
      case 'LOT_CREATED':
        return 'bg-slate-100 text-slate-700 border-slate-200';

      case 'MATCHED':
        return 'bg-blue-50 text-blue-700 border-blue-200';

      case 'HANDED_OVER':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';

      case 'IN_INVENTORY':
        return 'bg-amber-50 text-amber-700 border-amber-200';

      case 'TRANSFERRED_TO_RECYCLER':
        return 'bg-purple-50 text-purple-700 border-purple-200';

      case 'PROCESSING':
        return 'bg-orange-50 text-orange-700 border-orange-200';

      case 'RECYCLED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';

      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  /*
  =============================================
  PAGE TITLE
  =============================================
  */

  let pageTitle = 'Lots';

  if (isCollector) {
    pageTitle = 'My Lots';
  }

  if (isAggregator) {
    pageTitle = 'Aggregator Inventory';
  }

  if (isRecycler) {
    pageTitle = 'Recycler Queue';
  }

  if (isAdmin) {
    pageTitle = 'All Lots';
  }

  return (
    <div className="space-y-6">

      {/* =============================================
          HEADER
      ============================================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-600">
            Inventory
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            {pageTitle}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Track and manage material lots through the recycling journey.
          </p>
        </div>

        {/* ONLY COLLECTOR CAN CREATE LOT */}

        {isCollector && (
          <Link
            to="/lots/new"
            className="rounded-xl bg-emerald-600 px-4 py-2.5 font-medium text-white transition hover:bg-emerald-500"
          >
            + New Lot
          </Link>
        )}

      </div>

      {/* =============================================
          LOADING
      ============================================= */}

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
          Loading lots...
        </div>
      )}

      {/* =============================================
          EMPTY STATE
      ============================================= */}

      {!loading && lots.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

          <PackageCheck
            size={40}
            className="mx-auto text-slate-300"
          />

          <h2 className="mt-4 text-lg font-semibold text-slate-800">
            No lots available
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            There are currently no lots assigned to your account.
          </p>

        </div>
      )}

      {/* =============================================
          LOT LIST
      ============================================= */}

      {!loading && lots.length > 0 && (
        <div className="grid gap-4">

          {lots.map((lot) => (

            <div
              key={lot._id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >

              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                {/* =====================================
                    LOT INFORMATION
                ===================================== */}

                <div className="flex items-start gap-4">

                  {/* IMAGE */}

                  {lot.image ? (
                    <img
                      src={lot.image}
                      alt={lot.materialType}
                      className="h-20 w-20 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-slate-100">
                      <PackageCheck
                        size={30}
                        className="text-slate-400"
                      />
                    </div>
                  )}

                  <div>

                    <div className="flex flex-wrap items-center gap-3">

                      <h2 className="text-xl font-semibold text-slate-900">
                        {lot.lotId}
                      </h2>

                      <span
                        className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${getStatusStyle(
                          lot.status
                        )}`}
                      >
                        {lot.status.replaceAll('_', ' ')}
                      </span>

                    </div>

                    <div className="mt-2 text-sm text-slate-600">
                      {lot.materialType} • {lot.estimatedWeight} kg
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                      <MapPin size={14} />
                      {lot.location}
                    </div>

                    {/* CURRENT HOLDER */}

                    {lot.buyer && (
                      <div className="mt-2 text-xs text-slate-500">

                        Current holder:{' '}

                        <span className="font-semibold text-slate-700">
                          {lot.buyer?.name || 'Assigned Entity'}
                        </span>

                      </div>
                    )}

                    {/* AGGREGATOR HISTORY - ADMIN ONLY */}

                    {lot.aggregator && isAdmin && (
                      <div className="mt-1 text-xs text-slate-500">

                        Aggregator:{' '}

                        <span className="font-semibold text-slate-700">
                          {lot.aggregator?.name || 'Aggregator'}
                        </span>

                      </div>
                    )}

                  </div>

                </div>

                {/* =====================================
                    ACTION BUTTONS
                ===================================== */}

                <div className="flex flex-wrap gap-2">

                  {/* =====================================
                      AGGREGATOR ACCEPT

                      MATCHED → IN_INVENTORY
                  ===================================== */}

                  {isAggregator &&
                    lot.status === 'MATCHED' &&
                    lot.buyerType === 'AGGREGATOR' && (

                      <button
                        onClick={() =>
                          handleAcceptLot(lot._id)
                        }
                        className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-600"
                      >
                        <Warehouse size={16} />
                        Accept Lot
                      </button>

                    )}

                  {/* =====================================
                      RECYCLER START PROCESSING

                      DIRECT FLOW:
                      MATCHED → PROCESSING

                      AGGREGATOR FLOW:
                      TRANSFERRED_TO_RECYCLER → PROCESSING
                  ===================================== */}

                  {isRecycler &&
                    lot.buyerType === 'RECYCLER' &&
                    [
                      'MATCHED',
                      'TRANSFERRED_TO_RECYCLER',
                    ].includes(lot.status) && (

                      <button
                        onClick={() =>
                          handleStartProcessing(lot._id)
                        }
                        className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-700"
                      >
                        <Play size={16} />
                        Start Processing
                      </button>

                    )}

                  {/* =====================================
                      RECYCLER MARK RECYCLED

                      PROCESSING → RECYCLED
                  ===================================== */}

                  {isRecycler &&
                    lot.buyerType === 'RECYCLER' &&
                    lot.status === 'PROCESSING' && (

                      <button
                        onClick={() =>
                          handleRecycle(lot._id)
                        }
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
                      >
                        <CheckCircle2 size={16} />
                        Mark Recycled
                      </button>

                    )}

                  {/* =====================================
                      COMPLETED
                  ===================================== */}

                  {lot.status === 'RECYCLED' && (

                    <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">

                      <CheckCircle2 size={16} />

                      Completed

                    </div>

                  )}

                </div>

              </div>

            </div>

          ))}

        </div>
      )}

    </div>
  );
}