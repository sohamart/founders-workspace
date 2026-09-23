const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

router.get('/founders', authenticate, adminController.getFounders);
router.post('/founders', authenticate, requireAdmin, adminController.createFounder);
router.delete('/founders/:id', authenticate, requireAdmin, adminController.deleteFounder);
router.post('/founders/:id/strike', authenticate, requireAdmin, adminController.issueStrike);
router.post('/founders/:id/pardon', authenticate, requireAdmin, adminController.pardonStrike);
router.post('/founders/:id/status', authenticate, requireAdmin, adminController.toggleAccountStatus);

// Rules Book & Seal Endorsement
router.get('/rules', authenticate, adminController.getRulesBook);
router.post('/rules/sign', authenticate, adminController.signRulesBook);
router.post('/rules/ratify', authenticate, requireAdmin, adminController.ratifyRulesBook);

// Productivity & Admin Tools
router.get('/inactivity-radar', authenticate, requireAdmin, adminController.getInactivityRadar);
router.post('/security-freeze', authenticate, requireAdmin, adminController.toggleSecurityFreeze);
router.get('/backup-export', authenticate, requireAdmin, adminController.exportBackup);
router.post('/backup-restore', authenticate, requireAdmin, adminController.restoreBackup);

// Portal Settings & Coming Soon Gateway Control
router.get('/settings', adminController.getSettings);
router.post('/settings', authenticate, requireAdmin, adminController.updateSettings);

module.exports = router;
