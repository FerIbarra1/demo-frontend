"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useCallback, useState, useRef } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api/axios";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/auth";
import { AuthService } from "@/lib/services/auth.service";
import {
  LoginCredentials,
  AuthResponse,
  User,
  ApiError,
  UserRole,
} from "@/lib/types";

// ============================================
// USE LOGIN - Professional implementation
// ============================================

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      credentials: LoginCredentials,
    ): Promise<AuthResponse> => {
      const { data } = await api.post<AuthResponse>("/auth/login", credentials);
      return data;
    },
    onSuccess: (data) => {
      // Use AuthService to handle full auth flow
      AuthService.handleAuthSuccess(data);
      toast.success(`Bienvenido, ${data.user.nombre}`);
      // Redirection is handled by components or guards observing isAuthenticated
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Error al iniciar sesión");
    },
  });
}

// ============================================
// USE REGISTER
// ============================================

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (userData: {
      email: string;
      password: string;
      nombre: string;
      apellido?: string;
      telefono?: string;
    }): Promise<AuthResponse> => {
      const { data } = await api.post<AuthResponse>("/auth/register", userData);
      return data;
    },
    onSuccess: (data) => {
      AuthService.handleAuthSuccess(data);
      toast.success("Cuenta creada exitosamente");
      // Redirection is handled by components or guards observing isAuthenticated
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Error al crear cuenta");
    },
  });
}

// ============================================
// USE KIOSK TOKEN - For QR Login
// ============================================

export function useKioskToken() {
  return useQuery({
    queryKey: ["kiosk-token"],
    queryFn: () => authApi.getKioskToken(),
    refetchInterval: 4 * 60 * 1000, // Refrescar cada 4 min (antes de que expire a los 5)
    staleTime: 4 * 60 * 1000,
    retry: 1,
    enabled: useAuthStore.getState().isAuthenticated,
  });
}

// ============================================
// USE KIOSK LOGIN
// ============================================

export function useKioskLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: (kioskToken: string) => authApi.loginByKioskToken(kioskToken),
    onSuccess: (data) => {
      AuthService.handleAuthSuccess(data);
      toast.success(`Bienvenido, ${data.user.nombre}`);
      // Redirect to catalog in kiosk mode
      router.push("/catalogo");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Error al iniciar sesión en el kiosko");
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: { nombre?: string; apellido?: string; telefono?: string }) =>
      authApi.updateProfile(userData),
    onSuccess: (updatedUser) => {
      // Actualizar el usuario en el store global
      useAuthStore.setState({ user: updatedUser });
      // Invalidar queries que dependan del perfil
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success("Perfil actualizado correctamente");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Error al actualizar perfil");
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (passwordData: { oldPassword: string; newPassword: string }) =>
      authApi.changePassword(passwordData),
    onSuccess: (data) => {
      toast.success(data.message || "Contraseña actualizada correctamente");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Error al cambiar contraseña");
    },
  });
}

// ============================================
// USE LOGOUT
// ============================================

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await AuthService.logout(false);
    },
    onSuccess: () => {
      queryClient.clear();
      toast.info("Sesión cerrada");
      router.push("/login");
    },
    onError: () => {
      // Even if server logout fails, clear local state
      queryClient.clear();
      router.push("/login");
    },
  });
}

// ============================================
// USE ME - Get current user with auto-refresh
// ============================================

export function useMe() {
  const { isAuthenticated, accessToken } = useAuthStore();

  return useQuery({
    queryKey: ["me", accessToken], // Re-fetch when token changes
    queryFn: async (): Promise<User> => {
      const { data } = await api.get<User>("/auth/me");
      return data;
    },
    enabled: isAuthenticated && !!accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 401
      if (error?.statusCode === 401) return false;
      return failureCount < 3;
    },
  });
}

// ============================================
// USE REFRESH TOKEN
// ============================================

export function useRefreshToken() {
  return useMutation({
    mutationFn: async (): Promise<string> => {
      return AuthService.refreshAccessToken();
    },
    onError: () => {
      toast.error("Sesión expirada. Por favor inicia sesión nuevamente.");
    },
  });
}

// ============================================
// COMPREHENSIVE AUTH HOOK
// ============================================

interface UseAuthOptions {
  redirectTo?: string;
  requiredRoles?: UserRole[];
  onUnauthorized?: () => void;
}

export function useAuth(options: UseAuthOptions = {}) {
  const { redirectTo, requiredRoles, onUnauthorized } = options;
  const router = useRouter();

  // Store state
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const error = useAuthStore((state) => state.error);
  const accessToken = useAuthStore((state) => state.accessToken);

  // Local state
  const [isHydrated, setIsHydrated] = useState(false);
  const hasCheckedRef = useRef(false);

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (hasCheckedRef.current) return;
      hasCheckedRef.current = true;

      const isValid = AuthService.validateSession();

      if (!isValid && isAuthenticated) {
        await AuthService.logout(false);
        if (redirectTo) {
          router.replace(redirectTo);
        }
        onUnauthorized?.();
      }
    };

    checkAuth();
    setIsHydrated(true);
  }, [isAuthenticated, redirectTo, router, onUnauthorized]);

  // Check roles
  const hasRequiredRoles = useCallback(() => {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    if (!user) return false;
    return requiredRoles.includes(user.rol);
  }, [user, requiredRoles]);

  // Redirect if no access
  useEffect(() => {
    if (!isHydrated) return;

    if (isAuthenticated && requiredRoles && !hasRequiredRoles()) {
      router.replace("/unauthorized");
    }
  }, [isAuthenticated, requiredRoles, hasRequiredRoles, router, isHydrated]);

  // Actions
  const login = useCallback(
    async (email: string, password: string, tiendaId?: number) => {
      try {
        const user = await AuthService.login({ email, password, tiendaId });
        return { success: true, user };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || "Error al iniciar sesión",
        };
      }
    },
    [],
  );

  const register = useCallback(
    async (data: {
      email: string;
      password: string;
      nombre: string;
      apellido?: string;
    }) => {
      try {
        const user = await AuthService.register(data);
        return { success: true, user };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || "Error al registrarse",
        };
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    await AuthService.logout();
  }, []);

  const logoutSilent = useCallback(async () => {
    await AuthService.logout(false);
  }, []);

  const clearError = useCallback(() => {
    useAuthStore.getState().clearError();
  }, []);

  const setTienda = useCallback((tiendaId: number | null) => {
    useAuthStore.getState().setSelectedTienda(tiendaId);
  }, []);

  // Role checks
  const roleChecks = {
    isClient: user?.rol === "CLIENTE",
    isWarehouse: user?.rol === "BODEGA",
    isCashier: user?.rol === "CAJERO",
    isCounter: user?.rol === "MOSTRADOR",
    isAdmin: user?.rol === "ADMIN",
    hasRole: (roles: UserRole[]) => (user ? roles.includes(user.rol) : false),
  };

  return {
    // State
    user,
    isAuthenticated,
    isLoading: !isHydrated,
    isHydrated,
    error,
    accessToken,

    // Role checks
    ...roleChecks,

    // Actions
    login,
    register,
    logout,
    logoutSilent,
    clearError,
    setTienda,

    // Helpers
    hasRequiredRoles: hasRequiredRoles(),
    tiendaId: useAuthStore.getState().selectedTiendaId,
  };
}

// ============================================
// USE REQUIRE AUTH - For protected pages
// ============================================

export function useRequireAuth(
  options: Omit<UseAuthOptions, "onUnauthorized"> = {},
) {
  const { redirectTo = "/login", requiredRoles } = options;
  const router = useRouter();

  const auth = useAuth({
    redirectTo,
    requiredRoles,
    onUnauthorized: () => {
      router.replace(redirectTo);
    },
  });

  return auth;
}

// ============================================
// USE AUTH GUARD - Simple boolean check
// ============================================

export function useAuthGuard(requiredRoles?: UserRole[]) {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const hasAccess =
    isAuthenticated &&
    (!requiredRoles ||
      requiredRoles.length === 0 ||
      (user && requiredRoles.includes(user.rol)));

  return {
    hasAccess,
    isAuthenticated,
    user,
  };
}

// ============================================
// LEGACY EXPORTS (for backwards compatibility)
// ============================================

export const legacyLogout = () => {
  const store = useAuthStore.getState();
  store.logout();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
};
