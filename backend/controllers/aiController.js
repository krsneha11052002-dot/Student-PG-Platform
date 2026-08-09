const { memoryStore } = require('../utils/memoryStore');
const PG = require('../models/PG');
const Review = require('../models/Review');

// Mock average rents per area
const AREA_RENT_BASELINES = {
  'Hauz Khas': 13500,
  'North Campus': 11000,
  'South Campus': 9000,
  'Dhaula Kuan': 9500,
  'Dwarka': 8000,
  'Rohini': 7500,
  'Kashmere Gate': 8500,
  'Greater Noida': 6500,
  'Sector 125, Noida': 7000
};

// Simple Mock Translations Database
const TRANSLATIONS = {
  hi: { // Hindi
    'The food quality is unmatched and fiber internet is super fast during assignment submissions!': 'भोजन की गुणवत्ता बेजोड़ है और असाइनमेंट जमा करने के दौरान फाइबर इंटरनेट सुपर फास्ट है!',
    'Biometric security makes me feel extremely safe. Highly recommended for students near North Campus.': 'बायोमेट्रिक सुरक्षा मुझे बेहद सुरक्षित महसूस कराती है। उत्तर परिसर के पास के छात्रों के लिए अत्यधिक अनुशंसित।',
    'Best PG near campus — clean, safe & great food!': 'कैंपस के पास सबसे अच्छा पीजी — स्वच्छ, सुरक्षित और बढ़िया भोजन!',
    'Good value, minor issues with AC in summer': 'अच्छा मूल्य, गर्मियों में एसी के साथ छोटी समस्याएं',
    'Average experience — management could improve': 'औसत अनुभव — प्रबंधन में सुधार हो सकता है'
  },
  es: { // Spanish
    'The food quality is unmatched and fiber internet is super fast during assignment submissions!': '¡La calidad de la comida es insuperable y el internet de fibra es súper rápido durante la entrega de tareas!',
    'Biometric security makes me feel extremely safe. Highly recommended for students near North Campus.': 'La seguridad biométrica me hace sentir extremadamente segura. Muy recomendado para estudiantes cerca de North Campus.',
    'Best PG near campus — clean, safe & great food!': '¡El mejor PG cerca del campus: limpio, seguro y con excelente comida!',
    'Good value, minor issues with AC in summer': 'Buena relación calidad-precio, problemas menores con el aire acondicionado en verano',
    'Average experience — management could improve': 'Experiencia promedio: el servicio podría mejorar'
  },
  fr: { // French
    'The food quality is unmatched and fiber internet is super fast during assignment submissions!': 'La qualité de la nourriture est inégalée et l\'internet fibre est ultra rapide lors des remises de devoirs !',
    'Biometric security makes me feel extremely safe. Highly recommended for students near North Campus.': 'La sécurité biométrique me permet de me sentir extrêmement en sécurité. Fortement recommandé pour les étudiants près du campus Nord.',
    'Best PG near campus — clean, safe & great food!': 'Meilleur PG près du campus - propre, sûr et excellente nourriture !',
    'Good value, minor issues with AC in summer': 'Bon rapport qualité-prix, problèmes mineurs avec la climatisation en été',
    'Average experience — management could improve': 'Expérience moyenne - la direction pourrait s\'améliorer'
  }
};

// @desc    Analyze Rent comparison with area baseline
// @route   GET /api/ai/rent-analysis/:pgId
const analyzeRent = async (req, res) => {
  try {
    const { pgId } = req.params;
    let pg = null;

    try {
      pg = await PG.findById(pgId);
    } catch (e) {
      pg = memoryStore.getPGById(pgId);
    }

    if (!pg) {
      return res.status(404).json({ success: false, message: 'PG not found' });
    }

    // Extract area base
    const area = pg.location.split(',')[0].trim();
    const baseline = AREA_RENT_BASELINES[area] || 9000;
    const price = pg.pricePerMonth;
    const diffPct = Math.round(((price - baseline) / baseline) * 100);

    let status = 'Fair Rent';
    let analysisText = `The rent of ₹${price.toLocaleString()} is aligned with average prices in ${area}.`;
    
    if (diffPct < -10) {
      status = 'Underpriced / Deal';
      analysisText = `This PG is priced ${Math.abs(diffPct)}% lower than the area average of ₹${baseline.toLocaleString()}. Great value choice!`;
    } else if (diffPct > 15) {
      status = 'Premium Overpriced';
      analysisText = `This PG is priced ${diffPct}% higher than the average for ${area} (₹${baseline.toLocaleString()}). Rent is premium, verify if amenities justify this markup.`;
    }

    res.json({
      success: true,
      baseline,
      price,
      differencePercentage: diffPct,
      status,
      analysis: analysisText
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error in rent analysis' });
  }
};

// @desc    Summarize reviews using mock AI Summarizer
// @route   GET /api/ai/reviews/:pgId/summary
const summarizeReviews = async (req, res) => {
  try {
    const { pgId } = req.params;
    let reviews = [];

    try {
      reviews = await Review.find({ pgId });
    } catch (e) {
      reviews = memoryStore.getReviewsByPGId(pgId);
    }

    if (reviews.length === 0) {
      return res.json({
        success: true,
        summary: 'No student reviews are available yet to analyze.',
        pros: [],
        cons: []
      });
    }

    const ratingsSum = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avg = (ratingsSum / reviews.length).toFixed(1);

    // Dynamic Pros / Cons parsing based on reviews comment tokens
    const pros = new Set(['Verified Accommodation']);
    const cons = new Set();

    reviews.forEach(r => {
      const text = r.comment.toLowerCase();
      if (text.includes('food') || text.includes('meal')) pros.add('Good Food Quality');
      if (text.includes('wifi') || text.includes('internet')) pros.add('Fast Wi-Fi Connection');
      if (text.includes('safe') || text.includes('security')) pros.add('Biometric Curfew Security');
      if (text.includes('clean') || text.includes('hygien')) pros.add('Regular Cleaning Service');
      
      if (text.includes('ac') && (text.includes('broken') || text.includes('summer'))) cons.add('AC maintenance delays');
      if (text.includes('water') && text.includes('cut')) cons.add('Morning water supply interruptions');
      if (text.includes('noisy') || text.includes('noise')) cons.add('Loud neighbourhood street');
      if (text.includes('small') || text.includes('cramped')) cons.add('Small room sizes');
    });

    const summary = `StaySmart AI analyzed ${reviews.length} student reviews. The property holds an average rating of ${avg}/5.0. Students highlight the security and community vibes as major advantages, while some note occasional maintenance response delays.`;

    res.json({
      success: true,
      summary,
      pros: Array.from(pros),
      cons: Array.from(cons)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Reviews summary failure' });
  }
};

// @desc    Translate review comments to specific language
// @route   POST /api/ai/translate
const translateReview = async (req, res) => {
  try {
    const { text, targetLang } = req.body;
    if (!text || !targetLang) {
      return res.status(400).json({ success: false, message: 'Text and targetLang are required' });
    }

    const languageMap = TRANSLATIONS[targetLang] || {};
    const translated = languageMap[text] || `[Mock AI Translated to ${targetLang.toUpperCase()}]: ${text}`;

    res.json({ success: true, original: text, translated, targetLang });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Translation error' });
  }
};

// @desc    AI Fake Review Analyzer
// @route   POST /api/ai/reviews/verify-fake
const verifyFakeReviews = async (req, res) => {
  try {
    const { reviewId, comment } = req.body;
    if (!comment) {
      return res.status(400).json({ success: false, message: 'Comment is required' });
    }

    // Heuristics check
    let fakeScore = 5; // default low baseline
    const upperCasePct = (comment.match(/[A-Z]/g) || []).length / comment.length;
    const hasRepeatedPhrases = /(.)\1{4,}/.test(comment); // e.g. "aaaaa"
    const spamWords = ['best pg ever', 'no faults', '100% perfect', 'visit now link', 'click here'];
    
    let spamMatches = 0;
    spamWords.forEach(word => {
      if (comment.toLowerCase().includes(word)) spamMatches++;
    });

    if (upperCasePct > 0.5) fakeScore += 30;
    if (hasRepeatedPhrases) fakeScore += 25;
    if (spamMatches > 0) fakeScore += spamMatches * 20;

    let isSuspicious = fakeScore > 40;
    let verdict = isSuspicious ? 'Suspicious Review Detected' : 'Verified Student Feedback';

    res.json({
      success: true,
      fakeScore,
      isSuspicious,
      verdict,
      analysis: isSuspicious
        ? 'AI flagged this review due to excessive capitalization, repeated keyphrases, or spam-like marketing language.'
        : 'Review verified as authentic student feedback with natural vocabulary distribution.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Fake review analysis failure' });
  }
};

// @desc    Categorize Complaints using keyword matching
// @route   POST /api/ai/complaints/categorize
const categorizeComplaint = (req, res) => {
  try {
    const { description } = req.body;
    if (!description) {
      return res.status(400).json({ success: false, message: 'Description is required' });
    }

    const desc = description.toLowerCase();
    let category = 'Other';
    let urgency = 'Medium';

    if (desc.includes('water') || desc.includes('plumbing') || desc.includes('pipe') || desc.includes('leak')) {
      category = 'Maintenance';
      urgency = 'High';
    } else if (desc.includes('wifi') || desc.includes('internet') || desc.includes('router') || desc.includes('speed')) {
      category = 'Maintenance';
      urgency = 'Low';
    } else if (desc.includes('ac') || desc.includes('air conditioner') || desc.includes('fan') || desc.includes('cool')) {
      category = 'Maintenance';
      urgency = 'Medium';
    } else if (desc.includes('theft') || desc.includes('robbery') || desc.includes('lock') || desc.includes('biometric') || desc.includes('guard')) {
      category = 'Safety';
      urgency = 'Critical';
    } else if (desc.includes('food') || desc.includes('meal') || desc.includes('dinner') || desc.includes('lunch') || desc.includes('kitchen')) {
      category = 'Food';
      urgency = 'Medium';
    } else if (desc.includes('roommate') || desc.includes('noise') || desc.includes('loud') || desc.includes('smoke')) {
      category = 'Roommate Issue';
      urgency = 'Medium';
    }

    res.json({
      success: true,
      suggestedCategory: category,
      urgency,
      autoRoutingDept: category === 'Safety' ? 'Security & Campus Police Desk' : 'StaySmart Facilities Management Team'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Complaint categorization failed' });
  }
};

// @desc    Tag uploaded images for PG cataloging
// @route   POST /api/ai/image-tagging
const tagUploadedImage = (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ success: false, message: 'imageUrl is required' });
    }

    // Simulate Computer Vision image tagging based on static names
    let tags = ['Student Room', 'Well-lit space', 'Clean walls'];
    if (imageUrl.includes('kitchen') || imageUrl.includes('meals') || imageUrl.includes('photo-1502672')) {
      tags = ['Shared Kitchen', 'Cooking range', 'Utensils cabinet'];
    } else if (imageUrl.includes('bathroom') || imageUrl.includes('bath') || imageUrl.includes('photo-152277')) {
      tags = ['Attached Bathroom', 'Geyser', 'Tiled shower'];
    } else if (imageUrl.includes('lounge') || imageUrl.includes('study')) {
      tags = ['Study Lounge', 'Ergonomic Desk', 'AC library room'];
    }

    res.json({
      success: true,
      detectedObjects: tags,
      qualityRating: 'High Resolution (Passed)',
      contentModerationPassed: true
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Image analysis error' });
  }
};

// ==========================================
// AI COMMUNITY ENHANCEMENT CONTROLLERS
// ==========================================

// @desc    AI Community Discussion Summarizer
// @route   GET /api/ai/community/summary
const getCommunitySummary = (req, res) => {
  try {
    const { collegeShortName } = req.query;
    const short = collegeShortName || 'Campus';

    const summaryText = `StaySmart AI summarized recent discussions for ${short}. Students are actively sharing PG mess food ratings, looking for Semester exam study notes, and warning peers about unauthorized advance deposit requests by unverified brokers near Patel Chest & Hudson Lane.`;

    res.json({
      success: true,
      collegeShortName: short,
      summary: summaryText,
      keyTakeaways: [
        `Mess Food Quality: UrbanNest PG rated #1 near ${short}.`,
        'Exam Preparation: Drive link created for 2nd & 3rd Year notes.',
        'Marketplace Bargains: Study tables and portable mini-fridges available under ₹2,000.',
        'Campus Safety: 100% biometric verified listings recommended.'
      ],
      aiConfidence: 0.96
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Community summary failure' });
  }
};

// @desc    AI Auto Category Detector for Post Drafts
// @route   POST /api/ai/community/auto-category
const autoCategoryDetect = (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title && !content) {
      return res.status(400).json({ success: false, message: 'Title or content required' });
    }

    const text = ((title || '') + ' ' + (content || '')).toLowerCase();
    let suggestedCategory = 'feed';
    let confidence = 0.85;

    if (text.includes('sell') || text.includes('price') || text.includes('table') || text.includes('fridge') || text.includes('cycle') || text.includes('₹') || text.includes('rs')) {
      suggestedCategory = 'marketplace';
      confidence = 0.94;
    } else if (text.includes('lost') || text.includes('found') || text.includes('backpack') || text.includes('card') || text.includes('wallet') || text.includes('reward')) {
      suggestedCategory = 'lost_found';
      confidence = 0.95;
    } else if (text.includes('how to') || text.includes('exam') || text.includes('notes') || text.includes('question') || text.includes('syllabus') || text.includes('advice')) {
      suggestedCategory = 'forum';
      confidence = 0.92;
    } else if (text.includes('fest') || text.includes('event') || text.includes('hackathon') || text.includes('workshop') || text.includes('auditorium')) {
      suggestedCategory = 'event';
      confidence = 0.91;
    } else if (text.includes('sos') || text.includes('urgent') || text.includes('theft') || text.includes('police') || text.includes('medical') || text.includes('help')) {
      suggestedCategory = 'emergency';
      confidence = 0.98;
    }

    res.json({
      success: true,
      suggestedCategory,
      confidence,
      reasoning: `Matched keywords in prompt for category: ${suggestedCategory.toUpperCase()}`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Auto category detection failure' });
  }
};

// @desc    AI Spam & Scam Detector for Community Listings
// @route   POST /api/ai/community/audit-spam-scam
const auditSpamScam = (req, res) => {
  try {
    const { title, content, price } = req.body;
    const text = ((title || '') + ' ' + (content || '')).toLowerCase();

    let spamScore = 5;
    let isScam = false;
    let flags = [];

    if (text.includes('http') || text.includes('bit.ly') || text.includes('telegram')) {
      spamScore += 35;
      flags.push('Contains unverified external link');
    }
    if (text.includes('pay advance') || text.includes('token money without viewing')) {
      spamScore += 40;
      isScam = true;
      flags.push('Advance payment demand before physical inspection');
    }
    if (price && Number(price) < 100 && text.includes('laptop')) {
      spamScore += 30;
      isScam = true;
      flags.push('Unrealistically low price for electronics');
    }

    res.json({
      success: true,
      spamScore,
      isScam,
      status: spamScore > 40 ? 'Suspicious Post Flagged' : 'Passed Safety Audit',
      flags
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Spam audit error' });
  }
};

// @desc    AI Trending Topics & Campus Hashtags
// @route   GET /api/ai/community/trending
const getTrendingTopics = (req, res) => {
  try {
    const { collegeShortName } = req.query;
    const short = collegeShortName || 'Campus';

    res.json({
      success: true,
      collegeShortName: short,
      trendingHashtags: [
        { tag: `#${short}Exams2026`, postsCount: 142, trend: '🔥 Hot' },
        { tag: `#MessFoodRatings`, postsCount: 98, trend: '📈 Rising' },
        { tag: `#KamlaNagarMarket`, postsCount: 76, trend: '🛒 Popular' },
        { tag: `#FestRegistration`, postsCount: 64, trend: '🎉 New' }
      ]
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Trending topics error' });
  }
};

// @desc    AI Community Insights & Sentiment
// @route   GET /api/ai/community/insights
const getCommunityInsights = (req, res) => {
  try {
    const { collegeShortName } = req.query;
    const short = collegeShortName || 'Campus';

    res.json({
      success: true,
      collegeShortName: short,
      overallSentiment: 'Positive (88%)',
      activeStudentsCount: 340,
      verifiedPeerBadgePct: '100%',
      safetyAdvisory: 'Campus zone rated safe. Biometric gate entries active.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Community insights error' });
  }
};

module.exports = {
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
};

