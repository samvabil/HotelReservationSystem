import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { type RootState } from '../store/store'; 
import { Box, CircularProgress, Typography } from '@mui/material';

// ⚠️ MAKE SURE THIS MATCHES YOUR SPRING BOOT PORT
const SPRING_BOOT_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

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
            window.location.href = `${SPRING_BOOT_URL}/oauth2/authorization/google`;
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