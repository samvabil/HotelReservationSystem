import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container, IconButton, Menu, MenuItem, Avatar, Tooltip } from '@mui/material';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import { Link, useNavigate, useLocation } from 'react-router-dom'; 
import { useSelector, useDispatch } from 'react-redux';
import { type RootState } from '../store/store';
import { logout } from '../store/userAuthSlice';
import { useLogoutUserMutation } from '../services/userAuthApi'; 

// MAKE SURE THIS PORT MATCHES YOUR SPRING BOOT SERVER
const SPRING_BOOT_URL = "http://localhost:8080";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Get auth state for both user and employee
  const { user, isAuthenticated } = useSelector((state: RootState) => state.userAuth);
  const { isEmployeeAuthenticated } = useSelector((state: RootState) => state.employeeAuth);
  const [logoutApiCall] = useLogoutUserMutation();
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = async () => {
    handleCloseUserMenu();
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      window.location.reload();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // --- THIS IS THE FIX ---
  const handleLogin = () => {
    // 1. Save current location so we can return here later
    const fullPath = location.pathname + location.search;
    sessionStorage.setItem('redirectPath', fullPath);

    // 2. FORCE BROWSER REDIRECT (Do not use navigate)
    window.location.href = `${SPRING_BOOT_URL}/oauth2/authorization/google`;
  };

  return (
    <AppBar position="static">
      <Container maxWidth={false}>
        <Toolbar disableGutters>
          {/* LOGO */}
          <SportsEsportsIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1, color: 'secondary.main' }} />
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
              flexGrow: 1,
            }}
          >
            Level Up Lounge
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button 
                onClick={() => navigate('/book')}
                sx={{ my: 2, color: 'white', display: 'block' }}
            >
              Book A Room
            </Button>

            <Button 
                onClick={() => navigate('/account')}
                sx={{ my: 2, color: 'white', display: 'block' }}
            >
              My Account
            </Button>

            <Button
                onClick={() => {
                  if (isEmployeeAuthenticated) {
                    navigate("/employee/dashboard");
                  } else {
                    navigate("/employee/login");
                  }
                }}
                sx={{
                  my: 2,
                  color: "text.secondary",
                  fontSize: "0.85rem",
                  textTransform: "none",
                }}
              >
                Employee Portal
              </Button>

            {isAuthenticated && user ? (
              // LOGGED IN VIEW
              <Box sx={{ flexGrow: 0 }}>
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar alt={user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1)} src={user.auth?.avatarUrl} imgProps={{ referrerPolicy: "no-referrer" }} />
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                  keepMounted
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <MenuItem disabled>
                    <Typography textAlign="center">Hi, {user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1)}!</Typography>
                  </MenuItem>
                  <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/account'); }}>
                    <Typography textAlign="center">My Account</Typography>
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <Typography textAlign="center" color="error">Logout</Typography>
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              // LOGGED OUT VIEW
              <Button 
                // CRITICAL FIX: call handleLogin, NOT navigate('/login')
                onClick={handleLogin}
                variant="contained" 
                color="primary"
              >
                Sign In
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}