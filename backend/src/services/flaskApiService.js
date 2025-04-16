const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const config = require('../../config/config');

// Flask API URL - this should be configured in your config file
const FLASK_API_URL = config.flaskApiUrl || 'http://localhost:5001';

/**
 * Extract metadata from a PDF file using the Flask OCR API
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<Object>} - Extracted metadata
 */
exports.extractMetadataFromPDF = async (filePath) => {
  try {
    console.log(`Extracting metadata from PDF: ${filePath}`);
    
    // Create form data
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    
    // Send the file to Flask API for metadata extraction
    const response = await axios.post(`${FLASK_API_URL}/detect_details`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 30000, // 30 seconds timeout for OCR processing
    });
    
    console.log('Metadata extraction response:', response.data);
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to extract metadata');
    }
    
    // Map Flask API response to our application's format
    const metadata = {
      courseCode: response.data.course_code || '',
      subject: '', // Subject should be determined based on course code
      examType: response.data.exam_type || 'other',
      year: response.data.year || new Date().getFullYear(),
      rawOcrText: response.data.raw_ocr_text || ''
    };
    
    console.log('Mapped metadata:', metadata);
    return metadata;
  } catch (error) {
    console.error('Error extracting metadata from PDF:', error.message);
    // Return empty metadata object on error
    return {
      courseCode: '',
      subject: '',
      examType: '',
      year: new Date().getFullYear(),
      rawOcrText: ''
    };
  }
}; 