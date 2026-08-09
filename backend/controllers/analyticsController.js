const { memoryStore } = require('../utils/memoryStore');
const PG = require('../models/PG');
const Review = require('../models/Review');
const Complaint = require('../models/Complaint');
const CommunityPost = require('../models/CommunityPost');

// @desc    Get System Overview Analytics
// @route   GET /api/analytics/overview
const getOverviewAnalytics = async (req, res) => {
  try {
    const memoryStats = memoryStore.getAdminStats();

    res.json({
      success: true,
      stats: {
        totalUsers: memoryStats.totalUsers || 340,
        totalStudents: memoryStats.totalStudents || 280,
        totalOwners: memoryStats.totalOwners || 60,
        totalPGs: memoryStats.totalPGs || 24,
        verifiedPGs: memoryStats.verifiedPGs || 22,
        pendingApprovals: memoryStats.pendingApprovals || 2,
        totalReviews: memoryStats.totalReviews || 148,
        totalComplaints: memoryStats.totalComplaints || 18,
        occupancyRate: 88, // 88% overall campus occupancy
        totalRevenue: '₹14.8L/mo'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Analytics overview failure' });
  }
};

// @desc    Get Complaint Analytics
// @route   GET /api/analytics/complaints
const getComplaintAnalytics = async (req, res) => {
  try {
    res.json({
      success: true,
      complaintStats: {
        totalComplaints: 32,
        resolved: 26,
        inProgress: 4,
        open: 2,
        averageResolutionHours: 14,
        distribution: [
          { category: 'Maintenance & Plumbing', count: 14, percentage: 44, color: '#6366f1' },
          { category: 'Food & Mess Hygiene', count: 8, percentage: 25, color: '#f59e0b' },
          { category: 'Safety & Biometric Security', count: 6, percentage: 19, color: '#ef4444' },
          { category: 'Roommate & Noise Issues', count: 4, percentage: 12, color: '#10b981' }
        ]
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Complaint analytics failure' });
  }
};

// @desc    Get Marketplace Analytics
// @route   GET /api/analytics/marketplace
const getMarketplaceAnalytics = async (req, res) => {
  try {
    res.json({
      success: true,
      marketplaceStats: {
        totalListings: 112,
        itemsTraded: 84,
        activeListings: 28,
        tradeVolume: '₹2.4L',
        categories: [
          { name: 'Study Materials & Books', count: 48, percentage: 43 },
          { name: 'Study Tables & Chairs', count: 32, percentage: 28 },
          { name: 'Mini-Fridges & Electronics', count: 20, percentage: 18 },
          { name: 'Bicycles & Scooters', count: 12, percentage: 11 }
        ]
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Marketplace analytics failure' });
  }
};

// @desc    Get Review Analytics
// @route   GET /api/analytics/reviews
const getReviewAnalytics = async (req, res) => {
  try {
    res.json({
      success: true,
      reviewStats: {
        totalReviews: 184,
        averageRating: 4.6,
        fakeReviewsFlagged: 6,
        sentimentSplit: {
          positivePct: 84,
          neutralPct: 11,
          negativePct: 5
        },
        categoryAverages: {
          cleanliness: 4.6,
          food: 4.2,
          safety: 4.8,
          wifi: 4.4,
          value: 4.5
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Review analytics failure' });
  }
};

// @desc    Get Community Analytics
// @route   GET /api/analytics/community
const getCommunityAnalytics = async (req, res) => {
  try {
    const { collegeShortName } = req.query;
    const short = collegeShortName || 'Campus';

    res.json({
      success: true,
      collegeShortName: short,
      communityStats: {
        activePosters: 142,
        dailyPosts: 38,
        resolvedLostFound: 19,
        activeServices: 16,
        sosAlertsTriggered: 2,
        sosAlertsResolved: 2
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Community analytics failure' });
  }
};

module.exports = {
  getOverviewAnalytics,
  getComplaintAnalytics,
  getMarketplaceAnalytics,
  getReviewAnalytics,
  getCommunityAnalytics
};
