const { memoryStore } = require('../utils/memoryStore');
const { getMongoStatus } = require('../config/db');
const User = require('../models/User');
const PG = require('../models/PG');
const Review = require('../models/Review');

// @desc    Get Admin System Stats
// @route   GET /api/admin/stats
const getAdminStats = async (req, res) => {
  try {
    if (getMongoStatus()) {
      const totalUsers = await User.countDocuments();
      const totalStudents = await User.countDocuments({ role: 'student' });
      const totalOwners = await User.countDocuments({ role: 'owner' });
      const totalPGs = await PG.countDocuments();
      const verifiedPGs = await PG.countDocuments({ isVerified: true });
      const pendingApprovals = await PG.countDocuments({ status: 'pending' });
      const totalReviews = await Review.countDocuments();

      return res.json({
        success: true,
        stats: {
          totalUsers,
          totalStudents,
          totalOwners,
          totalPGs,
          verifiedPGs,
          pendingApprovals,
          totalReviews
        }
      });
    }

    const stats = memoryStore.getAdminStats();
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch admin stats' });
  }
};

// @desc    Get All Users (Admin)
// @route   GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    if (getMongoStatus()) {
      const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
      return res.json({ success: true, count: users.length, users });
    }

    const users = memoryStore.users.map(u => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      isVerified: u.isVerified,
      university: u.university || '',
      createdAt: u.createdAt
    }));

    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

// @desc    Approve/Reject PG Listing (Admin)
// @route   PUT /api/admin/pgs/:id/status
const updatePGStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (getMongoStatus()) {
      const pg = await PG.findByIdAndUpdate(id, { status }, { new: true });
      return res.json({ success: true, data: pg });
    }

    const pg = memoryStore.updatePGStatus(id, status);
    res.json({ success: true, data: pg });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update PG status' });
  }
};

module.exports = { getAdminStats, getUsers, updatePGStatus };
