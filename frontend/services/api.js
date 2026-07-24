import axios from 'axios';

// Use environment variable or direct URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

console.log('🌐 API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000 // 10 second timeout
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('📤 Request:', config.method.toUpperCase(), config.url);
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('📥 Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.message);
    console.error('URL:', error.config?.url);
    console.error('Status:', error.response?.status);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('gm_token');
      localStorage.removeItem('gm_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  getCaptcha: () => api.get('/auth/captcha'),
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  getDashboard: () => api.get('/auth/dashboard'),
  logout: () => api.post('/auth/logout')
};

export default api;
