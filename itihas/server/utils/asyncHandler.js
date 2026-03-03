/**
 * asyncHandler – eliminates repetitive try/catch in async route handlers.
 *
 * Wraps an async Express handler so that any rejected promise is
 * automatically forwarded to Express's `next(error)` error pipeline.
 *
 * @param {Function} fn – async (req, res, next) => { … }
 * @returns {Function}  – Express middleware
 *
 * @example
 * const asyncHandler = require('../utils/asyncHandler');
 *
 * exports.getPlaces = asyncHandler(async (req, res, next) => {
 *   const places = await Place.find();
 *   res.json({ success: true, data: places });
 * });
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
