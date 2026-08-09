const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { memoryStore, JWT_SECRET } = require('../utils/memoryStore');
const { getMongoStatus } = require('../config/db');
const User = require('../models/User');

// @desc    Register a new user (Student / Owner)
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, university, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const selectedRole = role || 'student';

    // MongoDB Mode
    if (getMongoStatus()) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(400).json({ success: false, message: 'User with this email already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: selectedRole,
        isVerified: selectedRole === 'student',
        university: university || '',
        phone: phone || ''
      });

      const token = jwt.sign({ id: user._id, role: user.role, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

      return res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          university: user.university,
          savedPGs: user.savedPGs || []
        }
      });
    }

    // In-Memory Mode
    const existingMem = memoryStore.findUserByEmail(email);
    if (existingMem) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const newUser = memoryStore.createUser({ name, email, password, role: selectedRole, university, phone });
    const token = memoryStore.generateToken(newUser);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isVerified: newUser.isVerified,
        university: newUser.university,
        savedPGs: newUser.savedPGs || []
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server registration error' });
  }
};

// @desc    Authenticate User & Get Token
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // MongoDB Mode
    if (getMongoStatus()) {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (user && (await bcrypt.compare(password, user.passwordHash))) {
        const token = jwt.sign({ id: user._id, role: user.role, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        return res.json({
          success: true,
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            university: user.university,
            savedPGs: user.savedPGs || []
          }
        });
      }
    }

    // In-Memory Mode
    const memUser = memoryStore.findUserByEmail(email);
    if (memUser && bcrypt.compareSync(password, memUser.passwordHash)) {
      const token = memoryStore.generateToken(memUser);
      return res.json({
        success: true,
        token,
        user: {
          id: memUser._id,
          name: memUser.name,
          email: memUser.email,
          role: memUser.role,
          isVerified: memUser.isVerified,
          university: memUser.university || '',
          savedPGs: memUser.savedPGs || []
        }
      });
    }

    return res.status(401).json({ success: false, message: 'Invalid credentials. Check email or password.' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server login error' });
  }
};

// @desc    Get Current User Profile
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user._id || req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        isVerified: req.user.isVerified,
        university: req.user.university || '',
        savedPGs: req.user.savedPGs || []
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving user profile' });
  }
};

// @desc    Toggle Save PG Favorite
// @route   POST /api/auth/save-pg/:pgId
const toggleSavePG = async (req, res) => {
  try {
    const { pgId } = req.params;
    const userId = req.user._id || req.user.id;

    if (getMongoStatus()) {
      const user = await User.findById(userId);
      if (user) {
        if (!user.savedPGs) user.savedPGs = [];
        if (user.savedPGs.includes(pgId)) {
          user.savedPGs = user.savedPGs.filter(id => id !== pgId);
        } else {
          user.savedPGs.push(pgId);
        }
        await user.save();
        return res.json({ success: true, savedPGs: user.savedPGs });
      }
    }

    const saved = memoryStore.toggleSavePG(userId, pgId);
    return res.json({ success: true, savedPGs: saved });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error saving PG' });
  }
};

module.exports = { registerUser, loginUser, getMe, toggleSavePG };
