import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  ArrowRight,
  Boxes,
  BriefcaseBusiness,
  Building2,
  CreditCard,
  PackageCheck,
  ShieldCheck,
  Truck,
} from 'lucide-react';

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


  /*
  =========================================
  FETCH DASHBOARD DATA
  =========================================
  */

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

        setUsers(
          user?.role === 'ADMIN'
            ? responses[2]?.data?.users || []
            : []
        );


      } catch (error) {

        console.error('Dashboard fetch failed', error);

      }

    }


    if (user) {
      void fetchData();
    }


  }, [user]);


  /*
  =========================================
  GET ID SAFELY

  Works whether MongoDB returns:
  - ObjectId
  - populated object
  =========================================
  */

  const getId = (value) => {

    if (!value) return null;

    if (typeof value === 'object') {
      return String(value._id || value.id);
    }

    return String(value);

  };


  /*
  =========================================
  ROLE BASED LOTS

  THIS IS THE IMPORTANT PART
  =========================================
  */

  const visibleLots = useMemo(() => {

    if (!user?._id) return [];


    /*
    ADMIN
    */

    if (user.role === 'ADMIN') {
      return lots;
    }


    /*
    COLLECTOR

    See all lots created by them
    */

    if (user.role === 'COLLECTOR') {

      return lots.filter(
        (lot) =>
          getId(lot.collector) === String(user._id)
      );

    }


    /*
    AGGREGATOR

    See all lots permanently connected
    to this Aggregator.

    Includes:

    MATCHED
    IN_INVENTORY
    TRANSFERRED_TO_RECYCLER
    PROCESSING
    RECYCLED
    */

    if (user.role === 'AGGREGATOR') {

      return lots.filter(
        (lot) =>
          getId(lot.aggregator) === String(user._id)
      );

    }


    /*
    RECYCLER

    See lots currently assigned to them
    */

    if (user.role === 'RECYCLER') {

      return lots.filter(
        (lot) =>
          getId(lot.buyer) === String(user._id) &&
          lot.buyerType === 'RECYCLER'
      );

    }


    return [];


  }, [lots, user]);


  /*
  =========================================
  COMMON COUNTS
  =========================================
  */

  const pendingEntities =
    entities.filter(
      (entity) =>
        entity.verificationStatus === 'PENDING'
    ).length;


  const pendingPayments =
    visibleLots.filter(
      (lot) =>
        lot.paymentStatus === 'PENDING'
    ).length;


  /*
  =========================================
  ROLE CONFIG
  =========================================
  */

  const roleConfig = useMemo(() => {

    const role = user?.role || 'COLLECTOR';


    const configs = {


      /*
      =====================================
      COLLECTOR
      =====================================
      */

      COLLECTOR: {

        kicker: 'Collector dashboard',

        title:
          'Good morning, ' +
          (user?.name?.split(' ')[0] || 'Collector') +
          '.',


        subtitle:
          'Track your collected lots and follow their journey through the recycling ecosystem.',


        action: {
          to: '/lots/new',
          label: 'Create lot',
        },


        metrics: [

          {
            label: 'Total lots',
            value: visibleLots.length,
            caption:
              visibleLots.length
                ? 'Your collected lots'
                : 'No lots yet',
            icon: Boxes,
            accent: 'emerald',
          },


          {
            label: 'Ready for matching',
            value: visibleLots.filter(
              (lot) => lot.status === 'LOT_CREATED'
            ).length,
            caption: 'Waiting for buyer selection',
            icon: PackageCheck,
            accent: 'teal',
          },


          {
            label: 'Active journey',
            value: visibleLots.filter(
              (lot) =>
                !['LOT_CREATED', 'RECYCLED'].includes(
                  lot.status
                )
            ).length,
            caption: 'Moving through network',
            icon: Truck,
            accent: 'blue',
          },


          {
            label: 'Payments settled',
            value: visibleLots.filter(
              (lot) =>
                lot.paymentStatus === 'PAID'
            ).length,
            caption: 'Completed payments',
            icon: CreditCard,
            accent: 'amber',
          },

        ],


        pending:

          visibleLots.filter(
            (lot) =>
              lot.status === 'LOT_CREATED'
          ).length

            ? [

                {
                  label: `${visibleLots.filter(
                    (lot) =>
                      lot.status === 'LOT_CREATED'
                  ).length} lot(s) waiting for matching`,

                  meta: 'Select an Aggregator or Recycler',

                  action: 'Match',

                },

              ]

            : [

                {
                  label: 'No pending actions',

                  meta: 'Your lots are moving through the network',

                  action: 'View',

                },

              ],

      },


      /*
      =====================================
      AGGREGATOR
      =====================================
      */

      AGGREGATOR: {

        kicker: 'Aggregator dashboard',

        title:
          'Operations are on track across your collection network.',


        subtitle:
          'Manage incoming material, inventory, and transfer consolidated lots to recyclers.',


        action: {
          to: '/buyers',
          label: 'Match recycler',
        },


        metrics: [

          {
            label: 'Total connected lots',

            value: visibleLots.length,

            caption: 'Your complete lot history',

            icon: Boxes,

            accent: 'emerald',

          },


          {
            label: 'Incoming lots',

            value: visibleLots.filter(
              (lot) =>
                lot.status === 'MATCHED'
            ).length,

            caption: 'Waiting for receipt',

            icon: Truck,

            accent: 'teal',

          },


          {
            label: 'In inventory',

            value: visibleLots.filter(
              (lot) =>
                lot.status === 'IN_INVENTORY'
            ).length,

            caption: 'Ready for recycler transfer',

            icon: Building2,

            accent: 'blue',

          },


          {
            label: 'Transferred',

            value: visibleLots.filter(
              (lot) =>
                [
                  'TRANSFERRED_TO_RECYCLER',
                  'PROCESSING',
                  'RECYCLED',
                ].includes(lot.status)
            ).length,

            caption: 'Sent to recycler',

            icon: Truck,

            accent: 'amber',

          },

        ],


        pending:

          visibleLots.filter(
            (lot) =>
              lot.status === 'MATCHED'
          ).length

            ? [

                {
                  label: `${visibleLots.filter(
                    (lot) =>
                      lot.status === 'MATCHED'
                  ).length} lot(s) awaiting receipt`,

                  meta: 'Confirm incoming material',

                  action: 'Accept',

                },

              ]

            : visibleLots.filter(
                (lot) =>
                  lot.status === 'IN_INVENTORY'
              ).length

                ? [

                    {
                      label: `${visibleLots.filter(
                        (lot) =>
                          lot.status === 'IN_INVENTORY'
                      ).length} lot(s) ready for Recycler`,

                      meta: 'Select a verified recycler',

                      action: 'Transfer',

                    },

                  ]

                : [

                    {
                      label: 'No pending actions',

                      meta: 'Your inventory flow is up to date',

                      action: 'View',

                    },

                  ],

      },


      /*
      =====================================
      RECYCLER
      =====================================
      */

      RECYCLER: {

        kicker: 'Recycler dashboard',

        title:
          'Your recycling pipeline is active.',


        subtitle:
          'Track incoming material, processing operations, and final recycling outcomes.',


        action: {
          to: '/lots',
          label: 'Open queue',
        },


        metrics: [

          {
            label: 'Assigned lots',

            value: visibleLots.length,

            caption: 'Lots assigned to you',

            icon: Boxes,

            accent: 'emerald',

          },


          {
            label: 'Awaiting receipt',

            value: visibleLots.filter(
              (lot) =>
                [
                  'MATCHED',
                  'TRANSFERRED_TO_RECYCLER',
                ].includes(lot.status)
            ).length,

            caption: 'Incoming materials',

            icon: Truck,

            accent: 'teal',

          },


          {
            label: 'Processing',

            value: visibleLots.filter(
              (lot) =>
                lot.status === 'PROCESSING'
            ).length,

            caption: 'Active recycling',

            icon: PackageCheck,

            accent: 'blue',

          },


          {
            label: 'Recycled',

            value: visibleLots.filter(
              (lot) =>
                lot.status === 'RECYCLED'
            ).length,

            caption: 'Completed recovery',

            icon: ShieldCheck,

            accent: 'amber',

          },

        ],


        pending:

          visibleLots.filter(
            (lot) =>
              [
                'MATCHED',
                'TRANSFERRED_TO_RECYCLER',
              ].includes(lot.status)
          ).length

            ? [

                {
                  label: `${visibleLots.filter(
                    (lot) =>
                      [
                        'MATCHED',
                        'TRANSFERRED_TO_RECYCLER',
                      ].includes(lot.status)
                  ).length} lot(s) awaiting receipt`,

                  meta: 'Confirm material intake',

                  action: 'Inspect',

                },

              ]

            : [

                {
                  label: 'No pending actions',

                  meta: 'Your recycling queue is current',

                  action: 'View',

                },

              ],

      },


      /*
      =====================================
      ADMIN
      =====================================
      */

      ADMIN: {

        kicker: 'Admin dashboard',

        title:
          'Good morning, ' +
          (user?.name?.split(' ')[0] || 'Admin') +
          '.',


        subtitle:
          'Monitor the complete Kabadiwala Connect ecosystem from collection to recycling.',


        action: {
          to: '/admin',
          label: 'Review verifications',
        },


        metrics: [

          {
            label: 'Total lots',

            value: lots.length,

            caption: 'Live database',

            icon: Boxes,

            accent: 'emerald',

          },


          {
            label: 'Verified entities',

            value: entities.filter(
              (entity) =>
                entity.verificationStatus === 'VERIFIED'
            ).length,

            caption: 'Active partners',

            icon: ShieldCheck,

            accent: 'teal',

          },


          {
            label: 'Payments settled',

            value: lots.filter(
              (lot) =>
                lot.paymentStatus === 'PAID'
            ).length,

            caption: 'Completed settlements',

            icon: CreditCard,

            accent: 'blue',

          },


          {
            label: 'Recycled lots',

            value: lots.filter(
              (lot) =>
                lot.status === 'RECYCLED'
            ).length,

            caption: 'Completed lifecycle',

            icon: Truck,

            accent: 'amber',

          },

        ],


        pending:

          pendingEntities

            ? [

                {
                  label: `${pendingEntities} entity verification(s) pending`,

                  meta: 'Partner network review',

                  action: 'Review',

                },

              ]

            : [

                {
                  label: 'No pending actions',

                  meta: 'Everything is current',

                  action: 'View',

                },

              ],

      },

    };


    return configs[role] || configs.COLLECTOR;


  }, [
    user,
    lots,
    entities,
    visibleLots,
    pendingEntities,
  ]);


  /*
  =========================================
  RECENT LOT ACTIVITY

  Uses visibleLots instead of all lots
  =========================================
  */

  const rows = visibleLots
    .slice(0, 5)
    .map((lot) => ({

      lotId: lot.lotId,

      material: lot.materialType,

      location: lot.location,

      status: lot.status,

      updated:
        lot.updatedAt || lot.createdAt
          ? new Date(
              lot.updatedAt || lot.createdAt
            ).toLocaleDateString()
          : '—',

    }));


  /*
  =========================================
  ADMIN ECOSYSTEM OVERVIEW
  =========================================
  */

  const ecosystem = useMemo(() => {

    const verifiedCollectors =
      users.filter(
        (entry) =>
          entry.role === 'COLLECTOR' &&
          entry.verificationStatus === 'VERIFIED'
      ).length;


    const verifiedAggregators =
      users.filter(
        (entry) =>
          entry.role === 'AGGREGATOR' &&
          entry.verificationStatus === 'VERIFIED'
      ).length;


    const verifiedRecyclers =
      users.filter(
        (entry) =>
          entry.role === 'RECYCLER' &&
          entry.verificationStatus === 'VERIFIED'
      ).length;


    const totalVerified =
      verifiedCollectors +
      verifiedAggregators +
      verifiedRecyclers;


    const totalUsers = users.length || 1;


    const coverage =
      totalVerified
        ? Math.min(
            100,
            Math.round(
              (totalVerified / totalUsers) * 100
            )
          )
        : 0;


    return [

      {
        label: 'Verified collectors',
        value: String(verifiedCollectors),
        percent: Math.min(
          100,
          Math.round(
            (verifiedCollectors / totalUsers) * 100
          )
        ),
      },

      {
        label: 'Verified aggregators',
        value: String(verifiedAggregators),
        percent: Math.min(
          100,
          Math.round(
            (verifiedAggregators / totalUsers) * 100
          )
        ),
      },

      {
        label: 'Verified recyclers',
        value: String(verifiedRecyclers),
        percent: Math.min(
          100,
          Math.round(
            (verifiedRecyclers / totalUsers) * 100
          )
        ),
      },

      {
        label: 'Material coverage',
        value: `${coverage}%`,
        percent: coverage,
      },

    ];


  }, [users]);


  /*
  =========================================
  UI
  =========================================
  */

  return (

    <div className="space-y-6">


      {/* HERO */}

      <section className="rounded-[28px] border border-emerald-100 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.15),_transparent_35%),linear-gradient(135deg,#ffffff_0%,#f6faf8_100%)] p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">

        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">


          <div className="max-w-2xl">

            <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-emerald-700">

              {roleConfig.kicker}

            </p>


            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-slate-900 md:text-4xl">

              {roleConfig.title}

            </h1>


            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">

              {roleConfig.subtitle}

            </p>

          </div>


          <div className="rounded-2xl border border-emerald-200 bg-white/70 p-4 shadow-sm">

            <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">

              Priority action

            </div>


            <div className="mt-3 text-base font-semibold text-slate-900">

              {roleConfig.pending[0]?.label}

            </div>


            <Link
              to={roleConfig.action.to}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500"
            >

              {roleConfig.action.label}

              <ArrowRight size={15} />

            </Link>

          </div>


        </div>

      </section>


      {/* METRICS */}

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


      {/* CHART + ACTIONS */}

      <section className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">

        <ChartCard
          title="Lot activity"
          subtitle="Flow overview"
          values={[48, 62, 58, 80, 72, 90, 96]}
          color="#10b981"
        />

        <ActionPanel
          title="Pending actions"
          items={roleConfig.pending}
        />

      </section>


      {/* RECENT ACTIVITY */}

      <section
        className={`grid gap-6 ${
          user?.role === 'ADMIN'
            ? 'xl:grid-cols-[1.7fr_0.9fr]'
            : ''
        }`}
      >


        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">


          <div className="mb-4 flex items-center justify-between gap-3">


            <div>

              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">

                Recent lot activity

              </p>


              <h2 className="mt-2 text-xl font-semibold text-slate-900">

                Operational updates

              </h2>

            </div>


            <Link
              to="/lots"
              className="text-sm font-medium text-emerald-700 hover:text-emerald-600"
            >

              View all

            </Link>


          </div>


          <DataTable rows={rows} />


        </div>


        {/* ADMIN ONLY ECOSYSTEM */}

        {user?.role === 'ADMIN' && (

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">


            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">

              Ecosystem overview

            </p>


            <h2 className="mt-2 text-xl font-semibold text-slate-900">

              Network health

            </h2>


            <div className="mt-5 space-y-4">

              {ecosystem.map((item) => (

                <div key={item.label}>


                  <div className="mb-2 flex items-center justify-between text-sm text-slate-700">

                    <span>{item.label}</span>

                    <span className="font-medium text-slate-900">

                      {item.value}

                    </span>

                  </div>


                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">

                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                      style={{
                        width: `${item.percent}%`,
                      }}
                    />

                  </div>


                </div>

              ))}

            </div>


          </div>

        )}


      </section>


    </div>

  );

}