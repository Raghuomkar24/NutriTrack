import axios from 'axios';

// Create API instance that utilizes Vite proxy to direct calls to localhost:8080/api
// Use the environment variable for production, or localhost for local development
const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8085';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      if (typeof config.headers.set === 'function') {
        config.headers.set('Authorization', `Bearer ${token}`);
      } else {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login page if unauthorized
      if (window.location.pathname !== '/login' && window.location.pathname !== '/' && window.location.pathname !== '/register') {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

import { ApiError } from '@/types';

// Structured error handler
export const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    return {
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      status: error.response?.status,
      code: error.code,
    };
  }
  if (error instanceof Error) {
    return { message: error.message };
  }
  return { message: String(error) };
};

export default api;
