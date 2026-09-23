const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.post('/onboard', authenticate, authController.onboard);
router.post('/admin-override-password', authenticate, requireAdmin, authController.adminOverridePassword);
router.post('/setup-master-admin', authController.setupMasterAdmin);
router.post('/factory-reset', authenticate, requireAdmin, authController.factoryReset);
router.post('/verify-bypass', authController.verifyBypassKey);
router.get('/me', authenticate, authController.getMe);
router.put('/profile', authenticate, authController.updateProfile);

module.exports = router;
