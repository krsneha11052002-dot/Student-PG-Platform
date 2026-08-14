const express = require('express');
const router = express.Router();
const {
  getCommunityPosts,
  createCommunityPost,
  toggleLikePost,
  addComment,
  getLocalServices,
  triggerEmergencyAlert,
  updateCommunityPost,
  deleteCommunityPost
} = require('../controllers/communityController');

const { protect } = require('../middleware/auth');

// Routes
router.get('/posts', getCommunityPosts);
router.post('/posts', protect, createCommunityPost);
router.put('/posts/:id', protect, updateCommunityPost);
router.delete('/posts/:id', protect, deleteCommunityPost);
router.post('/posts/:id/like', protect, toggleLikePost);
router.post('/posts/:id/comment', protect, addComment);
router.get('/services', getLocalServices);
router.post('/emergency', triggerEmergencyAlert);

module.exports = router;
