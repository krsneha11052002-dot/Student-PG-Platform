const express = require('express');
const router = express.Router();
const {
  getOverviewAnalytics,
  getComplaintAnalytics,
  getMarketplaceAnalytics,
  getReviewAnalytics,
  getCommunityAnalytics
} = require('../controllers/analyticsController');

router.get('/overview', getOverviewAnalytics);
router.get('/complaints', getComplaintAnalytics);
router.get('/marketplace', getMarketplaceAnalytics);
router.get('/reviews', getReviewAnalytics);
router.get('/community', getCommunityAnalytics);

module.exports = router;
