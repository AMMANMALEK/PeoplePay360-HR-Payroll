const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    const error = new Error('Not authorized, no token');
    error.statusCode = 401;
    return next(error);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      const error = new Error('User belonging to this token no longer exists');
      error.statusCode = 401;
      return next(error);
    }
    
    if (!user.isActive) {
      const error = new Error('User account is deactivated');
      error.statusCode = 401;
      return next(error);
    }

    req.user = user;
    next();
  } catch (err) {
    const error = new Error('Not authorized, token failed');
    error.statusCode = 401;
    next(error);
  }
};

const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles) {
      const error = new Error('Not authorized to access this route');
      error.statusCode = 403;
      return next(error);
    }

    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));
    
    if (!hasRole) {
      const error = new Error(`User roles ${req.user.roles.join(', ')} are not authorized to access this route`);
      error.statusCode = 403;
      return next(error);
    }
    
    next();
  };
};

module.exports = { protect, checkRole };
