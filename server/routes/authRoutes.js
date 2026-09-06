const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Entity = require('../models/Entity');

const { protect } = require('../middleware/auth');

const router = express.Router();

const publicRoles = ['COLLECTOR', 'AGGREGATOR', 'RECYCLER'];


function sanitizeUser(user) {
  if (!user) return user;

  const { password, ...safeUser } = user.toObject
    ? user.toObject()
    : user;

  return safeUser;
}


function generateToken(user) {
  return jwt.sign(
    {
      id: String(user._id),
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || 'kabadiwala-secret',
    {
      expiresIn: '7d',
    }
  );
}


/**
 * REGISTER USER
 */
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      role = 'COLLECTOR',
      location,
    } = req.body;


    // Validate required fields
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        message: 'Name, email, phone, and password are required.',
      });
    }


    // Normalize role
    const normalizedRole = String(role).toUpperCase();


    // Prevent public Admin registration
    if (
      normalizedRole === 'ADMIN' ||
      !publicRoles.includes(normalizedRole)
    ) {
      return res.status(400).json({
        message:
          'Public registration is limited to Collector, Aggregator, and Recycler roles.',
      });
    }


    // Check existing user
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'A user with this email already exists.',
      });
    }


    /**
     * CREATE USER
     */

    const verificationStatus =
      normalizedRole === 'COLLECTOR'
        ? 'VERIFIED'
        : 'PENDING';


    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password: await bcrypt.hash(password, 10),
      role: normalizedRole,
      location: location || 'Bengaluru',
      verificationStatus,
    });


    /**
     * IMPORTANT:
     * Automatically create an Entity
     * for Aggregators and Recyclers
     */

    let newEntity = null;

    if (
      normalizedRole === 'AGGREGATOR' ||
      normalizedRole === 'RECYCLER'
    ) {
      newEntity = await Entity.create({
        name,
        type: normalizedRole,
        location: location || 'Bengaluru',

         materialsAccepted: [
      'Aluminium',
      'Copper',
      'Iron',
      'Plastic',
      'Paper',
      'E-Waste',
       ],

        verificationStatus: 'PENDING',

        contactInformation: {
          phone,
          email: email.toLowerCase(),
        },

        user: newUser._id,
      });
    }


    return res.status(201).json({
      message: 'Registration successful.',

      token: generateToken(newUser),

      user: sanitizeUser(newUser),

      entity: newEntity,
    });


  } catch (error) {

    return res.status(500).json({
      message: 'Unable to register user',
      error: error.message,
    });

  }
});


/**
 * LOGIN
 */

router.post('/login', async (req, res) => {

  try {

    const { email, password } = req.body;


    if (!email || !password) {

      return res.status(400).json({
        message: 'Email and password are required.',
      });

    }


    const user = await User.findOne({
      email: String(email).toLowerCase(),
    });


    if (!user) {

      return res.status(401).json({
        message: 'Invalid email or password.',
      });

    }


    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );


    if (!passwordMatch) {

      return res.status(401).json({
        message: 'Invalid email or password.',
      });

    }


    return res.status(200).json({

      token: generateToken(user),

      user: sanitizeUser(user),

    });


  } catch (error) {

    return res.status(500).json({
      message: 'Unable to login',
      error: error.message,
    });

  }

});


/**
 * GET CURRENT USER
 */

router.get('/me', protect(), (req, res) => {

  return res.status(200).json({

    user: sanitizeUser(req.user),

  });

});


module.exports = router;