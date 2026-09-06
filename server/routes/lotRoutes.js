const express = require('express');
const Lot = require('../models/Lot');
const Entity = require('../models/Entity');
const Transaction = require('../models/Transaction');
const TraceabilityEvent = require('../models/TraceabilityEvent');
const { protect } = require('../middleware/auth');

const router = express.Router();

function generateLotId() {
  const year = new Date().getFullYear();
  return `EW-${year}-${String(Date.now()).slice(-6)}`;
}

function toObjectId(value) {
  return value && value.toString ? value.toString() : value;
}

function buildAccessFilter(user) {
  const userId = toObjectId(user._id);

  if (user.role === 'COLLECTOR') {
    return { collector: userId };
  }

  if (user.role === 'AGGREGATOR') {
    return {
      $or: [
        { createdBy: userId },
        { buyer: userId },
      ],
    };
  }

  if (user.role === 'RECYCLER') {
    return { buyer: userId };
  }

  return {};
}

function sanitizeLot(lot) {
  if (!lot) return lot;

  const normalized = lot.toObject ? lot.toObject() : lot;

  normalized.collector = toObjectId(normalized.collector);
  normalized.createdBy = toObjectId(normalized.createdBy);

  normalized.buyer = normalized.buyer
    ? toObjectId(normalized.buyer)
    : null;

  normalized.sourceLots = (normalized.sourceLots || []).map(
    (sourceLot) => toObjectId(sourceLot)
  );

  return normalized;
}


/*
=========================================
GET ALL ACCESSIBLE LOTS
=========================================
*/

router.get('/', protect(), async (req, res) => {
  try {
    const lots = await Lot.find(
      buildAccessFilter(req.user)
    )
      .sort({ updatedAt: -1 })
      .lean();

    return res.status(200).json({
      lots: lots.map(sanitizeLot),
    });

  } catch (error) {

    return res.status(500).json({
      message: 'Unable to load lots',
      error: error.message,
    });

  }
});


/*
=========================================
GET LOT TRACEABILITY
=========================================
*/

router.get('/:id/traceability', protect(), async (req, res) => {
  try {

    const lot = await Lot.findOne({
      $or: [
        { _id: req.params.id },
        { lotId: req.params.id },
      ],
    }).lean();

    if (!lot) {
      return res.status(404).json({
        message: 'Lot not found.',
      });
    }

    if (req.user.role !== 'ADMIN') {

      const accessibleLot = await Lot.exists({
        _id: lot._id,
        ...buildAccessFilter(req.user),
      });

      if (!accessibleLot) {
        return res.status(403).json({
          message: 'You do not have access to this lot.',
        });
      }
    }

    const events = await TraceabilityEvent.find({
      lot: lot._id,
    })
      .sort({ timestamp: 1 })
      .lean();

    return res.status(200).json({
      traceability: events,
    });

  } catch (error) {

    return res.status(500).json({
      message: 'Unable to load traceability',
      error: error.message,
    });

  }
});


/*
=========================================
AI / SMART RECOMMENDATIONS
=========================================
*/

router.get('/:id/recommendations', protect(), async (req, res) => {
  try {

    const lot = await Lot.findOne({
      $or: [
        { _id: req.params.id },
        { lotId: req.params.id },
      ],
    });

    if (!lot) {
      return res.status(404).json({
        message: 'Lot not found.',
      });
    }

    let allowedTypes = [];

    // Collector can select Aggregator OR Recycler
    if (req.user.role === 'COLLECTOR') {
      allowedTypes = ['AGGREGATOR', 'RECYCLER'];
    }

    // Aggregator can select only Recycler
    if (req.user.role === 'AGGREGATOR') {
      allowedTypes = ['RECYCLER'];
    }

    const verifiedEntities = await Entity.find({
      verificationStatus: 'VERIFIED',
      type: { $in: allowedTypes },
    }).lean();

    const recommended = verifiedEntities
      .filter((entity) =>
        entity.materialsAccepted?.includes(lot.materialType)
      )
      .map((entity) => ({
        _id: entity._id,
        name: entity.name,
        type: entity.type,
        verificationStatus: entity.verificationStatus,
        location: entity.location,
        materialAccepted: lot.materialType,
        reason:
          entity.type === 'RECYCLER'
            ? 'Verified recycler compatible with this material.'
            : 'Verified nearby aggregator compatible with this material.',
      }));

    return res.status(200).json({
      recommendations: recommended,
    });

  } catch (error) {

    return res.status(500).json({
      message: 'Unable to load recommendations',
      error: error.message,
    });

  }
});


/*
=========================================
CREATE LOT
=========================================
*/

router.post(
  '/',
  protect(['COLLECTOR', 'AGGREGATOR']),
  async (req, res) => {

    try {

      const {
        materialType,
        estimatedWeight,
        location,
        image,
        description,
        sourceLots = [],
      } = req.body;

      if (
        !materialType ||
        !estimatedWeight ||
        !location ||
        !image
      ) {
        return res.status(400).json({
          message:
            'Material type, estimated weight, location, and image are required.',
        });
      }

      if (
        typeof image !== 'string' ||
        !image.startsWith('data:image/')
      ) {
        return res.status(400).json({
          message: 'Please upload an image file.',
        });
      }

      const lotType =
        req.user.role === 'COLLECTOR'
          ? 'COLLECTION'
          : 'CONSOLIDATED';

      const lot = await Lot.create({

        lotId: generateLotId(),

        collector:
          req.user.role === 'COLLECTOR'
            ? req.user._id
            : sourceLots[0]
              ? await Lot.findById(sourceLots[0]).then(
                  (source) =>
                    source
                      ? source.collector
                      : req.user._id
                )
              : req.user._id,

        createdBy: req.user._id,

        lotType,

        sourceLots:
          lotType === 'CONSOLIDATED'
            ? sourceLots
            : [],

        materialType,

        image,

        estimatedWeight: Number(estimatedWeight),

        actualWeight: null,

        location,

        buyer: null,

        buyerType: null,

        status: 'LOT_CREATED',

        paymentStatus: 'PENDING',

        description: description || '',

        aiPrediction:
          `Likely ${materialType} material for e-waste recovery`,

        syncStatus: 'PENDING',

      });


      await TraceabilityEvent.create({

        lot: lot._id,

        lotId: lot.lotId,

        eventType: 'LOT_CREATED',

        user: req.user._id,

        location,

        remarks:
          `${req.user.role} created a new ${lotType.toLowerCase()} lot.`,

      });


      return res.status(201).json({
        lot: sanitizeLot(lot),
      });

    } catch (error) {

      return res.status(500).json({
        message: 'Unable to create lot',
        error: error.message,
      });

    }

  }
);


/*
=========================================
MATCH LOT
=========================================

COLLECTOR:
→ AGGREGATOR
→ RECYCLER

AGGREGATOR:
→ RECYCLER ONLY
*/

router.post(
  '/:id/match',
  protect(['COLLECTOR', 'AGGREGATOR', 'ADMIN']),
  async (req, res) => {

    try {

      const { buyerId } = req.body;

      if (!buyerId) {
        return res.status(400).json({
          message: 'Please select an Aggregator or Recycler.',
        });
      }


      const lot = await Lot.findOne({
        $or: [
          { _id: req.params.id },
          { lotId: req.params.id },
        ],
      });

      if (!lot) {
        return res.status(404).json({
          message: 'Lot not found.',
        });
      }


      const buyerEntity = await Entity.findById(buyerId);

      if (!buyerEntity) {
        return res.status(404).json({
          message: 'Selected entity not found.',
        });
      }


      /*
      -----------------------------------------
      VERIFY ENTITY
      -----------------------------------------
      */

      if (buyerEntity.verificationStatus !== 'VERIFIED') {

        return res.status(400).json({
          message:
            'Only verified Aggregators or Recyclers can be selected.',
        });

      }


      /*
      -----------------------------------------
      ROLE BASED MATCHING RULES
      -----------------------------------------
      */

      // Collector → Aggregator OR Recycler
      if (req.user.role === 'COLLECTOR') {

        if (
          !['AGGREGATOR', 'RECYCLER'].includes(
            buyerEntity.type
          )
        ) {

          return res.status(400).json({
            message:
              'Collector can select only an Aggregator or Recycler.',
          });

        }

      }


      // Aggregator → Recycler ONLY
      if (req.user.role === 'AGGREGATOR') {

        if (buyerEntity.type !== 'RECYCLER') {

          return res.status(400).json({
            message:
              'Aggregator can select only a Recycler.',
          });

        }

      }


      /*
      -----------------------------------------
      MATERIAL COMPATIBILITY
      -----------------------------------------
      */

      if (
        !buyerEntity.materialsAccepted ||
        !buyerEntity.materialsAccepted.includes(
          lot.materialType
        )
      ) {

        return res.status(400).json({
          message:
            `${buyerEntity.name} cannot accept ${lot.materialType}.`,
        });

      }


      /*
      -----------------------------------------
      MATCH LOT
      -----------------------------------------
      */

      lot.buyer = buyerEntity.user;

      lot.buyerType = buyerEntity.type;

      lot.status = 'MATCHED';

      lot.paymentStatus = 'PENDING';

      lot.updatedAt = new Date();


      await lot.save();


      /*
      -----------------------------------------
      TRACEABILITY
      -----------------------------------------
      */

      await TraceabilityEvent.create({

        lot: lot._id,

        lotId: lot.lotId,

        eventType: 'MATCHED',

        user: req.user._id,

        location: lot.location,

        remarks:
          `Matched with verified ${buyerEntity.type.toLowerCase()} ${buyerEntity.name}.`,

      });


      return res.status(200).json({

        message:
          `Lot successfully matched with ${buyerEntity.name}.`,

        lot: sanitizeLot(lot),

      });


    } catch (error) {

      return res.status(500).json({

        message: 'Unable to match buyer',

        error: error.message,

      });

    }

  }
);


/*
=========================================
HANDOVER LOT
=========================================
*/

router.post(
  '/:id/handover',
  protect(['COLLECTOR', 'AGGREGATOR', 'RECYCLER']),
  async (req, res) => {

    try {

      const {
        actualWeight,
        handoverLocation,
        remarks,
      } = req.body;

      const lot = await Lot.findOne({
        $or: [
          { _id: req.params.id },
          { lotId: req.params.id },
        ],
      });

      if (!lot) {
        return res.status(404).json({
          message: 'Lot not found.',
        });
      }


      lot.actualWeight =
        actualWeight || lot.estimatedWeight;

      lot.location =
        handoverLocation || lot.location;

      lot.status = 'HANDED_OVER';

      lot.updatedAt = new Date();

      await lot.save();


      await TraceabilityEvent.create({

        lot: lot._id,

        lotId: lot.lotId,

        eventType: 'HANDED_OVER',

        user: req.user._id,

        location: lot.location,

        remarks:
          remarks || 'Lot handed over successfully.',

      });


      return res.status(200).json({
        lot: sanitizeLot(lot),
      });


    } catch (error) {

      return res.status(500).json({
        message: 'Unable to record handover',
        error: error.message,
      });

    }

  }
);


/*
=========================================
RECORD PAYMENT
=========================================
*/

router.post(
  '/:id/payment',
  protect(['COLLECTOR', 'AGGREGATOR', 'RECYCLER']),
  async (req, res) => {

    try {

      const {
        amount,
        paymentMethod = 'UPI',
        reference,
      } = req.body;


      const lot = await Lot.findOne({
        $or: [
          { _id: req.params.id },
          { lotId: req.params.id },
        ],
      });


      if (!lot) {

        return res.status(404).json({
          message: 'Lot not found.',
        });

      }


      const transaction = await Transaction.create({

        transactionId:
          `TX-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,

        lot: lot._id,

        seller: lot.collector,

        buyer: lot.buyer || req.user._id,

        amount: Number(amount) || 0,

        paymentMethod,

        paymentStatus: 'PAID',

        reference:
          reference || `REF-${Date.now()}`,

      });


      lot.paymentStatus = 'PAID';

      lot.updatedAt = new Date();

      await lot.save();


      await TraceabilityEvent.create({

        lot: lot._id,

        lotId: lot.lotId,

        eventType: 'PAYMENT_RECORDED',

        user: req.user._id,

        location: lot.location,

        remarks:
          `Payment recorded for ${amount || 0} via ${paymentMethod}.`,

      });


      return res.status(200).json({

        lot: sanitizeLot(lot),

        transaction,

      });


    } catch (error) {

      return res.status(500).json({

        message: 'Unable to record payment',

        error: error.message,

      });

    }

  }
);


/*
=========================================
UPDATE LOT STATUS
=========================================
*/

router.patch(
  '/:id/status',
  protect(['AGGREGATOR', 'RECYCLER', 'ADMIN']),
  async (req, res) => {

    try {

      const { status } = req.body;


      const lot = await Lot.findOne({
        $or: [
          { _id: req.params.id },
          { lotId: req.params.id },
        ],
      });


      if (!lot) {

        return res.status(404).json({
          message: 'Lot not found.',
        });

      }


      lot.status = status;

      lot.updatedAt = new Date();

      await lot.save();


      await TraceabilityEvent.create({

        lot: lot._id,

        lotId: lot.lotId,

        eventType: status,

        user: req.user._id,

        location: lot.location,

        remarks:
          `Status updated by ${req.user.role}.`,

      });


      return res.status(200).json({
        lot: sanitizeLot(lot),
      });


    } catch (error) {

      return res.status(500).json({

        message: 'Unable to update status',

        error: error.message,

      });

    }

  }
);


module.exports = router;