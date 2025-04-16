// Load environment variables
require('dotenv').config();

const config = {
  // Server configuration
  port: process.env.PORT || 5000,
  
  // Database configuration
  mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/exam-papers',
  
  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || 'secret_key_for_jwt',
  jwtExpiration: process.env.JWT_EXPIRATION || '24h',
  
  // File upload paths
  uploadPath: process.env.UPLOAD_PATH || './uploads',
  
  // Flask API URL for OCR services
  flaskApiUrl: process.env.FLASK_API_URL || 'http://localhost:5001',
  
  // Credit system
  creditsForUpload: 5,
  creditsForDownload: 2,
  
  // Google OAuth
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  
  // Environment
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: (process.env.NODE_ENV || 'development') === 'development'
};

module.exports = config; 