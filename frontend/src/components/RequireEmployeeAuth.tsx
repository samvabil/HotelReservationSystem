import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { type RootState } from '../store/store'; 
import { Box, CircularProgress, Typography } from '@mui/material';

const RequireEmployeeAuth = ({ children }: { children: React.ReactElement }) => {
    const { isEmployeeAuthenticated } = useSelector((state: RootState) => state.employeeAuth);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!isEmployeeAuthenticated) {
            // Save the path they were trying to access so we can return after login
            const fullPath = location.pathname + location.search;
            sessionStorage.setItem('employeeRedirectPath', fullPath);
            
            navigate('/employee/login', { replace: true });
        }
    }, [isEmployeeAuthenticated, navigate, location]);

    if (!isEmployeeAuthenticated) {
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
                <Typography>Checking authentication...</Typography>
            </Box>
        );
    }

    return children;
};

export default RequireEmployeeAuth;
