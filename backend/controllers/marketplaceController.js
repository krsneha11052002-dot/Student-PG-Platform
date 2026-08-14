const { getMongoStatus } = require('../config/db');
const MarketplaceListing = require('../models/MarketplaceListing');
const MarketplaceContact = require('../models/MarketplaceContact');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get all marketplace listings
// @route   GET /api/marketplace
const getListings = async (req, res) => {
  try {
    if (getMongoStatus()) {
      const listings = await MarketplaceListing.find().sort({ createdAt: -1 });
      return res.json({ success: true, data: listings });
    }
    res.json({ success: true, data: [] });
  } catch (err) {
    console.error('Get listings error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch listings' });
  }
};

// @desc    Create marketplace listing
// @route   POST /api/marketplace
const createListing = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { title, price, category, condition, description, location, tags } = req.body;

    if (!title || !price) {
      return res.status(400).json({ success: false, message: 'Title and price are required' });
    }

    if (getMongoStatus()) {
      // Get seller phone from User model for WhatsApp integration
      let sellerPhone = req.user.phone || '';
      if (!sellerPhone) {
        try {
          const sellerUser = await User.findById(userId);
          if (sellerUser && sellerUser.phone) sellerPhone = sellerUser.phone;
        } catch (e) {}
      }

      const listing = await MarketplaceListing.create({
        sellerId: userId,
        sellerName: req.user.name,
        sellerPhone,
        title,
        price: Number(price),
        category: category || 'other',
        condition: condition || 'Good',
        description: description || '',
        location: location || '',
        tags: tags || []
      });
      return res.status(201).json({ success: true, data: listing });
    }
    res.status(503).json({ success: false, message: 'Database not connected. Please try again later.' });
  } catch (err) {
    console.error('Create listing error:', err);
    res.status(500).json({ success: false, message: 'Failed to create listing' });
  }
};

// @desc    Update listing (owner only)
// @route   PUT /api/marketplace/:id
const updateListing = async (req, res) => {
  try {
    const userId = String(req.user._id || req.user.id);
    if (getMongoStatus()) {
      const listing = await MarketplaceListing.findById(req.params.id);
      if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
      if (String(listing.sellerId) !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to edit this listing' });
      }
      const allowed = ['title', 'price', 'category', 'condition', 'description', 'location', 'tags', 'isSold'];
      allowed.forEach(key => {
        if (req.body[key] !== undefined) listing[key] = req.body[key];
      });
      await listing.save();
      return res.json({ success: true, data: listing });
    }
    res.status(503).json({ success: false, message: 'Database not connected.' });
  } catch (err) {
    console.error('Update listing error:', err);
    res.status(500).json({ success: false, message: 'Failed to update listing' });
  }
};

// @desc    Delete listing (owner only)
// @route   DELETE /api/marketplace/:id
const deleteListing = async (req, res) => {
  try {
    const userId = String(req.user._id || req.user.id);
    if (getMongoStatus()) {
      const listing = await MarketplaceListing.findById(req.params.id);
      if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
      if (String(listing.sellerId) !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this listing' });
      }
      await MarketplaceListing.findByIdAndDelete(req.params.id);
      await MarketplaceContact.deleteMany({ listingId: req.params.id });
      return res.json({ success: true, message: 'Listing deleted successfully' });
    }
    res.status(503).json({ success: false, message: 'Database not connected.' });
  } catch (err) {
    console.error('Delete listing error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete listing' });
  }
};

// @desc    Contact seller (saves request + creates notification + returns phone for WhatsApp)
// @route   POST /api/marketplace/:id/contact
const contactSeller = async (req, res) => {
  try {
    const buyerId = String(req.user._id || req.user.id);
    const listingId = req.params.id;

    if (getMongoStatus()) {
      const listing = await MarketplaceListing.findById(listingId);
      if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });

      // Prevent self-contact
      if (String(listing.sellerId) === buyerId) {
        return res.status(400).json({ success: false, message: 'You cannot contact yourself' });
      }

      // Prevent duplicate pending contact
      const existing = await MarketplaceContact.findOne({ buyerId, listingId, status: 'pending' });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'You already have a pending contact request for this listing',
          sellerPhone: listing.sellerPhone || null
        });
      }

      const contact = await MarketplaceContact.create({
        buyerId,
        buyerName: req.user.name,
        sellerId: listing.sellerId,
        listingId,
        listingTitle: listing.title,
        message: req.body.message || `Hi, I'm interested in your listing: ${listing.title}`,
        status: 'pending'
      });

      // Create notification for seller
      await Notification.create({
        recipientId: listing.sellerId,
        senderId: buyerId,
        senderName: req.user.name,
        title: '🛒 Someone is Interested!',
        message: `${req.user.name} is interested in your listing: "${listing.title}"`,
        type: 'marketplace_interest',
        relatedId: String(listingId),
        requestId: String(contact._id),
        actionStatus: 'pending'
      });

      // Get seller phone for WhatsApp
      let sellerPhone = listing.sellerPhone || '';
      if (!sellerPhone) {
        try {
          const seller = await User.findById(listing.sellerId);
          if (seller && seller.phone) sellerPhone = seller.phone;
        } catch (e) {}
      }

      return res.status(201).json({ success: true, data: contact, sellerPhone: sellerPhone || null });
    }
    res.status(503).json({ success: false, message: 'Database not connected.' });
  } catch (err) {
    console.error('Contact seller error:', err);
    res.status(500).json({ success: false, message: 'Failed to contact seller' });
  }
};

module.exports = { getListings, createListing, updateListing, deleteListing, contactSeller };
