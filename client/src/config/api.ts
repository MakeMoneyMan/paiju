export const API_BASE_URL = import.meta.env.VITE_API_URL;

// API endpoints
export const API_ENDPOINTS = {
  GENERATE_HAIKU: `${API_BASE_URL}/generate`,
  LIST_HAIKUS: `${API_BASE_URL}/haikus`,
  // ... 其他端点
}; 