"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth";
import { UserRole } from "@/lib/types";

interface UseProtectedRouteOptions {
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export function useProtectedRoute(options: UseProtectedRouteOptions = {}) {
  const { allowedRoles, redirectTo = "/login" } = options;
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);

  useEffect(() => {
    // Wait for store to hydrate before making any routing decisions
    if (!_hasHydrated) return;

    // 1. If NOT authenticated:
    if (!isAuthenticated) {
      // Avoid redirecting if we are already on login/register/unauthorized
      const publicPaths = ["/login", "/registro", "/unauthorized"];
      if (!publicPaths.some(path => pathname?.startsWith(path))) {
        router.push(`${redirectTo}?redirect=${encodeURIComponent(pathname)}`);
      }
      return;
    }

    // 2. If authenticated:

    // Check role authorization if specified
    if (allowedRoles && allowedRoles.length > 0 && user) {
      if (!allowedRoles.includes(user.rol)) {
        router.push("/unauthorized");
        return;
      }
    }

    // Redirect away from root to appropriate dashboard
    if (pathname === "/") {
      const targetPath = getDashboardPath(user?.rol);
      if (targetPath && targetPath !== pathname) {
        router.push(targetPath);
      }
    }
  }, [isAuthenticated, user, pathname, router, allowedRoles, redirectTo, _hasHydrated]);

  return { isAuthenticated, user, isLoading: !_hasHydrated };
}

export function getDashboardPath(role?: UserRole): string | null {
  switch (role) {
    case "CLIENTE":
      return "/catalogo";
    case "BODEGA":
      return "/bodega";
    case "CAJERO":
      return "/cajero";
    case "MOSTRADOR":
      return "/mostrador";
    case "ADMIN":
      return "/admin";
    default:
      return null;
  }
}

// Hook for CLIENTE only
export function useClienteRoute() {
  return useProtectedRoute({ allowedRoles: ["CLIENTE"] });
}

// Hook for BODEGA only
export function useBodegaRoute() {
  return useProtectedRoute({ allowedRoles: ["BODEGA"] });
}

// Hook for CAJERO only
export function useCajeroRoute() {
  return useProtectedRoute({ allowedRoles: ["CAJERO"] });
}

// Hook for MOSTRADOR only
export function useMostradorRoute() {
  return useProtectedRoute({ allowedRoles: ["MOSTRADOR"] });
}

// Hook for ADMIN only
export function useAdminRoute() {
  return useProtectedRoute({ allowedRoles: ["ADMIN"] });
}

// Hook for any authenticated employee (not CLIENTE)
export function useEmployeeRoute() {
  return useProtectedRoute({
    allowedRoles: ["BODEGA", "CAJERO", "MOSTRADOR", "ADMIN"],
  });
}
