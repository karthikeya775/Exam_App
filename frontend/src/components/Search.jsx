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
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Info as InfoIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Description as DocIcon,
  Description as DescriptionIcon
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
  
  const [searchTerm, setSearchTerm] = useState(queryParams.get('search') || '');
  const [examType, setExamType] = useState(queryParams.get('examType') || '');
  const [year, setYear] = useState(queryParams.get('year') || '');
  const [subject, setSubject] = useState(queryParams.get('subject') || '');
  
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(parseInt(queryParams.get('page') || '1', 10));
  const [totalPages, setTotalPages] = useState(1);
  
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
        return <PdfIcon color="error" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <ImageIcon color="primary" />;
      case 'doc':
      case 'docx':
        return <DocIcon color="info" />;
      default:
        return <DescriptionIcon />;
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Search Question Papers
        </Typography>
        
        <form onSubmit={handleSearch}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Search papers"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by subject, course, title or tags"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel id="exam-type-label">Exam Type</InputLabel>
                <Select
                  labelId="exam-type-label"
                  value={examType}
                  onChange={(e) => setExamType(e.target.value)}
                  label="Exam Type"
                >
                  {examTypes.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel id="year-label">Year</InputLabel>
                <Select
                  labelId="year-label"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  label="Year"
                >
                  {years.map(y => (
                    <MenuItem key={y.value} value={y.value}>
                      {y.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  startIcon={<SearchIcon />}
                >
                  Search
                </Button>
                <Button
                  variant="outlined"
                  onClick={clearFilters}
                >
                  Clear
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Active filters display */}
      {(searchTerm || examType || year || subject) && (
        <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
          <Typography variant="body2">Active filters:</Typography>
          
          {searchTerm && (
            <Chip 
              label={`Search: ${searchTerm}`} 
              onDelete={() => setSearchTerm('')}
              size="small"
              color="primary"
            />
          )}
          
          {examType && (
            <Chip 
              label={`Type: ${examTypes.find(t => t.value === examType)?.label}`} 
              onDelete={() => setExamType('')}
              size="small"
              color="primary"
            />
          )}
          
          {year && (
            <Chip 
              label={`Year: ${year}`} 
              onDelete={() => setYear('')}
              size="small"
              color="primary"
            />
          )}
          
          {subject && (
            <Chip 
              label={`Subject: ${subject}`} 
              onDelete={() => setSubject('')}
              size="small"
              color="primary"
            />
          )}
        </Box>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Typography variant="h6" component="h2" gutterBottom>
            {papers.length > 0 
              ? `Found ${papers.length} question paper${papers.length !== 1 ? 's' : ''}`
              : 'No question papers found matching your criteria'}
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {papers.map((paper) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={paper._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      {getFileIcon(paper.fileType)}
                      <Typography variant="h6" component="h3" sx={{ ml: 1, fontWeight: 'bold' }}>
                        {paper.title.length > 30 
                          ? paper.title.substring(0, 30) + '...' 
                          : paper.title}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {paper.subject} • {paper.course}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', my: 1 }}>
                      <Chip 
                        label={paper.examType.replace('-', ' ')} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                      />
                      <Chip 
                        label={paper.year.toString()} 
                        size="small" 
                        color="secondary" 
                        variant="outlined" 
                      />
                    </Box>
                    
                    {paper.uploadedBy && (
                      <Typography variant="caption" color="textSecondary" display="block">
                        Uploaded by: {paper.uploadedBy.name}
                      </Typography>
                    )}
                  </CardContent>
                  
                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<InfoIcon />}
                      onClick={() => navigate(`/papers/${paper._id}`)}
                    >
                      Details
                    </Button>
                    <Button
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownload(paper._id)}
                    >
                      Download
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
                showFirstButton 
                showLastButton
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default Search; 