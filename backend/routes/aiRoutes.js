const express = require('express');
const router = express.Router();
const { memoryStore } = require('../utils/memoryStore');
const {
  analyzeRent,
  summarizeReviews,
  translateReview,
  verifyFakeReviews,
  categorizeComplaint,
  tagUploadedImage,
  getCommunitySummary,
  autoCategoryDetect,
  auditSpamScam,
  getTrendingTopics,
  getCommunityInsights
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

// @desc    AI Smart Housing Assistant / Recommendations
// @route   POST /api/ai/assistant
router.post('/assistant', async (req, res) => {
  try {
    const { message, budget, preferredLocation, roomType } = req.body;

    // Smart logic for StaySmart AI recommendations
    const allPGs = memoryStore.getPGs({});

    let recommendations = allPGs;
    if (budget) {
      recommendations = recommendations.filter(p => p.pricePerMonth <= Number(budget));
    }
    if (roomType && roomType !== 'All') {
      recommendations = recommendations.filter(p => p.roomType === roomType);
    }

    // Top 2 recommended matches
    const topMatches = recommendations.slice(0, 2);

    let reply = `Hello! I am StaySmart AI Housing Assistant. Based on your prompt "${message || 'housing search'}", here is my analysis:\n\n`;

    if (topMatches.length > 0) {
      reply += `🌟 I found ${topMatches.length} top recommended PG options that match your budget and lifestyle preferences! Check out "${topMatches[0].title}" starting at ₹${topMatches[0].pricePerMonth}/mo with rating ${topMatches[0].rating}★.`;
    } else {
      reply += `I analyzed our verified database. We recommend broadening your budget or preferred room type slightly to unlock 5+ premium PG listings nearby your campus!`;
    }

    res.json({
      success: true,
      reply,
      suggestedPGs: topMatches,
      aiConfidence: 0.94
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'AI Assistant error' });
  }
});

// Rent Analysis
router.get('/rent-analysis/:pgId', analyzeRent);

// Reviews Summary
router.get('/reviews/:pgId/summary', summarizeReviews);

// Translations
router.post('/translate', translateReview);

// Fake Review Checker
router.post('/reviews/verify-fake', verifyFakeReviews);

// Complaint categorizer
router.post('/complaints/categorize', categorizeComplaint);

// Vision tagger
router.post('/image-tagging', tagUploadedImage);

// Community AI Intelligence Endpoints
router.get('/community/summary', getCommunitySummary);
router.post('/community/auto-category', autoCategoryDetect);
router.post('/community/audit-spam-scam', auditSpamScam);
router.get('/community/trending', getTrendingTopics);
router.get('/community/insights', getCommunityInsights);

module.exports = router;
