const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT containing the user's id and role.
 *
 * @param {import('mongoose').Document} user – Mongoose user document
 * @returns {string} Signed JWT
 */
const generateToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );

module.exports = generateToken;
