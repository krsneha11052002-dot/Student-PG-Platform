const { getMongoStatus } = require('../config/db');
const Notification = require('../models/Notification');
const RoommateRequest = require('../models/RoommateRequest');

// @desc    Get all notifications for logged-in user
// @route   GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    if (getMongoStatus()) {
      const notifications = await Notification.find({ recipientId: userId })
        .sort({ createdAt: -1 })
        .limit(50);
      return res.json({ success: true, data: notifications });
    }
    res.json({ success: true, data: [] });
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
const markRead = async (req, res) => {
  try {
    const userId = String(req.user._id || req.user.id);
    if (getMongoStatus()) {
      const notification = await Notification.findById(req.params.id);
      if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
      if (String(notification.recipientId) !== userId) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
      notification.read = true;
      await notification.save();
      return res.json({ success: true, data: notification });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Mark read error:', err);
    res.status(500).json({ success: false, message: 'Failed to mark notification as read' });
  }
};

// @desc    Mark ALL notifications read for user
// @route   PUT /api/notifications/read-all
const markAllRead = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    if (getMongoStatus()) {
      await Notification.updateMany({ recipientId: userId, read: false }, { read: true });
      return res.json({ success: true });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Mark all read error:', err);
    res.status(500).json({ success: false, message: 'Failed to mark all read' });
  }
};

// @desc    Respond to roommate request (accept/reject)
// @route   POST /api/notifications/respond-roommate
const respondToRoommateRequest = async (req, res) => {
  try {
    const userId = String(req.user._id || req.user.id);
    const { requestId, notificationId, action } = req.body;

    if (!requestId || !action || !['accepted', 'rejected'].includes(action)) {
      return res.status(400).json({ success: false, message: 'requestId and action (accepted/rejected) are required' });
    }

    if (getMongoStatus()) {
      const request = await RoommateRequest.findById(requestId);
      if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

      if (String(request.recipientId) !== userId) {
        return res.status(403).json({ success: false, message: 'Not authorized to respond to this request' });
      }

      if (request.status !== 'pending') {
        return res.status(400).json({ success: false, message: `Request already ${request.status}` });
      }

      // Update request status
      request.status = action;
      request.updatedAt = new Date();
      await request.save();

      // Update the triggering notification's actionStatus
      if (notificationId) {
        await Notification.findByIdAndUpdate(notificationId, { actionStatus: action, read: true });
      }

      // Create response notification for the requester
      const accepted = action === 'accepted';
      await Notification.create({
        recipientId: request.requesterId,
        senderId: userId,
        senderName: req.user.name,
        title: accepted ? '✅ Roommate Request Accepted!' : '❌ Roommate Request Declined',
        message: accepted
          ? `${req.user.name} accepted your roommate connection request! 🎉`
          : `${req.user.name} declined your roommate request.`,
        type: 'roommate_response',
        relatedId: String(request.postId),
        requestId: String(request._id),
        actionStatus: 'none'
      });

      return res.json({ success: true, data: request });
    }
    res.status(503).json({ success: false, message: 'Database not connected.' });
  } catch (err) {
    console.error('Respond to roommate request error:', err);
    res.status(500).json({ success: false, message: 'Failed to respond to request' });
  }
};

module.exports = { getNotifications, markRead, markAllRead, respondToRoommateRequest };
