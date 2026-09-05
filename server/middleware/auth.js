const jwt = require('jsonwebtoken');
const User = require('../models/User');

function protect(allowedRoles = []) {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      return res.status(401).json({ message: 'Authentication token missing.' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'kabadiwala-secret');
      const user = await User.findById(decoded.id || decoded._id).lean();

      if (!user) {
        return res.status(401).json({ message: 'User not found for token.' });
      }

      req.user = user;

      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: 'You do not have permission to access this resource.' });
      }

      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }
  };
}

module.exports = { protect };
