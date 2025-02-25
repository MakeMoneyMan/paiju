import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  useTheme,
  useMediaQuery,
  Fade
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import axios from 'axios';

const HaikuGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [haiku, setHaiku] = useState('');
  const [haikuData, setHaikuData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [success, setSuccess] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleGenerateHaiku = async () => {
    if (!prompt.trim()) {
      setError('请输入主题或想法');
      return;
    }

    setLoading(true);
    setError('');
    setHaiku('');
    setHaikuData(null);
    setSuccess(false);

    try {
      const response = await axios.post('/api/generate-haiku', { prompt });
      setHaiku(response.data.haiku);
      setHaikuData(response.data.haikuData);
      setSuccess(true);
      
      // 生成成功后，触发列表刷新的提示
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (err) {
      console.error('生成俳句出错:', err);
      setError(err.response?.data?.error || '生成俳句时出错，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(haiku).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, sm: 4 }, 
          borderRadius: 2,
          background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
          boxShadow: '0 8px 32px rgba(156, 39, 176, 0.1)'
        }}
      >
        <Typography 
          variant="h5" 
          component="h2" 
          gutterBottom 
          align="center"
          sx={{ 
            mb: 3, 
            color: 'primary.main',
            fontFamily: "'Noto Serif JP', 'Noto Sans SC', serif",
            fontWeight: 500
          }}
        >
          创作专属于你的俳句
        </Typography>
        
        <Typography 
          variant="body1" 
          gutterBottom 
          align="center" 
          sx={{ mb: 3, color: 'text.secondary' }}
        >
          输入你的主题或想法，AI将为你创作一首优美的俳句
        </Typography>
        
        <TextField
          fullWidth
          label="输入主题或想法"
          variant="outlined"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          multiline
          rows={2}
          placeholder="例如：秋天的落叶、海边的日落、思念远方的朋友..."
          sx={{ mb: 3 }}
        />
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleGenerateHaiku}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutorenewIcon />}
            sx={{ 
              px: 4, 
              py: 1.5,
              borderRadius: 8,
              boxShadow: '0 4px 20px rgba(156, 39, 176, 0.25)',
              '&:hover': {
                boxShadow: '0 6px 25px rgba(156, 39, 176, 0.35)',
              }
            }}
          >
            {loading ? '生成中...' : '生成俳句'}
          </Button>
        </Box>
        
        {haiku && (
          <Fade in={!!haiku}>
            <Paper 
              elevation={1} 
              sx={{ 
                p: 3, 
                mt: 2, 
                mb: 2, 
                borderRadius: 2,
                backgroundColor: 'rgba(156, 39, 176, 0.03)',
                border: '1px solid rgba(156, 39, 176, 0.1)',
                position: 'relative'
              }}
            >
              <Typography 
                variant="body1" 
                component="div" 
                sx={{ 
                  whiteSpace: 'pre-line',
                  fontFamily: "'Noto Serif JP', 'Noto Sans SC', serif",
                  fontSize: '1.1rem',
                  lineHeight: 1.8,
                  textAlign: 'center',
                  color: 'text.primary',
                  mb: 2
                }}
              >
                {haiku}
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  startIcon={<ContentCopyIcon />}
                  onClick={handleCopyToClipboard}
                  sx={{ borderRadius: 4 }}
                >
                  复制俳句
                </Button>
              </Box>
            </Paper>
          </Fade>
        )}
      </Paper>
      
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar open={copied} autoHideDuration={2000} onClose={() => setCopied(false)}>
        <Alert onClose={() => setCopied(false)} severity="success" sx={{ width: '100%' }}>
          已复制到剪贴板
        </Alert>
      </Snackbar>

      <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}>
        <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
          俳句已生成并保存！页面将在3秒后刷新以显示最新俳句...
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HaikuGenerator; 