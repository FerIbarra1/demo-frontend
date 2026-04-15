import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface KioskState {
  isKioskMode: boolean;
  kioskId: string | null;
  tiendaId: number | null;
  tiendaNombre: string | null;

  // Actions
  activateKiosk: (tiendaId: number, tiendaNombre: string, kioskId: string) => void;
  deactivateKiosk: () => void;
}

export const useKioskStore = create<KioskState>()(
  persist(
    (set) => ({
      isKioskMode: false,
      kioskId: null,
      tiendaId: null,
      tiendaNombre: null,

      activateKiosk: (tiendaId, tiendaNombre, kioskId) =>
        set({
          isKioskMode: true,
          tiendaId,
          tiendaNombre,
          kioskId
        }),

      deactivateKiosk: () =>
        set({
          isKioskMode: false,
          tiendaId: null,
          tiendaNombre: null,
          kioskId: null
        }),
    }),
    {
      name: 'kiosk-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
