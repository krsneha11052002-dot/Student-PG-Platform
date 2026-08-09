const express = require('express');
const router = express.Router();
const { getAdminStats, getUsers, updatePGStatus } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getUsers);
router.put('/pgs/:id/status', updatePGStatus);

module.exports = router;
