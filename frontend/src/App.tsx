import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import { theme } from "./theme";
import Navbar from "./components/Navbar";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import LoginSuccess from "./components/LoginSuccess";

// Placeholder components for routes we haven't built yet
const Placeholder = ({ title }: { title: string }) => (
  <Box sx={{ p: 5, textAlign: "center" }}>
    <h1>{title}</h1>
    <p>Coming Soon...</p>
  </Box>
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      {/* CssBaseline kicksstart an elegant, consistent, and simple baseline to build upon. */}
      <CssBaseline />
      
      <BrowserRouter>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/book" element={<Placeholder title="Book A Room" />} />
            <Route path="/account" element={<Placeholder title="My Account" />} />
            <Route path="/login-success" element={<LoginSuccess />} />
          </Routes>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;