import React from 'react';
import { AppBar, Toolbar, Typography, Container, useTheme, useMediaQuery } from '@mui/material';
import GrainIcon from '@mui/icons-material/Grain';

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <AppBar position="static" color="primary" elevation={0}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'center' }}>
          <GrainIcon sx={{ mr: 1, fontSize: isMobile ? 24 : 28 }} />
          <Typography
            variant={isMobile ? "h6" : "h5"}
            component="h1"
            sx={{
              fontWeight: 500,
              letterSpacing: '0.05em',
              fontFamily: "'Noto Serif JP', 'Noto Sans SC', serif",
            }}
          >
            俳句生成器
          </Typography>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header; 