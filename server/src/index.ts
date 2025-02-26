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

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders
      });
    }
    
    // 你的逻辑
    const response = await handleRequest(request, env);
    
    // 添加 CORS 头
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    return response;
  },
}; 