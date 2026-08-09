const jwt = require('jsonwebtoken');
const { JWT_SECRET, memoryStore } = require('../utils/memoryStore');
const { getMongoStatus } = require('../config/db');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no authentication token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (getMongoStatus()) {
      const user = await User.findById(decoded.id).select('-passwordHash');
      if (user) {
        req.user = user;
        return next();
      }
    }

    // Fallback or memory store user
    const memUser = memoryStore.findUserById(decoded.id) || {
      _id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
      isVerified: true
    };

    req.user = memUser;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role [${req.user ? req.user.role : 'guest'}] is not permitted to perform this action`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
