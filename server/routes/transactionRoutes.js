const express = require('express');
const Transaction = require('../models/Transaction');
const Lot = require('../models/Lot');
const { protect } = require('../middleware/auth');

const router = express.Router();

function buildAccessLotFilter(user) {
  if (!user) return {};

  if (user.role === 'COLLECTOR') {
    return { collector: user._id };
  }

  if (user.role === 'AGGREGATOR') {
    return {
      $or: [
        { collector: user._id },
        { buyer: user._id },
        { createdBy: user._id },
      ],
    };
  }

  if (user.role === 'RECYCLER') {
    return { buyer: user._id };
  }

  return {};
}

router.get('/', protect(), async (req, res) => {
  try {
    const lotFilter = buildAccessLotFilter(req.user);
    const transactionQuery = req.user.role === 'ADMIN' ? {} : { lot: { $exists: true } };

    if (req.user.role !== 'ADMIN') {
      const accessibleLots = await Lot.find(lotFilter).select('_id');
      const lotIds = accessibleLots.map((lot) => lot._id);

      if (!lotIds.length) {
        return res.status(200).json({ transactions: [] });
      }

      transactionQuery.lot = { $in: lotIds };
    }

    const transactions = await Transaction.find(transactionQuery)
      .sort({ timestamp: -1 })
      .populate('lot', 'lotId materialType status paymentStatus location')
      .populate('seller', 'name email role')
      .populate('buyer', 'name email role')
      .lean();

    return res.status(200).json({ transactions });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load transactions', error: error.message });
  }
});

module.exports = router;
