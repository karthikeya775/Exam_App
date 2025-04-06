import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Paper, Container } from '@mui/material';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const { currentUser, loading, error, handleGoogleLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if user is already logged in
    if (currentUser && !loading) {
      navigate('/dashboard');
    }
  }, [currentUser, loading, navigate]);

  // Initialize Google Sign-In when component mounts
  useEffect(() => {
    // Load the Google API script
    const loadGoogleScript = () => {
      // Check if the script already exists
      if (document.querySelector('script[src*="accounts.google.com/gsi/client"]')) {
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      
      script.onload = initializeGoogleSignIn;
    };
    
    // Initialize Google Sign-In button
    const initializeGoogleSignIn = () => {
      if (!window.google) return;
      
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      
      window.google.accounts.id.renderButton(
        document.getElementById('googleSignInButton'),
        { 
          theme: 'outline', 
          size: 'large',
          width: 280,
          text: 'signin_with'
        }
      );
    };
    
    loadGoogleScript();
    
    return () => {
      // Clean up
      const scriptTag = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
      if (scriptTag) {
        scriptTag.remove();
      }
    };
  }, []);

  // Handle Google Sign-In response
  const handleCredentialResponse = async (response) => {
    if (response.credential) {
      try {
        await handleGoogleLogin(response.credential);
        navigate('/dashboard');
      } catch (error) {
        console.error('Login error:', error);
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Exam Paper Repository
          </Typography>
          
          <Typography variant="body1" align="center" sx={{ mb: 4 }}>
            Access a collection of past exam papers for IIT ISM Dhanbad students
          </Typography>
          
          {error && (
            <Typography variant="body2" color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          
          <Typography variant="body2" sx={{ mb: 3 }}>
            Sign in with your IIT ISM Dhanbad account (@iitism.ac.in)
          </Typography>
          
          <Box id="googleSignInButton" sx={{ mb: 2 }}></Box>
          
          <Typography variant="caption" align="center" sx={{ mt: 2 }}>
            *Only IIT ISM Dhanbad email accounts are authorized
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 