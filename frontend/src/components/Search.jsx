import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  InputAdornment,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Pagination,
  Paper,
  Divider,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
  Checkbox,
  FormControlLabel,
  FormGroup
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Description as DocIcon,
  Clear as ClearIcon,
  FilterAlt as FilterIcon,
  CalendarToday as CalendarIcon,
  School as SchoolIcon,
  Category as CategoryIcon,
  ArrowForwardIos as ArrowIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { getQuestionPapers, downloadQuestionPaper, searchQuestionPapers } from '../services/questionPaperService';

const examTypes = [
  { value: '', label: 'All Types' },
  { value: 'mid-semester', label: 'Mid Semester' },
  { value: 'end-semester', label: 'End Semester' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'other', label: 'Other' }
];

const currentYear = new Date().getFullYear();
const years = [
  { value: '', label: 'All Years' },
  ...Array.from({ length: 6 }, (_, i) => ({
    value: currentYear - 5 + i,
    label: (currentYear - 5 + i).toString()
  }))
];

const initialFilters = {
  subjects: [],
  courses: [],
  courseCodes: [], // Added courseCode to filters
  examTypes: [],
  years: [],
  tags: []
};

const Search = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const theme = useTheme();
  
  const [searchTerm, setSearchTerm] = useState(queryParams.get('search') || '');
  const [examType, setExamType] = useState(queryParams.get('examType') || '');
  const [year, setYear] = useState(queryParams.get('year') || '');
  const [subject, setSubject] = useState(queryParams.get('subject') || '');
  const [courseCode, setCourseCode] = useState(queryParams.get('courseCode') || ''); // Added courseCode state
  
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(parseInt(queryParams.get('page') || '1', 10));
  const [totalPages, setTotalPages] = useState(1);
  
  // Available filter options
  const [availableFilters, setAvailableFilters] = useState({
    subjects: [],
    courses: [],
    courseCodes: [], // Added courseCode to available filters
    examTypes: [],
    years: [],
    tags: []
  });
  
  // Active filters
  const [activeFilters, setActiveFilters] = useState(initialFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Notification message state
  const [notification, setNotification] = useState(location.state?.notification || null);
  
  // Load available filter options on component mount
  useEffect(() => {
    const loadDistinctValues = async () => {
      try {
        setLoading(true);
        
        // Fetch all papers to extract distinct values
        const response = await getQuestionPapers({
          limit: 500, // Get a large enough sample to extract all values
          select: 'subject,course,courseCode,examType,year,tags'
        });
        
        // Extract unique values using Set
        const subjects = [...new Set(response.data.map(paper => paper.subject))].filter(Boolean);
        const courses = [...new Set(response.data.map(paper => paper.course))].filter(Boolean);
        const courseCodes = [...new Set(response.data.map(paper => paper.courseCode))].filter(Boolean);
        const years = [...new Set(response.data.map(paper => paper.year))].filter(Boolean);
        
        // Flatten and extract unique tags
        const allTags = response.data.flatMap(paper => paper.tags).filter(Boolean);
        const tags = [...new Set(allTags)];
        
        // Extract unique exam types
        const examTypes = [...new Set(response.data.map(paper => paper.examType))].filter(Boolean);
        
        // Sort values
        subjects.sort();
        courses.sort();
        courseCodes.sort();
        years.sort((a, b) => b - a); // Sort years in descending order
        tags.sort();
        
        // Set the available filter options
        setAvailableFilters({
          subjects,
          courses,
          courseCodes,
          examTypes,
          years,
          tags
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading filter values:', error);
        setError(error?.error || 'Failed to load filter options');
        setLoading(false);
      }
    };
    
    loadDistinctValues();
  }, []);
  
  // Clear notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
        // Clear the location state
        navigate(location.pathname + location.search, { replace: true });
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [notification, navigate, location.pathname, location.search]);
  
  // Update URL when search params change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (examType) params.append('examType', examType);
    if (year) params.append('year', year);
    if (subject) params.append('subject', subject);
    if (courseCode) params.append('courseCode', courseCode); // Added courseCode to URL params
    if (page > 1) params.append('page', page.toString());
    
    navigate({
      pathname: location.pathname,
      search: params.toString()
    }, { replace: true });
    
    // Fetch papers based on search params
    fetchPapers();
  }, [examType, year, subject, courseCode, page]);
  
  const fetchPapers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page,
        limit: 12
      };
      
      if (examType) params.examType = examType;
      if (year) params.year = year;
      if (subject) params.subject = subject;
      if (courseCode) params.courseCode = courseCode; // Added courseCode to query params
      
      let result;
      
      if (searchTerm) {
        result = await searchQuestionPapers(searchTerm);
      } else {
        result = await getQuestionPapers(params);
      }
      
      setPapers(result.data);
      
      // Calculate total pages
      const total = Math.ceil(result.count / 12);
      setTotalPages(total || 1);
      
      setLoading(false);
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to fetch papers. Please try again.');
      setLoading(false);
    }
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
    fetchPapers();
  };
  
  const handleDownload = async (id) => {
    try {
      await downloadQuestionPaper(id);
    } catch (error) {
      console.error('Download error:', error);
      setError(error.error || 'Failed to download paper');
    }
  };
  
  const handlePageChange = (event, value) => {
    setPage(value);
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setExamType('');
    setYear('');
    setSubject('');
    setCourseCode('');
    setPage(1);
    setActiveFilters(initialFilters);
  };
  
  const handleFilterChange = (filterType, value, checked) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      
      if (checked) {
        newFilters[filterType] = [...newFilters[filterType], value];
      } else {
        newFilters[filterType] = newFilters[filterType].filter(item => item !== value);
      }
      
      return newFilters;
    });
  };
  
  const getFileIcon = (fileType) => {
    switch(fileType) {
      case 'pdf':
        return <PdfIcon fontSize="small" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <ImageIcon fontSize="small" />;
      case 'doc':
      case 'docx':
        return <DocIcon fontSize="small" />;
      default:
        return <DocIcon fontSize="small" />;
    }
  };
  
  const getFileColor = (fileType) => {
    switch(fileType) {
      case 'pdf':
        return '#f44336'; // red
      case 'jpg':
      case 'jpeg':
      case 'png':
        return '#2196f3'; // blue
      case 'doc':
      case 'docx':
        return '#3f51b5'; // indigo
      default:
        return '#757575'; // grey
    }
  };
  
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container>
        {/* Search Header */}
        <Paper 
          elevation={2} 
          sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: 2,
            background: theme.palette.mode === 'dark' 
              ? 'linear-gradient(45deg, #1a237e 0%, #311b92 100%)' 
              : 'linear-gradient(45deg, #3949ab 0%, #5e35b1 100%)',
            color: 'white'
          }}
        >
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ 
              fontWeight: 700,
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
            }}
          >
            Search Question Papers
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
            Find question papers by subject, course, course code, exam type, and year.
          </Typography>
          
          <form onSubmit={handleSearch}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search by keywords, subject, or course..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  variant="outlined"
                  sx={{
                    bgcolor: alpha('#fff', 0.15),
                    borderRadius: 1,
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: 'white',
                      },
                      '& fieldset': {
                        borderColor: alpha('#fff', 0.5),
                      },
                    },
                    '& .MuiInputBase-input': {
                      color: 'white',
                      '&::placeholder': {
                        color: alpha('#fff', 0.7),
                        opacity: 1,
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'white' }} />
                      </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                      <InputAdornment position="end">
                        <IconButton 
                          edge="end" 
                          onClick={() => setSearchTerm('')}
                          sx={{ color: 'white' }}
                        >
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={6} md={2}>
                <FormControl fullWidth variant="outlined" sx={{ bgcolor: alpha('#fff', 0.15), borderRadius: 1 }}>
                  <InputLabel sx={{ color: 'white' }}>Exam Type</InputLabel>
                  <Select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value)}
                    label="Exam Type"
                    sx={{
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha('#fff', 0.5),
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'white',
                      },
                      '& .MuiSvgIcon-root': {
                        color: 'white',
                      },
                    }}
                  >
                    {examTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={6} md={2}>
                <FormControl fullWidth variant="outlined" sx={{ bgcolor: alpha('#fff', 0.15), borderRadius: 1 }}>
                  <InputLabel sx={{ color: 'white' }}>Year</InputLabel>
                  <Select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    label="Year"
                    sx={{
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha('#fff', 0.5),
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'white',
                      },
                      '& .MuiSvgIcon-root': {
                        color: 'white',
                      },
                    }}
                  >
                    {years.map((y) => (
                      <MenuItem key={y.value} value={y.value}>
                        {y.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={2}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{
                    py: 1.8,
                    bgcolor: 'white',
                    color: '#5e35b1',
                    '&:hover': {
                      bgcolor: alpha('#fff', 0.9),
                    },
                    fontWeight: 600,
                    fontSize: '1rem',
                    height: '100%'
                  }}
                >
                  Search
                </Button>
              </Grid>
            </Grid>
          </form>
          
          {/* Additional Filters */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {/* Course Code Filter */}
              <TextField
                placeholder="Course Code"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                variant="outlined"
                size="small"
                sx={{
                  bgcolor: alpha('#fff', 0.15),
                  borderRadius: 1,
                  width: 140,
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'white',
                    },
                    '& fieldset': {
                      borderColor: alpha('#fff', 0.5),
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: 'white',
                    '&::placeholder': {
                      color: alpha('#fff', 0.7),
                      opacity: 1,
                    },
                  },
                }}
              />
              
              {/* Subject Filter */}
              <TextField
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                variant="outlined"
                size="small"
                sx={{
                  bgcolor: alpha('#fff', 0.15),
                  borderRadius: 1,
                  width: 140,
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'white',
                    },
                    '& fieldset': {
                      borderColor: alpha('#fff', 0.5),
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: 'white',
                    '&::placeholder': {
                      color: alpha('#fff', 0.7),
                      opacity: 1,
                    },
                  },
                }}
              />
            </Box>
            
            <Button 
              variant="text" 
              onClick={clearFilters}
              sx={{ 
                color: 'white',
                opacity: 0.9,
                '&:hover': {
                  opacity: 1,
                  bgcolor: alpha('#fff', 0.1),
                },
                fontSize: '0.85rem'
              }}
              startIcon={<ClearIcon />}
            >
              Clear Filters
            </Button>
          </Box>
        </Paper>
        
        {/* Notification */}
        {notification && (
          <Alert 
            severity="success" 
            sx={{ mb: 3, borderRadius: 1 }}
            onClose={() => setNotification(null)}
          >
            {notification}
          </Alert>
        )}
        
        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius: 1 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}
        
        {/* Results Section */}
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {loading ? 'Loading Results...' : `Found ${papers.length} Question Papers`}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {/* Active Filters */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {searchTerm && (
                  <Chip 
                    label={`Search: ${searchTerm}`} 
                    onDelete={() => setSearchTerm('')}
                    size="small"
                    sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}
                  />
                )}
                
                {examType && (
                  <Chip 
                    label={`Exam: ${examType}`} 
                    onDelete={() => setExamType('')}
                    size="small"
                    sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1) }}
                  />
                )}
                
                {year && (
                  <Chip 
                    label={`Year: ${year}`} 
                    onDelete={() => setYear('')}
                    size="small"
                    sx={{ bgcolor: alpha(theme.palette.info.main, 0.1) }}
                  />
                )}
                
                {subject && (
                  <Chip 
                    label={`Subject: ${subject}`} 
                    onDelete={() => setSubject('')}
                    size="small"
                    sx={{ bgcolor: alpha(theme.palette.success.main, 0.1) }}
                  />
                )}
                
                {courseCode && (
                  <Chip 
                    label={`Code: ${courseCode}`} 
                    onDelete={() => setCourseCode('')}
                    size="small"
                    sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1) }}
                  />
                )}
              </Box>
            </Box>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : papers.length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              py: 6,
              px: 2,
              bgcolor: alpha(theme.palette.info.main, 0.05),
              borderRadius: 2
            }}>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No question papers found
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Try adjusting your search or filters to find what you're looking for.
              </Typography>
              <Button 
                variant="outlined" 
                onClick={clearFilters}
                startIcon={<ClearIcon />}
              >
                Clear All Filters
              </Button>
            </Box>
          ) : (
            <>
              <Grid container spacing={3}>
                {papers.map((paper) => (
                  <Grid item xs={12} sm={6} md={4} key={paper._id}>
                    <Card sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: 4
                      },
                      borderRadius: 2,
                      overflow: 'hidden'
                    }}>
                      <Box sx={{ 
                        p: 2, 
                        bgcolor: alpha(getFileColor(paper.fileType), 0.1),
                        borderBottom: `1px solid ${alpha(getFileColor(paper.fileType), 0.2)}`
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ 
                            mr: 1.5,
                            color: getFileColor(paper.fileType),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {getFileIcon(paper.fileType)}
                          </Box>
                          <Typography 
                            variant="subtitle2" 
                            sx={{ 
                              textTransform: 'uppercase',
                              letterSpacing: 0.5,
                              fontWeight: 600,
                              color: getFileColor(paper.fileType)
                            }}
                          >
                            {paper.fileType.toUpperCase()}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                        <Typography 
                          variant="h6" 
                          component="h2" 
                          sx={{ 
                            mb: 1,
                            fontWeight: 600,
                            fontSize: '1.1rem',
                            lineHeight: 1.3
                          }}
                        >
                          {paper.title}
                        </Typography>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography 
                            variant="body2" 
                            color="textSecondary" 
                            sx={{ 
                              display: 'flex',
                              alignItems: 'center',
                              mb: 0.5,
                              fontSize: '0.875rem'
                            }}
                          >
                            <SchoolIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main, opacity: 0.7 }} />
                            {paper.subject}
                          </Typography>
                          
                          {paper.courseCode && (
                            <Typography 
                              variant="body2" 
                              color="textSecondary" 
                              sx={{ 
                                display: 'flex',
                                alignItems: 'center',
                                mb: 0.5,
                                fontSize: '0.875rem'
                              }}
                            >
                              <CategoryIcon fontSize="small" sx={{ mr: 1, color: theme.palette.secondary.main, opacity: 0.7 }} />
                              {paper.courseCode}
                            </Typography>
                          )}
                          
                          <Typography 
                            variant="body2" 
                            color="textSecondary" 
                            sx={{ 
                              display: 'flex',
                              alignItems: 'center',
                              fontSize: '0.875rem'
                            }}
                          >
                            <CalendarIcon fontSize="small" sx={{ mr: 1, color: theme.palette.info.main, opacity: 0.7 }} />
                            {paper.examType.replace('-', ' ')} {paper.year}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 2 }}>
                          <Chip 
                            label={paper.fileType.toUpperCase()} 
                            size="small"
                            sx={{ 
                              bgcolor: alpha(getFileColor(paper.fileType), 0.1),
                              color: getFileColor(paper.fileType),
                              fontWeight: 500,
                              borderRadius: 1
                            }}
                          />
                          <Chip 
                            label={paper.examType.replace('-', ' ')} 
                            size="small"
                            sx={{ 
                              bgcolor: alpha(theme.palette.info.main, 0.1),
                              color: theme.palette.info.main,
                              fontWeight: 500,
                              borderRadius: 1
                            }}
                          />
                          <Chip 
                            label={paper.year} 
                            size="small"
                            sx={{ 
                              bgcolor: alpha(theme.palette.secondary.main, 0.1),
                              color: theme.palette.secondary.main,
                              fontWeight: 500,
                              borderRadius: 1
                            }}
                          />
                        </Box>
                      </CardContent>
                      
                      <CardActions sx={{ p: 2, pt: 0 }}>
                        <Button
                          size="small"
                          onClick={() => navigate(`/papers/${paper._id}`)}
                          sx={{ 
                            fontWeight: 500,
                            textTransform: 'none'
                          }}
                          startIcon={<InfoIcon fontSize="small" />}
                        >
                          View Details
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleDownload(paper._id)}
                          sx={{ 
                            ml: 'auto',
                            fontWeight: 500,
                            textTransform: 'none'
                          }}
                          startIcon={<DownloadIcon fontSize="small" />}
                        >
                          Download
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                  <Pagination 
                    count={totalPages} 
                    page={page} 
                    onChange={handlePageChange}
                    color="primary"
                    showFirstButton
                    showLastButton
                    sx={{
                      '& .MuiPaginationItem-root': {
                        fontWeight: 500
                      }
                    }}
                  />
                </Box>
              )}
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default Search; 