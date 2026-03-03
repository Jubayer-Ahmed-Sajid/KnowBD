const cloudinary = require('cloudinary').v2;

// ─── Configure Cloudinary ───────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload an image to Cloudinary's `itihas/` folder.
 *
 * Applies automatic format selection, automatic quality optimisation,
 * and limits width to 1200 px to keep payloads reasonable.
 *
 * @param {string|Buffer} file   - File path, base64 data-URI, or buffer
 * @param {string}        [folder='itihas'] - Cloudinary folder
 * @returns {Promise<{ url: string, public_id: string, width: number, height: number }>}
 */
const uploadImage = async (file, folder = 'itihas') => {
  const result = await cloudinary.uploader.upload(file, {
    folder,
    resource_type: 'image',
    fetch_format: 'auto',
    quality: 'auto',
    transformation: [{ width: 1200, crop: 'limit' }],
  });

  return {
    url: result.secure_url,
    public_id: result.public_id,
    width: result.width,
    height: result.height,
  };
};

/**
 * Delete an image from Cloudinary by its public_id.
 *
 * @param {string} publicId
 * @returns {Promise<void>}
 */
const deleteImage = async (publicId) => {
  await cloudinary.uploader.destroy(publicId);
};

module.exports = { cloudinary, uploadImage, deleteImage };
