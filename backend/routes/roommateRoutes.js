const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getRoommatePosts,
  createRoommatePost,
  updateRoommatePost,
  deleteRoommatePost,
  sendRoommateRequest,
  getMyRequests
} = require('../controllers/roommateController');

// my-requests must come before /:id
router.get('/my-requests', protect, getMyRequests);

router.get('/', getRoommatePosts);
router.post('/', protect, createRoommatePost);
router.put('/:id', protect, updateRoommatePost);
router.delete('/:id', protect, deleteRoommatePost);
router.post('/:id/request', protect, sendRoommateRequest);

module.exports = router;
