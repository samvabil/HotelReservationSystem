import { ThemeProvider, CssBaseline, Box, CircularProgress } from "@mui/material";
import { theme } from "./theme";
import Navbar from "./components/Navbar";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Book from "./pages/Book"
import LoginSuccess from "./components/LoginSuccess";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "./store/userAuthSlice";
import { useGetCurrentUserQuery } from "./services/userAuthApi";
import EmployeeLogin from "./pages/EmployeeLogin";
import EmployeeDashboard from "./pages/EmployeeDashboard";

// Placeholder components for routes we haven't built yet
const Placeholder = ({ title }: { title: string }) => (
  <Box sx={{ p: 5, textAlign: "center" }}>
    <h1>{title}</h1>
    <p>Coming Soon...</p>
  </Box>
);

function App() {
  const dispatch = useDispatch();
  
  // 1. GET THE LOADING STATUS
  const { data: user, isLoading } = useGetCurrentUserQuery();

  // 2. SYNC REDUX
  useEffect(() => {
    if (user) {
      dispatch(setUser(user));
    }
  }, [user, dispatch]);

  // 3. THE FIX: BLOCK RENDERING UNTIL WE KNOW THE AUTH STATUS
  // If we are still checking the cookie, show a spinner instead of the Navbar.
  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }
  return (
    <ThemeProvider theme={theme}>
      {/* CssBaseline kicksstart an elegant, consistent, and simple baseline to build upon. */}
      <CssBaseline />
      
      <BrowserRouter>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/book" element={<Book/>} />
            <Route path="/account" element={<Placeholder title="My Account" />} />
            <Route path="/login-success" element={<LoginSuccess />} />
            <Route path="/employee/login" element={<EmployeeLogin />} />
            <Route path="/employee" element={<EmployeeDashboard />} />
          </Routes>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;