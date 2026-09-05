import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../lib/api';

export default function BuyerPage() {
  const [entities, setEntities] = useState([]);
  const [lots, setLots] = useState([]);
  const [selectedLotId, setSelectedLotId] = useState('');
  const [selectedBuyerId, setSelectedBuyerId] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [entitiesResponse, lotsResponse] = await Promise.all([api.get('/entities'), api.get('/lots')]);
        setEntities(entitiesResponse.data.entities || []);
        setLots(lotsResponse.data.lots || []);
        setSelectedLotId(lotsResponse.data.lots?.[0]?._id || '');
        setSelectedBuyerId(entitiesResponse.data.entities?.[0]?._id || '');
      } catch {
        toast.error('Unable to load buyer network');
      }
    }

    void fetchData();
  }, []);

  const handleMatch = async () => {
    const buyer = entities.find((item) => item._id === selectedBuyerId);
    if (!selectedLotId || !buyer) {
      toast.error('Please select a lot and a verified buyer');
      return;
    }

    try {
      await api.post(`/lots/${selectedLotId}/match`, {
        buyerId: buyer.user,
        buyerType: buyer.type,
      });
      toast.success(`Lot matched with ${buyer.name}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to match buyer');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-600">Buyer matching</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Recommend suitable buyers</h1>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-slate-700">Select lot</label>
            <select value={selectedLotId} onChange={(e) => setSelectedLotId(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900">
              {lots.map((lot) => (
                <option key={lot._id} value={lot._id}>{lot.lotId} • {lot.materialType}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-700">Select buyer</label>
            <select value={selectedBuyerId} onChange={(e) => setSelectedBuyerId(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900">
              {entities.map((entity) => (
                <option key={entity._id} value={entity._id}>{entity.name} • {entity.type}</option>
              ))}
            </select>
          </div>
        </div>

        <button onClick={handleMatch} className="mt-5 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-500">
          Match lot to buyer
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {entities.map((entity) => (
          <div key={entity._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{entity.name}</h2>
                <p className="text-sm text-slate-500">{entity.type}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[11px] ${entity.verificationStatus === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                {entity.verificationStatus}
              </span>
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p>Location: {entity.location}</p>
              <p>Accepted: {entity.materialsAccepted.join(', ')}</p>
              <p>Contact: {entity.contactInformation?.phone}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
