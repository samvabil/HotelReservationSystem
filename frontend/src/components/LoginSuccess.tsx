import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/userAuthSlice';
import { Box, CircularProgress } from '@mui/material';
import { useGetCurrentUserQuery } from '../services/userAuthApi'; 

const LoginSuccess = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: user, isError } = useGetCurrentUserQuery();

  useEffect(() => {
    if (user) {
      dispatch(setUser(user));
      const redirectPath = sessionStorage.getItem('redirectPath') || '/';
      sessionStorage.removeItem('redirectPath');
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