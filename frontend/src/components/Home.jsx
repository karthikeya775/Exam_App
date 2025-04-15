import React from 'react';
import { Container, Typography, Box, Button, Grid, Paper, Card, CardContent, CardMedia, Divider, Chip } from '@mui/material';
import { Link } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import SearchIcon from '@mui/icons-material/Search';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';

function Home() {
  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh' }}>
    {/* Hero Section */}
<Box 
  sx={{ 
    background: 'linear-gradient(135deg,rgb(32, 129, 226) 0%,rgb(65, 132, 209) 100%)',
    color: 'white',
    pt: { xs: 10, md: 12 }, 
    pb: { xs: 10, md: 12 },
    position: 'relative',
    overflow: 'hidden'
  }}
>
  {/* Decorative elements */}
  <Box sx={{ 
    position: 'absolute', 
    top: -100, 
    right: -100, 
    width: 300, 
    height: 300, 
    borderRadius: '50%', 
    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
  }} />
  <Box sx={{ 
    position: 'absolute', 
    bottom: -50, 
    left: -50, 
    width: 200, 
    height: 200, 
    borderRadius: '50%', 
    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
  }} />
  
  <Container maxWidth="lg">
    <Box sx={{ textAlign: 'center', maxWidth: 900, mx: 'auto' }}>
      <Typography 
        variant="h1" 
        component="h1" 
        fontWeight="bold" 
        gutterBottom
        sx={{ 
          fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
          letterSpacing: '-0.5px',
          textShadow: '0 2px 10px rgba(0,0,0,0.2)'
        }}
      >
        IIT ISM Dhanbad Exam Paper Repository
      </Typography>
      
      <Typography 
        variant="h5" 
        sx={{ 
          mb: 5, 
          opacity: 0.9,
          maxWidth: 700,
          mx: 'auto',
          lineHeight: 1.5
        }}
      >
        Your comprehensive resource for accessing, sharing, and mastering past examination papers
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        justifyContent: 'center',
        gap: 3,
        mt: 6
      }}>
        <Box sx={{ 
          p: 3, 
          bgcolor: 'rgba(255,255,255,0.1)', 
          borderRadius: 2,
          backdropFilter: 'blur(10px)',
          width: { xs: '100%', sm: 'calc(33% - 16px)' },
          transition: 'transform 0.3s',
          '&:hover': { transform: 'translateY(-5px)' }
        }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            2,500+ Papers
          </Typography>
          <Typography variant="body1">
            Comprehensive collection covering all departments and courses
          </Typography>
        </Box>
        
        <Box sx={{ 
          p: 3, 
          bgcolor: 'rgba(255,255,255,0.1)', 
          borderRadius: 2,
          backdropFilter: 'blur(10px)',
          width: { xs: '100%', sm: 'calc(33% - 16px)' },
          transition: 'transform 0.3s',
          '&:hover': { transform: 'translateY(-5px)' }
        }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            15 Departments
          </Typography>
          <Typography variant="body1">
            Papers from all engineering, science, and management disciplines
          </Typography>
        </Box>
        
        <Box sx={{ 
          p: 3, 
          bgcolor: 'rgba(255,255,255,0.1)', 
          borderRadius: 2,
          backdropFilter: 'blur(10px)',
          width: { xs: '100%', sm: 'calc(33% - 16px)' },
          transition: 'transform 0.3s',
          '&:hover': { transform: 'translateY(-5px)' }
        }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Exclusive Access
          </Typography>
          <Typography variant="body1">
            Designed specifically for IIT ISM Dhanbad students
          </Typography>
        </Box>
      </Box>
    </Box>
  </Container>
</Box>





 {/* Features Section */}
<Box sx={{ py: 8, bgcolor: '#f8f9fa' }}>
  <Container maxWidth="lg">
    <Typography variant="h3" component="h2" gutterBottom fontWeight="bold" textAlign="center" color="primary" sx={{ mb: 5 }}>
      Key Features
    </Typography>
    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
      {[
        { 
          icon: <SchoolIcon />, 
          title: "IIT ISM Exclusive", 
          description: "Secure access with your iitism.ac.in email. Repository designed specifically for IIT ISM Dhanbad students." 
        },
        { 
          icon: <SearchIcon />, 
          title: "Smart Search", 
          description: "Find exactly what you need with filters for subject, course, exam type, and year. Full-text search available." 
        },
        { 
          icon: <CloudUploadIcon />, 
          title: "Credit System", 
          description: "Earn credits by uploading papers and spend them to download. New users start with 10 credits." 
        }
      ].map((feature, index) => (
        <Paper 
          key={index}
          elevation={3} 
          sx={{ 
            p: 4, 
            width: '30%', // Set a fixed width for each box
            height: 300, // Fixed height for all boxes
            borderRadius: 2, 
            transition: 'transform 0.3s, box-shadow 0.3s', 
            '&:hover': { 
              transform: 'translateY(-5px)',
              boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
            },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            textAlign: 'center'
          }}
        >
          <Box sx={{ 
            fontSize: 60, 
            color: '#1976d2', 
            mb: 2,
            '& > svg': {
              fontSize: 'inherit'
            }
          }}>
            {feature.icon}
          </Box>
          <Typography variant="h5" component="h3" gutterBottom fontWeight="bold">
            {feature.title}
          </Typography>
          <Typography variant="body1" sx={{ flexGrow: 1, overflow: 'auto' }}>
            {feature.description}
          </Typography>
        </Paper>
      ))}
    </Box>
  </Container>
</Box>




      {/* About Section */}
      <Box sx={{ bgcolor: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" component="h2" gutterBottom fontWeight="bold" color="primary">
                About the Repository
              </Typography>
              <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', mb: 3 }}>
                The Exam Paper Repository is a comprehensive platform designed specifically for IIT ISM Dhanbad students to access, share, and study from past examination papers.
              </Typography>
              <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem' }}>
                Our platform features a credit system that encourages contribution - earn credits by uploading papers and spend them to download papers you need for your exam preparation.
              </Typography>
              <Box sx={{ mt: 4 }}>
                <Button 
                  component={Link} 
                  to="/upload" 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  startIcon={<CloudUploadIcon />}
                  sx={{ mr: 2, mb: 2 }}
                >
                  Upload Papers
                </Button>
                <Button 
                  component={Link} 
                  to="/search" 
                  variant="outlined" 
                  color="primary" 
                  size="large"
                  startIcon={<SearchIcon />}
                  sx={{ mb: 2 }}
                >
                  Search Papers
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                <CardMedia
                  component="img"
                  height="300"
                  image="/images/iitism_cover.jpg"
                  alt="IIT ISM Dhanbad Campus"
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div" fontWeight="bold">
                    IIT (ISM) Dhanbad
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    The Indian Institute of Technology (Indian School of Mines) Dhanbad is a premier institution known for its excellence in engineering education and research.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

 {/* How It Works Section */}
<Box sx={{ py: 8, bgcolor: '#f8f9fa' }}>
  <Container maxWidth="lg">
    <Typography variant="h3" component="h2" gutterBottom fontWeight="bold" textAlign="center" color="primary" sx={{ mb: 5 }}>
      How It Works
    </Typography>
    
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        justifyContent: 'center',
        gap: 3,
        maxWidth: 1200,
        mx: 'auto'
      }}>
        {[
          { number: 1, title: "Sign In", description: "Use your IIT ISM Dhanbad Google account to log in securely" },
          { number: 2, title: "Upload Papers", description: "Share exam papers and earn 5 credits for each upload" },
          { number: 3, title: "Search Papers", description: "Find papers by subject, course, exam type, or year" },
          { number: 4, title: "Download Papers", description: "Spend 2 credits to download the papers you need" }
        ].map((step) => (
          <Box 
            key={step.number}
            sx={{ 
              width: { xs: '100%', sm: 'calc(50% - 24px)', md: 'calc(25% - 24px)' },
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-10px)'
              }
            }}
          >
            <Paper 
              elevation={2} 
              sx={{ 
                p: 3, 
                height: 250, // Fixed exact height
                textAlign: 'center', 
                borderRadius: 2, 
                bgcolor: 'white',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
              }}
            >
              <Box sx={{ 
                width: 70, 
                height: 70, 
                borderRadius: '50%', 
                bgcolor: '#e3f2fd', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mb: 2,
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#1976d2'
              }}>
                {step.number}
              </Box>
              <Typography variant="h6" component="h3" gutterBottom fontWeight="bold">
                {step.title}
              </Typography>
              <Typography variant="body2">
                {step.description}
              </Typography>
            </Paper>
          </Box>
        ))}
      </Box>
    </Box>
  </Container>
</Box>




      {/* Paper Categories Section */}
      <Box sx={{ bgcolor: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" gutterBottom fontWeight="bold" textAlign="center" color="primary" sx={{ mb: 5 }}>
            Available Paper Categories
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            {['Mid-Semester Exams', 'End-Semester Exams', 'Quizzes', 'Assignments', 'Previous Year Papers', 'Sample Papers'].map((category, index) => (
              <Grid item xs={6} sm={4} md={2} key={index}>
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 2, 
                    textAlign: 'center', 
                    borderRadius: 2,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    transition: 'all 0.3s',
                    '&:hover': {
                      boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                      transform: 'translateY(-5px)',
                      bgcolor: '#f0f7ff'
                    }
                  }}
                >
                  <Typography variant="body1" fontWeight="medium">
                    {category}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Credit System Section */}
      <Box sx={{ bgcolor: '#1976d2', color: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" gutterBottom fontWeight="bold" textAlign="center" sx={{ mb: 5 }}>
            Credit System
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2, height: '100%', bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }}>
                <Typography variant="h2" component="div" fontWeight="bold" color="white">
                  +10
                </Typography>
                <Typography variant="h6" component="div" sx={{ mt: 2 }}>
                  New User Registration
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                  Start with 10 credits when you sign up
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2, height: '100%', bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }}>
                <Typography variant="h2" component="div" fontWeight="bold" color="white">
                  +5
                </Typography>
                <Typography variant="h6" component="div" sx={{ mt: 2 }}>
                  Upload a Paper
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                  Earn 5 credits for each paper you upload
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2, height: '100%', bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }}>
                <Typography variant="h2" component="div" fontWeight="bold" color="white">
                  -2
                </Typography>
                <Typography variant="h6" component="div" sx={{ mt: 2 }}>
                  Download a Paper
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                  Spend 2 credits to download a paper
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 10, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h3" component="h2" gutterBottom fontWeight="bold" color="primary">
            Ready to Get Started?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, maxWidth: 700, mx: 'auto' }}>
            Join our growing community of IIT ISM Dhanbad students who are sharing and accessing past exam papers to excel in their academics.
          </Typography>
          <Button 
            component={Link} 
            to="/login" 
            variant="contained" 
            color="primary" 
            size="large"
            sx={{ fontWeight: 'bold', px: 6, py: 1.5, fontSize: '1.1rem' }}
          >
            Sign in with Google
          </Button>
        </Container>
      </Box>
    </Box>
  );
}

export default Home;
