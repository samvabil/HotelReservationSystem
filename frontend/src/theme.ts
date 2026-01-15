import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: 'dark', // Default to dark mode for that "gamer" aesthetic
    primary: {
      main: '#9c27b0', // Neon Purple (Cyberpunk vibe)
    },
    secondary: {
      main: '#00e5ff', // Neon Cyan/Blue
    },
    background: {
      default: '#121212', // Very dark grey (easier on eyes than pure black)
      paper: '#1e1e1e',   // Slightly lighter for cards/navbars
    },
    text: {
      primary: '#ffffff',
      secondary: '#b3b3b3',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '0.1rem',
      textTransform: 'uppercase', // Gamer headers are usually uppercase
    },
    h2: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 700,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0, // Sharp corners feel more "tech/sci-fi"
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
          borderBottom: '2px solid #9c27b0', // Purple glowing line under navbar
        }
      }
    }
  },
});