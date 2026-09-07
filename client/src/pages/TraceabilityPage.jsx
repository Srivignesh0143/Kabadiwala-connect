import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  MapPin,
  Package,
  Search,
  Route,
  Loader2,
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../lib/api';

const statusStyles = {
  LOT_CREATED: 'bg-slate-100 text-slate-700',
  MATCHED: 'bg-blue-50 text-blue-700',
  HANDED_OVER: 'bg-violet-50 text-violet-700',
  IN_INVENTORY: 'bg-amber-50 text-amber-700',
  PROCESSING: 'bg-orange-50 text-orange-700',
  TRANSFERRED_TO_RECYCLER: 'bg-indigo-50 text-indigo-700',
  RECYCLED: 'bg-emerald-50 text-emerald-700',
};

function formatStatus(status) {
  return String(status || '')
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function TraceabilityPage() {
  const [lots, setLots] = useState([]);
  const [selectedLot, setSelectedLot] = useState(null);
  const [events, setEvents] = useState([]);
  const [loadingLots, setLoadingLots] = useState(true);
  const [loadingJourney, setLoadingJourney] = useState(false);
  const [search, setSearch] = useState('');

  const fetchLots = async () => {
    try {
      setLoadingLots(true);

      const response = await api.get('/lots');

      setLots(response.data.lots || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Unable to load lots'
      );
    } finally {
      setLoadingLots(false);
    }
  };

  useEffect(() => {
    void fetchLots();
  }, []);

  const viewJourney = async (lot) => {
    try {
      setSelectedLot(lot);
      setEvents([]);
      setLoadingJourney(true);

      const response = await api.get(
        `/lots/${lot._id}/traceability`
      );

      setEvents(response.data.traceability || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Unable to load lot journey'
      );
    } finally {
      setLoadingJourney(false);
    }
  };

  const filteredLots = lots.filter((lot) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    return `${lot.lotId} ${lot.materialType} ${lot.location}`
      .toLowerCase()
      .includes(query);
  });

  // ===============================
  // LOT JOURNEY VIEW
  // ===============================

  if (selectedLot) {
    return (
      <div className="space-y-6">

        {/* HEADER */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <button
              onClick={() => {
                setSelectedLot(null);
                setEvents([]);
              }}
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-emerald-600"
            >
              <ArrowLeft size={16} />
              Back to lots
            </button>

            <p className="text-xs uppercase tracking-[0.35em] text-emerald-600">
              Lot Traceability
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              {selectedLot.lotId}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Track the complete journey of this e-waste lot.
            </p>
          </div>

          {/* CURRENT STATUS */}
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Current status
            </p>

            <span
              className={`mt-2 inline-flex rounded-full px-3 py-1.5 text-sm font-semibold ${
                statusStyles[selectedLot.status] ||
                'bg-slate-100 text-slate-700'
              }`}
            >
              {formatStatus(selectedLot.status)}
            </span>
          </div>
        </div>

        {/* LOT INFORMATION */}
        <div className="grid gap-4 md:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Package className="mb-3 text-emerald-600" size={22} />

            <p className="text-sm text-slate-500">
              Material
            </p>

            <p className="mt-1 font-semibold text-slate-900">
              {selectedLot.materialType}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Package className="mb-3 text-blue-600" size={22} />

            <p className="text-sm text-slate-500">
              Estimated Weight
            </p>

            <p className="mt-1 font-semibold text-slate-900">
              {selectedLot.estimatedWeight} kg
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <MapPin className="mb-3 text-violet-600" size={22} />

            <p className="text-sm text-slate-500">
              Current Location
            </p>

            <p className="mt-1 font-semibold text-slate-900">
              {selectedLot.location}
            </p>
          </div>

        </div>

        {/* JOURNEY TIMELINE */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-8 flex items-center gap-3">

            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <Route size={22} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Complete Journey
              </h2>

              <p className="text-sm text-slate-500">
                Every recorded event for this lot.
              </p>
            </div>

          </div>

          {loadingJourney ? (

            <div className="flex justify-center py-12 text-emerald-600">
              <Loader2 className="animate-spin" size={30} />
            </div>

          ) : events.length === 0 ? (

            <div className="py-10 text-center text-sm text-slate-500">
              No journey events found for this lot.
            </div>

          ) : (

            <div className="relative space-y-6 border-l-2 border-emerald-100 pl-7">

              {events.map((event, index) => (

                <div
                  key={event._id}
                  className="relative"
                >

                  {/* TIMELINE DOT */}

                  <div
                    className={`absolute -left-[35px] top-1 flex h-4 w-4 items-center justify-center rounded-full border-4 border-white ${
                      index === events.length - 1
                        ? 'bg-emerald-500'
                        : 'bg-slate-300'
                    }`}
                  />

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">

                      <div>

                        <span className="text-base font-semibold text-slate-900">
                          {formatStatus(event.eventType)}
                        </span>

                        <p className="mt-2 text-sm text-slate-600">
                          {event.remarks}
                        </p>

                      </div>

                      <div className="flex shrink-0 items-center gap-2 text-xs text-slate-500">

                        <Clock3 size={14} />

                        {event.timestamp
                          ? new Date(
                              event.timestamp
                            ).toLocaleString()
                          : 'Time unavailable'}

                      </div>

                    </div>

                    {event.location ? (

                      <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">

                        <MapPin size={15} />

                        {event.location}

                      </div>

                    ) : null}

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>
    );
  }

  // ===============================
  // LOT LIST VIEW
  // ===============================

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

        <p className="text-xs uppercase tracking-[0.35em] text-emerald-600">
          Traceability
        </p>

        <h1 className="mt-3 text-3xl font-bold text-slate-900">
          Track your material journey
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          View the current status and complete journey of every
          e-waste lot relevant to your account.
        </p>

      </div>

      {/* SEARCH */}

      <div className="relative">

        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          size={18}
        />

        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by Lot ID, material or location..."
          className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-emerald-400"
        />

      </div>

      {/* LOTS */}

      {loadingLots ? (

        <div className="flex justify-center py-16 text-emerald-600">
          <Loader2 className="animate-spin" size={32} />
        </div>

      ) : filteredLots.length === 0 ? (

        <div className="rounded-3xl border border-slate-200 bg-white py-16 text-center">

          <Package
            className="mx-auto text-slate-300"
            size={40}
          />

          <h3 className="mt-4 font-semibold text-slate-800">
            No lots found
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            There are currently no lots matching your search.
          </p>

        </div>

      ) : (

        <div className="grid gap-5 lg:grid-cols-2">

          {filteredLots.map((lot) => (

            <div
              key={lot._id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >

              <div className="flex items-start justify-between gap-4">

                <div>

                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Lot ID
                  </p>

                  <h2 className="mt-2 text-xl font-bold text-slate-900">
                    {lot.lotId}
                  </h2>

                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    statusStyles[lot.status] ||
                    'bg-slate-100 text-slate-700'
                  }`}
                >
                  {formatStatus(lot.status)}
                </span>

              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">

                <div>

                  <p className="text-xs text-slate-500">
                    Material
                  </p>

                  <p className="mt-1 font-medium text-slate-800">
                    {lot.materialType}
                  </p>

                </div>

                <div>

                  <p className="text-xs text-slate-500">
                    Weight
                  </p>

                  <p className="mt-1 font-medium text-slate-800">
                    {lot.estimatedWeight} kg
                  </p>

                </div>

                <div className="col-span-2">

                  <p className="text-xs text-slate-500">
                    Location
                  </p>

                  <p className="mt-1 flex items-center gap-2 font-medium text-slate-800">

                    <MapPin
                      size={15}
                      className="text-emerald-600"
                    />

                    {lot.location}

                  </p>

                </div>

              </div>

              <button
                onClick={() => viewJourney(lot)}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white transition hover:bg-emerald-500"
              >

                View Complete Journey

                <ArrowRight size={17} />

              </button>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}