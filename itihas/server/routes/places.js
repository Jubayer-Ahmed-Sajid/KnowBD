const router = require('express').Router();
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { validatePlace, validate } = require('../middleware/validators');

const {
  getPlaces,
  getPlace,
  getPlacesByCategory,
  getPlacesByEra,
  getFeaturedPlaces,
  getNearbyPlaces,
  searchPlaces,
  getPlaceStats,
  createPlace,
  updatePlace,
  deletePlace,
  getMapPlaces,
} = require('../controllers/placeController');

// ─── Nested route: re-route into review router ─────────────────
const reviewRouter = require('./reviews');
router.use('/:placeId/reviews', reviewRouter);

// ─── Static / keyword routes (must come BEFORE /:slug) ─────────
router.get('/featured', optionalAuth, getFeaturedPlaces);
router.get('/nearby', optionalAuth, getNearbyPlaces);
router.get('/search', optionalAuth, searchPlaces);
router.get('/stats', getPlaceStats);
router.get('/map/all', getMapPlaces);
router.get('/category/:category', optionalAuth, getPlacesByCategory);
router.get('/era/:era', optionalAuth, getPlacesByEra);

// ─── CRUD ───────────────────────────────────────────────────────
router
  .route('/')
  .get(optionalAuth, getPlaces)
  .post(protect, authorize('admin'), validatePlace, validate, createPlace);

router.get('/:slug', optionalAuth, getPlace);

router
  .route('/:id')
  .put(protect, authorize('admin'), validatePlace, validate, updatePlace)
  .delete(protect, authorize('admin'), deletePlace);

module.exports = router;
