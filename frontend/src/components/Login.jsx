import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Container } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import SchoolIcon from '@mui/icons-material/School';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const { currentUser, loading, error, handleGoogleLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if user is already logged in
    if (currentUser && !loading) {
      navigate('/dashboard');
    }
  }, [currentUser, loading, navigate]);

  // Handle Google Sign-In response
  const onLoginSuccess = async (credentialResponse) => {
    if (credentialResponse.credential) {
      try {
        await handleGoogleLogin(credentialResponse.credential);
        navigate('/dashboard');
      } catch (error) {
        console.error('Login error:', error);
      }
    }
  };

  const onLoginError = () => {
    console.error('Google login failed');
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
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
      
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            p: 5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            borderRadius: 3,
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            height: 6, 
            background: '#1976d2' // Using the same blue color
          }} />
          
          <SchoolIcon sx={{ fontSize: 60, color: '#1976d2', mb: 2 }} />
          
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            fontWeight="bold"
            sx={{ color: '#1976d2' }}
          >
            Welcome Back
          </Typography>
          
          <Typography variant="body1" align="center" sx={{ mb: 4, color: '#546e7a' }}>
            Access a comprehensive collection of past exam papers for IIT ISM Dhanbad students
          </Typography>
          
          {error && (
            <Box sx={{ 
              p: 2, 
              mb: 3, 
              width: '100%', 
              bgcolor: 'rgba(244, 67, 54, 0.1)', 
              borderRadius: 1,
              color: '#d32f2f'
            }}>
              <Typography variant="body2" align="center">
                {error}
              </Typography>
            </Box>
          )}
          
          <Box sx={{ 
            p: 3, 
            mb: 3, 
            width: '100%', 
            bgcolor: 'rgba(25, 118, 210, 0.05)', 
            borderRadius: 2,
            border: '1px solid rgba(25, 118, 210, 0.1)'
          }}>
            <Typography variant="body1" align="center" fontWeight="medium" sx={{ color: '#1976d2', mb: 1 }}>
              Sign in with your IIT ISM Dhanbad account
            </Typography>
            <Typography variant="body2" align="center" sx={{ color: '#546e7a', mb: 3 }}>
              Only @iitism.ac.in email addresses are authorized
            </Typography>
            
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'center',
                margin: '0 auto',
                '& > div': {
                  width: '100% !important',
                  maxWidth: '300px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1) !important',
                  transition: 'transform 0.3s !important',
                  '&:hover': {
                    transform: 'translateY(-3px) !important'
                  }
                }
              }}
            >
              <GoogleLogin 
                onSuccess={onLoginSuccess}
                onError={onLoginError}
                theme="filled_blue"
                shape="pill"
                text="signin_with"
                size="large"
                width="300px"
                useOneTap
              />
            </Box>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            p: 2,
            borderRadius: 2,
            bgcolor: 'rgba(0, 0, 0, 0.02)'
          }}>
            <Box sx={{ 
              width: 40, 
              height: 40, 
              borderRadius: '50%', 
              bgcolor: 'rgba(25, 118, 210, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1976d2',
              fontWeight: 'bold'
            }}>
              ?
            </Box>
            <Typography variant="body2" sx={{ color: '#546e7a' }}>
              Need help? Contact the administrator at support@iitism.ac.in
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
