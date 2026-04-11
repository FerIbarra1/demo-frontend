import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api/axios';
import { useAuthStore } from '@/lib/stores/auth';
import {
  LoginCredentials,
  AuthResponse,
  User,
  ApiError,
} from '@/lib/types';

// Login mutation
export function useLogin() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const { data } = await api.post<AuthResponse>('/auth/login', credentials);
      return data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      toast.success(`Bienvenido, ${data.user.nombre}`);

      // Check for redirect first
      const redirect = localStorage.getItem('redirectAfterLogin');
      if (redirect) {
        localStorage.removeItem('redirectAfterLogin');
        router.push(redirect);
        return;
      }

      // Redirect based on role
      switch (data.user.rol) {
        case 'CLIENTE':
          router.push('/catalogo');
          break;
        case 'BODEGA':
          router.push('/bodega');
          break;
        case 'CAJERO':
          router.push('/cajero');
          break;
        case 'MOSTRADOR':
          router.push('/mostrador');
          break;
        case 'ADMIN':
          router.push('/admin');
          break;
        default:
          router.push('/');
      }
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Error al iniciar sesión');
    },
  });
}

// Register mutation
export function useRegister() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: async (userData: {
      email: string;
      password: string;
      nombre: string;
    }) => {
      const { data } = await api.post<AuthResponse>('/auth/register', userData);
      return data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      toast.success('Cuenta creada exitosamente');

      // Check for redirect after registration
      const redirect = localStorage.getItem('redirectAfterLogin');
      if (redirect) {
        localStorage.removeItem('redirectAfterLogin');
        router.push(redirect);
      } else {
        router.push('/catalogo');
      }
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Error al crear cuenta');
    },
  });
}

// Logout
export function useLogout() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();

  return () => {
    logout();
    queryClient.clear();
    router.push('/login');
    toast.info('Sesión cerrada');
  };
}

// Get current user
export function useMe() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await api.get<User>('/auth/me');
      return data;
    },
    enabled: isAuthenticated,
  });
}

// Refresh token mutation
export function useRefreshToken() {
  const { updateAccessToken } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token');

      const { data } = await api.post<{ accessToken: string }>('/auth/refresh', {
        refreshToken,
      });
      return data;
    },
    onSuccess: (data) => {
      updateAccessToken(data.accessToken);
    },
  });
}
