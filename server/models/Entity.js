const mongoose = require('mongoose');

const entitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['AGGREGATOR', 'RECYCLER'],
      required: true,
    },
    location: { type: String, required: true },
    materialsAccepted: [{ type: String }],
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
