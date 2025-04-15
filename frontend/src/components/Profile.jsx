import { useContext, useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Avatar,
  Grid,
  Card,
  Chip,
  CardContent,
  CircularProgress,
  Button,
  Divider,
  useTheme,
  LinearProgress,
  IconButton,
  Tooltip,
  Badge,
  Alert,
  Stack
} from '@mui/material';
import {
  Upload as UploadIcon,
  Download as DownloadIcon,
  CreditCard as CreditIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Description as DocIcon,
  ArrowForward as ArrowForwardIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getQuestionPapers } from '../services/questionPaperService';

const Profile = () => {
  const { currentUser, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const [userPapers, setUserPapers] = useState([]);
  const [papersLoading, setPapersLoading] = useState(true);
  const [papersError, setPapersError] = useState(null);
  const [showAllUploads, setShowAllUploads] = useState(false);

  useEffect(() => {
    const fetchUserPapers = async () => {
      if (!currentUser) return;
      
      try {
        setPapersLoading(true);
        setPapersError(null);
        
        // Fetch papers uploaded by the current user
        const result = await getQuestionPapers({ 
          uploadedBy: currentUser.id,
          limit: 20,
          sort: '-createdAt'
        });
        
        setUserPapers(result.data);
        setPapersLoading(false);
      } catch (error) {
        console.error('Error fetching user papers:', error);
        setPapersError('Failed to load your uploaded papers');
        setPapersLoading(false);
      }
    };
    
    fetchUserPapers();
  }, [currentUser]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} sx={{ color: '#673AB7' }} />
      </Box>
    );
  }

  if (!currentUser) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, textAlign: 'center' }}>
        <Paper sx={{ p: 4, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            Please log in to view your profile
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/')}
            sx={{ 
              mt: 2, 
              borderRadius: 2,
              backgroundColor: '#673AB7',
              px: 3,
              py: 1
            }}
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

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Hero Section with User Info and Quick Stats */}
      <Paper sx={{ 
        borderRadius: 3, 
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #f1f4f9 100%)',
        mb: 3
      }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center'
        }}>
          {/* Left section - Profile picture and basic info */}
          <Box sx={{ 
            p: 4, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            width: { xs: '100%', md: '25%' },
            borderRight: { md: '1px solid rgba(0,0,0,0.08)' }
          }}>
            <Avatar 
              src={currentUser.avatar} 
              alt={currentUser.name}
              sx={{ 
                width: 140, 
                height: 140, 
                mb: 3, 
                border: '4px solid #673AB7',
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
              }}
            />
            <Typography variant="h4" gutterBottom fontWeight="bold" align="center">
              {currentUser.name}
            </Typography>
            <Typography variant="body1" color="textSecondary" gutterBottom align="center">
              {currentUser.email}
            </Typography>
            <Chip 
              label={`Joined: ${formatDate(currentUser.createdAt)}`} 
              sx={{ 
                mt: 2, 
                py: 1,
                px: 2,
                bgcolor: 'rgba(103, 58, 183, 0.1)', 
                color: '#673AB7',
                fontWeight: 500,
                fontSize: '0.9rem'
              }} 
            />
            
            <Button
              variant="outlined"
              color="primary"
              sx={{ 
                mt: 4, 
                borderRadius: 2,
                px: 4,
                py: 1,
                borderColor: '#673AB7',
                color: '#673AB7',
                fontWeight: 600
              }}
            >
              Edit Profile
            </Button>
          </Box>
          
          {/* Right section - Quick stats */}
          <Box sx={{ 
            flex: 1, 
            p: 4,
            width: { xs: '100%', md: '75%' },
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight="bold">
                Your Activity
              </Typography>
              <Button
                color="primary"
                startIcon={<UploadIcon />}
                onClick={() => navigate('/upload')}
                variant="contained"
                sx={{ 
                  borderRadius: 2,
                  bgcolor: '#673AB7'
                }}
              >
                Upload Paper
              </Button>
            </Box>
            
            {/* Activity metrics in a row */}
            <Grid container spacing={3}>
              {/* Credits */}
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ 
                  borderRadius: 3, 
                  background: 'linear-gradient(135deg, #673AB7 0%, #9C27B0 100%)',
                  color: 'white',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                  height: '100%'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CreditIcon sx={{ mr: 1 }} />
                      <Typography variant="h6" fontWeight="bold">
                        Credits
                      </Typography>
                    </Box>
                    
                    <Typography variant="h3" fontWeight="bold">
                      {currentUser.credits}
                    </Typography>
                    
                    <Box sx={{ mt: 2 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min((currentUser.credits / 20) * 100, 100)} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: 'white'
                          }
                        }}
                      />
                    </Box>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      mt: 1
                    }}>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Available downloads:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {Math.floor(currentUser.credits / 2)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Uploads */}
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ 
                  borderRadius: 3, 
                  boxShadow: '0 6px 16px rgba(0,0,0,0.06)',
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                  border: '1px solid rgba(0,0,0,0.05)'
                }}>
                  <Box sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    right: 0, 
                    width: '40%', 
                    height: '100%',
                    bgcolor: 'rgba(76, 175, 80, 0.05)',
                    borderLeft: '1px dashed rgba(76, 175, 80, 0.2)'
                  }} />
                  
                  <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: '#4CAF50', mr: 2, width: 32, height: 32 }}>
                        <UploadIcon fontSize="small" />
                      </Avatar>
                      <Typography variant="h6" fontWeight="bold">
                        Uploads
                      </Typography>
                    </Box>
                    
                    <Typography variant="h3" fontWeight="bold" color="#4CAF50">
                      {currentUser.uploadCount}
                    </Typography>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      mt: 1,
                      color: '#4CAF50'
                    }}>
                      <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="body2" fontWeight="medium">
                        +{currentUser.uploadCount * 5} credits earned
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Downloads */}
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ 
                  borderRadius: 3, 
                  boxShadow: '0 6px 16px rgba(0,0,0,0.06)',
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                  border: '1px solid rgba(0,0,0,0.05)'
                }}>
                  <Box sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    right: 0, 
                    width: '40%', 
                    height: '100%',
                    bgcolor: 'rgba(33, 150, 243, 0.05)',
                    borderLeft: '1px dashed rgba(33, 150, 243, 0.2)'
                  }} />
                  
                  <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: '#2196F3', mr: 2, width: 32, height: 32 }}>
                        <DownloadIcon fontSize="small" />
                      </Avatar>
                      <Typography variant="h6" fontWeight="bold">
                        Downloads
                      </Typography>
                    </Box>
                    
                    <Typography variant="h3" fontWeight="bold" color="#2196F3">
                      {currentUser.downloadCount}
                    </Typography>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      mt: 1,
                      color: '#2196F3'
                    }}>
                      <Typography variant="body2" fontWeight="medium">
                        {currentUser.downloadCount * 2} credits spent
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            {/* How Credits Work */}
            <Box sx={{ 
              display: 'flex', 
              mt: 3, 
              p: 2, 
              borderRadius: 2,
              bgcolor: 'rgba(103, 58, 183, 0.05)',
              border: '1px dashed rgba(103, 58, 183, 0.2)'
            }}>
              <InfoIcon sx={{ color: '#673AB7', mr: 2 }} />
              <Box>
                <Typography variant="body2" fontWeight="medium" sx={{ color: '#673AB7' }}>
                  How Credits Work:
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Box component="span" sx={{ 
                      width: 6, 
                      height: 6, 
                      borderRadius: '50%', 
                      bgcolor: '#4CAF50', 
                      mr: 1,
                      display: 'inline-block' 
                    }}/>
                    Earn 5 credits for each upload
                  </Typography>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Box component="span" sx={{ 
                      width: 6, 
                      height: 6, 
                      borderRadius: '50%', 
                      bgcolor: '#2196F3', 
                      mr: 1,
                      display: 'inline-block' 
                    }}/>
                    Each download costs 2 credits
                  </Typography>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box component="span" sx={{ 
                      width: 6, 
                      height: 6, 
                      borderRadius: '50%', 
                      bgcolor: '#673AB7', 
                      mr: 1,
                      display: 'inline-block' 
                    }}/>
                    New users start with 10 credits
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>
      
      {/* Your Uploads Section */}
      <Paper sx={{ 
        borderRadius: 3, 
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <Box sx={{ 
          p: 3, 
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h5" fontWeight="bold">
              Your Uploads
            </Typography>
            <Chip 
              label={userPapers.length} 
              size="small" 
              sx={{ 
                ml: 2, 
                bgcolor: 'rgba(103, 58, 183, 0.1)', 
                color: '#673AB7',
                fontWeight: 'bold'
              }} 
            />
          </Box>
          {userPapers.length > 0 && (
            <Button
              variant="text"
              color="primary"
              onClick={() => setShowAllUploads(!showAllUploads)}
              endIcon={showAllUploads ? <ArrowForwardIcon sx={{ transform: 'rotate(180deg)' }} /> : <ArrowForwardIcon />}
              sx={{
                fontWeight: 'medium'
              }}
            >
              {showAllUploads ? 'Show Less' : 'View All'}
            </Button>
          )}
        </Box>
        
        {papersLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress size={40} sx={{ color: '#673AB7' }} />
          </Box>
        ) : papersError ? (
          <Box sx={{ p: 3 }}>
            <Alert severity="error">
              {papersError}
            </Alert>
          </Box>
        ) : userPapers.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 5, 
            px: 3,
          }}>
            <Box sx={{
              mx: 'auto',
              mb: 3,
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: 'rgba(103, 58, 183, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <UploadIcon sx={{ fontSize: 40, color: '#673AB7' }} />
            </Box>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              You haven't uploaded any papers yet
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
              Share your question papers with the community and earn credits for each upload.
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<UploadIcon />}
              onClick={() => navigate('/upload')}
              sx={{ 
                mt: 2, 
                borderRadius: 2,
                px: 4,
                py: 1.5,
                bgcolor: '#673AB7'
              }}
            >
              Upload Your First Paper
            </Button>
          </Box>
        ) : (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={2} justifyContent="center">
              {userPapers.slice(0, showAllUploads ? userPapers.length : 5).map((paper, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={paper._id}>
                  <Card sx={{ 
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s ease',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.15)'
                    }
                  }}>
                    <Box sx={{ 
                      p: 2, 
                      borderBottom: '1px solid rgba(0,0,0,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5
                    }}>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                        {getFileIcon(paper.fileType)}
                      </Avatar>
                      <Box sx={{ flex: 1, overflow: 'hidden' }}>
                        <Typography variant="subtitle1" fontWeight="bold" noWrap sx={{ mb: 0.5 }}>
                          {paper.title}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" noWrap>
                          {paper.examType.replace('-', ' ')} • {paper.year}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <CardContent sx={{ flex: 1, pt: 1.5 }}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                        <Chip 
                          label={paper.subject} 
                          size="small" 
                          sx={{ 
                            bgcolor: 'rgba(103, 58, 183, 0.1)',
                            color: theme.palette.primary.main
                          }} 
                        />
                      </Box>
                      
                      <Box sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mt: 'auto',
                        pt: 1
                      }}>
                        <Typography variant="caption" color="textSecondary">
                          Uploaded: {new Date(paper.createdAt).toLocaleDateString()}
                        </Typography>
                        <Chip 
                          label={`+5 credits`} 
                          size="small"
                          sx={{ 
                            bgcolor: 'rgba(76, 175, 80, 0.1)',
                            color: '#4CAF50',
                            fontWeight: 'medium'
                          }}
                        />
                      </Box>
                    </CardContent>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      borderTop: '1px solid rgba(0,0,0,0.08)'
                    }}>
                      <Button 
                        size="small" 
                        fullWidth
                        onClick={() => navigate(`/papers/${paper._id}`)}
                        sx={{ 
                          py: 1.5,
                          color: theme.palette.primary.main,
                          fontWeight: 'medium'
                        }}
                      >
                        View Details
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
            
            {userPapers.length > 5 && !showAllUploads && (
              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setShowAllUploads(true)}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    py: 1,
                    fontWeight: 'medium'
                  }}
                >
                  View All {userPapers.length} Uploads
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Profile;
