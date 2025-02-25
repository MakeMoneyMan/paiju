import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  Divider,
  IconButton,
  TextField,
  Button,
  Collapse,
  CircularProgress,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import CommentIcon from '@mui/icons-material/Comment';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';

const HaikuList = () => {
  const [haikus, setHaikus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedComments, setExpandedComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchHaikus();
  }, []);

  const fetchHaikus = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/haikus');
      // 按时间排序，最新的在前面
      const sortedHaikus = response.data.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      );
      setHaikus(sortedHaikus);
    } catch (err) {
      console.error('获取俳句列表失败:', err);
      setError('获取俳句列表失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  const handleRateHaiku = async (id, isLike) => {
    try {
      const response = await axios.post(`/api/haikus/${id}/rate`, { isLike });
      // 更新本地状态
      setHaikus(haikus.map(haiku => 
        haiku.id === id ? response.data : haiku
      ));
      
      setSnackbar({
        open: true,
        message: isLike ? '点赞成功！' : '评价已提交',
        severity: 'success'
      });
    } catch (err) {
      console.error('评分失败:', err);
      setSnackbar({
        open: true,
        message: '评分失败，请稍后再试',
        severity: 'error'
      });
    }
  };

  const handleToggleComments = (id) => {
    setExpandedComments(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCommentChange = (id, value) => {
    setCommentInputs(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleAddComment = async (id) => {
    const comment = commentInputs[id];
    if (!comment || !comment.trim()) {
      setSnackbar({
        open: true,
        message: '评论不能为空',
        severity: 'warning'
      });
      return;
    }

    try {
      const response = await axios.post(`/api/haikus/${id}/comments`, { comment });
      // 更新本地状态
      setHaikus(haikus.map(haiku => 
        haiku.id === id ? response.data : haiku
      ));
      
      // 清空输入框
      setCommentInputs(prev => ({
        ...prev,
        [id]: ''
      }));
      
      setSnackbar({
        open: true,
        message: '评论已添加',
        severity: 'success'
      });
    } catch (err) {
      console.error('添加评论失败:', err);
      setSnackbar({
        open: true,
        message: '添加评论失败，请稍后再试',
        severity: 'error'
      });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ mt: 6, mb: 4 }}>
      <Typography 
        variant="h5" 
        component="h2" 
        gutterBottom 
        align="center"
        sx={{ 
          mb: 4, 
          color: 'primary.main',
          fontFamily: "'Noto Serif JP', 'Noto Sans SC', serif",
          fontWeight: 500
        }}
      >
        俳句集锦
      </Typography>
      
      {haikus.length === 0 ? (
        <Typography align="center" color="text.secondary">
          暂无俳句，快来创作第一首吧！
        </Typography>
      ) : (
        <List sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 2 }}>
          {haikus.map((haiku, index) => (
            <React.Fragment key={haiku.id}>
              <ListItem 
                alignItems="flex-start"
                sx={{ 
                  flexDirection: 'column',
                  py: 2
                }}
              >
                <Paper 
                  elevation={1}
                  sx={{ 
                    width: '100%', 
                    p: 3, 
                    borderRadius: 2,
                    backgroundColor: 'rgba(156, 39, 176, 0.03)',
                    border: '1px solid rgba(156, 39, 176, 0.1)',
                  }}
                >
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    主题：{haiku.prompt}
                  </Typography>
                  
                  <Typography 
                    variant="body1" 
                    component="div" 
                    sx={{ 
                      whiteSpace: 'pre-line',
                      fontFamily: "'Noto Serif JP', 'Noto Sans SC', serif",
                      fontSize: '1.1rem',
                      lineHeight: 1.8,
                      my: 2,
                      color: 'text.primary'
                    }}
                  >
                    {haiku.text}
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mt: 2
                  }}>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(haiku.timestamp)}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton 
                        size="small" 
                        onClick={() => handleRateHaiku(haiku.id, true)}
                        color="primary"
                      >
                        <ThumbUpIcon fontSize="small" />
                      </IconButton>
                      <Typography variant="body2" sx={{ mx: 0.5 }}>
                        {haiku.likes}
                      </Typography>
                      
                      <IconButton 
                        size="small" 
                        onClick={() => handleRateHaiku(haiku.id, false)}
                        color="secondary"
                        sx={{ ml: 1 }}
                      >
                        <ThumbDownIcon fontSize="small" />
                      </IconButton>
                      <Typography variant="body2" sx={{ mx: 0.5 }}>
                        {haiku.dislikes}
                      </Typography>
                      
                      <IconButton 
                        size="small" 
                        onClick={() => handleToggleComments(haiku.id)}
                        color="default"
                        sx={{ ml: 1 }}
                      >
                        <CommentIcon fontSize="small" />
                      </IconButton>
                      <Typography variant="body2" sx={{ mx: 0.5 }}>
                        {haiku.comments.length}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Collapse in={expandedComments[haiku.id]} timeout="auto" unmountOnExit>
                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}>
                      {haiku.comments.length > 0 ? (
                        <List dense>
                          {haiku.comments.map((comment, commentIndex) => (
                            <ListItem key={comment.id} sx={{ px: 0, py: 1 }}>
                              <Box sx={{ width: '100%' }}>
                                <Typography variant="body2">
                                  {comment.text}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {formatDate(comment.timestamp)}
                                </Typography>
                              </Box>
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>
                          暂无评论，来添加第一条吧！
                        </Typography>
                      )}
                      
                      <Box sx={{ display: 'flex', mt: 2 }}>
                        <TextField
                          size="small"
                          placeholder="添加评论..."
                          fullWidth
                          value={commentInputs[haiku.id] || ''}
                          onChange={(e) => handleCommentChange(haiku.id, e.target.value)}
                          variant="outlined"
                        />
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          endIcon={<SendIcon />}
                          onClick={() => handleAddComment(haiku.id)}
                          sx={{ ml: 1, minWidth: 'auto' }}
                        >
                          发送
                        </Button>
                      </Box>
                    </Box>
                  </Collapse>
                </Paper>
              </ListItem>
              {index < haikus.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      )}
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={3000} 
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HaikuList; 