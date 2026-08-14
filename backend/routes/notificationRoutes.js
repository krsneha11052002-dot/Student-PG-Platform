const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getNotifications, markRead, markAllRead, respondToRoommateRequest } = require('../controllers/notificationController');

// read-all must come before /:id
router.put('/read-all', protect, markAllRead);

router.get('/', protect, getNotifications);
router.put('/:id/read', protect, markRead);
router.post('/respond-roommate', protect, respondToRoommateRequest);

module.exports = router;
