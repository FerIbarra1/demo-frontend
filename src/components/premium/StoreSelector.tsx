'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ChevronRight, Store, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Tienda } from '@/lib/types';
import { useTiendas, useTienda } from '@/lib/hooks';
import { useAuthStore } from '@/lib/stores/auth';

interface StoreSelectorModalProps {
  isOpen: boolean;
  onSelect: (tienda: Tienda) => void;
  onClose?: () => void;
  allowClose?: boolean;
}

export function StoreSelectorModal({
  isOpen,
  onSelect,
  onClose,
  allowClose = false,
}: StoreSelectorModalProps) {
  const { data: tiendas, isLoading, error } = useTiendas();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const handleSelect = (tienda: Tienda) => {
    setSelectedId(tienda.id);
    // Pequeña demora para mostrar feedback visual
    setTimeout(() => {
      onSelect(tienda);
    }, 300);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && allowClose && onClose?.()}>
      <DialogContent
        className={cn(
          'max-w-lg w-[calc(100%-2rem)] p-0 overflow-hidden',
          'bg-background border shadow-2xl',
          !allowClose && '[&>button]:hidden'
        )}
      >
        <DialogTitle className="sr-only">Seleccionar Sucursal</DialogTitle>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-accent" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl mb-2">
              Selecciona tu sucursal
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Elige la tienda más cercana para ver disponibilidad y realizar pedidos
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-accent mb-4" />
              <p className="text-muted-foreground">Cargando sucursales...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-8">
              <p className="text-destructive mb-4">
                Error al cargar las sucursales
              </p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Intentar de nuevo
              </Button>
            </div>
          )}

          {/* Stores List */}
          {tiendas && tiendas.length > 0 && (
            <div className="space-y-3">
              {tiendas.map((tienda, index) => (
                <motion.button
                  key={tienda.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleSelect(tienda)}
                  className={cn(
                    'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300',
                    'hover:border-accent/50 hover:bg-accent/5',
                    selectedId === tienda.id
                      ? 'border-accent bg-accent/5'
                      : 'border-border bg-background'
                  )}
                >
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-foreground" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-left">
                    <h3 className="font-medium text-foreground">
                      {tienda.nombre}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {tienda.direccion || 'Dirección no disponible'}
                    </p>
                  </div>

                  {/* Arrow */}
                  <ChevronRight
                    className={cn(
                      'w-5 h-5 text-muted-foreground transition-all duration-300',
                      selectedId === tienda.id
                        ? 'translate-x-1 text-accent'
                        : ''
                    )}
                  />
                </motion.button>
              ))}
            </div>
          )}

          {/* No Stores */}
          {tiendas && tiendas.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No hay sucursales disponibles
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-muted/50 p-4 text-center">
          <p className="text-xs text-muted-foreground">
            Podrás cambiar de sucursal en cualquier momento desde el menú
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// STORE BADGE - Shows selected store in navbar
// ============================================

interface StoreBadgeProps {
  tiendaId: number | null;
  onClick?: () => void;
}

export function StoreBadge({ tiendaId, onClick }: StoreBadgeProps) {
  const { data: tienda, isLoading } = useTienda(tiendaId || 0);

  if (!tiendaId) return null;

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-full',
        'bg-secondary hover:bg-secondary/80 transition-colors',
        'text-sm font-medium'
      )}
    >
      <MapPin className="w-3.5 h-3.5 text-accent" />
      {isLoading ? (
        <span className="w-16 h-4 bg-muted animate-pulse rounded" />
      ) : (
        <span className="max-w-[120px] truncate">{tienda?.nombre || 'Tienda'}</span>
      )}
    </button>
  );
}

// ============================================
// STORE SELECTOR TRIGGER - For navbar
// ============================================

export function useStoreSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const selectedTiendaId = useAuthStore((state) => state.selectedTiendaId);
  const setSelectedTienda = useAuthStore((state) => state.setSelectedTienda);

  const handleSelect = (tienda: Tienda) => {
    setSelectedTienda(tienda.id);
    setIsOpen(false);
  };

  return {
    isOpen,
    setIsOpen,
    selectedTiendaId,
    handleSelect,
    StoreSelectorModal: (
      <StoreSelectorModal
        isOpen={isOpen}
        onSelect={handleSelect}
        onClose={() => setIsOpen(false)}
        allowClose={true}
      />
    ),
  };
}
