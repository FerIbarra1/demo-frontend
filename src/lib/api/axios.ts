import axios from 'axios';
import { ApiError } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add tiendaId header for CLIENTE role
    const tiendaId = localStorage.getItem('tiendaId');
    if (tiendaId && config.headers) {
      config.headers['X-Tienda-Id'] = tiendaId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Transform error to standard format
    const apiError: ApiError = {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || 'Error desconocido',
      error: error.response?.data?.error || 'Error',
    };

    return Promise.reject(apiError);
  }
);

// Helper for handling errors
export function handleApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    return {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || error.message,
      error: error.response?.data?.error || 'Error',
    };
  }
  return {
    statusCode: 500,
    message: 'Error desconocido',
    error: 'Error',
  };
}
