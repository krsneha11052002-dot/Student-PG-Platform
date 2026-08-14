const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getListings, createListing, updateListing, deleteListing, contactSeller } = require('../controllers/marketplaceController');

router.get('/', getListings);
router.post('/', protect, createListing);
router.put('/:id', protect, updateListing);
router.delete('/:id', protect, deleteListing);
router.post('/:id/contact', protect, contactSeller);

module.exports = router;
