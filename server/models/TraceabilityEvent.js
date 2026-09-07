const mongoose = require('mongoose');

const traceabilityEventSchema = new mongoose.Schema(
  {
    lot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lot',
      required: true,
    },

    lotId: {
      type: String,
      required: true,
    },

    eventType: {
      type: String,
      required: true,
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    remarks: {
      type: String,
      default: '',
    },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model(
  'TraceabilityEvent',
  traceabilityEventSchema
);