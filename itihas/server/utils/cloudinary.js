const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a buffer/base64 image to Cloudinary.
 * @param {string} file – base64 data URI or file path
 * @param {string} folder – Cloudinary folder name
 * @returns {Promise<{url: string, public_id: string}>}
 */
const uploadImage = async (file, folder = 'itihas') => {
  const result = await cloudinary.uploader.upload(file, {
    folder,
    resource_type: 'image',
  });
  return { url: result.secure_url, public_id: result.public_id };
};

/**
 * Delete an image from Cloudinary by public_id.
 */
const deleteImage = async (publicId) => {
  await cloudinary.uploader.destroy(publicId);
};

module.exports = { cloudinary, uploadImage, deleteImage };
