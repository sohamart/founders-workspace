const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', authenticate, meetingController.getAllMeetings);
router.get('/current', authenticate, meetingController.getCurrentMeeting);
router.post('/schedule', authenticate, meetingController.scheduleMeeting);
router.post('/host-submit', authenticate, meetingController.hostSubmit);
router.post('/rsvp', authenticate, meetingController.confirmRsvp);
router.post('/cancel', authenticate, meetingController.cancelMeeting);

module.exports = router;
