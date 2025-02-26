require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const cloudflareKV = require('./services/cloudflareKV');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS 配置
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,  // 允许携带凭证
  maxAge: 86400  // 预检请求的缓存时间，单位为秒
}));

// 中间件
app.use(express.json());

// DeepSeek API调用生成俳句
app.post('/api/generate-haiku', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: '请提供主题或想法' });
    }
    
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      return res.status(500).json({ error: 'OpenAI API密钥未配置' });
    }
    
    const response = await axios.post(
      'https://api.siliconflow.cn/v1/chat/completions',
      {
        model: 'deepseek-ai/DeepSeek-V3',
        messages: [
          {
            role: 'system',
            content: '你是一位专业的俳句创作者。俳句是一种日本传统诗歌形式，通常由三行组成，分别是5个音节、7个音节和5个音节。请根据用户提供的主题或想法，创作一首优美、意境深远的俳句。只返回俳句内容，不要有其他解释。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        }
      }
    );
    
    const haikuText = response.data.choices[0].message.content;
    
    // 保存到Cloudflare KV
    const haikuId = `haiku_${uuidv4()}`;
    const haikuData = {
      id: haikuId,
      text: haikuText,
      prompt: prompt,
      timestamp: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
      comments: []
    };
    
    await cloudflareKV.saveHaiku(haikuId, haikuData);
    
    res.json({ haiku: haikuText, haikuData });
    
  } catch (error) {
    console.error('调用API出错:', error.response?.data || error.message);
    res.status(500).json({ 
      error: '生成俳句时出错', 
      details: error.response?.data?.error?.message || error.message 
    });
  }
});

// 获取所有俳句
app.get('/api/haikus', async (req, res) => {
  try {
    const haikus = await cloudflareKV.getAllHaikus();
    res.json(haikus);
  } catch (error) {
    console.error('获取俳句列表失败:', error);
    res.status(500).json({ error: '获取俳句列表失败' });
  }
});

// 获取单个俳句
app.get('/api/haikus/:id', async (req, res) => {
  try {
    const haiku = await cloudflareKV.getHaiku(req.params.id);
    if (!haiku) {
      return res.status(404).json({ error: '俳句不存在' });
    }
    res.json(haiku);
  } catch (error) {
    console.error('获取俳句失败:', error);
    res.status(500).json({ error: '获取俳句失败' });
  }
});

// 点赞/差评俳句
app.post('/api/haikus/:id/rate', async (req, res) => {
  try {
    const { isLike } = req.body;
    if (isLike === undefined) {
      return res.status(400).json({ error: '请提供评分类型' });
    }
    
    const updatedHaiku = await cloudflareKV.updateHaikuRating(req.params.id, isLike);
    res.json(updatedHaiku);
  } catch (error) {
    console.error('评分失败:', error);
    res.status(500).json({ error: '评分失败' });
  }
});

// 添加评论
app.post('/api/haikus/:id/comments', async (req, res) => {
  try {
    const { comment } = req.body;
    if (!comment || !comment.trim()) {
      return res.status(400).json({ error: '评论不能为空' });
    }
    
    const updatedHaiku = await cloudflareKV.addComment(req.params.id, comment);
    res.json(updatedHaiku);
  } catch (error) {
    console.error('添加评论失败:', error);
    res.status(500).json({ error: '添加评论失败' });
  }
});

// 临时路由：删除有问题的俳句
app.delete('/api/haikus/:id', async (req, res) => {
  try {
    await cloudflareKV.deleteHaiku(req.params.id);
    res.json({ success: true, message: '俳句已删除' });
  } catch (error) {
    console.error('删除俳句失败:', error);
    res.status(500).json({ error: '删除俳句失败' });
  }
});

app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
}); 