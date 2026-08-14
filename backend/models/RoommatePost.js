const mongoose = require('mongoose');

const RoommatePostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  gender: { type: String, default: 'Not specified' },
  year: { type: String, default: '' },
  department: { type: String, default: 'Student' },
  college: { type: String, default: '' },
  area: { type: String, default: '' },
  avatar: { type: String, default: '🎓' },
  lifestyle: [{ type: String }],
  lookingFor: { type: String, default: '2-Sharing Room' },
  budget: { type: String, default: '' },
  bio: { type: String, default: '' },
  verified: { type: Boolean, default: true },
  matchScore: { type: Number, default: 85 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RoommatePost', RoommatePostSchema);
