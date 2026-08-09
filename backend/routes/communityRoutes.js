const express = require('express');
const router = express.Router();
const {
  getCommunityPosts,
  createCommunityPost,
  toggleLikePost,
  addComment,
  getLocalServices,
  triggerEmergencyAlert
} = require('../controllers/communityController');

// Routes
router.get('/posts', getCommunityPosts);
router.post('/posts', createCommunityPost);
router.post('/posts/:id/like', toggleLikePost);
router.post('/posts/:id/comment', addComment);
router.get('/services', getLocalServices);
router.post('/emergency', triggerEmergencyAlert);

module.exports = router;
