const CommunityPost = require('../models/CommunityPost');
const LocalService = require('../models/LocalService');
const { memoryStore } = require('../utils/memoryStore');

// @desc    Get Community Posts by College & Category
// @route   GET /api/community/posts
const getCommunityPosts = async (req, res) => {
  try {
    const { collegeId, category, search, subCategory } = req.query;

    try {
      const query = {};
      if (collegeId) query.collegeId = collegeId;
      if (category && category !== 'all') query.category = category;
      if (subCategory && subCategory !== 'all') query.subCategory = subCategory;
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }

      const posts = await CommunityPost.find(query).sort({ createdAt: -1 });
      return res.json({ success: true, count: posts.length, posts });
    } catch (dbErr) {
      // Memory Store fallback
      const posts = memoryStore.getCommunityPosts({ collegeId, category, search, subCategory });
      return res.json({ success: true, count: posts.length, posts });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch community posts' });
  }
};

// @desc    Create Community Post
// @route   POST /api/community/posts
const createCommunityPost = async (req, res) => {
  try {
    const {
      collegeId, collegeShortName, authorName, authorBadge, category,
      subCategory, title, content, imageUrl, tags, marketplace,
      lostFound, eventDetails, emergencyDetails
    } = req.body;

    if (!title || !content || !collegeShortName) {
      return res.status(400).json({ success: false, message: 'Title, content and college short name are required' });
    }

    const postData = {
      id: 'cpost_' + Date.now(),
      collegeId: collegeId || collegeShortName.toLowerCase().replace(/\s+/g, '-'),
      collegeShortName,
      authorName: req.user?.name || authorName || 'Anonymous Student',
      authorAvatar: '🎓',
      authorBadge: authorBadge || 'Verified Student',
      authorId: String(req.user._id),
      category: category || 'feed',
      subCategory: subCategory || 'General',
      title,
      content,
      imageUrl: imageUrl || null,
      tags: tags || [collegeShortName],
      likesCount: 0,
      likedBy: [],
      comments: [],
      marketplace: marketplace || null,
      lostFound: lostFound || null,
      eventDetails: eventDetails || null,
      emergencyDetails: emergencyDetails || null,
      createdAt: new Date().toISOString()
    };

    try {
      const newPost = await CommunityPost.create(postData);
      return res.status(201).json({ success: true, post: newPost });
    } catch (e) {
      const memoryPost = memoryStore.addCommunityPost(postData);
      return res.status(201).json({ success: true, post: memoryPost });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create community post' });
  }
};

// @desc    Like / Unlike Community Post
// @route   POST /api/community/posts/:id/like
const toggleLikePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    try {
      const post = await CommunityPost.findById(id);
      if (post) {
        const isLiked = post.likedBy.includes(userId);
        if (isLiked) {
          post.likedBy = post.likedBy.filter(u => u !== userId);
          post.likesCount = Math.max(0, post.likesCount - 1);
        } else {
          post.likedBy.push(userId);
          post.likesCount += 1;
        }
        await post.save();
        return res.json({ success: true, likesCount: post.likesCount, liked: !isLiked });
      }
    } catch (e) {
      // Fallback
    }

    const result = memoryStore.toggleLikePost(id, userId || 'user_anon');
    res.json({ success: true, likesCount: result.likesCount, liked: result.liked });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error toggling post like' });
  }
};

// @desc    Update Community Post
// @route   PUT /api/community/posts/:id
const updateCommunityPost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (String(post.authorId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this post' });
    }

    const { title, content, imageUrl, category, subCategory, tags, eventDetails, marketplace, lostFound, emergencyDetails } = req.body;
    
    post.title = title || post.title;
    post.content = content || post.content;
    post.imageUrl = imageUrl !== undefined ? imageUrl : post.imageUrl;
    post.category = category || post.category;
    post.subCategory = subCategory || post.subCategory;
    post.tags = tags || post.tags;

    if (eventDetails) post.eventDetails = { ...post.eventDetails, ...eventDetails };
    if (marketplace) post.marketplace = { ...post.marketplace, ...marketplace };
    if (lostFound) post.lostFound = { ...post.lostFound, ...lostFound };
    if (emergencyDetails) post.emergencyDetails = { ...post.emergencyDetails, ...emergencyDetails };

    await post.save();
    res.json({ success: true, post });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ success: false, message: 'Failed to update post' });
  }
};

// @desc    Delete Community Post
// @route   DELETE /api/community/posts/:id
const deleteCommunityPost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (String(post.authorId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();
    res.json({ success: true, message: 'Post removed' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete post' });
  }
};

// @desc    Add Comment to Post
// @route   POST /api/community/posts/:id/comment
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { authorName, text } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    const commentObj = {
      commentId: 'cmt_' + Date.now(),
      authorName: authorName || 'Student Member',
      authorAvatar: '👤',
      text,
      createdAt: new Date()
    };

    try {
      const post = await CommunityPost.findById(id);
      if (post) {
        post.comments.push(commentObj);
        await post.save();
        return res.json({ success: true, comments: post.comments });
      }
    } catch (e) {
      // Fallback
    }

    const updatedComments = memoryStore.addCommentToPost(id, commentObj);
    res.json({ success: true, comments: updatedComments });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error adding comment' });
  }
};

// @desc    Get Campus Local Services
// @route   GET /api/community/services
const getLocalServices = async (req, res) => {
  try {
    const { collegeShortName, category } = req.query;

    try {
      const query = {};
      if (collegeShortName) query.collegeShortName = collegeShortName;
      if (category && category !== 'All') query.category = category;

      const services = await LocalService.find(query);
      return res.json({ success: true, services });
    } catch (e) {
      const services = memoryStore.getLocalServices(collegeShortName, category);
      return res.json({ success: true, services });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch local services' });
  }
};

// @desc    Trigger Emergency SOS Broadcast
// @route   POST /api/community/emergency
const triggerEmergencyAlert = async (req, res) => {
  try {
    const { collegeShortName, location, issueType, contactPhone, details } = req.body;

    const alertPost = {
      id: 'sos_' + Date.now(),
      collegeId: (collegeShortName || 'delhi').toLowerCase().replace(/\s+/g, '-'),
      collegeShortName: collegeShortName || 'Campus',
      authorName: '🚨 Emergency SOS Desk',
      authorAvatar: '🆘',
      authorBadge: 'URGENT SAFETY BROADCAST',
      category: 'emergency',
      title: `🚨 EMERGENCY SOS: ${issueType || 'Campus Safety Need'} at ${location || 'Campus Zone'}`,
      content: `Urgent Student SOS Alert reported at ${location || 'Campus'}. Details: ${details || 'Immediate assistance requested.'}. Contact phone: ${contactPhone || '112 / Campus Security'}.`,
      emergencyDetails: {
        isUrgent: true,
        contactPhone: contactPhone || '112',
        safetyType: issueType || 'Security'
      },
      tags: ['SOS', 'Emergency', collegeShortName || 'Campus'],
      likesCount: 0,
      likedBy: [],
      comments: [],
      createdAt: new Date().toISOString()
    };

    memoryStore.addCommunityPost(alertPost);

    res.json({
      success: true,
      message: 'Emergency SOS Broadcasted to Verified Campus Network!',
      alert: alertPost,
      hotlines: [
        { name: 'National Emergency', phone: '112' },
        { name: 'Women Safety Helpline', phone: '1091' },
        { name: 'Campus Security Control Desk', phone: '+91 98765 43210' },
        { name: 'Nearby Ambulance Service', phone: '102' }
      ]
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to trigger emergency SOS' });
  }
};

module.exports = {
  getCommunityPosts,
  createCommunityPost,
  toggleLikePost,
  addComment,
  getLocalServices,
  triggerEmergencyAlert,
  updateCommunityPost,
  deleteCommunityPost
};
