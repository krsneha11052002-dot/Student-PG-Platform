const mongoose = require('mongoose');

const localServiceSchema = new mongoose.Schema({
  collegeId: { type: String, required: true },
  collegeShortName: { type: String, required: true },
  title: { type: String, required: true },
  category: {
    type: String,
    enum: ['Tiffin & Food', 'Laundry & Dry Clean', 'Stationery & Printing', 'Bike & Scooty Rental', 'Pharmacy & Medical', 'Library & Study Space'],
    required: true
  },
  rating: { type: Number, default: 4.5 },
  reviewsCount: { type: Number, default: 12 },
  priceRange: { type: String, default: '₹' },
  contactPhone: { type: String, required: true },
  address: { type: String, required: true },
  features: [{ type: String }],
  isStudentDiscountAvailable: { type: Boolean, default: true },
  isVerifiedService: { type: Boolean, default: true },
  icon: { type: String, default: '🛠️' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LocalService', localServiceSchema);
