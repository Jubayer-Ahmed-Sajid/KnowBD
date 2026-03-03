const { body, validationResult } = require('express-validator');

// ─── Allowed enum values (keep in sync with Place model) ────────
const CATEGORY_ENUM = [
  'Archaeological',
  'Architectural',
  'Religious',
  'Natural',
  'Liberation War',
  'Cultural',
  'UNESCO',
];

// ─────────────────────────────────────────────────────────────────
// validate — runs express-validator result check
// ─────────────────────────────────────────────────────────────────

/**
 * Middleware that inspects `validationResult(req)`.
 * Returns 400 with an array of errors if any rule failed.
 *
 * Usage: router.post('/', [...validateRegister, validate], handler)
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  next();
};

// ─────────────────────────────────────────────────────────────────
// validatePlace
// ─────────────────────────────────────────────────────────────────

/**
 * Validation chain for creating / updating a Place.
 *
 * Required: name.en, category (valid enum), location.coordinates
 */
const validatePlace = [
  body('name.en')
    .trim()
    .notEmpty()
    .withMessage('English name is required')
    .isLength({ max: 200 })
    .withMessage('English name cannot exceed 200 characters'),

  body('category')
    .optional()
    .isIn(CATEGORY_ENUM)
    .withMessage(`Category must be one of: ${CATEGORY_ENUM.join(', ')}`),

  body('location.coordinates')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be an array of [longitude, latitude]'),

  body('location.coordinates.*')
    .optional()
    .isFloat()
    .withMessage('Each coordinate must be a valid number'),
];

// ─────────────────────────────────────────────────────────────────
// validateReview
// ─────────────────────────────────────────────────────────────────

/**
 * Validation chain for creating / updating a Review.
 */
const validateReview = [
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),

  body('title')
    .trim()
    .notEmpty()
    .withMessage('Review title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),

  body('text')
    .trim()
    .notEmpty()
    .withMessage('Review text is required')
    .isLength({ max: 1000 })
    .withMessage('Review text cannot exceed 1000 characters'),
];

// ─────────────────────────────────────────────────────────────────
// validateRegister
// ─────────────────────────────────────────────────────────────────

/**
 * Validation chain for user registration.
 */
const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

// ─────────────────────────────────────────────────────────────────
// validateLogin
// ─────────────────────────────────────────────────────────────────

/**
 * Validation chain for user login.
 */
const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

module.exports = {
  validate,
  validatePlace,
  validateReview,
  validateRegister,
  validateLogin,
};
