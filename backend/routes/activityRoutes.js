const express = require('express');
const router = express.Router();
const { getStore } = require('../config/localStore');
const { authenticate } = require('../middleware/authMiddleware');

// @desc Get Live Activity Stream for all authenticated founders
// @route GET /api/activity
router.get('/', authenticate, (req, res) => {
  const store = getStore();
  const logs = (store.auditLogs || []).slice(0, 150);
  res.json({
    success: true,
    count: logs.length,
    activity: logs,
    auditLogs: logs
  });
});

module.exports = router;
