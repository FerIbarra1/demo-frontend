'use client';

import { useEffect, useRef, useState } from 'react';
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
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (isKioskMode && isAuthenticated) {
      timerRef.current = setTimeout(() => {
        handleTimeout();
      }, timeoutMs);
    }
  };

  const handleTimeout = () => {
    // Solo cerrar sesión si no estamos ya en la página de bienvenida o login
    const publicPaths = ['/kiosko/welcome', '/kiosko/scan', '/login'];
    if (publicPaths.some(path => pathname?.startsWith(path))) return;

    toast.info("Sesión cerrada por inactividad", {
      description: "Vuelve a escanear tu QR para continuar."
    });

    logout(false); // Logout sin redirección automática de window.location
    router.push('/kiosko/welcome');
  };

  useEffect(() => {
    if (!isKioskMode || !isAuthenticated) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    const handleEvent = () => resetTimer();

    // Inicializar timer
    resetTimer();

    // Agregar listeners
    events.forEach(event => {
      window.addEventListener(event, handleEvent);
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(event => {
        window.removeEventListener(event, handleEvent);
      });
    };
  }, [isKioskMode, isAuthenticated, pathname]);

  return { resetTimer };
}
