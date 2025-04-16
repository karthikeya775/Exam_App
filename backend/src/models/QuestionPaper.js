const mongoose = require('mongoose');

const QuestionPaperSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  subject: {
    type: String,
    trim: true
  },
  course: {
    type: String,
    trim: true
  },
  courseCode: {
    type: String,
    required: [true, 'Please add a course code'],
    trim: true
  },
  semester: {
    type: String,
    required: [true, 'Please add semester'],
    enum: ['winter', 'summer', 'monsoon'],
    default: 'winter'
  },
  examDate: {
    type: Date
  },
  academicYear: {
    type: String,
    required: [true, 'Please add academic year']
  },
  examType: {
    type: String,
    required: [true, 'Please add exam type'],
    enum: ['mid-semester', 'end-semester', 'quiz', 'other'],
    default: 'other'
  },
  year: {
    type: Number,
    required: [true, 'Please add a year'],
    min: [1950, 'Year must be at least 1950'],
    max: [2100, 'Year cannot be more than 2100']
  },
  filePath: {
    type: String,
    required: [true, 'Please add a file path']
  },
  fileType: {
    type: String,
    required: [true, 'Please add a file type'],
    enum: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx']
  },
  fileSize: {
    type: Number,
    required: [true, 'Please add a file size']
  },
  uploadedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  tags: [String],
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  isVerified: {
    type: Boolean,
    default: false
  }
});

// Create index for search functionality
QuestionPaperSchema.index({ 
  subject: 'text', 
  course: 'text',
  courseCode: 'text',
  title: 'text',
  tags: 'text'
});

module.exports = mongoose.model('QuestionPaper', QuestionPaperSchema);