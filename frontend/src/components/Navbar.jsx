import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box,
  Badge,
  Tooltip,
  Container
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  CloudUpload as CloudUploadIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  const handleProfile = () => {
    handleClose();
    console.log("hi!!!!!!")
    navigate('/profile');
    console.log("navigated to profile...")
  };

  // Handle title click based on authentication status
  const handleTitleClick = (e) => {
    if (currentUser) {
      e.preventDefault(); // Prevent default link behavior
      navigate('/dashboard');
    }
    // If not logged in, default link behavior will navigate to '/'
  };

  return (
    <AppBar position="sticky" sx={{ 
      background: 'linear-gradient(135deg,rgb(0, 0, 0) 0%,rgb(0, 0, 0) 100%)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }}>
      <Container maxWidth="lg">
        <Toolbar sx={{ px: { xs: 1, sm: 2 }, py: 1 }}>
          <Typography 
            variant="h5" 
            component={Link} 
            to={currentUser ? "/dashboard" : "/"} // Conditionally set destination
            onClick={handleTitleClick}
            sx={{ 
              flexGrow: 1, 
              textDecoration: 'none', 
              color: 'white',
              fontWeight: 700,
              letterSpacing: '0.5px',
              cursor: 'pointer'
            }}
          >
            Exam Paper Repository
          </Typography>

          {currentUser ? (
            <>
              <Button
                component={Link}
                to="/search"
                color="inherit"
                startIcon={<SearchIcon />}
                sx={{ 
                  mx: 1, 
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500
                }}
              >
                Search
              </Button>
              <Button
                component={Link}
                to="/upload"
                color="inherit"
                startIcon={<CloudUploadIcon />}
                sx={{ 
                  mx: 1, 
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500
                }}
              >
                Upload
              </Button>
              <Tooltip title={`Credits: ${currentUser.credits || 0}`}>
                <Button 
                  color="inherit" 
                  sx={{ 
                    mx: 1, 
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 500
                  }}
                >
                  Credits: {currentUser.credits || 0}
                </Button>
              </Tooltip>
              <IconButton
                onClick={handleMenu}
                color="inherit"
                size="large"
                sx={{ ml: 1 }}
              >
                {currentUser.avatar ? (
                  <Avatar 
                    src={currentUser.avatar} 
                    alt={currentUser.name}
                    sx={{ 
                      width: 40, 
                      height: 40,
                      border: '2px solid white' 
                    }}
                  />
                ) : (
                  <Avatar sx={{ 
                    width: 40, 
                    height: 40,
                    bgcolor: '#f50057',
                    border: '2px solid white',
                    fontWeight: 600
                  }}>
                    {currentUser.name?.charAt(0) || 'U'}
                  </Avatar>
                )}
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    borderRadius: 2,
                    minWidth: 180,
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <MenuItem onClick={handleProfile} sx={{ py: 1.5 }}>
                  <PersonIcon sx={{ mr: 2, color: '#1565c0' }} />
                  Profile
                </MenuItem>
                <MenuItem onClick={() => { handleClose(); navigate('/dashboard'); }} sx={{ py: 1.5 }}>
                  <DashboardIcon sx={{ mr: 2, color: '#1565c0' }} />
                  Dashboard
                </MenuItem>
                <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
                  <LogoutIcon sx={{ mr: 2, color: '#f44336' }} />
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button 
              component={Link} 
              to="/login" 
              variant="contained" 
              color="secondary"
              sx={{ 
                borderRadius: 2,
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                backgroundColor: '#f50057',
                '&:hover': {
                  backgroundColor: '#c51162'
                }
              }}
            >
              Login
            </Button>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
