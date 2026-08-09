const mongoose = require('mongoose');

const PGSchema = new mongoose.Schema({
  title: { type: String, required: true },
  ownerId: { type: String, required: true },
  ownerName: { type: String, default: 'PG Owner' },
  ownerPhone: { type: String, default: '' },
  location: { type: String, required: true },
  city: { type: String, default: 'Metro Hub' },
  pricePerMonth: { type: Number, required: true },
  deposit: { type: Number, required: true },
  roomType: { type: String, enum: ['Single', 'Sharing', 'Studio'], default: 'Sharing' },
  gender: { type: String, enum: ['Boys Only', 'Girls Only', 'Co-Ed'], default: 'Co-Ed' },
  sharingCapacity: { type: String, default: '2 Sharing' },
  occupancyStatus: { type: String, default: 'Beds Available' },
  images: [{ type: String }],
  videos: [{ type: String }],
  mapCoordinates: {
    lat: { type: Number, default: 28.6139 },
    lng: { type: Number, default: 77.2090 }
  },
  nearbyPlaces: [{
    name: { type: String },
    distance: { type: String },
    type: { type: String } // e.g. Metro, Bus, Market, Food
  }],
  rules: [{ type: String }],
  floorPlan: { type: String, default: '' },
  wishlistedBy: [{ type: String }],
  amenities: [{ type: String }],
  description: { type: String, required: true },
  rating: { type: Number, default: 5.0 },
  reviewsCount: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PG', PGSchema);
