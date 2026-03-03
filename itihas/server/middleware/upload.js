const multer = require('multer');

// ─── Storage ────────────────────────────────────────────────────
// Memory storage — files stay in buffer until uploaded to Cloudinary.
const storage = multer.memoryStorage();

// ─── File filter ────────────────────────────────────────────────
const ALLOWED_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error('Invalid file type — only JPEG, PNG and WebP images are allowed'),
      false
    );
  }
};

// ─── Multer instance ────────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

/**
 * Accept a single image upload (field name: `image`).
 */
const uploadSingle = upload.single('image');

/**
 * Accept up to 10 images (field name: `images`).
 */
const uploadArray = upload.array('images', 10);

module.exports = { uploadSingle, uploadArray };
