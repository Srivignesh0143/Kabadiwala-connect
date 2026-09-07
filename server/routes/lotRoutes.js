const express = require('express');

const Lot = require('../models/Lot');
const Entity = require('../models/Entity');
const Traceability = require('../models/TraceabilityEvent');

const { protect } = require('../middleware/auth');

const router = express.Router();

/*
=================================================
HELPER: GET USER ID
=================================================
*/

function getId(value) {
  if (!value) return null;

  if (typeof value === 'object') {
    return String(value._id || value.id);
  }

  return String(value);
}

/*
=================================================
HELPER: CREATE TRACEABILITY EVENT
=================================================
*/

async function createTraceabilityEvent({
  lot,
  eventType,
  user,
  location,
  remarks,
}) {
  try {
    await Traceability.create({
      lot: lot._id,
      lotId: lot.lotId,
      eventType,
      timestamp: new Date(),
      user: user?._id || user,
      location: location || lot.location,
      remarks: remarks || '',
    });
  } catch (error) {
    console.error(
      'Unable to create traceability event:',
      error.message
    );
  }
}

/*
=================================================
GET LOTS
=================================================
*/

router.get('/', protect(), async (req, res) => {
  try {
    const user = req.user;

    let query = {};

    if (user.role === 'ADMIN') {
      query = {};
    } else if (user.role === 'COLLECTOR') {
      query = {
        collector: user._id,
      };
    } else if (user.role === 'AGGREGATOR') {
      query = {
        aggregator: user._id,
      };
    } else if (user.role === 'RECYCLER') {
      query = {
        buyer: user._id,
        buyerType: 'RECYCLER',
      };
    }

    const lots = await Lot.find(query)
      .populate('collector', 'name email phone role')
      .populate('createdBy', 'name email role')
      .populate('buyer', 'name email phone role')
      .populate('aggregator', 'name email phone role')
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      lots,
    });
  } catch (error) {
    console.error('Unable to load lots:', error);

    return res.status(500).json({
      message: 'Unable to load lots',
      error: error.message,
    });
  }
});

/*
=================================================
GET TRACEABILITY FOR ONE LOT
=================================================
*/

router.get(
  '/:id/traceability',
  protect(),

  async (req, res) => {
    try {
      const lot = await Lot.findById(req.params.id);

      if (!lot) {
        return res.status(404).json({
          message: 'Lot not found.',
        });
      }

      const userId = String(req.user._id);

      let hasAccess = false;

      if (req.user.role === 'ADMIN') {
        hasAccess = true;
      }

      if (
        req.user.role === 'COLLECTOR' &&
        getId(lot.collector) === userId
      ) {
        hasAccess = true;
      }

      if (
        req.user.role === 'AGGREGATOR' &&
        getId(lot.aggregator) === userId
      ) {
        hasAccess = true;
      }

      if (
        req.user.role === 'RECYCLER' &&
        getId(lot.buyer) === userId &&
        lot.buyerType === 'RECYCLER'
      ) {
        hasAccess = true;
      }

      if (!hasAccess) {
        return res.status(403).json({
          message:
            'You do not have permission to view this lot traceability.',
        });
      }

      const traceability = await Traceability.find({
        lot: lot._id,
      })
        .populate(
          'user',
          'name email role'
        )
        .sort({
          timestamp: 1,
        });

      return res.status(200).json({
        lot,
        traceability,
      });
    } catch (error) {
      console.error(
        'Unable to load traceability:',
        error
      );

      return res.status(500).json({
        message: 'Unable to load traceability',
        error: error.message,
      });
    }
  }
);

/*
=================================================
GET SINGLE LOT
=================================================
*/

router.get('/:id', protect(), async (req, res) => {
  try {
    const lot = await Lot.findById(req.params.id)
      .populate('collector', 'name email phone role')
      .populate('createdBy', 'name email role')
      .populate('buyer', 'name email phone role')
      .populate('aggregator', 'name email phone role');

    if (!lot) {
      return res.status(404).json({
        message: 'Lot not found.',
      });
    }

    return res.status(200).json({
      lot,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to load lot',
      error: error.message,
    });
  }
});

/*
=================================================
CREATE LOT

ONLY COLLECTOR
=================================================
*/

router.post(
  '/',
  protect('COLLECTOR'),

  async (req, res) => {
    try {
      const {
        lotId,
        materialType,
        image,
        estimatedWeight,
        location,
        description,
        aiPrediction,
      } = req.body;

      if (
        !lotId ||
        !materialType ||
        !estimatedWeight ||
        !location
      ) {
        return res.status(400).json({
          message:
            'Lot ID, material type, estimated weight and location are required.',
        });
      }

      const existingLot = await Lot.findOne({
        lotId,
      });

      if (existingLot) {
        return res.status(409).json({
          message:
            'A lot with this Lot ID already exists.',
        });
      }

      const lot = await Lot.create({
        lotId,

        collector: req.user._id,

        createdBy: req.user._id,

        lotType: 'COLLECTION',

        materialType,

        image,

        estimatedWeight,

        location,

        description,

        aiPrediction,

        status: 'LOT_CREATED',

        paymentStatus: 'PENDING',

        buyer: null,

        buyerType: null,

        aggregator: null,
      });

      await createTraceabilityEvent({
        lot,

        eventType: 'LOT_CREATED',

        user: req.user,

        location: lot.location,

        remarks: 'Lot created by Collector',
      });

      return res.status(201).json({
        message: 'Lot created successfully',
        lot,
      });
    } catch (error) {
      console.error('Unable to create lot:', error);

      return res.status(500).json({
        message: 'Unable to create lot',
        error: error.message,
      });
    }
  }
);

/*
=================================================
MATCH LOT

COLLECTOR CAN SELECT:

1. AGGREGATOR
2. RECYCLER

IMPORTANT:

AGGREGATOR → NO MATERIAL RESTRICTION
RECYCLER → MUST ACCEPT THE LOT MATERIAL
=================================================
*/

router.post(
  '/:id/match',
  protect('COLLECTOR'),

  async (req, res) => {
    try {
      const {
        buyerId,
        buyerType,
      } = req.body;

      if (!buyerId || !buyerType) {
        return res.status(400).json({
          message:
            'Buyer ID and buyer type are required.',
        });
      }

      const normalizedBuyerType =
        String(buyerType).toUpperCase();

      if (
        !['AGGREGATOR', 'RECYCLER'].includes(
          normalizedBuyerType
        )
      ) {
        return res.status(400).json({
          message:
            'Buyer must be an Aggregator or Recycler.',
        });
      }

      const lot = await Lot.findById(
        req.params.id
      );

      if (!lot) {
        return res.status(404).json({
          message: 'Lot not found.',
        });
      }

      if (
        String(lot.collector) !==
        String(req.user._id)
      ) {
        return res.status(403).json({
          message:
            'You can only match your own lots.',
        });
      }

      if (lot.status !== 'LOT_CREATED') {
        return res.status(400).json({
          message:
            `This lot is already in ${lot.status} status and cannot be matched again.`,
        });
      }

      const entity = await Entity.findById(
        buyerId
      );

      if (!entity) {
        return res.status(404).json({
          message:
            'Selected entity not found.',
        });
      }

      if (
        entity.type !== normalizedBuyerType
      ) {
        return res.status(400).json({
          message:
            `Selected entity is not a ${normalizedBuyerType}.`,
        });
      }

      if (
        entity.verificationStatus !==
        'VERIFIED'
      ) {
        return res.status(400).json({
          message:
            `${entity.name} is not verified yet.`,
        });
      }

      /*
      =============================================
      RECYCLER MATERIAL VALIDATION ONLY

      Aggregators can receive any material.
      =============================================
      */

      if (
        normalizedBuyerType === 'RECYCLER' &&
        (
          !Array.isArray(entity.materialsAccepted) ||
          !entity.materialsAccepted.includes(
            lot.materialType
          )
        )
      ) {
        return res.status(400).json({
          message:
            `${entity.name} cannot accept ${lot.materialType}.`,
        });
      }

      lot.buyer = entity.user;

      lot.buyerType = normalizedBuyerType;

      if (
        normalizedBuyerType === 'AGGREGATOR'
      ) {
        lot.aggregator = entity.user;
      }

      lot.status = 'MATCHED';

      lot.updatedAt = new Date();

      await lot.save();

      await createTraceabilityEvent({
        lot,

        eventType: 'LOT_MATCHED',

        user: req.user,

        location: lot.location,

        remarks:
          `Lot matched with ${entity.name} (${normalizedBuyerType})`,
      });

      return res.status(200).json({
        message:
          `Lot successfully matched with ${entity.name}.`,
        lot,
      });
    } catch (error) {
      console.error(
        'Unable to match lot:',
        error
      );

      return res.status(500).json({
        message: 'Unable to match lot',
        error: error.message,
      });
    }
  }
);

/*
=================================================
AGGREGATOR ACCEPTS LOT

MATCHED
↓
IN_INVENTORY
=================================================
*/

router.post(
  '/:id/accept',
  protect('AGGREGATOR'),

  async (req, res) => {
    try {
      const lot = await Lot.findById(
        req.params.id
      );

      if (!lot) {
        return res.status(404).json({
          message: 'Lot not found.',
        });
      }

      if (
        getId(lot.aggregator) !==
        String(req.user._id)
      ) {
        return res.status(403).json({
          message:
            'This lot is not assigned to you.',
        });
      }

      if (lot.status !== 'MATCHED') {
        return res.status(400).json({
          message:
            `This lot cannot be accepted in ${lot.status} status.`,
        });
      }

      if (
        lot.buyerType !== 'AGGREGATOR'
      ) {
        return res.status(400).json({
          message:
            'This lot was not matched to an Aggregator.',
        });
      }

      lot.status = 'IN_INVENTORY';

      lot.updatedAt = new Date();

      await lot.save();

      await createTraceabilityEvent({
        lot,

        eventType:
          'RECEIVED_BY_AGGREGATOR',

        user: req.user,

        location: lot.location,

        remarks:
          'Aggregator received the lot into inventory.',
      });

      return res.status(200).json({
        message:
          'Lot accepted and added to inventory.',
        lot,
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Unable to accept lot',
        error: error.message,
      });
    }
  }
);

/*
=================================================
AGGREGATOR TRANSFERS LOT TO RECYCLER

IN_INVENTORY
↓
TRANSFERRED_TO_RECYCLER

IMPORTANT:
Recycler must accept the material.
=================================================
*/

router.post(
  '/:id/transfer-to-recycler',
  protect('AGGREGATOR'),

  async (req, res) => {
    try {
      const {
        recyclerId,
      } = req.body;

      if (!recyclerId) {
        return res.status(400).json({
          message:
            'Recycler ID is required.',
        });
      }

      const lot = await Lot.findById(
        req.params.id
      );

      if (!lot) {
        return res.status(404).json({
          message: 'Lot not found.',
        });
      }

      if (
        getId(lot.aggregator) !==
        String(req.user._id)
      ) {
        return res.status(403).json({
          message:
            'You can only transfer your own inventory lots.',
        });
      }

      if (lot.status !== 'IN_INVENTORY') {
        return res.status(400).json({
          message:
            `This lot is in ${lot.status} status and cannot be transferred.`,
        });
      }

      const recycler =
        await Entity.findById(recyclerId);

      if (!recycler) {
        return res.status(404).json({
          message: 'Recycler not found.',
        });
      }

      if (recycler.type !== 'RECYCLER') {
        return res.status(400).json({
          message:
            'Selected entity is not a Recycler.',
        });
      }

      if (
        recycler.verificationStatus !==
        'VERIFIED'
      ) {
        return res.status(400).json({
          message:
            `${recycler.name} is not verified.`,
        });
      }

      /*
      =============================================
      RECYCLER MATERIAL VALIDATION
      =============================================
      */

      if (
        !Array.isArray(
          recycler.materialsAccepted
        ) ||
        !recycler.materialsAccepted.includes(
          lot.materialType
        )
      ) {
        return res.status(400).json({
          message:
            `${recycler.name} cannot accept ${lot.materialType}.`,
        });
      }

      lot.buyer = recycler.user;

      lot.buyerType = 'RECYCLER';

      lot.status =
        'TRANSFERRED_TO_RECYCLER';

      lot.updatedAt = new Date();

      await lot.save();

      await createTraceabilityEvent({
        lot,

        eventType:
          'TRANSFERRED_TO_RECYCLER',

        user: req.user,

        location: lot.location,

        remarks:
          `Aggregator transferred the lot to Recycler: ${recycler.name}`,
      });

      return res.status(200).json({
        message:
          `Lot transferred to ${recycler.name}.`,
        lot,
      });
    } catch (error) {
      console.error(
        'Unable to transfer lot:',
        error
      );

      return res.status(500).json({
        message:
          'Unable to transfer lot to Recycler',
        error: error.message,
      });
    }
  }
);

/*
=================================================
RECYCLER STARTS PROCESSING
=================================================
*/

router.post(
  '/:id/start-processing',
  protect('RECYCLER'),

  async (req, res) => {
    try {
      const lot = await Lot.findById(
        req.params.id
      );

      if (!lot) {
        return res.status(404).json({
          message: 'Lot not found.',
        });
      }

      if (
        getId(lot.buyer) !==
        String(req.user._id)
      ) {
        return res.status(403).json({
          message:
            'This lot is not assigned to you.',
        });
      }

      if (
        lot.buyerType !== 'RECYCLER'
      ) {
        return res.status(400).json({
          message:
            'This lot is not assigned to a Recycler.',
        });
      }

      const allowedStatuses = [
        'MATCHED',
        'TRANSFERRED_TO_RECYCLER',
      ];

      if (
        !allowedStatuses.includes(
          lot.status
        )
      ) {
        return res.status(400).json({
          message:
            `Cannot start processing from ${lot.status}.`,
        });
      }

      lot.status = 'PROCESSING';

      lot.updatedAt = new Date();

      await lot.save();

      await createTraceabilityEvent({
        lot,

        eventType:
          'PROCESSING_STARTED',

        user: req.user,

        location: lot.location,

        remarks:
          'Recycler started processing the material.',
      });

      return res.status(200).json({
        message:
          'Recycling process started.',
        lot,
      });
    } catch (error) {
      return res.status(500).json({
        message:
          'Unable to start processing',
        error: error.message,
      });
    }
  }
);

/*
=================================================
MARK LOT AS RECYCLED
=================================================
*/

router.post(
  '/:id/recycle',
  protect('RECYCLER'),

  async (req, res) => {
    try {
      const lot = await Lot.findById(
        req.params.id
      );

      if (!lot) {
        return res.status(404).json({
          message: 'Lot not found.',
        });
      }

      if (
        getId(lot.buyer) !==
        String(req.user._id)
      ) {
        return res.status(403).json({
          message:
            'This lot is not assigned to you.',
        });
      }

      if (
        lot.buyerType !== 'RECYCLER'
      ) {
        return res.status(400).json({
          message:
            'This lot is not assigned to a Recycler.',
        });
      }

      if (
        lot.status !== 'PROCESSING'
      ) {
        return res.status(400).json({
          message:
            `Lot cannot be recycled from ${lot.status}.`,
        });
      }

      lot.status = 'RECYCLED';

      lot.updatedAt = new Date();

      await lot.save();

      await createTraceabilityEvent({
        lot,

        eventType: 'RECYCLED',

        user: req.user,

        location: lot.location,

        remarks:
          'Material recycling completed.',
      });

      return res.status(200).json({
        message:
          'Lot successfully marked as recycled.',
        lot,
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Unable to recycle lot',
        error: error.message,
      });
    }
  }
);

/*
=================================================
UPDATE PAYMENT STATUS
=================================================
*/

router.patch(
  '/:id/payment',
  protect(),

  async (req, res) => {
    try {
      const {
        paymentStatus,
      } = req.body;

      if (
        !['PENDING', 'PAID'].includes(
          paymentStatus
        )
      ) {
        return res.status(400).json({
          message:
            'Payment status must be PENDING or PAID.',
        });
      }

      const lot = await Lot.findById(
        req.params.id
      );

      if (!lot) {
        return res.status(404).json({
          message: 'Lot not found.',
        });
      }

      lot.paymentStatus =
        paymentStatus;

      lot.updatedAt = new Date();

      await lot.save();

      await createTraceabilityEvent({
        lot,

        eventType:
          `PAYMENT_${paymentStatus}`,

        user: req.user,

        location: lot.location,

        remarks:
          `Payment marked as ${paymentStatus}.`,
      });

      return res.status(200).json({
        message:
          `Payment marked as ${paymentStatus}.`,
        lot,
      });
    } catch (error) {
      return res.status(500).json({
        message:
          'Unable to update payment',
        error: error.message,
      });
    }
  }
);

/*
=================================================
DELETE LOT

COLLECTOR ONLY
Only LOT_CREATED lots can be deleted
=================================================
*/

router.delete(
  '/:id',
  protect('COLLECTOR'),

  async (req, res) => {
    try {
      const lot = await Lot.findById(
        req.params.id
      );

      if (!lot) {
        return res.status(404).json({
          message: 'Lot not found.',
        });
      }

      if (
        String(lot.collector) !==
        String(req.user._id)
      ) {
        return res.status(403).json({
          message:
            'You can only delete your own lots.',
        });
      }

      if (
        lot.status !== 'LOT_CREATED'
      ) {
        return res.status(400).json({
          message:
            'Only unmatched lots can be deleted.',
        });
      }

      await lot.deleteOne();

      return res.status(200).json({
        message:
          'Lot deleted successfully.',
      });
    } catch (error) {
      return res.status(500).json({
        message:
          'Unable to delete lot',
        error: error.message,
      });
    }
  }
);

module.exports = router;