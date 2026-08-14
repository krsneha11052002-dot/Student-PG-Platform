const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  senderName: { type: String, default: '' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['roommate_request', 'roommate_response', 'marketplace_interest', 'system'],
    default: 'system'
  },
  relatedId: { type: String, default: '' },
  requestId: { type: String, default: '' },
  actionStatus: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'none'],
    default: 'none'
  },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema);
