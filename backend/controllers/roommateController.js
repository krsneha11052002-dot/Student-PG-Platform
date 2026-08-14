const { getMongoStatus } = require('../config/db');
const RoommatePost = require('../models/RoommatePost');
const RoommateRequest = require('../models/RoommateRequest');
const Notification = require('../models/Notification');

// @desc    Get all roommate posts
// @route   GET /api/roommates
const getRoommatePosts = async (req, res) => {
  try {
    if (getMongoStatus()) {
      const posts = await RoommatePost.find().sort({ createdAt: -1 });
      return res.json({ success: true, data: posts });
    }
    res.json({ success: true, data: [] });
  } catch (err) {
    console.error('Get roommate posts error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch roommate posts' });
  }
};

// @desc    Create roommate post
// @route   POST /api/roommates
const createRoommatePost = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { gender, year, department, college, area, avatar, lifestyle, lookingFor, budget, bio } = req.body;

    if (getMongoStatus()) {
      const post = await RoommatePost.create({
        userId,
        userName: req.user.name,
        gender: gender || 'Not specified',
        year: year || '',
        department: department || 'Student',
        college: college || '',
        area: area || '',
        avatar: avatar || '🎓',
        lifestyle: lifestyle || ['Non-Smoker'],
        lookingFor: lookingFor || '2-Sharing Room',
        budget: budget || '',
        bio: bio || '',
        verified: true,
        matchScore: Math.floor(Math.random() * 20) + 80
      });
      return res.status(201).json({ success: true, data: post });
    }
    res.status(503).json({ success: false, message: 'Database not connected. Please try again later.' });
  } catch (err) {
    console.error('Create roommate post error:', err);
    res.status(500).json({ success: false, message: 'Failed to create roommate post' });
  }
};

// @desc    Update roommate post (owner only)
// @route   PUT /api/roommates/:id
const updateRoommatePost = async (req, res) => {
  try {
    const userId = String(req.user._id || req.user.id);
    if (getMongoStatus()) {
      const post = await RoommatePost.findById(req.params.id);
      if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
      if (String(post.userId) !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to edit this post' });
      }
      const allowed = ['gender', 'year', 'department', 'college', 'area', 'avatar', 'lifestyle', 'lookingFor', 'budget', 'bio'];
      allowed.forEach(key => {
        if (req.body[key] !== undefined) post[key] = req.body[key];
      });
      await post.save();
      return res.json({ success: true, data: post });
    }
    res.status(503).json({ success: false, message: 'Database not connected.' });
  } catch (err) {
    console.error('Update roommate post error:', err);
    res.status(500).json({ success: false, message: 'Failed to update post' });
  }
};

// @desc    Delete roommate post (owner only)
// @route   DELETE /api/roommates/:id
const deleteRoommatePost = async (req, res) => {
  try {
    const userId = String(req.user._id || req.user.id);
    if (getMongoStatus()) {
      const post = await RoommatePost.findById(req.params.id);
      if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
      if (String(post.userId) !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
      }
      await RoommatePost.findByIdAndDelete(req.params.id);
      // Clean up related requests and notifications
      await RoommateRequest.deleteMany({ postId: req.params.id });
      return res.json({ success: true, message: 'Post deleted successfully' });
    }
    res.status(503).json({ success: false, message: 'Database not connected.' });
  } catch (err) {
    console.error('Delete roommate post error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete post' });
  }
};

// @desc    Send roommate request (real, DB-backed)
// @route   POST /api/roommates/:id/request
const sendRoommateRequest = async (req, res) => {
  try {
    const requesterId = String(req.user._id || req.user.id);
    const postId = req.params.id;

    if (getMongoStatus()) {
      const post = await RoommatePost.findById(postId);
      if (!post) return res.status(404).json({ success: false, message: 'Roommate post not found' });

      // Prevent self-request
      if (String(post.userId) === requesterId) {
        return res.status(400).json({ success: false, message: 'You cannot send a request to your own post' });
      }

      // Prevent duplicate pending request
      const existing = await RoommateRequest.findOne({ requesterId, postId, status: 'pending' });
      if (existing) {
        return res.status(400).json({ success: false, message: 'You already have a pending request for this post' });
      }

      const request = await RoommateRequest.create({
        requesterId,
        requesterName: req.user.name,
        recipientId: post.userId,
        postId,
        status: 'pending'
      });

      // Create notification for post owner
      await Notification.create({
        recipientId: post.userId,
        senderId: requesterId,
        senderName: req.user.name,
        title: '🔔 New Roommate Request',
        message: `${req.user.name} wants to connect with you for your roommate post.`,
        type: 'roommate_request',
        relatedId: String(postId),
        requestId: String(request._id),
        actionStatus: 'pending'
      });

      return res.status(201).json({ success: true, data: request });
    }
    res.status(503).json({ success: false, message: 'Database not connected.' });
  } catch (err) {
    console.error('Send roommate request error:', err);
    res.status(500).json({ success: false, message: 'Failed to send request' });
  }
};

// @desc    Get current user's sent/received requests
// @route   GET /api/roommates/my-requests
const getMyRequests = async (req, res) => {
  try {
    const userId = String(req.user._id || req.user.id);
    if (getMongoStatus()) {
      const sent = await RoommateRequest.find({ requesterId: userId }).sort({ createdAt: -1 });
      const received = await RoommateRequest.find({ recipientId: userId }).sort({ createdAt: -1 });
      return res.json({ success: true, sent, received });
    }
    res.json({ success: true, sent: [], received: [] });
  } catch (err) {
    console.error('Get my requests error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch requests' });
  }
};

module.exports = {
  getRoommatePosts,
  createRoommatePost,
  updateRoommatePost,
  deleteRoommatePost,
  sendRoommateRequest,
  getMyRequests
};
