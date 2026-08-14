const express = require('express');
const router = express.Router();
const { 
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
} = require('../controllers/pgController');
const { protect, authorize } = require('../middleware/auth');

// Get all reviews across all PGs
router.get('/all-reviews', getAllReviews);

// Compare route (needs to be defined before parameterized /:id routes)
router.get('/compare', comparePGs);

// Wishlist routes
router.get('/wishlist', protect, getWishlist);
router.post('/wishlist/:id', protect, toggleWishlist);

// Complaints routes
router.get('/complaints', protect, authorize('admin'), getComplaints);
router.post('/:id/complaints', protect, fileComplaint);

// Public Guest routes
router.get('/', getPGs);
router.get('/:id', getPGById);

// Owner / Admin protected route
router.post('/', protect, authorize('owner', 'admin'), createPG);

// Verified Student review route
router.post('/:id/reviews', protect, authorize('student', 'admin'), addReview);

// Mark review helpful
router.post('/:id/reviews/:reviewId/helpful', protect, markHelpfulReview);

// Edit review (reviewer only / admin)
router.put('/reviews/:reviewId', protect, async (req, res) => {
  try {
    const { getMongoStatus } = require('../config/db');
    const Review = require('../models/Review');
    const userId = String(req.user._id || req.user.id);
    if (getMongoStatus()) {
      const review = await Review.findById(req.params.reviewId);
      if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
      if (review.userId && review.userId !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to edit this review' });
      }
      const { rating, title, comment, categories } = req.body;
      if (rating) review.rating = Number(rating);
      if (title !== undefined) review.title = title;
      if (comment) review.comment = comment;
      if (categories) review.categories = categories;
      await review.save();
      return res.json({ success: true, data: review });
    }
    res.status(503).json({ success: false, message: 'Database not connected.' });
  } catch (err) {
    console.error('Edit review error:', err);
    res.status(500).json({ success: false, message: 'Failed to edit review' });
  }
});

// Delete review (reviewer only / admin)
router.delete('/reviews/:reviewId', protect, async (req, res) => {
  try {
    const { getMongoStatus } = require('../config/db');
    const Review = require('../models/Review');
    const userId = String(req.user._id || req.user.id);
    if (getMongoStatus()) {
      const review = await Review.findById(req.params.reviewId);
      if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
      if (review.userId && review.userId !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
      }
      await Review.findByIdAndDelete(req.params.reviewId);
      return res.json({ success: true, message: 'Review deleted' });
    }
    res.status(503).json({ success: false, message: 'Database not connected.' });
  } catch (err) {
    console.error('Delete review error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete review' });
  }
});

module.exports = router;
