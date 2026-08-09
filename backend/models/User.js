const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['student', 'owner', 'admin'], 
    default: 'student' 
  },
  isVerified: { type: Boolean, default: false },
  university: { type: String, default: '' },
  phone: { type: String, default: '' },
  savedPGs: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
