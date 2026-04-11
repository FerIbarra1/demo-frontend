import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '@/lib/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  selectedTiendaId: number | null;

  // Actions
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  updateAccessToken: (token: string) => void;
  logout: () => void;
  setSelectedTienda: (tiendaId: number) => void;
  clearSelectedTienda: () => void;

  // Getters
  hasRole: (roles: UserRole[]) => boolean;
  isClient: () => boolean;
  isWarehouse: () => boolean;
  isCashier: () => boolean;
  isCounter: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      selectedTiendaId: null,

      setAuth: (user, accessToken, refreshToken) => {
        // Solo ejecutar localStorage en el cliente
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('accessToken', accessToken);
          window.localStorage.setItem('refreshToken', refreshToken);
        }
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      },

      updateAccessToken: (token) => {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('accessToken', token);
        }
        set({ accessToken: token });
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('accessToken');
          window.localStorage.removeItem('refreshToken');
          window.localStorage.removeItem('tiendaId');
        }
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          selectedTiendaId: null,
        });
      },

      setSelectedTienda: (tiendaId) => {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('tiendaId', tiendaId.toString());
        }
        set({ selectedTiendaId: tiendaId });
      },

      clearSelectedTienda: () => {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('tiendaId');
        }
        set({ selectedTiendaId: null });
      },

      hasRole: (roles) => {
        const user = get().user;
        if (!user) return false;
        return roles.includes(user.rol);
      },

      isClient: () => {
        const user = get().user;
        return user?.rol === 'CLIENTE';
      },

      isWarehouse: () => {
        const user = get().user;
        return user?.rol === 'BODEGA';
      },

      isCashier: () => {
        const user = get().user;
        return user?.rol === 'CAJERO';
      },

      isCounter: () => {
        const user = get().user;
        return user?.rol === 'MOSTRADOR';
      },

      isAdmin: () => {
        const user = get().user;
        return user?.rol === 'ADMIN';
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        selectedTiendaId: state.selectedTiendaId,
      }),
    }
  )
);
