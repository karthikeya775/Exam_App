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
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Description as DocIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { getQuestionPaperById, downloadQuestionPaper, deleteQuestionPaper } from '../services/questionPaperService';
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
  
  // Delete-related state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  
  useEffect(() => {
    const fetchPaper = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await getQuestionPaperById(id);
        setPaper(result.data);
        
        // Debug logs to inspect paper and currentUser data
        console.log('Paper data:', result.data);
        console.log('Paper uploadedBy:', result.data.uploadedBy);
        console.log('Current user:', currentUser);
        console.log('isUploader check would be:', 
          result.data && 
          currentUser && 
          result.data.uploadedBy && 
          (result.data.uploadedBy._id === currentUser._id || result.data.uploadedBy === currentUser._id)
        );
        
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
  
  // Handle delete confirmation dialog
  const openDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };
  
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };
  
  // Handle delete operation
  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      setDeleteError(null);
      
      await deleteQuestionPaper(id);
      
      setDeleteLoading(false);
      closeDeleteDialog();
      
      // Redirect after successful deletion
      navigate('/search', { 
        state: { notification: 'Question paper was successfully deleted' } 
      });
    } catch (error) {
      console.error('Delete error:', error);
      setDeleteError(error.error || 'Failed to delete paper');
      setDeleteLoading(false);
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
  
  // Check if current user is the uploader of this paper
  const isUploader = paper && currentUser && paper.uploadedBy && (
    // Check both _id and id properties to handle inconsistency in property naming
    (paper.uploadedBy._id === currentUser._id || paper.uploadedBy._id === currentUser.id) || 
    (paper.uploadedBy === currentUser._id || paper.uploadedBy === currentUser.id)
  );
  
  // Debug log for isUploader value
  console.log('Final isUploader value:', isUploader);
  console.log('Comparison check:', {
    'paper.uploadedBy._id': paper?.uploadedBy?._id,
    'currentUser._id': currentUser?._id,
    'currentUser.id': currentUser?.id,
    'Match?': paper?.uploadedBy?._id === currentUser?.id
  });
  
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        
        {/* Delete button - only shown if current user is the uploader */}
        {isUploader && (
          <Tooltip title="Delete this paper">
            <Button 
              variant="outlined" 
              color="error"
              startIcon={<DeleteIcon />}
              onClick={openDeleteDialog}
            >
              Delete
            </Button>
          </Tooltip>
        )}
      </Box>
      
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
            
            {/* Show uploader information */}
            {paper.uploadedBy && (
              <Box sx={{ mt: 3 }}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2" color="textSecondary">
                  Uploaded by: {paper.uploadedBy.name || 'Anonymous'} on {formatDate(paper.createdAt)}
                </Typography>
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
          </Grid>
        </Grid>
      </Paper>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this question paper? This action cannot be undone.
          </DialogContentText>
          {deleteError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {deleteError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            disabled={deleteLoading}
            variant="contained"
            startIcon={deleteLoading ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PaperDetail; 