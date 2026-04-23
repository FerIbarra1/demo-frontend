'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';
import { useKioskStore } from '@/lib/stores/kioskStore';
import { toast } from 'sonner';

const DEFAULT_TIMEOUT = 2 * 60 * 1000; // 2 minutos

export function useKioskInactivity(timeoutMs = DEFAULT_TIMEOUT) {
  const router = useRouter();
  const pathname = usePathname();
  const { isKioskMode } = useKioskStore();
  const { isAuthenticated, logout } = useAuthStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef({ isKioskMode, isAuthenticated, pathname, logout, router });

  // Keep latest values in ref without causing re-subscription
  useEffect(() => {
    stateRef.current = { isKioskMode, isAuthenticated, pathname, logout, router };
  });

  useEffect(() => {
    if (!isKioskMode || !isAuthenticated) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const handleTimeout = () => {
      const state = stateRef.current;
      const publicPaths = ['/kiosko/welcome', '/kiosko/scan', '/login'];
      if (publicPaths.some(path => state.pathname?.startsWith(path))) return;

      toast.info("Sesión cerrada por inactividad", {
        description: "Vuelve a escanear tu QR para continuar."
      });

      state.logout(false);
      state.router.push('/kiosko/welcome');
    };

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (stateRef.current.isKioskMode && stateRef.current.isAuthenticated) {
        timerRef.current = setTimeout(handleTimeout, timeoutMs);
      }
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    const handleEvent = () => resetTimer();

    resetTimer();
    events.forEach(event => window.addEventListener(event, handleEvent));

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(event => window.removeEventListener(event, handleEvent));
    };
  }, [isKioskMode, isAuthenticated, timeoutMs]);

  return { resetTimer: () => {} };
}
