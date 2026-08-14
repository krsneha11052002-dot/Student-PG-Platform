const mongoose = require('mongoose');

const MarketplaceContactSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  buyerName: { type: String, required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'MarketplaceListing', required: true },
  listingTitle: { type: String, default: '' },
  message: { type: String, default: "Hi, I'm interested in your listing." },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MarketplaceContact', MarketplaceContactSchema);
