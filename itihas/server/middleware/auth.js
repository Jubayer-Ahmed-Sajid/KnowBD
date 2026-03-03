const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect – verify JWT from the `Authorization: Bearer <token>` header,
 * look up the user in the database, and attach the full user document
 * (minus password) to `req.user`.
 *
 * Returns 401 on missing / invalid / expired tokens.
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, error: 'Not authorised — no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user so downstream handlers have the full document
    const user = await User.findById(decoded.id);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: 'User belonging to this token no longer exists' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res
        .status(401)
        .json({ success: false, error: 'Token expired — please log in again' });
    }
    return res
      .status(401)
      .json({ success: false, error: 'Not authorised — invalid token' });
  }
};

/**
 * authorize – restrict access to specific roles.
 *
 * Must be used AFTER `protect` so `req.user` is available.
 *
 * @param  {...string} roles – e.g. 'admin', 'editor'
 * @returns {Function} Express middleware
 *
 * @example
 * router.delete('/:id', protect, authorize('admin'), deletePlace);
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Role '${req.user.role}' is not authorised to access this route`,
      });
    }
    next();
  };
};

/**
 * optionalAuth – like `protect` but does **not** return an error when
 * no token is present.  If a valid token IS provided, `req.user` is
 * populated; otherwise `req.user` remains `undefined`.
 *
 * Useful for endpoints that behave differently for authenticated users
 * (e.g. showing a "bookmarked" flag) without requiring login.
 */
const optionalAuth = async (req, _res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) return next(); // no token → anonymous visitor, that's fine

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (user) req.user = user;
  } catch (_err) {
    // Invalid/expired token in optional context → just continue anonymously
  }

  next();
};

module.exports = { protect, authorize, optionalAuth };
