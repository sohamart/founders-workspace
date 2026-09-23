const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', authenticate, clientController.getClientProjects);
router.post('/', authenticate, clientController.createClientProject);
router.post('/:id/approve', authenticate, requireAdmin, clientController.approveClientProject);
router.post('/:id/reject', authenticate, requireAdmin, clientController.rejectClientProject);
router.post('/:id/pipeline-stage', authenticate, clientController.addPipelineStage);
router.post('/:id/credentials', authenticate, clientController.addCredential);
router.post('/:id/credentials/:credId/approve', authenticate, requireAdmin, clientController.approveCredential);
router.post('/:id/credentials/:credId/reveal', authenticate, clientController.revealCredential);
router.post('/:id/phase-update', authenticate, clientController.updatePhase);
router.post('/:id/checklist-toggle', authenticate, clientController.toggleChecklist);

module.exports = router;
