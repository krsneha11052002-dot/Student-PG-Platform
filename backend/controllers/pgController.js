const { memoryStore } = require('../utils/memoryStore');
const { getMongoStatus } = require('../config/db');
const PG = require('../models/PG');
const Review = require('../models/Review');
const Complaint = require('../models/Complaint');
const User = require('../models/User');

const enrichPGWithAI = (pg) => {
  const pgObj = pg.toObject ? pg.toObject() : { ...pg };
  
  // Calculate AI Safety Score (out of 100)
  let safety = 70; // baseline
  const amenities = pgObj.amenities || [];
  if (amenities.includes('24/7 Security CCTV') || amenities.includes('CCTV')) safety += 10;
  if (amenities.includes('Biometric Entry') || amenities.includes('Biometric Safety Gate')) safety += 15;
  if (amenities.includes('Girls Only')) safety += 5;
  pgObj.aiSafetyScore = Math.min(safety, 100);

  // Calculate AI PG Score Grade
  let score = 75; // baseline
  score += amenities.length * 2;
  if (pgObj.rating >= 4.7) score += 10;
  if (pgObj.pricePerMonth < 10000) score += 5;
  
  let grade = 'B';
  if (score >= 90) grade = 'A+';
  else if (score >= 80) grade = 'A';
  else if (score >= 70) grade = 'B+';
  pgObj.aiPgScore = grade;

  // Calculate Scam Probability
  let scamProb = 8; // baseline
  if (pgObj.isVerified) scamProb = 1;
  else if (pgObj.ownerPhone && pgObj.ownerPhone.startsWith('+91 98765 00000')) scamProb = 15; // default mock flag
  pgObj.aiScamScore = scamProb;

  return pgObj;
};

// @desc    Get all PGs with Filters & Search
// @route   GET /api/pgs
const getPGs = async (req, res) => {
  try {
    const { search, gender, roomType, minPrice, maxPrice, amenities, sort } = req.query;

    const parsedAmenities = amenities ? (Array.isArray(amenities) ? amenities : amenities.split(',')) : [];

    if (getMongoStatus()) {
      let query = { status: 'approved' };

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } },
          { city: { $regex: search, $options: 'i' } }
        ];
      }

      if (gender && gender !== 'All') {
        query.gender = { $in: [gender, 'Co-Ed'] };
      }

      if (roomType && roomType !== 'All') {
        query.roomType = roomType;
      }

      if (minPrice || maxPrice) {
        query.pricePerMonth = {};
        if (minPrice) query.pricePerMonth.$gte = Number(minPrice);
        if (maxPrice) query.pricePerMonth.$lte = Number(maxPrice);
      }

      if (parsedAmenities.length > 0) {
        query.amenities = { $all: parsedAmenities };
      }

      let sortOption = { createdAt: -1 };
      if (sort === 'price_low') sortOption = { pricePerMonth: 1 };
      if (sort === 'price_high') sortOption = { pricePerMonth: -1 };
      if (sort === 'rating') sortOption = { rating: -1 };

      const pgs = await PG.find(query).sort(sortOption);
      const enriched = pgs.map(enrichPGWithAI);
      return res.json({ success: true, count: enriched.length, data: enriched });
    }

    // In-Memory Mode
    const pgs = memoryStore.getPGs({
      search,
      gender,
      roomType,
      minPrice,
      maxPrice,
      amenities: parsedAmenities,
      sort
    });

    const enriched = pgs.map(enrichPGWithAI);
    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (err) {
    console.error('Get PGs error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch PGs' });
  }
};

// @desc    Get single PG by ID with reviews
// @route   GET /api/pgs/:id
const getPGById = async (req, res) => {
  try {
    const { id } = req.params;

    if (getMongoStatus()) {
      const pg = await PG.findById(id);
      if (!pg) {
        return res.status(404).json({ success: false, message: 'PG listing not found' });
      }
      const enriched = enrichPGWithAI(pg);
      const reviews = await Review.find({ pgId: id }).sort({ createdAt: -1 });
      return res.json({ success: true, data: enriched, reviews });
    }

    const pg = memoryStore.getPGById(id);
    if (!pg) {
      return res.status(404).json({ success: false, message: 'PG listing not found' });
    }
    const enriched = enrichPGWithAI(pg);
    const reviews = memoryStore.getReviewsByPGId(id);

    res.json({ success: true, data: enriched, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving PG details' });
  }
};

// @desc    Create new PG listing (Owner / Admin)
// @route   POST /api/pgs
const createPG = async (req, res) => {
  try {
    const owner = req.user;

    if (getMongoStatus()) {
      const newPG = await PG.create({
        ...req.body,
        ownerId: owner._id,
        ownerName: owner.name,
        ownerPhone: owner.phone || req.body.ownerPhone || '+91 98765 43210',
        status: 'approved'
      });
      return res.status(201).json({ success: true, data: newPG });
    }

    const newPG = memoryStore.createPG(req.body, owner);
    res.status(201).json({ success: true, data: newPG });
  } catch (err) {
    console.error('Create PG Error:', err);
    res.status(500).json({ success: false, message: 'Error creating PG listing' });
  }
};

// @desc    Add review to PG (Verified Students)
// @route   POST /api/pgs/:id/reviews
const addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, title, comment, categories } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: 'Please provide rating and comment' });
    }

    const userRole = req.user.role === 'student' ? 'Verified Student' : 'Verified User';
    const isVerified = req.user.role === 'student';

    if (getMongoStatus()) {
      const review = await Review.create({
        pgId: id,
        userId: String(req.user._id || req.user.id),
        userName: req.user.name,
        userRole,
        rating: Number(rating),
        title: title || '',
        comment,
        categories: categories || { cleanliness: 5, food: 5, safety: 5, wifi: 5, value: 5 },
        verified: isVerified
      });

      // Update PG average rating
      const allReviews = await Review.find({ pgId: id });
      const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await PG.findByIdAndUpdate(id, {
        rating: Number(avg.toFixed(1)),
        reviewsCount: allReviews.length
      });

      return res.status(201).json({ success: true, data: review });
    }

    const review = memoryStore.addReview(id, {
      userName: req.user.name,
      userRole,
      rating,
      title,
      comment,
      categories,
      verified: isVerified
    });

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error adding review' });
  }
};

// @desc    Toggle wishlist (save / unsave PG)
// @route   POST /api/pgs/wishlist/:id
const toggleWishlist = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user._id;

    if (getMongoStatus()) {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      
      let saved = user.savedPGs || [];
      if (saved.includes(id)) {
        saved = saved.filter(savedId => savedId !== id);
        await PG.findByIdAndUpdate(id, { $pull: { wishlistedBy: userId } });
      } else {
        saved.push(id);
        await PG.findByIdAndUpdate(id, { $addToSet: { wishlistedBy: userId } });
      }
      user.savedPGs = saved;
      await user.save();
      return res.json({ success: true, savedPGs: saved });
    }

    const saved = memoryStore.toggleSavePG(userId, id);
    res.json({ success: true, savedPGs: saved });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error saving/unsaving PG' });
  }
};

// @desc    Get user wishlist
// @route   GET /api/pgs/wishlist
const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    if (getMongoStatus()) {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      const pgs = await PG.find({ _id: { $in: user.savedPGs } });
      return res.json({ success: true, data: pgs });
    }

    const pgs = memoryStore.getWishlist(userId);
    res.json({ success: true, data: pgs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching wishlist' });
  }
};

// @desc    Compare PGs
// @route   GET /api/pgs/compare?ids=id1,id2,id3
const comparePGs = async (req, res) => {
  try {
    const { ids } = req.query;
    if (!ids) {
      return res.status(400).json({ success: false, message: 'Please provide ids to compare' });
    }
    const idList = ids.split(',');

    if (getMongoStatus()) {
      const pgs = await PG.find({ _id: { $in: idList } });
      return res.json({ success: true, data: pgs });
    }

    const pgs = memoryStore.pgs.filter(p => idList.includes(p._id));
    res.json({ success: true, data: pgs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error comparing PGs' });
  }
};

// @desc    File a complaint about a PG
// @route   POST /api/pgs/:id/complaints
const fileComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, description } = req.body;
    const userId = req.user.id || req.user._id;

    if (!description) {
      return res.status(400).json({ success: false, message: 'Please provide a description of the issue' });
    }

    let pgTitle = 'PG Accommodation';
    if (getMongoStatus()) {
      const pg = await PG.findById(id);
      if (pg) pgTitle = pg.title;

      const complaint = await Complaint.create({
        pgId: id,
        pgTitle,
        userId,
        userName: req.user.name,
        type: type || 'Other',
        description
      });
      return res.status(201).json({ success: true, data: complaint });
    }

    const pg = memoryStore.getPGById(id);
    if (pg) pgTitle = pg.title;

    const complaint = memoryStore.fileComplaint(id, pgTitle, userId, req.user.name, type, description);
    res.status(201).json({ success: true, data: complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error filing complaint' });
  }
};

// @desc    Get all complaints (Admin) or complaints for specific PG
// @route   GET /api/pgs/complaints
const getComplaints = async (req, res) => {
  try {
    if (getMongoStatus()) {
      const complaints = await Complaint.find().sort({ createdAt: -1 });
      return res.json({ success: true, data: complaints });
    }

    const complaints = memoryStore.getComplaints();
    res.json({ success: true, data: complaints });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving complaints' });
  }
};

// @desc    Get all reviews across all PGs
// @route   GET /api/pgs/all-reviews
const getAllReviews = async (req, res) => {
  try {
    if (getMongoStatus()) {
      const Review = require('../models/Review');
      const PG = require('../models/PG');
      const reviews = await Review.find().sort({ createdAt: -1 });
      
      // Need to attach PG name to reviews
      const pgs = await PG.find({}, '_id name');
      const pgMap = pgs.reduce((acc, pg) => {
        acc[String(pg._id)] = pg.name;
        return acc;
      }, {});

      const reviewsWithPgName = reviews.map(r => ({
        ...r.toObject(),
        pgName: pgMap[r.pgId] || 'Unknown PG',
        id: r._id,
        reviewer: r.userName,
        date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent',
        body: r.comment,
        helpful: r.helpfulCount || 0,
        tags: [],
      }));

      return res.json({ success: true, data: reviewsWithPgName });
    }
    
    // In-Memory
    const reviews = memoryStore.getAllReviews();
    return res.json({ success: true, data: reviews });
  } catch (err) {
    console.error('Get all reviews error:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving reviews' });
  }
};

// @desc    Mark review as helpful
// @route   POST /api/pgs/:id/reviews/:reviewId/helpful
const markHelpfulReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id || req.user._id;

    if (getMongoStatus()) {
      const review = await Review.findById(reviewId);
      if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
      
      const hasMarked = review.helpful.includes(userId);
      if (hasMarked) {
        review.helpful = review.helpful.filter(uid => uid !== userId);
      } else {
        review.helpful.push(userId);
      }
      await review.save();
      return res.json({ success: true, data: review });
    }

    const review = memoryStore.markHelpfulReview(reviewId, userId);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    res.json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error marking review helpful' });
  }
};

module.exports = {
  getPGs,
  getPGById,
  createPG,
  addReview,
  toggleWishlist,
  getWishlist,
  comparePGs,
  fileComplaint,
  getComplaints,
  markHelpfulReview,
  getAllReviews
};

