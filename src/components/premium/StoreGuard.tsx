'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { StoreLocationModal } from './StoreLocationModal';
import { useAuthStore } from '@/lib/stores/auth';

import { useKioskStore } from '@/lib/stores/kioskStore';
import { useKioskInactivity } from '@/lib/hooks';

// ============================================
// STORE GUARD
// Automatically shows store location selector for CLIENTE users
// when they don't have a store selected
// Uses flow: Estado -> Ciudad -> Tienda
// ============================================

export function StoreGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const selectedTiendaId = useAuthStore((state) => state.selectedTiendaId);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setSelectedTienda = useAuthStore((state) => state.setSelectedTienda);
  const { isKioskMode, tiendaId: kioskTiendaId } = useKioskStore();
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);

  // Global Inactivity check for Kiosk Mode
  useKioskInactivity();

  // Check if user needs to select a store
  useEffect(() => {
    // If kiosk mode is active, force the store from kiosk config
    if (isKioskMode && kioskTiendaId) {
      if (selectedTiendaId !== kioskTiendaId) {
        setSelectedTienda(kioskTiendaId);
      }
      setIsStoreModalOpen(false);
      return;
    }

    // Only check for CLIENTE role in normal mode
    if (!isAuthenticated || user?.rol !== 'CLIENTE') {
      return;
    }

    // Don't show modal on certain pages
    const excludedPaths = ['/login', '/registro', '/catalogo', '/configuracion', '/kiosko/setup'];
    if (excludedPaths.some(path => pathname?.startsWith(path))) {
      return;
    }

    // Check if store is selected
    if (!selectedTiendaId) {
      // Small delay to prevent flash on initial load
      const timer = setTimeout(() => {
        setIsStoreModalOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user?.rol, selectedTiendaId, pathname, isKioskMode, kioskTiendaId, setSelectedTienda]);

  const handleStoreComplete = () => {
    // The store is already set in the StoreLocationModal via useAuthStore
    setIsStoreModalOpen(false);
  };

  return (
    <>
      {children}
      <StoreLocationModal
        isOpen={isStoreModalOpen}
        onComplete={handleStoreComplete}
      />
    </>
  );
}

// ============================================
// STORE CHECK HOOK
// For use in pages that require a store
// ============================================

export function useStoreCheck() {
  const { user, selectedTiendaId, isAuthenticated } = useAuthStore();
  const [showSelector, setShowSelector] = useState(false);

  const needsStore =
    isAuthenticated &&
    user?.rol === 'CLIENTE' &&
    !selectedTiendaId;

  return {
    needsStore,
    showSelector,
    setShowSelector,
    selectedTiendaId,
    isClient: user?.rol === 'CLIENTE',
  };
}
