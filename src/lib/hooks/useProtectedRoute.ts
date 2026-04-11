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
  const { isAuthenticated, user, hasRole } = useAuthStore();

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated) {
      router.push(`${redirectTo}?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // Check role authorization
    if (allowedRoles && allowedRoles.length > 0) {
      if (!hasRole(allowedRoles)) {
        router.push("/unauthorized");
        return;
      }
    }

    // Redirect to role-specific dashboard if on root
    if (pathname === "/" || pathname === "/login") {
      const targetPath = getDashboardPath(user?.rol);
      if (targetPath) {
        router.push(targetPath);
      }
    }
  }, [isAuthenticated, user, pathname, router, allowedRoles, redirectTo, hasRole]);

  return { isAuthenticated, user };
}

function getDashboardPath(role?: UserRole): string | null {
  switch (role) {
    case "CLIENTE":
      return "/tienda";
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
