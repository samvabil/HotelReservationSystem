import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container, IconButton, Menu, MenuItem, Avatar, Tooltip } from '@mui/material';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import { Link, useNavigate, useLocation } from 'react-router-dom'; 
import { useSelector, useDispatch } from 'react-redux';
import { type RootState } from '../store/store';

// --- USER AUTH IMPORTS ---
import { logout } from '../store/userAuthSlice';
import { useLogoutUserMutation } from '../services/userAuthApi'; 

// --- EMPLOYEE AUTH IMPORTS ---
import { clearEmployee } from '../store/employeeAuthSlice';
import { useLogoutEmployeeMutation } from '../services/employeeAuthApi';

import BadgeIcon from "@mui/icons-material/Badge";

// MAKE SURE THIS PORT MATCHES YOUR SPRING BOOT SERVER
const SPRING_BOOT_URL = import.meta.env.VITE_API_URL;

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  // 1. Get Auth State
  const { user, isAuthenticated } = useSelector((state: RootState) => state.userAuth);
  const { isEmployeeAuthenticated, employee } = useSelector((state: RootState) => state.employeeAuth);
  
  // 2. Logout Mutations
  const [logoutUserApi] = useLogoutUserMutation();
  const [logoutEmployeeApi] = useLogoutEmployeeMutation();

  // 3. Menu States
  const [anchorElSignIn, setAnchorElSignIn] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const isSignInOpen = Boolean(anchorElSignIn);
  const isUserMenuOpen = Boolean(anchorElUser);

  // --- HANDLERS: SIGN IN MENU ---
  const handleOpenSignIn = (event: React.MouseEvent<HTMLElement>) => setAnchorElSignIn(event.currentTarget);
  const handleCloseSignIn = () => setAnchorElSignIn(null);

  const handleEmployeeLoginClick = () => {
    handleCloseSignIn();
    navigate('/employee/login');
  };

  const handleLogin = () => {
    handleCloseSignIn();
    const fullPath = location.pathname + location.search;
    sessionStorage.setItem('redirectPath', fullPath);
    window.location.href = `${SPRING_BOOT_URL}/oauth2/authorization/google`;
  };

  // --- HANDLERS: PROFILE MENU ---
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  // --- HANDLER: LOGOUT (Dynamic) ---
  const handleLogout = async () => {
    handleCloseUserMenu();

    // A. EMPLOYEE LOGOUT
    if (isEmployeeAuthenticated) {
      try {
        await logoutEmployeeApi().unwrap();
      } catch (err) {
        console.error("Employee logout failed", err);
      } finally {
        dispatch(clearEmployee());
        navigate('/employee/login');
      }
    } 
    // B. USER LOGOUT
    else if (isAuthenticated) {
      try {
        await logoutUserApi().unwrap();
      } catch (err) {
        console.error("User logout failed", err);
      } finally {
        dispatch(logout());
        // Reloading ensures all states/caches are clean for the next user
        window.location.reload(); 
      }
    }
  };

  // Helper for Display Logic
  const getProfileSrc = () => {
    if (isAuthenticated && user) return user.auth?.avatarUrl;
    return undefined;
  };

  const getProfileName = () => {
      if (isEmployeeAuthenticated) return `Staff: ${employee?.employeeId || 'Employee'}`;
      if (isAuthenticated && user) return user.firstName;
      return "User";
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
            
            {/* 1. USER LINKS */}
            {isAuthenticated && !isEmployeeAuthenticated && (
                <>
                    <Button onClick={() => navigate('/book')} sx={{ my: 2, color: 'white', display: 'block' }}>
                        Book A Room
                    </Button>
                    <Button onClick={() => navigate('/account')} sx={{ my: 2, color: 'white', display: 'block' }}>
                        My Reservations
                    </Button>
                </>
            )}

            {/* 2. EMPLOYEE LINKS */}
            {isEmployeeAuthenticated && (
                <>
                    <Button onClick={() => navigate('/employee/reservations')} sx={{ my: 2, color: 'white', display: 'block' }}>
                        Manage Reservations
                    </Button>
                    <Button onClick={() => navigate('/employee/admin/rooms')} sx={{ my: 2, color: 'white', display: 'block' }}>
                        Manage Rooms
                    </Button>
                    <Button onClick={() => navigate('/employee/admin/room-types')} sx={{ my: 2, color: 'white', display: 'block' }}>
                        Manage Room Types
                    </Button>
                </>
            )}

            {/* 3. RIGHT SIDE: PROFILE OR SIGN IN */}
            {(isAuthenticated || isEmployeeAuthenticated) ? (
              // LOGGED IN VIEW: Clickable Profile Menu
              <Box sx={{ flexGrow: 0 }}>
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}> 
                    {isEmployeeAuthenticated ? (
                      <Avatar alt={getProfileName()}>
                        <BadgeIcon />
                      </Avatar>
                    ) : (
                      <Avatar
                        alt={getProfileName()}
                        src={getProfileSrc()}
                        imgProps={{ referrerPolicy: "no-referrer" }}
                      />
                    )}
                  </IconButton>
                </Tooltip>
                
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                  keepMounted
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  open={isUserMenuOpen}
                  onClose={handleCloseUserMenu}
                >

                  <MenuItem onClick={handleLogout}>
                    <Typography textAlign="center" color="error">Logout</Typography>
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              // LOGGED OUT VIEW: Hover Menu for Sign In
              <Box onMouseLeave={handleCloseSignIn}>
                <Button 
                    onMouseEnter={handleOpenSignIn}
                    aria-controls={isSignInOpen ? 'sign-in-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={isSignInOpen ? 'true' : undefined}
                    variant="contained" 
                    color="primary"
                >
                    Sign In
                </Button>
                
                <Menu
                    id="sign-in-menu"
                    anchorEl={anchorElSignIn}
                    open={isSignInOpen}
                    onClose={handleCloseSignIn}
                    MenuListProps={{
                        onMouseLeave: handleCloseSignIn,
                        sx: { pointerEvents: 'auto' }
                    }}
                    disableRestoreFocus
                    sx={{ pointerEvents: 'none' }} 
                    PaperProps={{ sx: { pointerEvents: 'auto' } }}
                >
                    <MenuItem onClick={handleLogin}>
                        Guest Sign In (User/OAuth)
                    </MenuItem>
                    <MenuItem onClick={handleEmployeeLoginClick}>
                        Employee Sign In
                    </MenuItem>
                </Menu>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}