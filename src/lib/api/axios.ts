import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/lib/stores/auth';
import { AuthService } from '@/lib/services/auth.service';
import { ApiError } from '@/lib/types';

// ============================================
// AXIOS CONFIGURATION - Professional Implementation
// Handles auth, token refresh, and error handling
// ============================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create axios instance
export const api = axios.create({
  baseURL: `${API_URL}`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Flag to prevent infinite refresh loops
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ============================================
// REQUEST INTERCEPTOR
// Adds auth token and other headers
// ============================================

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from store (not localStorage directly)
    const { accessToken, selectedTiendaId } = useAuthStore.getState();

    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Add tiendaId header if available
    if (selectedTiendaId && config.headers) {
      config.headers['X-Tienda-Id'] = selectedTiendaId.toString();
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR
// Handles token refresh and error transformation
// ============================================

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _retryCount?: number;
    };

    if (!originalRequest) {
      return Promise.reject(transformError(error));
    }

    // Prevent infinite loops
    originalRequest._retryCount = originalRequest._retryCount || 0;
    if (originalRequest._retryCount > 3) {
      return Promise.reject(transformError(error));
    }

    // Skip token refresh for auth endpoints
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') ||
                          originalRequest.url?.includes('/auth/register') ||
                          originalRequest.url?.includes('/auth/refresh');

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // Queue this request while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      originalRequest._retryCount++;

      try {
        const newToken = await AuthService.refreshAccessToken();
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        // Logout user
        await AuthService.logout();
        return Promise.reject(transformError(refreshError as AxiosError));
      } finally {
        isRefreshing = false;
      }
    }

    // Transform and return error
    return Promise.reject(transformError(error));
  }
);

// ============================================
// ERROR TRANSFORMATION
// Converts axios errors to standard ApiError
// ============================================

function transformError(error: AxiosError | unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const response = axiosError.response;

    // Network errors
    if (!response) {
      return {
        statusCode: 0,
        message: 'Error de conexión. Verifica tu internet.',
        error: 'NetworkError',
      };
    }

    // Server errors with messages
    const message =
      (response.data as any)?.message ||
      (response.data as any)?.error ||
      getDefaultErrorMessage(response.status);

    return {
      statusCode: response.status,
      message,
      error: (response.data as any)?.error || `HTTP ${response.status}`,
    };
  }

  // Unknown errors
  return {
    statusCode: 500,
    message: 'Error desconocido',
    error: 'UnknownError',
  };
}

function getDefaultErrorMessage(status: number): string {
  const messages: Record<number, string> = {
    400: 'Solicitud inválida',
    401: 'No autorizado. Inicia sesión nuevamente.',
    403: 'No tienes permiso para esta acción',
    404: 'Recurso no encontrado',
    409: 'Conflicto con los datos existentes',
    422: 'Datos de entrada inválidos',
    429: 'Demasiadas solicitudes. Intenta más tarde.',
    500: 'Error del servidor. Intenta más tarde.',
    502: 'Servicio no disponible',
    503: 'Servicio temporalmente no disponible',
  };

  return messages[status] || `Error ${status}`;
}

// ============================================
// PUBLIC API
// ============================================

export function handleApiError(error: unknown): ApiError {
  return transformError(error);
}

// Check if error is a specific type
export function isAuthError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  return error.response?.status === 401 || error.response?.status === 403;
}

export function isNetworkError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  return !error.response && error.message === 'Network Error';
}
