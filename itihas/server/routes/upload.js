const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { uploadSingle, uploadArray } = require('../middleware/upload');
const {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
} = require('../controllers/uploadController');

// Single image — any authenticated user (avatar, review photo, etc.)
router.post('/image', protect, uploadSingle, uploadImage);

// Multiple images — admin only (batch place gallery uploads)
router.post('/images', protect, authorize('admin'), uploadArray, uploadMultipleImages);

// Delete image — admin only
router.delete('/image', protect, authorize('admin'), deleteImage);

module.exports = router;
