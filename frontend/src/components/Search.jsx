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
  Tooltip
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
  ArrowForwardIos as ArrowIcon
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

const Search = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const theme = useTheme();
  
  const [searchTerm, setSearchTerm] = useState(queryParams.get('search') || '');
  const [examType, setExamType] = useState(queryParams.get('examType') || '');
  const [year, setYear] = useState(queryParams.get('year') || '');
  const [subject, setSubject] = useState(queryParams.get('subject') || '');
  
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(parseInt(queryParams.get('page') || '1', 10));
  const [totalPages, setTotalPages] = useState(1);
  
  // Notification message state
  const [notification, setNotification] = useState(location.state?.notification || null);
  
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
    if (page > 1) params.append('page', page.toString());
    
    navigate({
      pathname: location.pathname,
      search: params.toString()
    }, { replace: true });
    
    // Fetch papers based on search params
    fetchPapers();
  }, [examType, year, subject, page]);
  
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
  
  const clearFilters = () => {
    setSearchTerm('');
    setExamType('');
    setYear('');
    setSubject('');
    setPage(1);
  };
  
  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(120deg, #f5f7fa 0%, #e8edf5 100%)',
      py: { xs: 3, md: 5 }
    }}>
      <Container maxWidth="lg">
        {/* Display notification if present */}
        {notification && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
            }}
            onClose={() => setNotification(null)}
          >
            {notification}
          </Alert>
        )}
        
        {/* Header Section */}
        <Box sx={{ 
          textAlign: 'center', 
          mb: { xs: 3, md: 5 } 
        }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 700, 
              color: '#1a237e',
              mb: 2,
              fontSize: { xs: '1.75rem', md: '2.5rem' }
            }}
          >
            Question Paper Repository
          </Typography>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: '#546e7a', 
              maxWidth: 700, 
              mx: 'auto',
              lineHeight: 1.6
            }}
          >
            Search through our extensive collection of past exam papers to help with your exam preparation.
          </Typography>
        </Box>
        
        {/* Search Form */}
        <Paper 
          elevation={0} 
          sx={{ 
            borderRadius: 4,
            overflow: 'hidden',
            mb: 4,
            boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
            background: 'white'
          }}
        >
          {/* Search Header */}
          <Box sx={{ 
            p: { xs: 2, md: 3 },
            background: 'linear-gradient(120deg, #3949ab 0%, #1e88e5 100%)',
            color: 'white'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <SearchIcon />
              <Typography variant="h6" fontWeight="500">
                Search Question Papers
              </Typography>
            </Box>
          </Box>
          
          {/* Search Form Content */}
          <Box sx={{ p: { xs: 2, md: 3 } }}>
            <form onSubmit={handleSearch}>
              <Grid container spacing={3}>
                {/* Search Field */}
                <Grid item xs={12} md={12}>
                  <TextField
                    fullWidth
                    placeholder="Search by title, subject, or keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: searchTerm && (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setSearchTerm('')}>
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ),
                      sx: { 
                        height: 54,
                        borderRadius: 2
                      }
                    }}
                  />
                </Grid>
                
                {/* Filters Row */}
                <Grid item xs={12}>
                  <Grid container spacing={2}>
                    {/* Exam Type Dropdown */}
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel id="exam-type-label">Exam Type</InputLabel>
                        <Select
                          labelId="exam-type-label"
                          value={examType}
                          onChange={(e) => setExamType(e.target.value)}
                          label="Exam Type"
                          sx={{ 
                            height: 54,
                            borderRadius: 2
                          }}
                          startAdornment={
                            <CategoryIcon 
                              sx={{ 
                                mr: 1,
                                color: '#7986cb'
                              }} 
                            />
                          }
                        >
                          {examTypes.map(type => (
                            <MenuItem key={type.value} value={type.value}>
                              {type.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    {/* Year Dropdown */}
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel id="year-label">Year</InputLabel>
                        <Select
                          labelId="year-label"
                          value={year}
                          onChange={(e) => setYear(e.target.value)}
                          label="Year"
                          sx={{ 
                            height: 54,
                            borderRadius: 2
                          }}
                          startAdornment={
                            <CalendarIcon 
                              sx={{ 
                                mr: 1,
                                color: '#7986cb'
                              }} 
                            />
                          }
                        >
                          {years.map(y => (
                            <MenuItem key={y.value} value={y.value}>
                              {y.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    {/* Subject Input */}
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        variant="outlined"
                        placeholder="e.g. Mathematics"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SchoolIcon sx={{ color: '#7986cb' }} />
                            </InputAdornment>
                          ),
                          sx: { 
                            height: 54,
                            borderRadius: 2
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                
                {/* Buttons Row */}
                <Grid item xs={12}>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 2,
                    justifyContent: { xs: 'center', sm: 'flex-end' }
                  }}>
                    {(searchTerm || examType || year || subject) && (
                      <Button
                        variant="outlined"
                        onClick={clearFilters}
                        startIcon={<ClearIcon />}
                        sx={{ 
                          borderRadius: 2,
                          px: 3,
                          height: 44,
                          fontWeight: 500
                        }}
                      >
                        Clear Filters
                      </Button>
                    )}
                    
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      startIcon={<SearchIcon />}
                      sx={{ 
                        borderRadius: 2,
                        px: 4,
                        height: 44,
                        bgcolor: '#3949ab',
                        fontWeight: 500,
                        boxShadow: '0 4px 12px rgba(57, 73, 171, 0.3)',
                        '&:hover': {
                          bgcolor: '#303f9f'
                        }
                      }}
                    >
                      Search
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Box>
        </Paper>
        
        {/* Active Filters */}
        {(searchTerm || examType || year || subject) && (
          <Box sx={{ 
            mb: 3,
            p: 2,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 1.5
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              color: '#3949ab',
              mr: 1
            }}>
              <FilterIcon fontSize="small" />
              <Typography variant="body2" fontWeight={600}>
                Active Filters:
              </Typography>
            </Box>
            
            {searchTerm && (
              <Chip
                label={searchTerm}
                onDelete={() => setSearchTerm('')}
                size="small"
                sx={{ 
                  bgcolor: '#3949ab',
                  color: 'white',
                  fontWeight: 500,
                  borderRadius: '16px',
                  '& .MuiChip-deleteIcon': {
                    color: 'white'
                  }
                }}
              />
            )}
            
            {examType && (
              <Chip
                label={examTypes.find(t => t.value === examType)?.label}
                onDelete={() => setExamType('')}
                size="small"
                sx={{ 
                  bgcolor: '#5c6bc0',
                  color: 'white',
                  fontWeight: 500,
                  borderRadius: '16px',
                  '& .MuiChip-deleteIcon': {
                    color: 'white'
                  }
                }}
              />
            )}
            
            {year && (
              <Chip
                label={`Year: ${year}`}
                onDelete={() => setYear('')}
                size="small"
                sx={{ 
                  bgcolor: '#7986cb',
                  color: 'white',
                  fontWeight: 500,
                  borderRadius: '16px',
                  '& .MuiChip-deleteIcon': {
                    color: 'white'
                  }
                }}
              />
            )}
            
            {subject && (
              <Chip
                label={`Subject: ${subject}`}
                onDelete={() => setSubject('')}
                size="small"
                sx={{ 
                  bgcolor: '#9fa8da',
                  color: 'white',
                  fontWeight: 500,
                  borderRadius: '16px',
                  '& .MuiChip-deleteIcon': {
                    color: 'white'
                  }
                }}
              />
            )}
          </Box>
        )}
        
        {/* Error Message */}
        {error && (
          <Alert 
            severity="error" 
            variant="filled"
            sx={{ 
              mb: 3, 
              borderRadius: 2 
            }}
          >
            {error}
          </Alert>
        )}
        
        {/* Results Section */}
        {loading ? (
          // Loading State
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            p: 6 
          }}>
            <CircularProgress size={50} sx={{ color: '#3949ab', mb: 3 }} />
            <Typography variant="h6" color="#3949ab" fontWeight={500}>
              Searching for papers...
            </Typography>
          </Box>
        ) : (
          <>
            {/* Results Header */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 3,
              flexWrap: 'wrap',
              gap: 2
            }}>
              <Typography variant="h6" sx={{ color: '#1a237e', fontWeight: 600 }}>
                {papers.length > 0 
                  ? `Found ${papers.length} question papers`
                  : 'No question papers found'}
              </Typography>
              
              {totalPages > 1 && (
                <Pagination 
                  count={totalPages} 
                  page={page} 
                  onChange={handlePageChange} 
                  color="primary" 
                  shape="rounded"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      fontWeight: 500
                    }
                  }}
                />
              )}
            </Box>
            
            {/* Results Grid */}
            <Grid container spacing={3}>
              {papers.map((paper) => (
                <Grid item xs={12} sm={6} md={4} key={paper._id}>
                  <Card 
                    sx={{ 
                      height: 320, // Set fixed card height
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      overflow: 'hidden',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.07)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.12)'
                      }
                    }}
                  >
                    {/* Card Header - Fixed height */}
                    <Box sx={{ 
                      p: 2, 
                      height: 70, // Fixed header height
                      background: `linear-gradient(to right, ${alpha(getFileColor(paper.fileType), 0.8)}, ${alpha(getFileColor(paper.fileType), 0.6)})`,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5
                    }}>
                      <Box sx={{ 
                        width: 36, 
                        height: 36, 
                        borderRadius: '50%', 
                        bgcolor: 'rgba(255,255,255,0.2)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexShrink: 0
                      }}>
                        {getFileIcon(paper.fileType)}
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ opacity: 0.8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          {paper.fileType} document
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {paper.examType.replace('-', ' ')}
                        </Typography>
                      </Box>
                    </Box>
                    
                    {/* Card Content - Fixed height */}
                    <CardContent sx={{ 
                      p: 2.5, 
                      flexGrow: 1,
                      height: 170, // Set fixed content height
                      position: 'relative', // For absolute positioning of content
                      overflow: 'hidden', // Hide overflow content
                    }}>
                      {/* Title - Absolute positioning for scrollable area */}
                      <Box 
                        sx={{ 
                          height: 90, // Fixed title container height
                          overflow: 'auto', // Enable scrolling for long titles
                          mb: 2,
                          paddingRight: 1, // Add some padding for scroll
                          '&::-webkit-scrollbar': {
                            width: '4px',
                          },
                          '&::-webkit-scrollbar-thumb': {
                            backgroundColor: 'rgba(0,0,0,0.1)',
                            borderRadius: 4,
                          }
                        }}
                      >
                        <Typography 
                          variant="subtitle1" 
                          component="h2" 
                          sx={{ 
                            fontWeight: 600,
                            lineHeight: 1.4,
                            color: '#263238',
                            cursor: 'pointer',
                            '&:hover': { color: '#3949ab' }
                          }}
                          onClick={() => navigate(`/papers/${paper._id}`)}
                        >
                          {paper.title}
                        </Typography>
                      </Box>
                      
                      {/* Metadata at the bottom of content area */}
                      <Box sx={{ 
                        position: 'absolute',
                        bottom: 20,
                        left: 20,
                        right: 20
                      }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          mb: 1
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, maxWidth: '60%' }}>
                            <SchoolIcon fontSize="small" sx={{ color: '#3949ab', opacity: 0.7, flexShrink: 0 }} />
                            <Typography 
                              variant="body2" 
                              color="text.secondary" 
                              sx={{ 
                                fontWeight: 500,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {paper.subject}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarIcon fontSize="small" sx={{ color: '#3949ab', opacity: 0.7, flexShrink: 0 }} />
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                              {paper.year}
                            </Typography>
                          </Box>
                        </Box>
                        
                        {paper.course && (
                          <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            sx={{ 
                              display: 'block',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            Course: {paper.course}
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                    
                    {/* Card Actions - Fixed height */}
                    <Divider />
                    <CardActions sx={{ 
                      p: 2, 
                      justifyContent: 'space-between',
                      height: 60,
                      bgcolor: 'rgba(0,0,0,0.01)'
                    }}>
                      <Button
                        size="small"
                        onClick={() => navigate(`/papers/${paper._id}`)}
                        endIcon={<ArrowIcon fontSize="small" />}
                        sx={{ 
                          color: '#3949ab',
                          fontWeight: 600
                        }}
                      >
                        Details
                      </Button>
                      
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<DownloadIcon fontSize="small" />}
                        onClick={() => handleDownload(paper._id)}
                        sx={{ 
                          borderRadius: 6,
                          px: 2,
                          bgcolor: '#3949ab',
                          '&:hover': {
                            bgcolor: '#303f9f'
                          }
                        }}
                      >
                        Download
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
              
              {/* Empty State */}
              {papers.length === 0 && (
                <Grid item xs={12}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 5, 
                      textAlign: 'center',
                      borderRadius: 3,
                      bgcolor: 'white',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                      border: '1px solid #e0e0e0'
                    }}
                  >
                    <Box sx={{ 
                      width: 70, 
                      height: 70, 
                      borderRadius: '50%', 
                      bgcolor: alpha('#3949ab', 0.08),
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2
                    }}>
                      <SearchIcon fontSize="large" sx={{ color: '#3949ab' }} />
                    </Box>
                    
                    <Typography variant="h6" gutterBottom sx={{ color: '#3949ab', fontWeight: 600 }}>
                      No Question Papers Found
                    </Typography>
                    
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 450, mx: 'auto' }}>
                      We couldn't find any papers matching your search criteria. Try adjusting your filters or search for different keywords.
                    </Typography>
                    
                    <Button
                      variant="contained"
                      onClick={clearFilters}
                      sx={{ 
                        px: 3,
                        py: 1,
                        borderRadius: 2,
                        bgcolor: '#3949ab',
                        '&:hover': {
                          bgcolor: '#303f9f'
                        }
                      }}
                    >
                      Clear All Filters
                    </Button>
                  </Paper>
                </Grid>
              )}
            </Grid>
            
            {/* Bottom Pagination */}
            {totalPages > 1 && papers.length > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination 
                  count={totalPages} 
                  page={page} 
                  onChange={handlePageChange} 
                  color="primary" 
                  size="large"
                  shape="rounded"
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
      </Container>
    </Box>
  );
};

export default Search; 