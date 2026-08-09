const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  pgId: { type: String, required: true },
  userName: { type: String, required: true },
  userRole: { type: String, default: 'Verified Student' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, default: '' },
  comment: { type: String, required: true },
  helpful: [{ type: String }],
  categories: {
    cleanliness: { type: Number, default: 5 },
    food: { type: Number, default: 5 },
    safety: { type: Number, default: 5 },
    wifi: { type: Number, default: 5 },
    value: { type: Number, default: 5 }
  },
  verified: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', ReviewSchema);
