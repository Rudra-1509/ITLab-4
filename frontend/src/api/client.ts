import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// The API Gateway base URL defaults to '/api' (proxied by Vite to http://localhost:8000)
// or can be overridden via VITE_API_URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});

// Request interceptor: attach Bearer token if available
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 and 403 globally
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.warn('[API] 401 Unauthorized: token may be expired or session revoked.');
      // Dispatch custom event so AuthContext can clean up or show notification
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    } else if (error.response?.status === 403) {
      console.warn('[API] 403 Forbidden: insufficient privileges.');
      window.dispatchEvent(new CustomEvent('auth:forbidden'));
    }
    return Promise.reject(error);
  }
);
