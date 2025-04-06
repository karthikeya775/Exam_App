import axios from 'axios';

const API_URL = 'http://localhost:5000/api/question-papers';

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