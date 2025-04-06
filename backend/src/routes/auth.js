const express = require('express');
const { googleAuth, getMe } = require('../controllers/auth');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Routes
router.post('/google', googleAuth);
router.get('/me', protect, getMe);

module.exports = router; 