const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Login or Register user via Google
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = async (req, res) => {
  const { token } = req.body;

  try {
    console.log("Verifying token with client ID:", process.env.GOOGLE_CLIENT_ID);
    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    console.log("Token verified successfully");

    const { name, email, picture, sub: googleId } = ticket.getPayload();

    // Check if the email domain is allowed (e.g., iitism.ac.in)
    const emailDomain = email.split('@')[1];
    const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN;

    // Comment out or remove this check during testing
    // if (emailDomain !== allowedDomain) {
    //   return res.status(401).json({
    //     success: false,
    //     error: `Authentication failed. Only ${allowedDomain} email addresses are allowed.`
    //   });
    // }

    // Check if user already exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if doesn't exist
      user = await User.create({
        name,
        email,
        googleId,
        avatar: picture
      });
    } else {
      // Update user's Google ID and avatar if needed
      user.googleId = googleId;
      user.avatar = picture;
      user.lastLogin = Date.now();
      await user.save();
    }

    // Generate JWT token
    const jwtToken = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token: jwtToken,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        credits: user.credits,
        uploadCount: user.uploadCount,
        downloadCount: user.downloadCount
      }
    });
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({
      success: false,
      error: 'Authentication failed. Invalid token.'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        credits: user.credits,
        uploadCount: user.uploadCount,
        downloadCount: user.downloadCount,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
}; 