const express = require('express');
const multer = require('multer');
const path = require('path');
const { 
  uploadQuestionPaper, 
  getQuestionPapers, 
  getQuestionPaper, 
  downloadQuestionPaper,
  deleteQuestionPaper
} = require('../controllers/questionPapers');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function(req, file, cb) {
    // Create unique file name using timestamp
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept allowed file types
  const allowedFileTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type, only PDF, JPG, JPEG, PNG, DOC, and DOCX are allowed'), false);
  }
};

// Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter
});

// Routes
router.route('/')
  .get(protect, getQuestionPapers);

router.route('/upload')
  .post(protect, upload.single('file'), uploadQuestionPaper);

router.route('/:id')
  .get(protect, getQuestionPaper)
  .delete(protect, deleteQuestionPaper);

router.route('/:id/download')
  .get(protect, downloadQuestionPaper);

module.exports = router; 