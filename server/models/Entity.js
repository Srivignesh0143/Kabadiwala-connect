const mongoose = require('mongoose');

const MATERIAL_TYPES = [
  'PCB',
  'Copper',
  'Aluminium',
  'Steel',
  'Cable',
  'Battery',
  'Mixed E-Waste',
  'Plastic',
  'Glass',
  'Paper',
  'Other',
];

const entitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    type: {
      type: String,
      enum: ['AGGREGATOR', 'RECYCLER'],
      required: true,
    },

    location: { type: String, required: true },

    // Materials accepted for recycling
    // Used mainly for RECYCLER entities
    materialsAccepted: {
      type: [String],
      enum: MATERIAL_TYPES,
      default: [],
    },

    verificationStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED'],
      default: 'PENDING',
    },

    contactInformation: {
      phone: String,
      email: String,
    },

    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

module.exports = mongoose.model('Entity', entitySchema);