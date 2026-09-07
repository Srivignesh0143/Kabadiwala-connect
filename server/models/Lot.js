const mongoose = require('mongoose');

const lotSchema = new mongoose.Schema(
  {
    lotId: { type: String, required: true, unique: true },
    collector: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lotType: {
      type: String,
      enum: ['COLLECTION', 'CONSOLIDATED'],
      default: 'COLLECTION',
    },
    sourceLots: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lot' }],
    materialType: {
      type: String,
      enum: ['PCB', 'Copper', 'Aluminium', 'Steel', 'Cable', 'Battery', 'Mixed E-Waste', 'Plastic', 'Glass', 'Paper', 'Other'],
      required: true,
    },
    image: { type: String },
    estimatedWeight: { type: Number, required: true },
    actualWeight: { type: Number },
    location: { type: String, required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    aggregator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    },

    buyerType: {
      type: String,
      enum: ['AGGREGATOR', 'RECYCLER', null],
      default: null,
    },
    status: {
      type: String,
      enum: ['LOT_CREATED', 'MATCHED', 'HANDED_OVER', 'IN_INVENTORY', 'TRANSFERRED_TO_RECYCLER', 'PROCESSING', 'RECYCLED'],
      default: 'LOT_CREATED',
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID'],
      default: 'PENDING',
    },
    description: { type: String },
    aiPrediction: { type: String },
    syncStatus: { type: String, default: 'PENDING' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

module.exports = mongoose.model('Lot', lotSchema);
