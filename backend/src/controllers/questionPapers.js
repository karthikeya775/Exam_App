const path = require('path');
const fs = require('fs');
const QuestionPaper = require('../models/QuestionPaper');
const User = require('../models/User');
const { extractMetadataFromPDF } = require('../services/flaskApiService');

// @desc    Upload a question paper
// @route   POST /api/question-papers/upload
// @access  Private
exports.uploadQuestionPaper = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please upload a file'
      });
    }

    // Check if user has been authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized'
      });
    }

    const file = req.file;
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];

    // Validate file extension
    if (!allowedExtensions.includes(fileExtension)) {
      // Remove the uploaded file
      fs.unlinkSync(file.path);
      
      return res.status(400).json({
        success: false,
        error: `File type not supported. Allowed types: ${allowedExtensions.join(', ')}`
      });
    }

    // Extract metadata from file if it's a PDF
    let metadata = {
      courseCode: req.body.courseCode || '',
      subject: req.body.subject || '',
      course: req.body.course || '',
      examType: req.body.examType || 'other',
      year: parseInt(req.body.year) || new Date().getFullYear(),
      semester: req.body.semester || 'winter',
      examDate: null
    };

    // Add a flag to track if metadata was extracted
    let metadataExtracted = false;

    // If PDF, try to extract metadata using the Flask API
    if (fileExtension === '.pdf') {
      try {
        console.log('Processing PDF for metadata extraction via Flask API');
        
        // Extract metadata from PDF using Flask API
        const extractedMetadata = await extractMetadataFromPDF(file.path);
        
        console.log('Extracted metadata from Flask API:', extractedMetadata);

        // Validate required courseCode
        if (!req.body.courseCode && !extractedMetadata.courseCode) {
          return res.status(400).json({
            success: false,
            error: 'Course code is required'
          });
        }

        // Extract exam date if available in OCR text
        if (extractedMetadata.rawOcrText) {
          const datePattern = /(?:date|dated|held on|conducted on)[:\s]*([\d]{1,2}[\/-][\d]{1,2}[\/-][\d]{2,4})/i;
          const match = extractedMetadata.rawOcrText.match(datePattern);
          if (match) {
            const dateStr = match[1];
            metadata.examDate = new Date(dateStr);
          }
        }

        // Detect semester from OCR text
        if (!req.body.semester && extractedMetadata.rawOcrText) {
          const winterPattern = /winter semester|winter session/i;
          const summerPattern = /summer semester|summer session/i;
          const monsoonPattern = /monsoon semester|monsoon session/i;

          if (winterPattern.test(extractedMetadata.rawOcrText)) {
            metadata.semester = 'winter';
          } else if (summerPattern.test(extractedMetadata.rawOcrText)) {
            metadata.semester = 'summer';
          } else if (monsoonPattern.test(extractedMetadata.rawOcrText)) {
            metadata.semester = 'monsoon';
          }
        }

        // Only use extracted metadata for fields that weren't provided by the user
        if (extractedMetadata.courseCode && !req.body.courseCode) {
          metadata.courseCode = extractedMetadata.courseCode;
          metadataExtracted = true;
        }
        
        if (!req.body.examType && extractedMetadata.examType) {
          metadata.examType = extractedMetadata.examType;
          metadataExtracted = true;
        }
        
        if (!req.body.year && extractedMetadata.year) {
          metadata.year = extractedMetadata.year;
          metadataExtracted = true;
        }

        console.log('Final metadata after extraction:', metadata);
      } catch (error) {
        console.error('Error processing PDF metadata via Flask API:', error);
        // Continue with user provided metadata if extraction fails
      }
    }

    // Calculate academic year based on semester
    const examYear = metadata.year;
    metadata.academicYear = metadata.semester === 'monsoon' 
      ? `${examYear}-${examYear + 1}`
      : `${examYear - 1}-${examYear}`;

    // Ensure we have default values for required fields
    metadata.subject = metadata.subject || 'Unknown Subject';
    metadata.course = metadata.course || 'Unknown Course';
    metadata.year = metadata.year || new Date().getFullYear();

    // Map exam type to correct format if needed
    if (metadata.examType) {
      const examTypeMap = {
        'Mid_Semester': 'mid-semester',
        'End_Semester': 'end-semester',
        'Quiz': 'quiz'
      };
      metadata.examType = examTypeMap[metadata.examType] || metadata.examType;
    }

    // Create a new question paper entry
    const questionPaper = await QuestionPaper.create({
      title: req.body.title || file.originalname,
      subject: metadata.subject,
      course: metadata.course,
      courseCode: metadata.courseCode,
      examType: metadata.examType,
      year: metadata.year,
      semester: metadata.semester,
      academicYear: metadata.academicYear,
      examDate: metadata.examDate,
      filePath: file.path,
      fileType: fileExtension.slice(1), // Remove the dot
      fileSize: file.size,
      uploadedBy: req.user.id,
      tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
      description: req.body.description || ''
    });

    // Add credits to user for upload
    await req.user.addCreditsForUpload();

    // Update the response to include metadata extraction info
    res.status(201).json({
      success: true,
      data: questionPaper,
      metadataExtracted,
      courseCode: metadata.courseCode,
      subject: metadata.subject,
      course: metadata.course,
      examType: metadata.examType,
      year: metadata.year,
      semester: metadata.semester,
      academicYear: metadata.academicYear,
      examDate: metadata.examDate,
      message: 'Question paper uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading question paper:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload question paper'
    });
  }
};

// @desc    Get all question papers with filtering
// @route   GET /api/question-papers
// @access  Private
exports.getQuestionPapers = async (req, res) => {
  try {
    // Copy req.query
    const reqQuery = { ...req.query };
    
    // Fields to exclude from filtering
    const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
    removeFields.forEach(param => delete reqQuery[param]);
    
    // Create query string
    let queryStr = JSON.stringify(reqQuery);
    
    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    // Finding resource
    let query = QuestionPaper.find(JSON.parse(queryStr)).populate({
      path: 'uploadedBy',
      select: 'name avatar'
    });
    
    // Handle text search
    if (req.query.search) {
      query = QuestionPaper.find(
        { $text: { $search: req.query.search } },
        { score: { $meta: "textScore" } }
      )
      .sort({ score: { $meta: "textScore" } })
      .populate({
        path: 'uploadedBy',
        select: 'name avatar'
      });
    }
    
    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }
    
    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await QuestionPaper.countDocuments();
    
    query = query.skip(startIndex).limit(limit);
    
    // Executing query
    const questionPapers = await query;
    
    // Pagination result
    const pagination = {};
    
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }
    
    res.status(200).json({
      success: true,
      count: questionPapers.length,
      pagination,
      data: questionPapers
    });
  } catch (error) {
    console.error('Error getting question papers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve question papers'
    });
  }
};

// @desc    Get single question paper
// @route   GET /api/question-papers/:id
// @access  Private
exports.getQuestionPaper = async (req, res) => {
  try {
    const questionPaper = await QuestionPaper.findById(req.params.id).populate({
      path: 'uploadedBy',
      select: 'name avatar'
    });
    
    if (!questionPaper) {
      return res.status(404).json({
        success: false,
        error: 'Question paper not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: questionPaper
    });
  } catch (error) {
    console.error('Error getting question paper:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve question paper'
    });
  }
};

// @desc    Download a question paper
// @route   GET /api/question-papers/:id/download
// @access  Private
exports.downloadQuestionPaper = async (req, res) => {
  try {
    const questionPaper = await QuestionPaper.findById(req.params.id);
    
    if (!questionPaper) {
      return res.status(404).json({
        success: false,
        error: 'Question paper not found'
      });
    }
    
    // Check if file exists
    if (!fs.existsSync(questionPaper.filePath)) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }
    
    // Check if user has enough credits
    const user = await User.findById(req.user.id);
    
    if (user.credits < 2) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient credits to download this paper'
      });
    }
    
    // Deduct credits from user
    await user.useCreditsForDownload();
    
    // Increment download count
    questionPaper.downloadCount += 1;
    await questionPaper.save();
    
    // Send file
    res.download(
      questionPaper.filePath,
      `${questionPaper.subject}_${questionPaper.examType}_${questionPaper.year}.${questionPaper.fileType}`
    );
  } catch (error) {
    console.error('Error downloading question paper:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download question paper'
    });
  }
};

// @desc    Delete a question paper
// @route   DELETE /api/question-papers/:id
// @access  Private (only for the uploader)
exports.deleteQuestionPaper = async (req, res) => {
  try {
    const questionPaper = await QuestionPaper.findById(req.params.id);
    
    if (!questionPaper) {
      return res.status(404).json({
        success: false,
        error: 'Question paper not found'
      });
    }
    
    // Check if current user is the uploader of this paper
    if (questionPaper.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this question paper'
      });
    }
    
    // Get the user
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Remove credits that were earned from uploading (5 credits per upload)
    if (user.credits >= 5) {
      user.credits -= 5;
      user.uploadCount -= 1;
      await user.save();
    }
    
    // Delete the physical file from storage
    if (fs.existsSync(questionPaper.filePath)) {
      fs.unlinkSync(questionPaper.filePath);
    }
    
    // Delete the document from database
    await questionPaper.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {},
      message: 'Question paper deleted successfully and credits adjusted'
    });
  } catch (error) {
    console.error('Error deleting question paper:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete question paper'
    });
  }
};