import { useContext } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Avatar,
  Divider,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Button
} from '@mui/material';
import {
  Upload as UploadIcon,
  Download as DownloadIcon,
  CreditCard as CreditIcon
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { currentUser, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!currentUser) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Please log in to view your profile
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/')}
            sx={{ mt: 2 }}
          >
            Go to Login
          </Button>
        </Paper>
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
      <Paper elevation={2} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            src={currentUser.avatar}
            alt={currentUser.name}
            sx={{ width: 80, height: 80, mr: 3 }}
          />
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {currentUser.name}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {currentUser.email}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Joined: {formatDate(currentUser.createdAt)}
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h5" component="h2" gutterBottom>
          Your Account
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <CreditIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h4" component="div">
                  {currentUser.credits}
                </Typography>
                <Typography variant="h6" color="textSecondary">
                  Credits
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Used to download papers
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <UploadIcon color="success" sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h4" component="div">
                  {currentUser.uploadCount}
                </Typography>
                <Typography variant="h6" color="textSecondary">
                  Uploads
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  +5 credits per upload
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <DownloadIcon color="error" sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h4" component="div">
                  {currentUser.downloadCount}
                </Typography>
                <Typography variant="h6" color="textSecondary">
                  Downloads
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  -2 credits per download
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<UploadIcon />}
            onClick={() => navigate('/upload')}
          >
            Upload New Papers
          </Button>
          <Button 
            variant="outlined"
            color="primary"
            onClick={() => navigate('/search')}
          >
            Browse Papers
          </Button>
        </Box>
        
        <Box sx={{ mt: 4 }}>
          <Typography variant="body2" color="textSecondary" paragraph>
            <strong>How credits work:</strong> You earn 5 credits for each paper you upload. 
            Downloading a paper costs 2 credits. New users start with 10 credits.
          </Typography>
          <Typography variant="body2" color="textSecondary">
            <strong>Need more credits?</strong> Upload more question papers to increase your credit balance.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile; 