const router = require('express').Router();
const { protect, authorize, optionalAuth } = require('../middleware/auth');

const {
  getStories,
  getStory,
  createStory,
  updateStory,
  deleteStory,
  approveStory,
  toggleLike,
} = require('../controllers/storyController');

// ─── Routes ─────────────────────────────────────────────────────

router
  .route('/')
  .get(optionalAuth, getStories)
  .post(protect, createStory);

router.get('/:id', optionalAuth, getStory);

router
  .route('/:id')
  .put(protect, updateStory)
  .delete(protect, deleteStory);

router.put('/:id/approve', protect, authorize('admin'), approveStory);
router.put('/:id/like', protect, toggleLike);

module.exports = router;
