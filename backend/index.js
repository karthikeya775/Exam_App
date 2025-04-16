const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables from multiple possible locations
const envPaths = [
  './config/.env',
  './.env',
  path.join(__dirname, 'config', '.env'),
  path.join(__dirname, '.env')
];

let envLoaded = false;
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    console.log(`Loading environment variables from: ${envPath}`);
    dotenv.config({ path: envPath });
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.warn('No .env file found! Using default environment variables.');
  // Set some reasonable defaults
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret_key_for_development';
  process.env.JWT_EXPIRE = process.env.JWT_EXPIRE || '30d';
}

// Debug: Print important environment variables (without sensitive values)
console.log('Environment variables loaded:');
console.log('PORT:', process.env.PORT);
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Set [value hidden]' : 'Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set [value hidden]' : 'Not set');
console.log('JWT_EXPIRE:', process.env.JWT_EXPIRE);
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set [value hidden]' : 'Not set');

// Import route files
const authRoutes = require('./src/routes/auth');
const questionPaperRoutes = require('./src/routes/questionPapers');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  console.log(`Creating uploads directory at: ${uploadsDir}`);
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Set port and MongoDB URI
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/exam_paper_repository';

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/question-papers', questionPaperRoutes);

// MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Server Error'
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.error(err);
  // Close server & exit process
  process.exit(1);
}); 