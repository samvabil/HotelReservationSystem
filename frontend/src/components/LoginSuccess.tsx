import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/userAuthSlice';
import { Box, CircularProgress } from '@mui/material';
import { useGetCurrentUserQuery } from '../services/userAuthApi'; 

/**
 * Component displayed after successful OAuth login.
 * <p>
 * Fetches the current user's data from the API and updates Redux state.
 * Redirects the user to the path stored in sessionStorage (from RequireAuth)
 * or to the home page if no redirect path exists.
 * Shows a loading spinner during the authentication process.
 * </p>
 *
 * @returns {JSX.Element} A loading spinner while processing login.
 */
const LoginSuccess = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: user, isError } = useGetCurrentUserQuery();

  useEffect(() => {
    if (user) {
      dispatch(setUser(user));
      const redirectPath = sessionStorage.getItem('redirectPath') || '/';
      navigate(redirectPath);
    } 
    if (isError) {
       navigate('/');
    }
  }, [user, isError, navigate, dispatch]);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress color="secondary" />
    </Box>
  );
};

export default LoginSuccess;