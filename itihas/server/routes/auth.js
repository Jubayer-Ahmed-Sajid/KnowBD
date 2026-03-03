const router = require('express').Router();
const { protect } = require('../middleware/auth');
const {
  validateRegister,
  validateLogin,
  validate,
} = require('../middleware/validators');

const {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword,
  toggleBookmark,
  addVisitedPlace,
  getBookmarks,
  logout,
} = require('../controllers/authController');

// ─── Public routes ──────────────────────────────────────────────
router.post('/register', validateRegister, validate, register);
router.post('/login', validateLogin, validate, login);

// ─── Protected routes ───────────────────────────────────────────
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);
router.put('/bookmarks/:placeId', protect, toggleBookmark);
router.put('/visited/:placeId', protect, addVisitedPlace);
router.get('/bookmarks', protect, getBookmarks);
router.post('/logout', protect, logout);

module.exports = router;
