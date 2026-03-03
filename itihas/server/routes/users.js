const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getDashboardStats,
  getUsers,
  updateUserRole,
  deleteUser,
  getPendingStories,
  bulkApproveStories,
} = require('../controllers/adminController');

// ── All routes require authentication + admin role ──────────────
router.use(protect, authorize('admin'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// User management
router.route('/').get(getUsers);
router.route('/:id/role').put(updateUserRole);
router.route('/:id').delete(deleteUser);

// Story moderation (admin convenience — lives under /api/users path)
router.get('/stories/pending', getPendingStories);
router.put('/stories/bulk-approve', bulkApproveStories);

module.exports = router;
