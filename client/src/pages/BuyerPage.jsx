import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function BuyerPage() {
  const { user } = useAuth();

  const [entities, setEntities] = useState([]);
  const [lots, setLots] = useState([]);

  const [selectedLotId, setSelectedLotId] = useState('');
  const [selectedBuyerId, setSelectedBuyerId] = useState('');

  const [loading, setLoading] = useState(true);

  const isCollector = user?.role === 'COLLECTOR';
  const isAggregator = user?.role === 'AGGREGATOR';

  /*
  ==========================================
  LOAD DATA
  ==========================================
  */

  const fetchData = async () => {
    try {
      setLoading(true);

      const [entitiesResponse, lotsResponse] =
        await Promise.all([
          api.get('/entities'),
          api.get('/lots'),
        ]);

      const allEntities =
        entitiesResponse.data.entities || [];

      const allLots =
        lotsResponse.data.lots || [];

      /*
      ==========================================
      VERIFIED ENTITIES ONLY
      ==========================================
      */

      const verifiedEntities = allEntities.filter(
        (entity) =>
          entity.verificationStatus === 'VERIFIED'
      );

      let availableEntities = [];

      /*
      ==========================================
      COLLECTOR CAN SEE:

      AGGREGATOR
      RECYCLER
      ==========================================
      */

      if (isCollector) {
        availableEntities = verifiedEntities.filter(
          (entity) =>
            entity.type === 'AGGREGATOR' ||
            entity.type === 'RECYCLER'
        );
      }

      /*
      ==========================================
      AGGREGATOR CAN SEE:

      RECYCLER ONLY
      ==========================================
      */

      if (isAggregator) {
        availableEntities = verifiedEntities.filter(
          (entity) =>
            entity.type === 'RECYCLER'
        );
      }

      /*
      ==========================================
      AVAILABLE LOTS
      ==========================================
      */

      let availableLots = [];

      /*
      COLLECTOR

      Can only match new lots.
      */

      if (isCollector) {
        availableLots = allLots.filter(
          (lot) =>
            lot.status === 'LOT_CREATED'
        );
      }

      /*
      AGGREGATOR

      Can only transfer inventory lots.
      */

      if (isAggregator) {
        availableLots = allLots.filter(
          (lot) =>
            lot.status === 'IN_INVENTORY'
        );
      }

      setEntities(availableEntities);
      setLots(availableLots);

      /*
      ==========================================
      SELECT FIRST AVAILABLE LOT
      ==========================================
      */

      setSelectedLotId(
        availableLots.length > 0
          ? availableLots[0]._id
          : ''
      );

      /*
      ==========================================
      SELECT FIRST AVAILABLE BUYER
      ==========================================
      */

      setSelectedBuyerId(
        availableEntities.length > 0
          ? availableEntities[0]._id
          : ''
      );

    } catch (error) {
      console.error(error);

      toast.error(
        'Unable to load matching data'
      );

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    void fetchData();
  }, [user?.role]);


  /*
  ==========================================
  MATCH / TRANSFER LOT
  ==========================================
  */

  const handleMatch = async () => {

    /*
    CHECK LOT
    */

    if (!selectedLotId) {
      toast.error('Please select a lot.');
      return;
    }


    /*
    CHECK BUYER
    */

    if (!selectedBuyerId) {
      toast.error('Please select a buyer.');
      return;
    }


    /*
    FIND SELECTED ENTITY
    */

    const buyer = entities.find(
      (entity) =>
        entity._id === selectedBuyerId
    );


    if (!buyer) {
      toast.error(
        'Please select a valid buyer.'
      );
      return;
    }


    try {

      /*
      ==========================================
      COLLECTOR FLOW

      LOT_CREATED
          ↓
      MATCHED

      Can match with:

      AGGREGATOR
      OR
      RECYCLER
      ==========================================
      */

      if (isCollector) {

        await api.post(
          `/lots/${selectedLotId}/match`,
          {
            buyerId: selectedBuyerId,
            buyerType: buyer.type,
          }
        );

        toast.success(
          `Lot successfully matched with ${buyer.name}`
        );
      }


      /*
      ==========================================
      AGGREGATOR FLOW

      IN_INVENTORY
          ↓
      TRANSFERRED_TO_RECYCLER
      ==========================================
      */

      else if (isAggregator) {

        await api.post(
          `/lots/${selectedLotId}/transfer-to-recycler`,
          {
            recyclerId: selectedBuyerId,
          }
        );

        toast.success(
          `Lot successfully transferred to Recycler ${buyer.name}`
        );
      }


      /*
      RELOAD DATA

      The transferred/matched lot will disappear
      from the matching dropdown automatically.
      */

      await fetchData();

    } catch (error) {

      console.error(error);

      toast.error(
        error.response?.data?.message ||
        'Unable to process the lot.'
      );

    }

  };


  /*
  ==========================================
  PAGE TEXT
  ==========================================
  */

  const pageTitle = isAggregator
    ? 'Transfer Inventory to Recycler'
    : 'Find a Buyer for Your Lot';


  const pageDescription = isAggregator
    ? 'Select an inventory lot and transfer it to a verified Recycler.'
    : 'Select your lot and choose a verified Aggregator or Recycler.';


  const buyerLabel = isAggregator
    ? 'Select Recycler'
    : 'Select Aggregator or Recycler';


  const buttonText = isAggregator
    ? 'Transfer Lot to Recycler'
    : 'Match Lot';


  /*
  ==========================================
  UI
  ==========================================
  */

  return (
    <div className="space-y-6">

      {/* ==========================================
          HEADER
      ========================================== */}

      <div>

        <p className="text-xs uppercase tracking-[0.35em] text-emerald-600">

          {isAggregator
            ? 'Recycler Transfer'
            : 'Buyer Matching'}

        </p>


        <h1 className="mt-2 text-3xl font-bold text-slate-900">

          {pageTitle}

        </h1>


        <p className="mt-2 text-sm text-slate-500">

          {pageDescription}

        </p>

      </div>


      {/* ==========================================
          MATCHING SECTION
      ========================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        {loading ? (

          <p className="text-sm text-slate-500">
            Loading matching data...
          </p>

        ) : lots.length === 0 ? (

          <div className="py-6 text-center">

            <p className="font-medium text-slate-700">

              {isAggregator
                ? 'No lots are currently available for transfer.'
                : 'No new lots are available for matching.'}

            </p>


            <p className="mt-2 text-sm text-slate-500">

              {isAggregator
                ? 'Lots will appear here after you accept them into inventory.'
                : 'Create a new lot to start the matching process.'}

            </p>

          </div>

        ) : entities.length === 0 ? (

          <div className="py-6 text-center">

            <p className="font-medium text-slate-700">
              No verified buyers are available.
            </p>


            <p className="mt-2 text-sm text-slate-500">

              {isAggregator
                ? 'Please wait for a Recycler to be verified by the admin.'
                : 'Please wait for an Aggregator or Recycler to be verified by the admin.'}

            </p>

          </div>

        ) : (

          <>

            <div className="grid gap-4 md:grid-cols-2">


              {/* ======================================
                  SELECT LOT
              ====================================== */}

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Select Lot
                </label>


                <select
                  value={selectedLotId}

                  onChange={(e) =>
                    setSelectedLotId(e.target.value)
                  }

                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 focus:border-emerald-400 focus:outline-none"
                >

                  {lots.map((lot) => (

                    <option
                      key={lot._id}
                      value={lot._id}
                    >

                      {lot.lotId} • {lot.materialType} •{' '}
                      {lot.estimatedWeight} kg

                    </option>

                  ))}

                </select>

              </div>


              {/* ======================================
                  SELECT BUYER
              ====================================== */}

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">

                  {buyerLabel}

                </label>


                <select
                  value={selectedBuyerId}

                  onChange={(e) =>
                    setSelectedBuyerId(e.target.value)
                  }

                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 focus:border-emerald-400 focus:outline-none"
                >

                  {entities.map((entity) => (

                    <option
                      key={entity._id}
                      value={entity._id}
                    >

                      {entity.name} • {entity.type} •{' '}
                      {entity.location}

                    </option>

                  ))}

                </select>

              </div>

            </div>


            {/* ======================================
                ACTION BUTTON
            ====================================== */}

            <button
              onClick={handleMatch}

              className="mt-5 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-500"
            >

              {buttonText}

            </button>

          </>

        )}

      </div>


      {/* ==========================================
          AVAILABLE BUYERS
      ========================================== */}

      {!loading && entities.length > 0 && (

        <div>

          <h2 className="mb-4 text-xl font-semibold text-slate-900">

            {isAggregator
              ? 'Available Recyclers'
              : 'Available Buyers'}

          </h2>


          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

            {entities.map((entity) => (

              <div
                key={entity._id}

                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >

                <div className="flex items-start justify-between gap-3">

                  <div>

                    <h3 className="text-lg font-semibold text-slate-900">

                      {entity.name}

                    </h3>


                    <p className="mt-1 text-sm text-slate-500">

                      {entity.type}

                    </p>

                  </div>


                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">

                    VERIFIED

                  </span>

                </div>


                <div className="mt-4 space-y-2 text-sm text-slate-600">

                  <p>
                    📍 {entity.location}
                  </p>


                  <p>

                    ♻️ Accepted:{' '}

                    {entity.materialsAccepted?.length > 0
                      ? entity.materialsAccepted.join(', ')
                      : 'All materials'}

                  </p>


                  <p>

                    📞{' '}

                    {entity.contactInformation?.phone ||
                      'Not available'}

                  </p>

                </div>

              </div>

            ))}

          </div>

        </div>

      )}

    </div>
  );
}