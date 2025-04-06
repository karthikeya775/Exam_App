import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  CircularProgress,
  Alert,
  Avatar,
  Card,
  CardContent
} from '@mui/material';
import {
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Description as DocIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { getQuestionPaperById, downloadQuestionPaper } from '../services/questionPaperService';
import { AuthContext } from '../context/AuthContext';

const PaperDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, refreshUserData } = useContext(AuthContext);
  
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);
  
  useEffect(() => {
    const fetchPaper = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await getQuestionPaperById(id);
        setPaper(result.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching paper:', error);
        setError('Failed to load paper details. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchPaper();
  }, [id]);
  
  const handleDownload = async () => {
    try {
      setDownloadLoading(true);
      setDownloadError(null);
      
      await downloadQuestionPaper(id);
      
      // Refresh user data to update credit count
      await refreshUserData();
      
      setDownloadLoading(false);
    } catch (error) {
      console.error('Download error:', error);
      setDownloadError(error.error || 'Failed to download paper');
      setDownloadLoading(false);
    }
  };
  
  const getFileIcon = (fileType) => {
    switch(fileType) {
      case 'pdf':
        return <PdfIcon fontSize="large" color="error" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <ImageIcon fontSize="large" color="primary" />;
      case 'doc':
      case 'docx':
        return <DocIcon fontSize="large" color="info" />;
      default:
        return <DocIcon fontSize="large" />;
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </Container>
    );
  }
  
  if (!paper) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Paper not found or has been removed.
        </Alert>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/dashboard')}
        >
          Go to Dashboard
        </Button>
      </Container>
    );
  }
  
  // Format date to readable string
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
      >
        Back
      </Button>
      
      <Paper elevation={2} sx={{ p: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {getFileIcon(paper.fileType)}
              <Typography variant="h4" component="h1" sx={{ ml: 2 }}>
                {paper.title}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
              <Chip 
                label={paper.subject} 
                color="primary" 
                variant="outlined" 
              />
              <Chip 
                label={paper.course} 
                color="primary" 
                variant="outlined" 
              />
              <Chip 
                label={paper.examType.replace('-', ' ')} 
                color="secondary" 
                variant="outlined" 
              />
              <Chip 
                label={paper.year.toString()} 
                color="secondary" 
                variant="outlined" 
              />
            </Box>
            
            {paper.description && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body1" paragraph>
                  {paper.description}
                </Typography>
              </Box>
            )}
            
            {paper.tags && paper.tags.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {paper.tags.map((tag, index) => (
                    <Chip 
                      key={index}
                      label={tag} 
                      size="small"
                      color="default" 
                      variant="outlined" 
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" component="h3" gutterBottom>
                  Download Paper
                </Typography>
                
                <Typography variant="body2" color="textSecondary" paragraph>
                  Cost: 2 credits
                </Typography>
                
                {downloadError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {downloadError}
                  </Alert>
                )}
                
                {currentUser?.credits < 2 ? (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    You need at least 2 credits to download this paper.
                  </Alert>
                ) : null}
                
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  startIcon={<DownloadIcon />}
                  onClick={handleDownload}
                  disabled={downloadLoading || currentUser?.credits < 2}
                >
                  {downloadLoading ? 'Downloading...' : 'Download'}
                </Button>
                
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                  File type: {paper.fileType.toUpperCase()}
                </Typography>
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                  Size: {(paper.fileSize / 1024 / 1024).toFixed(2)} MB
                </Typography>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent>
                <Typography variant="h6" component="h3" gutterBottom>
                  Paper Info
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    src={paper.uploadedBy?.avatar}
                    alt={paper.uploadedBy?.name}
                    sx={{ width: 32, height: 32, mr: 1 }}
                  />
                  <Typography variant="body2">
                    Uploaded by: {paper.uploadedBy?.name || 'Unknown'}
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 1 }} />
                
                <Typography variant="body2" color="textSecondary">
                  Upload Date: {formatDate(paper.createdAt)}
                </Typography>
                
                <Typography variant="body2" color="textSecondary">
                  Downloads: {paper.downloadCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default PaperDetail; 