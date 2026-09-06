const express = require('express');
const Entity = require('../models/Entity');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * GET ALL ENTITIES
 *
 * ADMIN:
 * Can see all entities including PENDING, VERIFIED and REJECTED.
 *
 * OTHER USERS:
 * Can see only VERIFIED entities.
 */
router.get('/', protect(), async (req, res) => {
  try {
    const query = {};

    // Normal users should only see verified entities
    if (req.user.role !== 'ADMIN') {
      query.verificationStatus = 'VERIFIED';
    }

    const entities = await Entity.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      entities,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to load entities',
      error: error.message,
    });
  }
});


/**
 * CREATE ENTITY
 *
 * Only ADMIN can manually create an entity.
 *
 * Entity types allowed:
 * - AGGREGATOR
 * - RECYCLER
 */
router.post('/', protect(['ADMIN']), async (req, res) => {
  try {
    const {
      name,
      type,
      location,
      materialsAccepted,
      contactInformation,
      user,
    } = req.body;

    if (!name || !type || !location || !user) {
      return res.status(400).json({
        message:
          'Entity name, type, location, and user are required.',
      });
    }

    const entityType = String(type).toUpperCase();

    if (!['AGGREGATOR', 'RECYCLER'].includes(entityType)) {
      return res.status(400).json({
        message:
          'Entity type must be AGGREGATOR or RECYCLER.',
      });
    }

    const entity = await Entity.create({
      name,
      type: entityType,
      location,
      materialsAccepted: materialsAccepted || [],
      verificationStatus: 'PENDING',
      contactInformation: contactInformation || {},
      user,
    });

    return res.status(201).json({
      message: 'Entity created successfully.',
      entity,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to create entity',
      error: error.message,
    });
  }
});


/**
 * VERIFY OR REJECT ENTITY
 *
 * Only ADMIN can perform verification.
 *
 * Possible statuses:
 * - PENDING
 * - VERIFIED
 * - REJECTED
 */
router.patch('/:id/verify', protect(['ADMIN']), async (req, res) => {
  try {
    const entity = await Entity.findById(req.params.id);

    if (!entity) {
      return res.status(404).json({
        message: 'Entity not found.',
      });
    }

    const allowedStatuses = [
      'PENDING',
      'VERIFIED',
      'REJECTED',
    ];

    const nextStatus = String(
      req.body.verificationStatus || 'VERIFIED'
    ).toUpperCase();

    if (!allowedStatuses.includes(nextStatus)) {
      return res.status(400).json({
        message:
          'Invalid verification status. Use PENDING, VERIFIED, or REJECTED.',
      });
    }

    entity.verificationStatus = nextStatus;

    await entity.save();

    return res.status(200).json({
      message: `Entity ${nextStatus.toLowerCase()} successfully.`,
      entity,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to update entity status',
      error: error.message,
    });
  }
});


module.exports = router;