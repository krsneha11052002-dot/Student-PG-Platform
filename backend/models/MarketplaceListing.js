const mongoose = require('mongoose');

const MarketplaceListingSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerName: { type: String, required: true },
  sellerPhone: { type: String, default: '' },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, default: 'other' },
  condition: { type: String, default: 'Good' },
  description: { type: String, default: '' },
  location: { type: String, default: '' },
  tags: [{ type: String }],
  isSold: { type: Boolean, default: false },
  sellerRating: { type: Number, default: 5.0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MarketplaceListing', MarketplaceListingSchema);
