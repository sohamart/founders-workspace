const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/', authenticate, notificationController.getNotifications);
router.post('/read', authenticate, notificationController.markAsRead);
router.post('/clear', authenticate, notificationController.clearNotifications);

module.exports = router;
