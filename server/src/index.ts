import { KVNamespace, ExecutionContext } from '@cloudflare/workers-types';

export interface Env {
  // 在这里声明环境变量类型
  API_KEY: string;
  // 如果使用了 KV
  MY_KV: KVNamespace;
  // 如果使用了 D1
  // DB: D1Database;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
  'Access-Control-Max-Age': '86400',
};

// HTML 模板
const htmlTemplate = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>俳句生成器 API</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            text-align: center;
            margin-bottom: 20px;
        }
        .status {
            text-align: center;
            padding: 10px;
            background: #e8f5e9;
            border-radius: 4px;
            margin: 20px 0;
        }
        .endpoints {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 4px;
            margin-top: 20px;
        }
        code {
            background: #f1f1f1;
            padding: 2px 5px;
            border-radius: 3px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>俳句生成器 API</h1>
        <div class="status">
            ✅ API 服务器运行正常
        </div>
        <div class="endpoints">
            <h2>可用端点：</h2>
            <ul>
                <li><code>POST /generate</code> - 生成新俳句</li>
                <li><code>GET /haikus</code> - 获取所有俳句</li>
                <li><code>GET /haikus/:id</code> - 获取单个俳句</li>
                <li><code>POST /haikus/:id/rate</code> - 评分俳句</li>
                <li><code>POST /haikus/:id/comments</code> - 添加评论</li>
            </ul>
        </div>
    </div>
</body>
</html>
`;

// 处理请求的函数
async function handleRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  
  // 如果是根路径，返回 HTML 页面
  if (url.pathname === '/') {
    return new Response(htmlTemplate, {
      headers: {
        'Content-Type': 'text/html;charset=UTF-8',
        ...corsHeaders
      }
    });
  }
  
  // 其他 API 路由的处理...
  return new Response('API endpoint not found', { status: 404 });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders
      });
    }
    
    const response = await handleRequest(request, env);
    
    // 添加 CORS 头
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    return response;
  },
}; 