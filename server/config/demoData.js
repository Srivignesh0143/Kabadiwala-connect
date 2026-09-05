const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Entity = require('../models/Entity');
const Lot = require('../models/Lot');
const Transaction = require('../models/Transaction');
const TraceabilityEvent = require('../models/TraceabilityEvent');

const demoState = { users: [], entities: [], lots: [], transactions: [], traceabilityEvents: [] };

async function ensureDemoData() {
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    const adminUser = await User.create({
      name: 'Asha Nair',
      email: 'admin@kabadiwala.com',
      phone: '+91 98765 43210',
      password: await bcrypt.hash('admin123', 10),
      role: 'ADMIN',
      location: 'Bengaluru',
      verificationStatus: 'VERIFIED',
    });

    const collectorUser = await User.create({
      name: 'Ravi Kumar',
      email: 'collector@kabadiwala.com',
      phone: '+91 99887 76654',
      password: await bcrypt.hash('collector123', 10),
      role: 'COLLECTOR',
      location: 'Bengaluru',
      verificationStatus: 'VERIFIED',
    });

    const aggregatorUser = await User.create({
      name: 'Green Scrap Aggregator',
      email: 'aggregator@kabadiwala.com',
      phone: '+91 98111 22334',
      password: await bcrypt.hash('agg123', 10),
      role: 'AGGREGATOR',
      location: 'Bengaluru',
      verificationStatus: 'VERIFIED',
    });

    const recyclerUser = await User.create({
      name: 'EcoCycle Recycler',
      email: 'recycler@kabadiwala.com',
      phone: '+91 98777 22110',
      password: await bcrypt.hash('recycler123', 10),
      role: 'RECYCLER',
      location: 'Peenya',
      verificationStatus: 'VERIFIED',
    });

    const entities = await Entity.insertMany([
      {
        name: 'Green Scrap Aggregator',
        user: aggregatorUser._id,
        type: 'AGGREGATOR',
        location: 'Bengaluru',
        materialsAccepted: ['PCB', 'Copper', 'Aluminium', 'Cable'],
        verificationStatus: 'VERIFIED',
        contactInformation: { phone: '+91 98111 22334', email: 'aggregator@kabadiwala.com' },
      },
      {
        name: 'EcoCycle Recycler',
        user: recyclerUser._id,
        type: 'RECYCLER',
        location: 'Peenya',
        materialsAccepted: ['PCB', 'Battery', 'Mixed E-Waste'],
        verificationStatus: 'VERIFIED',
        contactInformation: { phone: '+91 98777 22110', email: 'recycler@kabadiwala.com' },
      },
    ]);

    const collectorLot = await Lot.create({
      lotId: 'EW-2026-0001',
      collector: collectorUser._id,
      createdBy: collectorUser._id,
      lotType: 'COLLECTION',
      materialType: 'PCB',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
      estimatedWeight: 20,
      actualWeight: 18.5,
      location: 'Bengaluru',
      buyer: aggregatorUser._id,
      buyerType: 'AGGREGATOR',
      status: 'MATCHED',
      paymentStatus: 'PAID',
      description: 'Recovered PCB boards from an e-waste collection drive.',
      aiPrediction: 'High-value circuit board with copper content',
      syncStatus: 'SYNCED',
    });

    await Lot.create({
      lotId: 'EW-2026-0002',
      collector: collectorUser._id,
      createdBy: collectorUser._id,
      lotType: 'COLLECTION',
      materialType: 'Copper',
      image: 'https://images.unsplash.com/photo-1581092160607-ee2279d6b1d0?auto=format&fit=crop&w=1200&q=80',
      estimatedWeight: 12,
      actualWeight: null,
      location: 'Koramangala',
      buyer: null,
      buyerType: null,
      status: 'LOT_CREATED',
      paymentStatus: 'PENDING',
      description: 'Copper wiring bundles collected from local shops.',
      aiPrediction: 'Copper-rich scrap with moderate lead contamination risk',
      syncStatus: 'PENDING',
    });

    await Transaction.create({
      transactionId: 'TX-2026-0001',
      lot: collectorLot._id,
      seller: collectorUser._id,
      buyer: aggregatorUser._id,
      amount: 4800,
      paymentMethod: 'UPI',
      paymentStatus: 'PAID',
      reference: 'UPI-REF-001',
    });

    await TraceabilityEvent.insertMany([
      { lot: collectorLot._id, lotId: collectorLot.lotId, eventType: 'LOT_CREATED', user: collectorUser._id, location: 'Bengaluru', remarks: 'Collector logged the e-waste lot in the system.' },
      { lot: collectorLot._id, lotId: collectorLot.lotId, eventType: 'MATCHED', user: adminUser._id, location: 'Bengaluru', remarks: 'Verified buyer matched with the collector lot based on material and location.' },
      { lot: collectorLot._id, lotId: collectorLot.lotId, eventType: 'HANDED_OVER', user: aggregatorUser._id, location: 'Bengaluru', remarks: 'Lot physically transferred to the aggregator.' },
      { lot: collectorLot._id, lotId: collectorLot.lotId, eventType: 'PAYMENT_RECORDED', user: aggregatorUser._id, location: 'Bengaluru', remarks: 'Collector received payment after handover confirmation.' },
    ]);

    demoState.users = await User.find({}).lean();
    demoState.entities = await Entity.find({}).lean();
    demoState.lots = await Lot.find({}).lean();
    demoState.transactions = await Transaction.find({}).lean();
    demoState.traceabilityEvents = await TraceabilityEvent.find({}).lean();
  }

  return demoState;
}

module.exports = { demoState, ensureDemoData };
