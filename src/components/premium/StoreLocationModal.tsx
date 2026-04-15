'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ChevronRight, Store, ChevronLeft, Loader2, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/stores/auth';
import { useKioskStore } from '@/lib/stores/kioskStore';

interface StoreLocationModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

interface Tienda {
  id: number;
  nombre: string;
  direccion: string;
  ciudad: string;
  estado: string;
}

export function StoreLocationModal({ isOpen, onComplete }: StoreLocationModalProps) {
  const [step, setStep] = useState<'estado' | 'ciudad' | 'tienda'>('estado');
  const [estados, setEstados] = useState<string[]>([]);
  const [ciudades, setCiudades] = useState<string[]>([]);
  const [tiendas, setTiendas] = useState<Tienda[]>([]);
  const [selectedEstado, setSelectedEstado] = useState<string | null>(null);
  const [selectedCiudad, setSelectedCiudad] = useState<string | null>(null);
  const [selectedTienda, setSelectedTienda] = useState<Tienda | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const setSelectedTiendaId = useAuthStore((state) => state.setSelectedTienda);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Load estados on mount
  useEffect(() => {
    if (isOpen) {
      loadEstados();
    }
  }, [isOpen]);

  const loadEstados = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/tiendas/estados`);
      const data = await res.json();
      // Ensure data is an array
      setEstados(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading estados:', error);
      setEstados([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCiudades = async (estado: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/tiendas/ciudades?estado=${encodeURIComponent(estado)}`);
      const data = await res.json();
      setCiudades(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading ciudades:', error);
      setCiudades([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTiendas = async (estado: string, ciudad: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/tiendas?estado=${encodeURIComponent(estado)}&ciudad=${encodeURIComponent(ciudad)}`
      );
      const data = await res.json();
      setTiendas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading tiendas:', error);
      setTiendas([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectEstado = (estado: string) => {
    setSelectedEstado(estado);
    loadCiudades(estado);
    setStep('ciudad');
  };

  const handleSelectCiudad = (ciudad: string) => {
    setSelectedCiudad(ciudad);
    if (selectedEstado) {
      loadTiendas(selectedEstado, ciudad);
    }
    setStep('tienda');
  };

  const handleSelectTienda = (tienda: Tienda) => {
    setSelectedTienda(tienda);
    setSelectedTiendaId(tienda.id);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  const handleBack = () => {
    if (step === 'tienda') {
      setStep('ciudad');
      setSelectedTienda(null);
    } else if (step === 'ciudad') {
      setStep('estado');
      setSelectedCiudad(null);
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'estado':
        return 'Selecciona tu estado';
      case 'ciudad':
        return selectedEstado || 'Selecciona tu ciudad';
      case 'tienda':
        return selectedCiudad || 'Selecciona una sucursal';
    }
  };

  const getStepSubtitle = () => {
    switch (step) {
      case 'estado':
        return 'Encuentra tiendas disponibles en tu ubicación';
      case 'ciudad':
        return `Ciudades disponibles en ${selectedEstado}`;
      case 'tienda':
        return `Sucursales en ${selectedCiudad}`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="!max-w-lg w-full p-0 overflow-hidden bg-background border shadow-2xl [&>button]:hidden">
        <DialogTitle className="sr-only">Seleccionar Ubicación</DialogTitle>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            {step !== 'estado' && (
              <button
                onClick={handleBack}
                className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div className={step === 'estado' ? 'ml-0' : ''}>
              <h2 className="font-serif text-2xl sm:text-3xl mb-1">{getStepTitle()}</h2>
              <p className="text-muted-foreground text-sm">{getStepSubtitle()}</p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex gap-2 mb-6">
            {['estado', 'ciudad', 'tienda'].map((s, i) => (
              <div
                key={s}
                className={cn(
                  'h-1 flex-1 rounded-full transition-colors',
                  step === s ? 'bg-accent' : step === 'tienda' || (step === 'ciudad' && i < 1) || (step === 'estado' && i === 0) ? 'bg-accent/30' : 'bg-secondary'
                )}
              />
            ))}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-accent mb-4" />
              <p className="text-muted-foreground">Cargando...</p>
            </div>
          )}

          {/* Estado Step */}
          <AnimatePresence mode="wait">
            {!isLoading && step === 'estado' && (
              <motion.div
                key="estado"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                {estados.map((estado, index) => (
                  <motion.button
                    key={estado}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSelectEstado(estado)}
                    className={cn(
                      'flex items-center gap-3 p-4 rounded-xl border-2 transition-all',
                      'hover:border-accent/50 hover:bg-accent/5',
                      'border-border bg-background text-left'
                    )}
                  >
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-accent" />
                    </div>
                    <span className="font-medium">{estado}</span>
                    <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
                  </motion.button>
                ))}
              </motion.div>
            )}

            {/* Ciudad Step */}
            {!isLoading && step === 'ciudad' && (
              <motion.div
                key="ciudad"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 gap-3"
              >
                {ciudades.map((ciudad, index) => (
                  <motion.button
                    key={ciudad}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSelectCiudad(ciudad)}
                    className={cn(
                      'flex items-center gap-3 p-4 rounded-xl border-2 transition-all',
                      'hover:border-accent/50 hover:bg-accent/5',
                      'border-border bg-background text-left'
                    )}
                  >
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <span className="font-medium">{ciudad}</span>
                    <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
                  </motion.button>
                ))}
              </motion.div>
            )}

            {/* Tienda Step */}
            {!isLoading && step === 'tienda' && (
              <motion.div
                key="tienda"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 gap-3"
              >
                {tiendas.map((tienda, index) => (
                  <motion.button
                    key={tienda.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSelectTienda(tienda)}
                    className={cn(
                      'flex items-center gap-3 p-4 rounded-xl border-2 transition-all',
                      'hover:border-accent/50 hover:bg-accent/5',
                      selectedTienda?.id === tienda.id
                        ? 'border-accent bg-accent/5'
                        : 'border-border bg-background',
                      'text-left'
                    )}
                  >
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <Store className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <span className="font-medium block">{tienda.nombre}</span>
                      <span className="text-sm text-muted-foreground">{tienda.direccion}</span>
                    </div>
                    {selectedTienda?.id === tienda.id && (
                      <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                        <Check className="w-4 h-4 text-accent-foreground" />
                      </div>
                    )}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty State */}
          {!isLoading && step === 'tienda' && tiendas.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No hay tiendas disponibles en esta ubicación</p>
              <Button variant="outline" onClick={handleBack} className="mt-4">
                Intentar otra ubicación
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-muted/50 p-4 text-center">
          <p className="text-xs text-muted-foreground">
            Podrás cambiar tu tienda preferida en cualquier momento desde tu perfil
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// STORE LOCATION GUARD
// Shows modal on homepage
// ============================================

export function StoreLocationGuard({ children }: { children: React.ReactNode }) {
  const [showModal, setShowModal] = useState(false);
  const pathname = usePathname();
  const selectedTiendaId = useAuthStore((state) => state.selectedTiendaId);
  const { isKioskMode } = useKioskStore();

  useEffect(() => {
    // Skip if in kiosk mode
    if (isKioskMode) return;

    // Check if on homepage and no store selected
    if (pathname === '/' && !selectedTiendaId) {
      // Small delay to prevent flash
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [pathname, selectedTiendaId]);

  const handleComplete = () => {
    setShowModal(false);
  };

  return (
    <>
      {children}
      <StoreLocationModal isOpen={showModal} onComplete={handleComplete} />
    </>
  );
}

import { usePathname } from 'next/navigation';
