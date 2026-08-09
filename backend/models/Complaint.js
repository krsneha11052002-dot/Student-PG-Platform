const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  pgId: { type: String, required: true },
  pgTitle: { type: String, default: '' },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  type: { type: String, enum: ['Maintenance', 'Safety', 'Cleanliness', 'Food', 'Roommate Issue', 'Other'], default: 'Other' },
  description: { type: String, required: true },
  status: { type: String, enum: ['open', 'investigating', 'resolved'], default: 'open' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Complaint', ComplaintSchema);
