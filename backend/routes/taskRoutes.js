const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', authenticate, taskController.getTasks);
router.post('/', authenticate, taskController.createTask);
router.post('/:id/daily-update', authenticate, taskController.postDailyUpdate);
router.post('/:id/request-progress', authenticate, taskController.requestProgress);
router.post('/:id/review-progress', authenticate, requireAdmin, taskController.reviewProgress);
router.post('/:id/transfer-request', authenticate, taskController.requestTransfer);
router.post('/:id/transfer-respond', authenticate, taskController.respondTransfer);
router.post('/:id/request-extension', authenticate, taskController.requestExtension);
router.post('/:id/review-extension', authenticate, requireAdmin, taskController.reviewExtension);
router.post('/:id/toggle-blocker', authenticate, taskController.toggleBlocker);
router.post('/:id/approve-creation', authenticate, requireAdmin, taskController.approveTaskCreation);
router.post('/:id/reject-creation', authenticate, requireAdmin, taskController.rejectTaskCreation);
router.post('/:id/checklist-toggle', authenticate, taskController.toggleChecklist);

router.put('/:id', authenticate, requireAdmin, taskController.updateTask);
router.delete('/:id', authenticate, requireAdmin, taskController.deleteTask);
router.patch('/:id/admin-status', authenticate, requireAdmin, taskController.adminUpdateStatus);
router.post('/:id/admin-transfer', authenticate, requireAdmin, taskController.adminDirectTransfer);
router.post('/:id/transfer-admin-review', authenticate, requireAdmin, taskController.adminReviewTransfer);

module.exports = router;
