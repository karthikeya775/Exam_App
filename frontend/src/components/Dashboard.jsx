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
  Divider,
  IconButton,
  Skeleton,
  useTheme,
  alpha,
  Tooltip,
  Fade,
  Zoom
} from '@mui/material';
import { 
  Download as DownloadIcon,
  Info as InfoIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Description as DocIcon,
  Description as DescriptionIcon,
  Search as SearchIcon,
  CloudUpload as UploadIcon,
  School as SchoolIcon,
  AccessTime as TimeIcon,
  TrendingUp as TrendingIcon
} from '@mui/icons-material';
import { getQuestionPapers, downloadQuestionPaper } from '../services/questionPaperService';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [recentPapers, setRecentPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();

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
        return <PdfIcon fontSize="large" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <ImageIcon fontSize="large" />;
      case 'doc':
      case 'docx':
        return <DocIcon fontSize="large" />;
      default:
        return <DescriptionIcon fontSize="large" />;
    }
  };

  const getFileColor = (fileType) => {
    switch(fileType) {
      case 'pdf':
        return '#f44336';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return '#2196f3';
      case 'doc':
      case 'docx':
        return '#1976d2';
      default:
        return '#757575';
    }
  };

  const getExamTypeColor = (examType) => {
    switch(examType.toLowerCase()) {
      case 'mid-semester':
        return theme.palette.info.main;
      case 'end-semester':
        return theme.palette.error.main;
      case 'quiz':
        return theme.palette.warning.main;
      case 'assignment':
        return theme.palette.success.main;
      default:
        return theme.palette.primary.main;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: theme.palette.mode === 'dark' 
        ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' 
        : 'linear-gradient(145deg, #f6f9fc 0%, #edf1f7 50%, #e3e8f0 100%)',
      pt: 4, 
      pb: 8,
      overflow: 'hidden'
    }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Zoom in={true} timeout={800}>
          <Paper 
            elevation={6} 
            sx={{ 
              borderRadius: 4,
              overflow: 'hidden',
              position: 'relative',
              mb: 6,
              backgroundImage: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
              color: 'white',
              p: 0,
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                boxShadow: '0 20px 30px rgba(0,0,0,0.1)',
                transform: 'translateY(-5px)'
              }
            }}
          >
            <Box sx={{ 
              position: 'absolute', 
              top: 0, 
              right: 0, 
              width: '40%', 
              height: '100%',
              opacity: 0.15,
              display: { xs: 'none', md: 'block' }
            }}>
              <SchoolIcon sx={{ 
                fontSize: 400, 
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                transform: 'rotate(15deg)'
              }} />
            </Box>

            {/* Decorative elements */}
            <Box sx={{ 
              position: 'absolute',
              bottom: '-20px',
              left: '-20px',
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.1)',
              zIndex: 0
            }} />
            
            <Box sx={{ 
              position: 'absolute',
              top: '20px',
              right: '30%',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.1)',
              zIndex: 0
            }} />
            
            <Box sx={{ p: { xs: 4, md: 6 }, position: 'relative', zIndex: 1 }}>
              <Typography 
                variant="h3" 
                component="h1" 
                gutterBottom 
                sx={{ 
                  fontWeight: 800,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                  mb: 3,
                  background: 'linear-gradient(to right, #ffffff, #e0e0e0)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                IIT ISM Dhanbad<br />Exam Paper Repository
              </Typography>
              
              <Typography variant="h6" sx={{ mb: 4, maxWidth: '80%', fontWeight: 300, lineHeight: 1.6 }}>
                Access, share, and contribute to our growing collection of exam papers to help you prepare better.
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                flexWrap: 'wrap',
                mt: 4
              }}>
                <Button 
                  variant="contained" 
                  size="large"
                  startIcon={<SearchIcon />}
                  onClick={() => navigate('/search')}
                  sx={{ 
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    backgroundColor: 'white',
                    color: '#8b5cf6',
                    fontWeight: 600,
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                    '&:hover': {
                      backgroundColor: alpha('#ffffff', 0.9),
                      transform: 'translateY(-3px)',
                      boxShadow: '0 6px 15px rgba(0,0,0,0.15)',
                    }
                  }}
                >
                  Search Papers
                </Button>
                <Button 
                  variant="outlined" 
                  size="large"
                  startIcon={<UploadIcon />}
                  onClick={() => navigate('/upload')}
                  sx={{ 
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    borderColor: 'white',
                    color: 'white',
                    fontWeight: 600,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: alpha('#ffffff', 0.1),
                      transform: 'translateY(-3px)',
                    }
                  }}
                >
                  Upload Paper
                </Button>
              </Box>
            </Box>
          </Paper>
        </Zoom>

        {/* Recent Papers Section */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 4
          }}>
            <Typography 
              variant="h4" 
              component="h2" 
              sx={{ 
                fontWeight: 700,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -8,
                  left: 0,
                  width: 60,
                  height: 4,
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: 2
                }
              }}
            >
              <TimeIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              Recently Added Papers
            </Typography>
            
            {recentPapers.length > 0 && (
              <Button 
                variant="text" 
                color="primary"
                endIcon={<TrendingIcon />}
                onClick={() => navigate('/search')}
                sx={{ 
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateX(5px)'
                  }
                }}
              >
                View All
              </Button>
            )}
          </Box>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 4,
                borderRadius: 2
              }}
            >
              {error}
            </Alert>
          )}

          {loading ? (
            <Grid container spacing={3}>
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item}>
                  <Paper sx={{ 
                    borderRadius: 3, 
                    overflow: 'hidden',
                    height: '100%',
                    boxShadow: theme.shadows[2]
                  }}>
                    <Skeleton variant="rectangular" height={60} />
                    <Box sx={{ p: 2 }}>
                      <Skeleton variant="text" height={40} />
                      <Skeleton variant="text" />
                      <Box sx={{ display: 'flex', gap: 1, my: 2 }}>
                        <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 4 }} />
                        <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 4 }} />
                      </Box>
                      <Skeleton variant="text" height={80} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
                        <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Grid container spacing={3}>
              {recentPapers.length > 0 ? (
                recentPapers.map((paper, index) => (
                  <Fade in={true} timeout={500 + index * 100} key={paper._id}>
                    <Grid item xs={12} sm={6} md={4}>
                      <Paper sx={{ 
                        borderRadius: 3, 
                        overflow: 'hidden',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: theme.shadows[10],
                        },
                        boxShadow: theme.shadows[3],
                        border: `1px solid ${alpha(theme.palette.divider, 0.05)}`
                      }}>
                        <Box sx={{ 
                          p: 2, 
                          display: 'flex', 
                          alignItems: 'center',
                          backgroundColor: alpha(getFileColor(paper.fileType), 0.1),
                          borderBottom: `1px solid ${alpha(getFileColor(paper.fileType), 0.2)}`
                        }}>
                          <Box sx={{ 
                            color: getFileColor(paper.fileType),
                            mr: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            backgroundColor: alpha(getFileColor(paper.fileType), 0.1)
                          }}>
                            {getFileIcon(paper.fileType)}
                          </Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {paper.fileType.toUpperCase()} File
                          </Typography>
                        </Box>
                        
                        <CardContent sx={{ flexGrow: 1, p: 3 }}>
                          <Typography 
                            variant="h6" 
                            component="h3" 
                            gutterBottom
                            sx={{ 
                              fontWeight: 700,
                              lineHeight: 1.4,
                              position: 'relative',
                              '&:hover': {
                                color: theme.palette.primary.main
                              }
                            }}
                          >
                            {paper.title.length > 40 
                              ? paper.title.substring(0, 40) + '...' 
                              : paper.title}
                          </Typography>
                          
                          <Typography 
                            variant="body2" 
                            color="textSecondary" 
                            sx={{ 
                              mb: 2,
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <Box component="span" sx={{ 
                              width: 8, 
                              height: 8, 
                              borderRadius: '50%', 
                              backgroundColor: theme.palette.text.secondary,
                              display: 'inline-block',
                              mr: 1
                            }} />
                            {paper.subject}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', my: 2 }}>
                            <Tooltip title={`Exam Type: ${paper.examType.replace('-', ' ')}`} arrow>
                              <Chip 
                                label={paper.examType.replace('-', ' ')} 
                                size="small" 
                                sx={{ 
                                  fontWeight: 600,
                                  backgroundColor: alpha(getExamTypeColor(paper.examType), 0.1),
                                  color: getExamTypeColor(paper.examType),
                                  borderRadius: 1,
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    backgroundColor: alpha(getExamTypeColor(paper.examType), 0.2),
                                  }
                                }} 
                              />
                            </Tooltip>
                            <Tooltip title={`Year: ${paper.year}`} arrow>
                              <Chip 
                                label={paper.year.toString()} 
                                size="small" 
                                sx={{ 
                                  fontWeight: 600,
                                  backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                                  color: theme.palette.secondary.main,
                                  borderRadius: 1,
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    backgroundColor: alpha(theme.palette.secondary.main, 0.2),
                                  }
                                }} 
                              />
                            </Tooltip>
                          </Box>
                          
                          {paper.description && (
                            <Typography 
                              variant="body2" 
                              color="textSecondary"
                              sx={{ 
                                mt: 2,
                                backgroundColor: alpha(theme.palette.background.default, 0.5),
                                p: 1.5,
                                borderRadius: 1,
                                borderLeft: `3px solid ${theme.palette.divider}`
                              }}
                            >
                              {paper.description.length > 80 
                                ? paper.description.substring(0, 80) + '...' 
                                : paper.description}
                            </Typography>
                          )}
                          
                          {paper.createdAt && (
                            <Typography 
                              variant="caption"
                              sx={{ 
                                display: 'flex',
                                alignItems: 'center',
                                mt: 2,
                                color: theme.palette.text.secondary,
                                opacity: 0.7
                              }}
                            >
                              <TimeIcon fontSize="small" sx={{ mr: 0.5, fontSize: 14 }} />
                              Added: {formatDate(paper.createdAt)}
                            </Typography>
                          )}
                        </CardContent>
                        
                        <CardActions sx={{ 
                          justifyContent: 'space-between', 
                          p: 2,
                          borderTop: `1px solid ${theme.palette.divider}`
                        }}>
                          <Button
                            variant="text"
                            startIcon={<InfoIcon />}
                            onClick={() => navigate(`/papers/${paper._id}`)}
                            sx={{ 
                              fontWeight: 600,
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                transform: 'translateX(3px)'
                              }
                            }}
                          >
                            Details
                          </Button>
                          <Button
                            variant="contained"
                            startIcon={<DownloadIcon />}
                            onClick={() => handleDownload(paper._id)}
                            sx={{ 
                              fontWeight: 600,
                              borderRadius: 2,
                              boxShadow: 'none',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                              }
                            }}
                          >
                            Download
                          </Button>
                        </CardActions>
                      </Paper>
                    </Grid>
                  </Fade>
                ))
              ) : (
                <Grid item xs={12}>
                  <Paper sx={{ 
                    p: 4, 
                    textAlign: 'center',
                    borderRadius: 3,
                    backgroundColor: alpha(theme.palette.info.main, 0.05),
                    border: `1px dashed ${alpha(theme.palette.info.main, 0.3)}`
                  }}>
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      No papers have been added yet
                    </Typography>
                    <Button 
                      variant="contained" 
                      color="primary"
                      startIcon={<UploadIcon />}
                      onClick={() => navigate('/upload')}
                      sx={{ 
                        mt: 2, 
                        fontWeight: 600,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                        }
                      }}
                    >
                      Be the first to upload
                    </Button>
                  </Paper>
                </Grid>
              )}
            </Grid>
          )}
          
          {recentPapers.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
              <Button 
                variant="contained"
                color="primary"
                size="large"
                onClick={() => navigate('/search')}
                sx={{ 
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  backgroundImage: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                  }
                }}
              >
                View All Papers
              </Button>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default Dashboard;
