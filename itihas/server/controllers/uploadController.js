const { uploadImage, deleteImage } = require('../config/cloudinary');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Convert a multer memory-buffer into a base64 data-URI that
 * Cloudinary's uploader.upload() can consume.
 *
 * @param {Buffer} buffer
 * @param {string} mimetype
 * @returns {string} data URI
 */
const bufferToDataUri = (buffer, mimetype) =>
  `data:${mimetype};base64,${buffer.toString('base64')}`;

// ─────────────────────────────────────────────────────────────────
// 1.  POST /api/upload/image
// ─────────────────────────────────────────────────────────────────

/**
 * Upload a single image to Cloudinary.
 *
 * Expects `multipart/form-data` with field `image`.
 * Optional query param `?folder=avatars` → subfolder under `itihas/`.
 * Default folder: `itihas/places`.
 */
exports.uploadImage = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    const err = new Error('Please upload an image file');
    err.statusCode = 400;
    return next(err);
  }

  const subfolder = req.query.folder === 'avatars' ? 'avatars' : 'places';
  const folder = `itihas/${subfolder}`;

  const dataUri = bufferToDataUri(req.file.buffer, req.file.mimetype);
  const result = await uploadImage(dataUri, folder);

  res.status(201).json({
    success: true,
    message: 'Image uploaded',
    data: {
      url: result.url,
      publicId: result.public_id,
    },
  });
});

// ─────────────────────────────────────────────────────────────────
// 2.  POST /api/upload/images
// ─────────────────────────────────────────────────────────────────

/**
 * Upload multiple images (up to 10) to Cloudinary.
 *
 * Expects `multipart/form-data` with field `images` (array).
 * Optional query param `?folder=avatars`.
 */
exports.uploadMultipleImages = asyncHandler(async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    const err = new Error('Please upload at least one image');
    err.statusCode = 400;
    return next(err);
  }

  const subfolder = req.query.folder === 'avatars' ? 'avatars' : 'places';
  const folder = `itihas/${subfolder}`;

  const uploads = await Promise.all(
    req.files.map((file) => {
      const dataUri = bufferToDataUri(file.buffer, file.mimetype);
      return uploadImage(dataUri, folder);
    })
  );

  const data = uploads.map((r) => ({
    url: r.url,
    publicId: r.public_id,
  }));

  res.status(201).json({
    success: true,
    message: `${data.length} image${data.length === 1 ? '' : 's'} uploaded`,
    data,
  });
});

// ─────────────────────────────────────────────────────────────────
// 3.  DELETE /api/upload/image
// ─────────────────────────────────────────────────────────────────

/**
 * Delete an image from Cloudinary by its publicId.
 *
 * Body: { publicId: 'itihas/places/abc123' }
 */
exports.deleteImage = asyncHandler(async (req, res, next) => {
  const { publicId } = req.body;

  if (!publicId) {
    const err = new Error('Please provide a publicId');
    err.statusCode = 400;
    return next(err);
  }

  await deleteImage(publicId);

  res.json({
    success: true,
    message: 'Image deleted',
  });
});
