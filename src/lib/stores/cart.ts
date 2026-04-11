import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CarritoItem, Producto, ProductoVariante } from '@/lib/types';

interface CartState {
  items: CarritoItem[];

  // Actions
  addItem: (producto: Producto, variante: ProductoVariante, cantidad: number) => void;
  removeItem: (precioCOId: number) => void;
  updateQuantity: (precioCOId: number, cantidad: number) => void;
  clearCart: () => void;

  // Getters
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemCount: (precioCOId: number) => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (producto, variante, cantidad) => {
        const items = get().items;
        const existingItem = items.find((item) => item.precioCOId === variante.id);

        if (existingItem) {
          set({
            items: items.map((item) =>
              item.precioCOId === variante.id
                ? { ...item, cantidad: item.cantidad + cantidad }
                : item
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                precioCOId: variante.id,
                cantidad,
                producto,
                variante,
              },
            ],
          });
        }
      },

      removeItem: (precioCOId) => {
        set({
          items: get().items.filter((item) => item.precioCOId !== precioCOId),
        });
      },

      updateQuantity: (precioCOId, cantidad) => {
        if (cantidad <= 0) {
          get().removeItem(precioCOId);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.precioCOId === precioCOId ? { ...item, cantidad } : item
          ),
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.cantidad, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.variante!.precio * item.cantidad,
          0
        );
      },

      getItemCount: (precioCOId) => {
        const item = get().items.find((item) => item.precioCOId === precioCOId);
        return item?.cantidad || 0;
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
