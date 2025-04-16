import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  Box,
  Alert,
  CircularProgress,
  Chip,
  FormHelperText,
  useTheme,
  alpha,
  Divider,
  Backdrop
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon, 
  CheckCircle as CheckCircleIcon,
  ArrowBack as ArrowBackIcon,
  Description as DescriptionIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Add as AddIcon,
  Tag as TagIcon,
  AutoAwesome as AutoAwesomeIcon
} from '@mui/icons-material';
import { uploadQuestionPaper, extractPdfMetadata } from '../services/questionPaperService';
import { AuthContext } from '../context/AuthContext';

const examTypes = [
  { value: 'mid-semester', label: 'Mid Semester' },
  { value: 'end-semester', label: 'End Semester' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'other', label: 'Other' }
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

const Upload = () => {
  const { refreshUserData } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [preview, setPreview] = useState(null);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [extractingMetadata, setExtractingMetadata] = useState(false);
  const [metadataExtracted, setMetadataExtracted] = useState(false);
  const [ocrText, setOcrText] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    course: '',
    courseCode: '',
    examType: 'other',
    year: currentYear,
    description: ''
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  // This effect runs when a PDF file is selected to automatically extract metadata
  useEffect(() => {
    const extractMetadata = async () => {
      if (file && file.type === 'application/pdf' && !metadataExtracted) {
        try {
          setExtractingMetadata(true);
          setError(null);
          
          const extractedMetadata = await extractPdfMetadata(file);
          
          setFormData(prevData => ({
            ...prevData,
            courseCode: extractedMetadata.courseCode || prevData.courseCode,
            examType: extractedMetadata.examType || prevData.examType,
            year: extractedMetadata.year || prevData.year
          }));
          
          setOcrText(extractedMetadata.rawOcrText || '');
          setMetadataExtracted(true);
          setExtractingMetadata(false);
          
        } catch (error) {
          console.error('Metadata extraction error:', error);
          setError('Failed to extract metadata from PDF. Please fill in the details manually.');
          setExtractingMetadata(false);
        }
      }
    };
    
    extractMetadata();
  }, [file]);
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) return;
    
    // Check file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Invalid file type. Only PDF, JPG, JPEG, PNG, DOC, and DOCX files are allowed.');
      return;
    }
    
    // Check file size (10MB limit)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit.');
      return;
    }
    
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setMetadataExtracted(false);
    setOcrText('');
    
    // Create preview for image files
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
    
    // Use filename as title if title is empty
    if (!formData.title) {
      const nameWithoutExt = selectedFile.name.split('.').slice(0, -1).join('.');
      setFormData(prevData => ({
        ...prevData,
        title: nameWithoutExt
      }));
    }
    
    setError(null);
  };
  
  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };
  
  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      addTag();
    }
  };
  
  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };
  
  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const getFileIcon = () => {
    if (!file) return <CloudUploadIcon sx={{ fontSize: 70, color: theme.palette.primary.main, opacity: 0.7 }} />;
    
    const fileType = file.type;
    if (fileType === 'application/pdf') {
      return <PdfIcon sx={{ fontSize: 60, color: '#f44336' }} />;
    } else if (fileType.startsWith('image/')) {
      return <ImageIcon sx={{ fontSize: 60, color: '#2196f3' }} />;
    } else {
      return <DescriptionIcon sx={{ fontSize: 60, color: '#1976d2' }} />;
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Create a copy of formData to ensure we don't modify the state directly
      const processedFormData = { ...formData };
      
      // Ensure examType is in the correct format
      const examTypeMap = {
        'Mid_Semester': 'mid-semester',
        'End_Semester': 'end-semester',
        'Quiz': 'quiz'
      };
      
      if (examTypeMap[processedFormData.examType]) {
        processedFormData.examType = examTypeMap[processedFormData.examType];
      }
      
      // Ensure subject is provided
      if (!processedFormData.subject.trim()) {
        if (processedFormData.courseCode) {
          processedFormData.subject = processedFormData.courseCode;
        } else {
          processedFormData.subject = "Unknown Subject";
        }
      }
      
      const paperFormData = new FormData();
      
      // Append file
      paperFormData.append('file', file);
      
      // Append processed form data
      Object.keys(processedFormData).forEach(key => {
        paperFormData.append(key, processedFormData[key]);
      });
      
      // Append tags
      if (tags.length > 0) {
        paperFormData.append('tags', tags.join(','));
      }
      
      console.log('Submitting with examType:', processedFormData.examType);
      const response = await uploadQuestionPaper(paperFormData);
      
      setSuccess(true);
      setLoading(false);
      
      // Refresh user data to update credit count
      await refreshUserData();
      
      // Redirect to paper details after 2 seconds
      setTimeout(() => {
        navigate(`/papers/${response.data._id}`);
      }, 2000);
      
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.error || 'Failed to upload question paper. Please try again.');
      setLoading(false);
    }
  };
  
  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: '#f5f7fa',
      py: 4
    }}>
      <Container maxWidth="md" sx={{ mt: 2, mb: 6 }}>
        <Box sx={{ display: 'flex', mb: 3 }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate(-1)}
            sx={{ color: theme.palette.text.secondary }}
          >
            Back
          </Button>
        </Box>
        
        {/* Backdrop for metadata extraction */}
        <Backdrop
          sx={{ 
            color: '#fff', 
            zIndex: (theme) => theme.zIndex.drawer + 1,
            flexDirection: 'column',
            '& .MuiCircularProgress-root': {
              marginBottom: 2
            }
          }}
          open={extractingMetadata}
        >
          <CircularProgress color="inherit" />
          <Typography variant="h6">Extracting metadata from PDF...</Typography>
          <Typography variant="body2" sx={{ mt: 1, maxWidth: '60%', textAlign: 'center' }}>
            This may take a few moments. We're using OCR to analyze the document.
          </Typography>
        </Backdrop>
        
        <Paper 
          elevation={3} 
          sx={{ 
            p: { xs: 3, md: 4 }, 
            borderRadius: 2, 
            overflow: 'hidden',
            position: 'relative',
            background: theme.palette.background.paper
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 700, 
              color: theme.palette.primary.main,
              pb: 1,
              borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              mb: 3
            }}
          >
            Upload Question Paper
          </Typography>
          
          <Typography variant="body1" paragraph color="textSecondary">
            Share your exam papers with other students. You will receive credits for each upload.
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 4, borderRadius: 1 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert 
              severity="success" 
              sx={{ 
                mb: 4, 
                borderRadius: 1,
                '& .MuiAlert-icon': {
                  alignItems: 'center'
                }
              }}
            >
              <Typography variant="subtitle2">
                Question paper uploaded successfully! You have received 5 credits.
              </Typography>
            </Alert>
          )}
          
          {metadataExtracted && (
            <Alert 
              severity="info" 
              sx={{ 
                mb: 4, 
                borderRadius: 1,
                bgcolor: alpha(theme.palette.success.main, 0.1),
                color: theme.palette.success.dark,
                '& .MuiAlert-icon': {
                  color: theme.palette.success.main
                }
              }}
              icon={<AutoAwesomeIcon />}
            >
              <Typography variant="subtitle2">
                <strong>Metadata extracted successfully!</strong> We've pre-filled some fields for you.
                Please review and correct if needed.
              </Typography>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box 
                  sx={{ 
                    border: `2px dashed ${file ? theme.palette.primary.main : alpha(theme.palette.divider, 0.8)}`, 
                    p: 4, 
                    textAlign: 'center',
                    borderRadius: 2,
                    mb: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: file ? alpha(theme.palette.primary.main, 0.03) : 'transparent',
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    }
                  }}
                  onClick={() => document.getElementById('fileInput').click()}
                >
                  <input
                    type="file"
                    id="fileInput"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                  
                  <Box sx={{ mb: 2 }}>
                    {preview ? (
                      <img 
                        src={preview} 
                        alt="Preview" 
                        style={{ maxHeight: '200px', maxWidth: '100%', borderRadius: '4px' }}
                      />
                    ) : (
                      getFileIcon()
                    )}
                  </Box>
                  
                  <Typography 
                    variant="h6" 
                    component="h2" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 600,
                      color: file ? theme.palette.primary.main : theme.palette.text.primary
                    }}
                  >
                    {fileName || 'Drag & drop file here or click to browse'}
                  </Typography>
                  
                  <Typography variant="body2" color="textSecondary">
                    Supported formats: PDF, JPG, JPEG, PNG, DOC, DOCX (max 10MB)
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ mb: 3, mt: 1 }}>
                  <Chip label="Paper Details" sx={{ fontWeight: 500 }} />
                </Divider>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  name="title"
                  label="Paper Title"
                  fullWidth
                  variant="outlined"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  name="subject"
                  label="Subject Name"
                  fullWidth
                  variant="outlined"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  name="course"
                  label="Course Name"
                  fullWidth
                  variant="outlined"
                  value={formData.course}
                  onChange={handleChange}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  name="courseCode"
                  label="Course Code"
                  fullWidth
                  variant="outlined"
                  value={formData.courseCode}
                  onChange={handleChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  helperText="Will be auto-extracted from PDF if possible"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined" required>
                  <InputLabel id="exam-type-label">Exam Type</InputLabel>
                  <Select
                    labelId="exam-type-label"
                    name="examType"
                    value={formData.examType}
                    onChange={handleChange}
                    label="Exam Type"
                  >
                    {examTypes.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined" required>
                  <InputLabel id="year-label">Year</InputLabel>
                  <Select
                    labelId="year-label"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    label="Year"
                  >
                    {years.map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TagIcon fontSize="small" sx={{ mr: 0.5, color: theme.palette.text.secondary }} />
                    <Typography variant="caption" color="textSecondary">
                      Tags (up to 5)
                    </Typography>
                  </Box>
                  <TextField
                    value={tagInput}
                    onChange={handleTagInputChange}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Type and press Enter"
                    InputProps={{
                      sx: { borderRadius: 1 },
                      endAdornment: (
                        <Button 
                          size="small" 
                          onClick={addTag} 
                          disabled={!tagInput.trim() || tags.length >= 5}
                          startIcon={<AddIcon fontSize="small" />}
                        >
                          Add
                        </Button>
                      )
                    }}
                  />
                  <FormHelperText>
                    Add relevant tags to improve searchability
                  </FormHelperText>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {tags.map(tag => (
                      <Chip
                        key={tag}
                        label={tag}
                        onDelete={() => removeTag(tag)}
                        color="primary"
                        variant="outlined"
                        size="small"
                        sx={{ borderRadius: 1 }}
                      />
                    ))}
                  </Box>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description (optional)"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  placeholder="Add any additional information about this question paper"
                  variant="outlined"
                  InputProps={{
                    sx: { borderRadius: 1 }
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ mb: 3 }} />
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={loading || success}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                    sx={{ 
                      py: 1.2,
                      px: 4,
                      borderRadius: 1,
                      fontWeight: 600,
                      boxShadow: 2,
                      '&:hover': {
                        boxShadow: 4,
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {loading ? 'Uploading...' : 'Upload Question Paper'}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/dashboard')}
                    disabled={loading}
                    sx={{ 
                      borderRadius: 1,
                      fontWeight: 500
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
          
          {/* Display OCR text if available */}
          {ocrText && (
            <Box mt={4}>
              <Divider sx={{ mb: 2 }}>
                <Chip label="Extracted OCR Text" />
              </Divider>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  maxHeight: '200px', 
                  overflow: 'auto',
                  bgcolor: alpha(theme.palette.info.main, 0.05),
                  borderRadius: 1,
                  fontSize: '0.8rem',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}
              >
                {ocrText.length > 1000 ? ocrText.substring(0, 1000) + '...' : ocrText}
              </Paper>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default Upload; 