import { useState, useContext } from 'react';
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
  Divider
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon, 
  CheckCircle as CheckCircleIcon,
  ArrowBack as ArrowBackIcon,
  Description as DescriptionIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Add as AddIcon,
  Tag as TagIcon
} from '@mui/icons-material';
import { uploadQuestionPaper } from '../services/questionPaperService';
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
  
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    course: '',
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
      
      const paperFormData = new FormData();
      
      // Append file
      paperFormData.append('file', file);
      
      // If it's a PDF and we want to extract metadata
      if (file.type === 'application/pdf' && !metadataExtracted) {
        setExtractingMetadata(true);
      }
      
      // Append form data
      Object.keys(formData).forEach(key => {
        paperFormData.append(key, formData[key]);
      });
      
      // Append tags
      if (tags.length > 0) {
        paperFormData.append('tags', tags.join(','));
      }
      
      const response = await uploadQuestionPaper(paperFormData);
      
      setSuccess(true);
      setLoading(false);
      setExtractingMetadata(false);
      
      // If metadata was extracted, update the form
      if (response.data.metadataExtracted) {
        setMetadataExtracted(true);
        setFormData(prevData => ({
          ...prevData,
          subject: response.data.subject || prevData.subject,
          course: response.data.course || prevData.course,
          examType: response.data.examType || prevData.examType,
          year: response.data.year || prevData.year
        }));
      }
      
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
      setExtractingMetadata(false);
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
              
              {file && file.type === 'application/pdf' && (
                <Grid item xs={12}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      backgroundColor: alpha(theme.palette.info.main, 0.05),
                      borderRadius: 1,
                      mb: 2,
                      border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: extractingMetadata 
                          ? theme.palette.info.main
                          : metadataExtracted 
                            ? theme.palette.success.main
                            : theme.palette.info.main
                      }}
                    >
                      {extractingMetadata ? (
                        <>
                          <CircularProgress size={16} sx={{ mr: 1 }} />
                          Extracting metadata from PDF...
                        </>
                      ) : metadataExtracted ? (
                        <>
                          <CheckCircleIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Metadata extracted successfully!
                        </>
                      ) : (
                        'Metadata will be extracted automatically from the PDF when you submit'
                      )}
                    </Typography>
                  </Paper>
                </Grid>
              )}
              
              <Grid item xs={12}>
                <Divider sx={{ mb: 3, mt: 1 }}>
                  <Chip label="Paper Details" sx={{ fontWeight: 500 }} />
                </Divider>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  InputProps={{
                    sx: { borderRadius: 1 }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Computer Science"
                  variant="outlined"
                  InputProps={{
                    sx: { borderRadius: 1 }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Course"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  required
                  placeholder="e.g. CS101"
                  variant="outlined"
                  InputProps={{
                    sx: { borderRadius: 1 }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="exam-type-label">Exam Type</InputLabel>
                  <Select
                    labelId="exam-type-label"
                    name="examType"
                    value={formData.examType}
                    onChange={handleChange}
                    label="Exam Type"
                    required
                    sx={{ borderRadius: 1 }}
                  >
                    {examTypes.map(type => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="year-label">Year</InputLabel>
                  <Select
                    labelId="year-label"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    label="Year"
                    required
                    sx={{ borderRadius: 1 }}
                  >
                    {years.map(year => (
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
        </Paper>
      </Container>
    </Box>
  );
};

export default Upload; 