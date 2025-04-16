import axios from 'axios';

const API_URL = 'http://localhost:5000/api/question-papers';
const FLASK_API_URL = 'http://localhost:5001';

// Get JWT token from localStorage
const getToken = () => localStorage.getItem('token');

// Configure axios with auth header
const authConfig = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`
  }
});

// Get all question papers with optional filters
export const getQuestionPapers = async (params = {}) => {
  try {
    const response = await axios.get(API_URL, {
      ...authConfig(),
      params
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get a single question paper by ID
export const getQuestionPaperById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, authConfig());
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Extract metadata from PDF
export const extractPdfMetadata = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(`${FLASK_API_URL}/detect_details`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 30000 // 30 seconds timeout for OCR processing
    });
    
    console.log('Metadata extraction response:', response.data);
    
    // Check if we got an error response
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to extract metadata');
    }
    
    // Map the exam type from OCR format to backend format
    let examType = 'other';
    if (response.data.exam_type) {
      // Convert OCR exam types to backend enum values
      const examTypeMap = {
        'Mid_Semester': 'mid-semester',
        'End_Semester': 'end-semester',
        'Quiz': 'quiz'
      };
      examType = examTypeMap[response.data.exam_type] || 'other';
    }
    
    // Map response to our format
    return {
      courseCode: response.data.course_code || '',
      examType: examType,
      year: response.data.year || new Date().getFullYear(),
      rawOcrText: response.data.raw_ocr_text || ''
    };
  } catch (error) {
    console.error('Error extracting metadata from PDF:', error);
    throw error;
  }
};

// Upload a question paper
export const uploadQuestionPaper = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/upload`, formData, {
      ...authConfig(),
      headers: {
        ...authConfig().headers,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Download a question paper
export const downloadQuestionPaper = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}/download`, {
      ...authConfig(),
      responseType: 'blob'
    });
    
    // Create a URL for the blob
    const url = window.URL.createObjectURL(new Blob([response.data]));
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = url;
    
    // Get the filename from Content-Disposition header
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'question-paper.pdf';
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1];
      }
    }
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Search question papers
export const searchQuestionPapers = async (searchTerm) => {
  try {
    const response = await axios.get(API_URL, {
      ...authConfig(),
      params: { search: searchTerm }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete a question paper by ID (only works if current user is the uploader)
export const deleteQuestionPaper = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, authConfig());
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}; 