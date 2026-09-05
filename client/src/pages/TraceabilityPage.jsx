import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../lib/api';

export default function TraceabilityPage() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    async function fetchTraceability() {
      try {
        const response = await api.get('/lots');
        const lots = response.data.lots || [];

        const eventRequests = lots.map((lot) => api.get(`/lots/${lot._id}/traceability`));
        const results = await Promise.all(eventRequests);
        const allEvents = results.flatMap((result) => result.data.traceability || []);
        setEvents(allEvents);
      } catch {
        toast.error('Unable to load traceability');
      }
    }

    void fetchTraceability();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-600">Traceability</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Material journey log</h1>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="space-y-3">
          {events.length === 0 ? (
            <p className="text-sm text-slate-500">No traceability events yet.</p>
          ) : (
            events.map((event) => (
              <div key={event._id} className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-medium text-slate-900">{event.eventType}</div>
                  <div className="text-sm text-slate-500">{new Date(event.timestamp).toLocaleString()}</div>
                </div>
                <div className="text-sm text-slate-600">{event.location}</div>
                <div className="max-w-md text-sm text-slate-600">{event.remarks}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
