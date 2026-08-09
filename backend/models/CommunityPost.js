const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema({
  collegeId: { type: String, required: true },
  collegeShortName: { type: String, required: true },
  authorName: { type: String, required: true },
  authorAvatar: { type: String, default: '🎓' },
  authorBadge: { type: String, default: 'Verified Student' },
  authorId: { type: String },
  category: {
    type: String,
    enum: ['feed', 'forum', 'roommate', 'marketplace', 'lost_found', 'event', 'emergency'],
    default: 'feed'
  },
  subCategory: { type: String, default: 'General' }, // for Forum: Academics, Exams, PG Advice, Careers
  title: { type: String, required: true },
  content: { type: String, required: true },
  imageUrl: { type: String, default: null },
  tags: [{ type: String }],
  likesCount: { type: Number, default: 0 },
  likedBy: [{ type: String }], // Array of User IDs
  comments: [
    {
      commentId: { type: String },
      authorName: { type: String },
      authorAvatar: { type: String, default: '👤' },
      text: { type: String },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  // Category-specific Metadata
  marketplace: {
    price: { type: Number },
    condition: { type: String }, // Like New, Good, Fair
    contactWhatsApp: { type: String }
  },
  lostFound: {
    status: { type: String, enum: ['LOST', 'FOUND'] },
    location: { type: String },
    contactPhone: { type: String }
  },
  eventDetails: {
    eventDate: { type: String },
    venue: { type: String },
    organizer: { type: String },
    rsvpCount: { type: Number, default: 0 }
  },
  emergencyDetails: {
    isUrgent: { type: Boolean, default: false },
    contactPhone: { type: String },
    safetyType: { type: String } // Medical, Security, Transport, Theft
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CommunityPost', communityPostSchema);
