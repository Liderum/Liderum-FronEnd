import axios from 'axios';
import { API_CONFIG } from '@/config/api_config_dsv';
import { ResponseRegisteredUser } from '@/types/auth';

const api = axios.create({
  baseURL: API_CONFIG.AUTH.BASE_URL_DSV,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('@Liderum:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('@Liderum:refreshToken');
        
        if (refreshToken) {
          const response = await axios.post(`${API_CONFIG.AUTH.BASE_URL_DSV}/refresh`, {
            refreshToken: refreshToken
          });
          
          const { success, tokens, errors } = response.data as ResponseRegisteredUser;
          
          if (success && tokens) {
            localStorage.setItem('@Liderum:token', tokens.accessToken);
            localStorage.setItem('@Liderum:refreshToken', tokens.refreshToken);
            
            originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
            return api(originalRequest);
          } else {
            const errorMessage = Array.isArray(errors) ? errors[0] : errors || 'Erro ao renovar token';
            throw new Error(errorMessage);
          }
        }
      } catch (refreshError) {
        console.error('Erro ao renovar token:', refreshError);
        localStorage.removeItem('@Liderum:token');
        localStorage.removeItem('@Liderum:refreshToken');
        localStorage.removeItem('@Liderum:user');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 