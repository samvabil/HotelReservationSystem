import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'; // A controller icon
import { Link, useNavigate } from 'react-router-dom';

// Mock state for now - we will connect this to Redux later
const isAuthenticated = false; 

/**
 * The main navigation bar component for the application.
 *
 * This component renders the top header using Material UI's `AppBar`. It includes:
 * - The "Level Up Lounge" logo and title, which link back to the homepage.
 * - Primary navigation links (e.g., "Book A Room").
 * - User authentication actions, displaying either a "Sign In" button or a "My Account" button based on the `isAuthenticated` status.
 *
 * It utilizes `react-router-dom`'s `useNavigate` and `Link` for client-side routing.
 *
 * @component
 * @returns {JSX.Element} The rendered application bar.
 */
export default function Navbar() {
  const navigate = useNavigate();

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

          {/* NAVIGATION LINKS */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
                onClick={() => navigate('/book')}
                sx={{ my: 2, color: 'white', display: 'block' }}
            >
              Book A Room
            </Button>

            {isAuthenticated ? (
              <Button 
                onClick={() => navigate('/account')}
                variant="outlined" 
                color="secondary"
              >
                My Account
              </Button>
            ) : (
              <Button 
                onClick={() => navigate('/login')}
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