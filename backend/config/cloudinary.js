const cloudinary = require('cloudinary').v2;

// Check if credentials exist
const isConfigured = !!(
  process.env.CLOUDINARY_URL || 
  (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
);

if (isConfigured) {
  try {
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
        api_key: process.env.CLOUDINARY_API_KEY.trim(),
        api_secret: process.env.CLOUDINARY_API_SECRET.trim(),
        secure: true
      });
      console.log('☁️  Cloudinary storage initialized successfully with API keys.');
    } else if (process.env.CLOUDINARY_URL) {
      const cleanUrl = process.env.CLOUDINARY_URL.replace(/^CLOUDINARY_URL=/, '').trim();
      cloudinary.config({
        cloudinary_url: cleanUrl
      });
      console.log('☁️  Cloudinary storage initialized successfully via URL.');
    }
  } catch (err) {
    console.warn('⚠️  Cloudinary initialization notice:', err.message);
  }
} else {
  console.log('ℹ️  Cloudinary credentials not configured yet. Operating in local memory fallback mode.');
}

/**
 * Uploads a buffer or base64 string to Cloudinary with fallback
 * @param {Buffer|string} file - The file buffer or base64 data URI
 * @param {string} folder - Destination folder on Cloudinary (e.g. 'founders/avatars', 'founders/proofs')
 * @param {string} resourceType - 'auto', 'image', 'video', 'raw'
 * @returns {Promise<{ url: string, public_id: string }>}
 */
const uploadMedia = async (file, folder = 'founders_workspace', resourceType = 'auto') => {
  if (!isConfigured) {
    // Graceful fallback: if it's already a string or buffer, return a data URI representation
    if (Buffer.isBuffer(file)) {
      const base64 = file.toString('base64');
      return {
        url: `data:image/jpeg;base64,${base64}`,
        public_id: `local_${Date.now()}`
      };
    }
    return {
      url: typeof file === 'string' ? file : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      public_id: `mock_${Date.now()}`
    };
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          // Fallback to data URI rather than failing user action
          if (Buffer.isBuffer(file)) {
            const base64 = file.toString('base64');
            return resolve({
              url: `data:image/jpeg;base64,${base64}`,
              public_id: `fallback_${Date.now()}`
            });
          }
          return reject(error);
        }
        resolve({
          url: result.secure_url || result.url,
          public_id: result.public_id,
          format: result.format,
          bytes: result.bytes
        });
      }
    );

    if (Buffer.isBuffer(file)) {
      uploadStream.end(file);
    } else if (typeof file === 'string' && file.startsWith('data:')) {
      cloudinary.uploader.upload(file, { folder, resource_type: resourceType })
        .then(result => resolve({ url: result.secure_url || result.url, public_id: result.public_id }))
        .catch(reject);
    } else {
      resolve({ url: file, public_id: 'pass_through' });
    }
  });
};

module.exports = {
  cloudinary,
  isConfigured,
  uploadMedia
};
