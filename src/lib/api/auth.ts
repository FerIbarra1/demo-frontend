import { api } from './axios';
import {
  LoginCredentials,
  AuthResponse,
  User,
} from '@/lib/types';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', credentials);
    return data;
  },

  register: async (userData: {
    email: string;
    password: string;
    nombre: string;
  }): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/register', userData);
    return data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  me: async (): Promise<User> => {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },

  refresh: async (refreshToken: string): Promise<{ accessToken: string }> => {
    const { data } = await api.post<{ accessToken: string }>('/auth/refresh', {
      refreshToken,
    });
    return data;
  },
};
