import React from 'react';
import { Box, Typography, Link, Container } from '@mui/material';

const Footer = () => {
  return (
    <Box 
      component="footer" 
      sx={{ 
        py: 3, 
        mt: 'auto',
        backgroundColor: 'rgba(0, 0, 0, 0.03)',
        borderTop: '1px solid rgba(0, 0, 0, 0.09)'
      }}
    >
      <Container maxWidth="lg">
        <Typography 
          variant="body2" 
          color="text.secondary" 
          align="center"
        >
          {'© '}
          {new Date().getFullYear()}
          {' 俳句生成器 | 由 '}
          <Link 
            color="primary" 
            href="https://github.com/MakeMoneyMan/" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            清汤挂面
          </Link>
          {' 提供支持'}
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer; 