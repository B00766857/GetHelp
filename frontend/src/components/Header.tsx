import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import MicIcon from '@mui/icons-material/Mic';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AppBar position="static">
      <Toolbar>
        <MicIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          GetHelp Demo
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            color="inherit"
            onClick={() => navigate('/')}
            variant={location.pathname === '/' ? 'outlined' : 'text'}
          >
            Voice Assistant
          </Button>
          <Button
            color="inherit"
            onClick={() => navigate('/dashboard')}
            variant={location.pathname === '/dashboard' ? 'outlined' : 'text'}
          >
            Dashboard
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;