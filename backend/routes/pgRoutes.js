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
  markHelpfulReview
} = require('../controllers/pgController');
const { protect, authorize } = require('../middleware/auth');

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

module.exports = router;
