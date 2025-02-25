import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HaikuGenerator from './components/HaikuGenerator';
import HaikuList from './components/HaikuList';
import Header from './components/Header';
import Footer from './components/Footer';
import { Container, Divider } from '@mui/material';

// 创建自定义主题
const theme = createTheme({
  palette: {
    primary: {
      main: '#9c27b0', // 紫色
    },
    secondary: {
      main: '#f50057', // 粉红色
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: "'Noto Sans SC', 'Noto Serif JP', sans-serif",
    h1: {
      fontWeight: 500,
    },
    h2: {
      fontWeight: 500,
    },
    h3: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh' 
      }}>
        <Header />
        <Container 
          component="main" 
          maxWidth="md" 
          sx={{ 
            flexGrow: 1, 
            py: 4, 
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <HaikuGenerator />
          <Divider sx={{ my: 4 }} />
          <HaikuList />
        </Container>
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App; 