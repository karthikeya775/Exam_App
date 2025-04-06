import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Box,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  Divider
} from '@mui/material';
import { 
  Download as DownloadIcon,
  Info as InfoIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Description as DocIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { getQuestionPapers, downloadQuestionPaper } from '../services/questionPaperService';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [recentPapers, setRecentPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecentPapers = async () => {
      try {
        const result = await getQuestionPapers({ limit: 6, sort: '-createdAt' });
        setRecentPapers(result.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching papers:', error);
        setError('Failed to load recent papers. Please try again later.');
        setLoading(false);
      }
    };

    fetchRecentPapers();
  }, []);

  const handleDownload = async (id) => {
    try {
      await downloadQuestionPaper(id);
    } catch (error) {
      console.error('Download error:', error);
      setError(error.error || 'Failed to download paper');
    }
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Paper elevation={1} sx={{ p: 3, mb: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome to Exam Paper Repository
          </Typography>
          <Typography variant="body1" paragraph>
            Access, share, and contribute to our collection of exam papers for IIT ISM Dhanbad students.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => navigate('/search')}
            >
              Search Papers
            </Button>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={() => navigate('/upload')}
            >
              Upload Paper
            </Button>
          </Box>
        </Paper>

        <Divider />

        <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 2 }}>
          Recently Added Papers
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {recentPapers.length > 0 ? (
              recentPapers.map((paper) => (
                <Grid item xs={12} sm={6} md={4} key={paper._id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {getFileIcon(paper.fileType)}
                        <Typography variant="h6" component="h3" sx={{ ml: 1, fontWeight: 'bold' }}>
                          {paper.title.length > 40 
                            ? paper.title.substring(0, 40) + '...' 
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
                      
                      {paper.description && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {paper.description.length > 80 
                            ? paper.description.substring(0, 80) + '...' 
                            : paper.description}
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
              ))
            ) : (
              <Grid item xs={12}>
                <Alert severity="info">
                  No papers have been added yet. Be the first to upload an exam paper!
                </Alert>
              </Grid>
            )}
          </Grid>
        )}
        
        {recentPapers.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/search')}
            >
              View All Papers
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Dashboard; 