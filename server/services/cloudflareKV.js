const axios = require('axios');
require('dotenv').config();

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_NAMESPACE_ID = process.env.CLOUDFLARE_NAMESPACE_ID;

const cloudflareKV = {
  // 获取所有俳句
  async getAllHaikus() {
    try {
      const response = await axios.get(
        `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${CLOUDFLARE_NAMESPACE_ID}/keys`,
        {
          headers: {
            'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data.success) {
        throw new Error('获取俳句列表失败');
      }

      const keys = response.data.result.filter(key => key.name.startsWith('haiku_'));
      const haikus = [];

      for (const key of keys) {
        try {
          const haikuData = await this.getHaiku(key.name);
          if (haikuData) {
            haikus.push(haikuData);
          }
        } catch (error) {
          console.error(`跳过无效的俳句 ${key.name}:`, error.message);
          // 继续处理其他俳句
        }
      }

      return haikus;
    } catch (error) {
      console.error('获取所有俳句失败:', error);
      throw error;
    }
  },

  // 获取单个俳句
  async getHaiku(id) {
    try {
      const response = await axios.get(
        `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${CLOUDFLARE_NAMESPACE_ID}/values/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // 检查响应是否已经是对象
      if (typeof response.data === 'object' && response.data !== null) {
        return response.data;
      }
      
      // 尝试解析JSON
      try {
        return JSON.parse(response.data);
      } catch (e) {
        console.error(`解析俳句 ${id} 失败:`, e.message);
        // 如果无法解析，返回一个格式化的对象
        return {
          id: id,
          text: String(response.data),
          prompt: "未知",
          timestamp: new Date().toISOString(),
          likes: 0,
          dislikes: 0,
          comments: []
        };
      }
    } catch (error) {
      console.error(`获取俳句 ${id} 失败:`, error);
      return null;
    }
  },

  // 保存俳句
  async saveHaiku(id, haikuData) {
    try {
      // 确保数据是字符串
      const dataToSave = typeof haikuData === 'string' 
        ? haikuData 
        : JSON.stringify(haikuData);
        
      await axios.put(
        `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${CLOUDFLARE_NAMESPACE_ID}/values/${id}`,
        dataToSave,
        {
          headers: {
            'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return true;
    } catch (error) {
      console.error(`保存俳句 ${id} 失败:`, error);
      throw error;
    }
  },

  // 更新俳句评分
  async updateHaikuRating(id, isLike) {
    try {
      const haiku = await this.getHaiku(id);
      if (!haiku) {
        throw new Error('俳句不存在');
      }

      if (isLike) {
        haiku.likes = (haiku.likes || 0) + 1;
      } else {
        haiku.dislikes = (haiku.dislikes || 0) + 1;
      }

      await this.saveHaiku(id, haiku);
      return haiku;
    } catch (error) {
      console.error(`更新俳句 ${id} 评分失败:`, error);
      throw error;
    }
  },

  // 添加评论
  async addComment(haikuId, comment) {
    try {
      const haiku = await this.getHaiku(haikuId);
      if (!haiku) {
        throw new Error('俳句不存在');
      }

      // 确保comments数组存在
      if (!haiku.comments) {
        haiku.comments = [];
      }

      haiku.comments.push({
        id: `comment_${Date.now()}`,
        text: comment,
        timestamp: new Date().toISOString()
      });

      await this.saveHaiku(haikuId, haiku);
      return haiku;
    } catch (error) {
      console.error(`为俳句 ${haikuId} 添加评论失败:`, error);
      throw error;
    }
  },
  
  // 删除有问题的俳句
  async deleteHaiku(id) {
    try {
      await axios.delete(
        `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${CLOUDFLARE_NAMESPACE_ID}/values/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`
          }
        }
      );
      return true;
    } catch (error) {
      console.error(`删除俳句 ${id} 失败:`, error);
      throw error;
    }
  }
};

module.exports = cloudflareKV; 