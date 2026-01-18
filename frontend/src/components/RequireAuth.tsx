import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { type RootState } from '../store/store'; 
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * The base URL for the Spring Boot backend API.
 * Reads from environment variable VITE_API_URL or defaults to localhost:8080.
 */
const SPRING_BOOT_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Route protection component that requires guest user authentication.
 * <p>
 * If the user is not authenticated, redirects to Google OAuth login.
 * The current path is saved to sessionStorage for redirect after login.
 * Shows a loading spinner during the authentication check and redirect.
 * </p>
 *
 * @param {Object} props - Component props.
 * @param {React.ReactElement} props.children - The protected component to render when authenticated.
 * @returns {JSX.Element} Either the protected children or a loading/redirect screen.
 */
const RequireAuth = ({ children }: { children: React.ReactElement }) => {
    // 1. Check your Redux store to see if the user is logged in
    const { isAuthenticated } = useSelector((state: RootState) => state.userAuth);
    
    // 2. Get the current URL (e.g., "/checkout/101")
    const location = useLocation();

    useEffect(() => {
        // 3. If they are NOT logged in, start the redirect process
        if (!isAuthenticated) {
            // Save the current page to storage so we can return here later
            const fullPath = location.pathname + location.search;
            sessionStorage.setItem('redirectPath', fullPath);

            // Force the browser to go to your Backend Google Login URL
            window.location.href = `${SPRING_BOOT_URL}/api/oauth2/authorization/google`;
        }
    }, [isAuthenticated, location]);

    // 4. While we are deciding (or redirecting), show a loading spinner
    // This prevents the protected content from flashing briefly
    if (!isAuthenticated) {
        return (
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '50vh', 
                gap: 2 
            }}>
                <CircularProgress size={60} />
                <Typography>Redirecting to Secure Login...</Typography>
            </Box>
        );
    }

    // 5. If they ARE authenticated, simply render the page they asked for
    return children;
};

export default RequireAuth;