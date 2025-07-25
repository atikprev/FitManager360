import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge,
  Tooltip,
  Container,
} from '@mui/material';
  Menu as MenuIcon,
  Dashboard,
  FitnessCenter,
  Chat,
  Person,
  Settings,
  Home,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';

const Navbar = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user, logout } = useAuth();
  const { connected, onlineUsers } = useSocket();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/login');
  };

  const handleNavigate = (path) => {
    navigate(path);
    handleClose();
  };

  // Don't show navbar on login/register pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  // Don't show navbar if user is not logged in
  if (!user) {
    return null;
  }

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <Dashboard />, key: 'dashboard' },
    { path: '/routines', label: 'Rutinas', icon: <FitnessCenter />, key: 'routines' },
    { path: '/chat', label: 'Chat', icon: <Chat />, key: 'chat', badge: connected ? onlineUsers.length : 0 },
  ];

  return (
    <AppBar 
      position="static" 
      sx={{ 
        backgroundColor: 'white',
        borderBottom: '1px solid #e0e0e0',
        color: 'text.primary',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar sx={{ minHeight: 64, px: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
            <FitnessCenter sx={{ mr: 1, fontSize: 28, color: 'primary.main' }} />
            <Typography 
              variant="h5" 
              component="div" 
              sx={{ 
                fontWeight: 700,
                color: 'primary.main',
                cursor: 'pointer',
              }}
              onClick={() => navigate('/')}
            >
              FitManager360
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
            {navItems.map((item) => (
              <Button
                key={item.key}
                startIcon={item.icon}
                onClick={() => handleNavigate(item.path)}
                variant={isActive(item.path) ? 'contained' : 'text'}
                sx={{
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  fontWeight: 600,
                  color: isActive(item.path) ? 'white' : 'text.primary',
                  backgroundColor: isActive(item.path) ? 'primary.main' : 'transparent',
                  '&:hover': {
                    backgroundColor: isActive(item.path) ? 'primary.dark' : 'grey.100',
                  },
                  display: { xs: 'none', sm: 'flex' }
                }}
              >
                {item.badge !== undefined ? (
                  <Badge
                    badgeContent={item.badge}
                    color="error"
                    max={99}
                    sx={{
                      '& .MuiBadge-badge': {
                        backgroundColor: '#ff4444',
                        color: 'white',
                        fontWeight: 600,
                      }
                    }}
                  >
                    {item.label}
                  </Badge>
                ) : (
                  item.label
                )}
              </Button>
            ))}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Notificaciones" arrow>
              <IconButton 
                sx={{ 
                  color: 'text.primary',
                  '&:hover': {
                    backgroundColor: 'grey.100',
                  }
                }}
              >
                <Badge badgeContent={0} color="error">
                  <NotificationsNone />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Perfil de usuario" arrow>
              <IconButton
                size="large"
                onClick={handleMenu}
                sx={{
                  ml: 1,
                  '&:hover': {
                    backgroundColor: 'grey.100',
                  }
                }}
              >
                <Avatar
                  sx={{ 
                    width: 36, 
                    height: 36,
                    backgroundColor: 'primary.main',
                    fontSize: '1rem',
                    fontWeight: 600,
                  }}
                  src={user?.profile?.avatar}
                >
                  {user?.username?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 200,
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  border: '1px solid #e0e0e0',
                }
              }}
            >
              <Box sx={{ px: 3, py: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {user?.username}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
              
              <MenuItem onClick={() => handleNavigate('/profile')} sx={{ px: 3, py: 1.5 }}>
                <Person sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Mi Perfil
                </Typography>
              </MenuItem>
              
              <Divider />
              
              <MenuItem 
                onClick={handleLogout}
                sx={{
                  px: 3,
                  py: 1.5,
                  color: 'error.main',
                  '&:hover': {
                    backgroundColor: 'error.50',
                  }
                }}
              >
                <Logout sx={{ mr: 2 }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Cerrar Sesión
                </Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;