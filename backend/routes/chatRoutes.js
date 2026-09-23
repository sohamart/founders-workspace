const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/messages', authenticate, chatController.getMessages);
router.post('/messages', authenticate, chatController.sendMessage);
router.post('/mark-read', authenticate, chatController.markAsRead);

module.exports = router;
