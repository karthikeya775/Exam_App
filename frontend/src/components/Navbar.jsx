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
  Tooltip
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
    navigate('/profile');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/dashboard"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          Exam Paper Repository
        </Typography>

        {currentUser ? (
          <>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
              <Tooltip title="Search Papers">
                <Button
                  color="inherit"
                  startIcon={<SearchIcon />}
                  component={Link}
                  to="/search"
                >
                  Search
                </Button>
              </Tooltip>
              
              <Tooltip title="Upload Paper">
                <Button
                  color="inherit"
                  startIcon={<CloudUploadIcon />}
                  component={Link}
                  to="/upload"
                >
                  Upload
                </Button>
              </Tooltip>
              
              <Tooltip title="Your Credits">
                <Badge 
                  badgeContent={currentUser.credits} 
                  color="secondary"
                  sx={{ mr: 2 }}
                >
                  <Button color="inherit" component={Link} to="/profile">
                    Credits
                  </Button>
                </Badge>
              </Tooltip>
            </Box>

            <Tooltip title="Account">
              <IconButton
                onClick={handleMenu}
                color="inherit"
                size="small"
                sx={{ ml: 1 }}
                aria-controls="menu-appbar"
                aria-haspopup="true"
              >
                {currentUser.avatar ? (
                  <Avatar
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    sx={{ width: 32, height: 32 }}
                  />
                ) : (
                  <Avatar sx={{ width: 32, height: 32 }}>
                    {currentUser.name?.charAt(0) || 'U'}
                  </Avatar>
                )}
              </IconButton>
            </Tooltip>
            
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleProfile}>
                <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                Profile
              </MenuItem>
              <MenuItem onClick={() => { handleClose(); navigate('/dashboard'); }}>
                <DashboardIcon fontSize="small" sx={{ mr: 1 }} />
                Dashboard
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Button color="inherit" component={Link} to="/">
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 