'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, UserRole } from '@/lib/types';

// ============================================
// AUTH STORE - Professional Implementation
// ============================================

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Timestamp when access token expires
}

interface AuthState extends AuthTokens {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  selectedTiendaId: number | null;
  _hasHydrated: boolean;

  // Actions
  setAuth: (user: User, tokens: AuthTokens) => void;
  updateAccessToken: (accessToken: string, expiresIn?: number) => void;
  logout: (redirect?: boolean) => void;
  clearError: () => void;
  setSelectedTienda: (tiendaId: number | null) => void;
  setHasHydrated: (state: boolean) => void;

  // Getters
  hasRole: (roles: UserRole[]) => boolean;
  isTokenExpired: () => boolean;
  getTimeUntilExpiry: () => number;

  // Role checks
  isClient: () => boolean;
  isWarehouse: () => boolean;
  isCashier: () => boolean;
  isCounter: () => boolean;
  isAdmin: () => boolean;
}

// Calculate expiry timestamp from seconds
const calculateExpiry = (expiresIn: number): number => {
  // Default 1 hour if not specified
  const expirySeconds = expiresIn || 3600;
  return Date.now() + expirySeconds * 1000;
};

// Safe localStorage access (only in browser)
const getLocalStorage = () => {
  if (typeof window !== 'undefined') {
    return window.localStorage;
  }
  return undefined;
};

// Broadcast channel for cross-tab sync
let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  broadcastChannel = new BroadcastChannel('auth-sync');
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      accessToken: '',
      refreshToken: '',
      expiresAt: 0,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      selectedTiendaId: null,
      _hasHydrated: false,

      // Set full auth state after login/register
      setAuth: (user, tokens) => {
        const expiresAt = tokens.expiresAt || calculateExpiry(3600);

        set({
          user,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        // Sync across tabs
        broadcastChannel?.postMessage({
          type: 'LOGIN',
          user,
          tokens: { ...tokens, expiresAt },
        });
      },

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      // Update only access token (after refresh)
      updateAccessToken: (accessToken, expiresIn = 3600) => {
        const expiresAt = calculateExpiry(expiresIn);
        set({ accessToken, expiresAt });

        broadcastChannel?.postMessage({
          type: 'TOKEN_REFRESH',
          accessToken,
          expiresAt,
        });
      },

      // Logout with optional redirect
      logout: (redirect = true) => {
        set({
          user: null,
          accessToken: '',
          refreshToken: '',
          expiresAt: 0,
          isAuthenticated: false,
          selectedTiendaId: null,
        });

        // Sync across tabs
        broadcastChannel?.postMessage({ type: 'LOGOUT' });

        // Redirect to login
        if (redirect && typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      },

      clearError: () => set({ error: null }),

      setSelectedTienda: (tiendaId) => {
        set({ selectedTiendaId: tiendaId });

        // Also store in localStorage for API headers
        if (tiendaId) {
          getLocalStorage()?.setItem('tiendaId', tiendaId.toString());
        } else {
          getLocalStorage()?.removeItem('tiendaId');
        }
      },

      // Check if token is expired (with 5 min buffer)
      isTokenExpired: () => {
        const { expiresAt } = get();
        if (!expiresAt) return true;
        // 5 minute buffer before actual expiry
        return Date.now() >= expiresAt - 5 * 60 * 1000;
      },

      // Get time until expiry in milliseconds
      getTimeUntilExpiry: () => {
        const { expiresAt } = get();
        if (!expiresAt) return 0;
        return Math.max(0, expiresAt - Date.now());
      },

      hasRole: (roles) => {
        const user = get().user;
        if (!user) return false;
        return roles.includes(user.rol);
      },

      isClient: () => get().user?.rol === 'CLIENTE',
      isWarehouse: () => get().user?.rol === 'BODEGA',
      isCashier: () => get().user?.rol === 'CAJERO',
      isCounter: () => get().user?.rol === 'MOSTRADOR',
      isAdmin: () => get().user?.rol === 'ADMIN',
    }),
    {
      name: 'auth-storage-v3', // New version to clear old data with invalid tienda IDs
      storage: createJSONStorage(() => {
        // Return custom storage that only works in browser
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        // Return noop storage for SSR
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        expiresAt: state.expiresAt,
        isAuthenticated: state.isAuthenticated,
        selectedTiendaId: state.selectedTiendaId,
      }),
      onRehydrateStorage: () => (state) => {
        // Clear any previous version data
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-storage-v2');
          localStorage.removeItem('auth-storage');
        }

        // Mark as hydrated
        state?.setHasHydrated(true);

        // Validate auth state on rehydrate
        if (state?.isAuthenticated && state?.accessToken) {
          // Check if token is expired
          const expiresAt = state.expiresAt || 0;
          if (Date.now() >= expiresAt - 5 * 60 * 1000) {
            // Token expired or about to expire - clear auth
            state.isAuthenticated = false;
            state.user = null;
            state.accessToken = '';
            state.refreshToken = '';
          }
        }

        // Validate tiendaId - clear if it seems invalid (IDs should be 1 or 2 after reset)
        if (state?.selectedTiendaId && state.selectedTiendaId > 10) {
          // Likely stale data from old DB - clear it
          state.selectedTiendaId = null;
        }
      },
    }
  )
);

// ============================================
// SYNC ACROSS TABS
// ============================================

if (broadcastChannel) {
  broadcastChannel.onmessage = (event) => {
    const { type, user, tokens } = event.data;

    switch (type) {
      case 'LOGOUT':
        // Logout from all tabs
        useAuthStore.setState({
          user: null,
          accessToken: '',
          refreshToken: '',
          expiresAt: 0,
          isAuthenticated: false,
        });
        break;

      case 'LOGIN':
        // Login from another tab
        useAuthStore.setState({
          user,
          ...tokens,
          isAuthenticated: true,
        });
        break;

      case 'TOKEN_REFRESH':
        // Token refreshed in another tab
        useAuthStore.setState({
          accessToken: tokens.accessToken,
          expiresAt: tokens.expiresAt,
        });
        break;
    }
  };
}

// ============================================
// HOOKS
// ============================================

// Hook to get current auth state for API calls
export const getAuthHeaders = () => {
  const state = useAuthStore.getState();
  return {
    Authorization: state.accessToken ? `Bearer ${state.accessToken}` : '',
    'X-Tienda-Id': state.selectedTiendaId?.toString() || '',
  };
};

// Hook to check if user needs token refresh
export const needsTokenRefresh = (): boolean => {
  const state = useAuthStore.getState();
  if (!state.isAuthenticated || !state.refreshToken) return false;

  // Refresh if token expires in less than 5 minutes
  const timeUntilExpiry = state.getTimeUntilExpiry();
  return timeUntilExpiry < 5 * 60 * 1000;
};
