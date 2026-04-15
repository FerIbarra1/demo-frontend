'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Store, Monitor, CheckCircle2, ChevronRight, ChevronLeft, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdminRoute, useTiendas } from '@/lib/hooks';
import { useKioskStore } from '@/lib/stores/kioskStore';
import { cn } from '@/lib/utils';
import { Tienda } from '@/lib/types';

export default function KioskSetupPage() {
  // Solo administradores pueden configurar el kiosko
  const { isLoading: isAuthLoading } = useAdminRoute();

  const router = useRouter();
  const { isKioskMode, activateKiosk, deactivateKiosk, tiendaNombre, kioskId: currentKioskId } = useKioskStore();

  const [step, setStep] = useState<1 | 2>(1); // 1: Seleccionar Tienda, 2: Identificar Kiosko
  const [selectedTienda, setSelectedTienda] = useState<Tienda | null>(null);
  const [kioskId, setKioskId] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const { data: tiendas, isLoading: isTiendasLoading, isError } = useTiendas();

  // Si ya es un kiosko, mostrar estado actual primero
  useEffect(() => {
    if (isKioskMode && !isSuccess) {
      // Opcional: podrías saltar al estado de "Ya configurado"
    }
  }, [isKioskMode, isSuccess]);

  const handleSelectTienda = (tienda: Tienda) => {
    setSelectedTienda(tienda);
    setStep(2);
  };

  const handleActivate = () => {
    if (selectedTienda && kioskId) {
      activateKiosk(selectedTienda.id, selectedTienda.nombre, kioskId);
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/'); // Al home, que ahora detectará el modo kiosko
      }, 2000);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full text-center space-y-6"
        >
          <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-serif">¡Kiosko Activado!</h1>
            <p className="text-muted-foreground">
              Este dispositivo ha sido vinculado a <strong>{selectedTienda?.nombre}</strong> como <strong>{kioskId}</strong>.
            </p>
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">Redirigiendo a interfaz de kiosko...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-background rounded-3xl border shadow-xl overflow-hidden">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-accent/10 text-accent rounded-2xl flex items-center justify-center">
                <Monitor className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-medium">Configuración de Kiosko</h1>
                <p className="text-sm text-muted-foreground tracking-wide">Vincula este dispositivo a una tienda física</p>
              </div>
            </div>
            {isKioskMode && (
              <Button
                variant="outline"
                size="sm"
                className="text-destructive border-destructive/20 hover:bg-destructive/5"
                onClick={() => deactivateKiosk()}
              >
                Desactivar Modo Kiosko
              </Button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <Label className="text-base font-medium">1. Selecciona la sucursal física</Label>
                  {isTiendasLoading ? (
                    <div className="py-12 flex justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-accent" />
                    </div>
                  ) : isError ? (
                    <div className="p-4 bg-destructive/10 text-destructive rounded-xl flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5" />
                      <p className="text-sm">Error al cargar sucursales</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {tiendas?.map((tienda) => (
                        <button
                          key={tienda.id}
                          onClick={() => handleSelectTienda(tienda)}
                          className={cn(
                            "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left",
                            "hover:border-accent/50 hover:bg-accent/5 border-border bg-card"
                          )}
                        >
                          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                            <Store className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-medium block">{tienda.nombre}</span>
                            <span className="text-xs text-muted-foreground line-clamp-1">{tienda.ciudad}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Cambiar sucursal
                </button>

                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-accent/5 border border-accent/20 rounded-2xl">
                    <div className="w-10 h-10 bg-accent/10 text-accent rounded-xl flex items-center justify-center">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Sucursal Seleccionada</p>
                      <p className="font-medium">{selectedTienda?.nombre}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="kiosk-id" className="text-base font-medium">2. Identificador del Kiosko</Label>
                    <Input
                      id="kiosk-id"
                      placeholder="Ej: Kiosko Entrada 1, Tablet Barra..."
                      value={kioskId}
                      onChange={(e) => setKioskId(e.target.value)}
                      className="h-14 bg-secondary/50 border-transparent focus:bg-background focus:ring-accent/20 transition-all text-lg"
                    />
                    <p className="text-xs text-muted-foreground">Este nombre servirá para rastrear desde dónde se hicieron los pedidos.</p>
                  </div>
                </div>

                <Button
                  className="w-full h-14 text-lg font-medium btn-shine"
                  disabled={!kioskId.trim()}
                  onClick={handleActivate}
                >
                  Activar este dispositivo como Kiosko
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="bg-secondary/50 p-4 border-t flex items-center justify-center gap-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">Modo Administrativo</p>
        </div>
      </div>
    </div>
  );
}
