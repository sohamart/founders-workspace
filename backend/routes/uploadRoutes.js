const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadMedia, isConfigured } = require('../config/cloudinary');

// Use memory storage for fast buffer processing
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit (supports images, audio, short videos, docs)
});

/**
 * @route   POST /api/upload
 * @desc    Upload single file to Cloudinary (avatar, proof, media, document)
 * @access  Public / Authenticated
 */
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const folder = req.body.folder || 'founders_workspace';
    const resourceType = req.body.resourceType || 'auto';

    // 1. If uploaded as multipart file
    if (req.file) {
      const result = await uploadMedia(req.file.buffer, folder, resourceType);
      return res.json({
        success: true,
        url: result.url,
        publicId: result.public_id,
        filename: req.file.originalname,
        size: req.file.size,
        provider: isConfigured ? 'cloudinary' : 'local_fallback'
      });
    }

    // 2. If uploaded as base64 string
    if (req.body.dataUri || req.body.base64) {
      const data = req.body.dataUri || req.body.base64;
      const result = await uploadMedia(data, folder, resourceType);
      return res.json({
        success: true,
        url: result.url,
        publicId: result.public_id,
        provider: isConfigured ? 'cloudinary' : 'local_fallback'
      });
    }

    return res.status(400).json({ success: false, message: 'No file or dataUri provided in request' });
  } catch (error) {
    console.error('File upload route error:', error);
    res.status(500).json({ success: false, message: error.message || 'Upload processing failed' });
  }
});

/**
 * @route   GET /api/upload/status
 * @desc    Check Cloudinary configuration status
 */
router.get('/status', (req, res) => {
  res.json({
    configured: isConfigured,
    provider: isConfigured ? 'Cloudinary (Active)' : 'Local Storage Fallback',
    maxFileSize: '25MB'
  });
});

module.exports = router;
