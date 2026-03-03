const router = require('express').Router({ mergeParams: true });
const { protect, optionalAuth } = require('../middleware/auth');
const { validateReview, validate } = require('../middleware/validators');

const {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  toggleHelpful,
} = require('../controllers/reviewController');

// ─── Routes ─────────────────────────────────────────────────────
//
// Mounted at /api/reviews
// Also nested at /api/places/:placeId/reviews (mergeParams: true)

router
  .route('/')
  .get(optionalAuth, getReviews)
  .post(protect, validateReview, validate, createReview);

router.get('/:id', optionalAuth, getReview);

router
  .route('/:id')
  .put(protect, updateReview)
  .delete(protect, deleteReview);

router.put('/:id/helpful', protect, toggleHelpful);

module.exports = router;
