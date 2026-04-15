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
    apellido?: string;
    telefono?: string;
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

  updateProfile: async (userData: {
    nombre?: string;
    apellido?: string;
    telefono?: string;
  }): Promise<User> => {
    const { data } = await api.post<User>('/auth/update-profile', userData);
    return data;
  },

  changePassword: async (passwordData: {
    oldPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> => {
    const { data } = await api.post<{ message: string }>('/auth/change-password', passwordData);
    return data;
  },

  refresh: async (refreshToken: string): Promise<{ accessToken: string }> => {
    const { data } = await api.post<{ accessToken: string }>('/auth/refresh', {
      refreshToken,
    });
    return data;
  },

  getKioskToken: async (): Promise<{ kioskToken: string; expiresAt: string }> => {
    const { data } = await api.get<{ kioskToken: string; expiresAt: string }>('/auth/kiosk-token');
    return data;
  },

  loginByKioskToken: async (kioskToken: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/kiosk-login', { kioskToken });
    return data;
  },
};
