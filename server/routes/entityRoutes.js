const express = require('express');
const Entity = require('../models/Entity');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect(), async (req, res) => {
  try {
    const query = {};
    if (req.user.role !== 'ADMIN') {
      query.verificationStatus = 'VERIFIED';
    }

    const entities = await Entity.find(query).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ entities });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load entities', error: error.message });
  }
});

router.post('/', protect(['ADMIN']), async (req, res) => {
  try {
    const { name, type, location, materialsAccepted, contactInformation, user } = req.body;

    if (!name || !type || !location || !user) {
      return res.status(400).json({ message: 'Entity name, type, location, and user are required.' });
    }

    if (!['AGGREGATOR', 'RECYCLER'].includes(String(type).toUpperCase())) {
      return res.status(400).json({ message: 'Entity type must be AGGREGATOR or RECYCLER.' });
    }

    const entity = await Entity.create({
      name,
      type: String(type).toUpperCase(),
      location,
      materialsAccepted: materialsAccepted || [],
      verificationStatus: 'PENDING',
      contactInformation: contactInformation || {},
      user,
    });

    return res.status(201).json({ entity });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to create entity', error: error.message });
  }
});

router.patch('/:id/verify', protect(['ADMIN']), async (req, res) => {
  try {
    const entity = await Entity.findById(req.params.id);

    if (!entity) {
      return res.status(404).json({ message: 'Entity not found.' });
    }

    const nextStatus = ['PENDING', 'VERIFIED', 'REJECTED'].includes(req.body.verificationStatus)
      ? req.body.verificationStatus
      : 'VERIFIED';

    entity.verificationStatus = nextStatus;
    await entity.save();
    return res.status(200).json({ entity });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to update entity status', error: error.message });
  }
});

module.exports = router;
