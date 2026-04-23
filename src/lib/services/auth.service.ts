import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/stores/auth';
import { User, AuthResponse } from '@/lib/types';

// ============================================
// AUTH SERVICE - Professional Implementation
// Handles login, logout, token refresh, and session management
// ============================================

interface LoginCredentials {
  email: string;
  password: string;
  tiendaId?: number;
}

interface RegisterData {
  email: string;
  password: string;
  nombre: string;
  apellido?: string;
  telefono?: string;
  rol?: string;
}

export class AuthService {
  private static refreshPromise: Promise<string> | null = null;
  private static tokenRefreshTimer: ReturnType<typeof setTimeout> | null = null;

  // ============================================
  // LOGIN
  // ============================================
  static async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await authApi.login(credentials);
      this.handleAuthSuccess(response);
      return response.user;
    } catch (error) {
      this.clearSession();
      throw error;
    }
  }

  // ============================================
  // REGISTER
  // ============================================
  static async register(data: RegisterData): Promise<User> {
    try {
      const response = await authApi.register(data as any);
      this.handleAuthSuccess(response);
      return response.user;
    } catch (error) {
      this.clearSession();
      throw error;
    }
  }

  // ============================================
  // LOGOUT
  // ============================================
  static async logout(redirect = true): Promise<void> {
    try {
      // Notify server (best effort)
      await authApi.logout().catch(() => {
        // Ignore server errors during logout
      });
    } finally {
      this.clearSession();
      if (redirect) {
        window.location.href = '/login';
      }
    }
  }

  // ============================================
  // TOKEN REFRESH
  // Deduplicates concurrent refresh requests
  // ============================================
  static async refreshAccessToken(): Promise<string> {
    const state = useAuthStore.getState();

    // If already refreshing, return the existing promise
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    // Create new refresh promise
    this.refreshPromise = (async () => {
      try {
        if (!state.refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await authApi.refresh(state.refreshToken);

        // Update store with new token
        state.updateAccessToken(response.accessToken, 3600);

        // Schedule next refresh
        this.scheduleTokenRefresh();

        return response.accessToken;
      } catch (error) {
        // Refresh failed - clear session
        this.clearSession();
        throw error;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  // ============================================
  // SESSION MANAGEMENT
  // ============================================
  static handleAuthSuccess(response: AuthResponse): void {
    const tokens = {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      expiresAt: Date.now() + (response.expiresIn || 3600) * 1000,
    };

    useAuthStore.getState().setAuth(response.user, tokens);

    // Schedule automatic token refresh
    this.scheduleTokenRefresh();
  }

  private static clearSession(): void {
    // Stop any scheduled refresh
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }

    // Clear store without redirect (we handle redirect separately)
    useAuthStore.getState().logout(false);
  }

  // ============================================
  // AUTO REFRESH
  // Schedules token refresh before expiry
  // ============================================
  private static scheduleTokenRefresh(): void {
    // Clear existing timer
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
    }

    const state = useAuthStore.getState();
    const timeUntilExpiry = state.getTimeUntilExpiry();

    // Refresh 2 minutes before expiry (or immediately if already close)
    const refreshDelay = Math.max(timeUntilExpiry - 2 * 60 * 1000, 1000);

    this.tokenRefreshTimer = setTimeout(() => {
      this.refreshAccessToken().catch(() => {
        // Refresh failed - user will be logged out on next API call
      });
    }, refreshDelay);
  }

  // ============================================
  // VALIDATION
  // ============================================
  static validateSession(): boolean {
    const state = useAuthStore.getState();

    if (!state.isAuthenticated || !state.accessToken) {
      return false;
    }

    // Check token expiry
    if (state.isTokenExpired()) {
      // Try to refresh if we have a refresh token
      if (state.refreshToken) {
        this.refreshAccessToken().catch(() => {
          this.logout();
        });
        return true; // Optimistically return true while refreshing
      }

      this.logout();
      return false;
    }

    return true;
  }

  // ============================================
  // GET CURRENT USER
  // ============================================
  static async getCurrentUser(): Promise<User | null> {
    const state = useAuthStore.getState();

    if (!state.isAuthenticated) {
      return null;
    }

    // Check if token needs refresh
    if (state.isTokenExpired()) {
      try {
        await this.refreshAccessToken();
      } catch {
        return null;
      }
    }

    try {
      const user = await authApi.me();
      return user;
    } catch (error: any) {
      if (error.statusCode === 401) {
        await this.logout();
      }
      throw error;
    }
  }

  // ============================================
  // CHECK ROLE
  // ============================================
  static hasRole(roles: string[]): boolean {
    return useAuthStore.getState().hasRole(roles as any);
  }

  static isClient(): boolean {
    return useAuthStore.getState().isClient();
  }

  static isAdmin(): boolean {
    return useAuthStore.getState().isAdmin();
  }
}
