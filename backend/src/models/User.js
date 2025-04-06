const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  avatar: {
    type: String
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  credits: {
    type: Number,
    default: 10 // Starting credits for new users
  },
  uploadCount: {
    type: Number,
    default: 0
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Method to increment credits on upload
UserSchema.methods.addCreditsForUpload = function(creditsToAdd = 5) {
  this.credits += creditsToAdd;
  this.uploadCount += 1;
  return this.save();
};

// Method to decrement credits on download
UserSchema.methods.useCreditsForDownload = function(creditsToUse = 2) {
  if (this.credits < creditsToUse) {
    throw new Error('Insufficient credits');
  }
  this.credits -= creditsToUse;
  this.downloadCount += 1;
  return this.save();
};

module.exports = mongoose.model('User', UserSchema); 