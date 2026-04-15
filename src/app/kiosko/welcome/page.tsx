'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Smartphone, User, ChevronRight, Store, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useKioskStore } from '@/lib/stores/kioskStore';
import { useEffect } from 'react';

export default function KioskWelcomePage() {
  const router = useRouter();
  const { isKioskMode, tiendaNombre } = useKioskStore();

  // Redirigir si no está en modo kiosko
  useEffect(() => {
    if (!isKioskMode) {
      router.push('/');
    }
  }, [isKioskMode, router]);

  const handleGuestMode = () => {
    router.push('/catalogo');
  };

  const handleScanQR = () => {
    router.push('/kiosko/scan');
  };

  if (!isKioskMode) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />

      {/* Header */}
      <header className="p-8 flex justify-between items-center relative z-10">
        <div className="flex flex-col">
          <span className="font-serif text-4xl font-medium tracking-tight">Demo</span>
          <span className="text-xs tracking-[0.3em] uppercase text-muted-foreground">{tiendaNombre || 'Sucursal'}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground bg-secondary/50 px-4 py-2 rounded-full border border-border/50">
          <Store className="w-4 h-4" />
          <span className="text-xs font-medium uppercase tracking-wider">Kiosko Activo</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 mb-16"
        >
          <h1 className="font-serif text-5xl md:text-7xl font-medium text-foreground tracking-tight">
            Bienvenido a <br /> <span className="text-accent">nuestra tienda</span>
          </h1>
          <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">
            Vive la experiencia premium. Elige cómo prefieres comprar hoy.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          {/* Option 1: Login QR */}
          <motion.div
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
            whileTap={{ scale: 0.98 }}
            className="group"
          >
            <button
              onClick={handleScanQR}
              className="w-full h-full bg-card border-2 border-border/50 hover:border-accent p-8 rounded-[40px] text-left transition-all shadow-sm hover:shadow-2xl flex flex-col justify-between"
            >
              <div className="w-16 h-16 bg-accent/10 text-accent rounded-2xl flex items-center justify-center mb-12 group-hover:scale-110 transition-transform duration-500">
                <Smartphone className="w-8 h-8" />
              </div>
              <div>
                <h2 className="font-serif text-3xl font-medium mb-2 group-hover:text-accent transition-colors">Tengo cuenta</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Escanea tu código QR desde la app para acumular puntos y ver tus favoritos.
                </p>
                <div className="flex items-center gap-2 text-accent font-medium uppercase tracking-widest text-xs">
                  Escanea ahora <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </button>
          </motion.div>

          {/* Option 2: Guest Mode */}
          <motion.div
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
            whileTap={{ scale: 0.98 }}
            className="group"
          >
            <button
              onClick={handleGuestMode}
              className="w-full h-full bg-foreground text-background p-8 rounded-[40px] text-left transition-all shadow-lg hover:shadow-2xl flex flex-col justify-between"
            >
              <div className="w-16 h-16 bg-white/10 text-white rounded-2xl flex items-center justify-center mb-12 group-hover:scale-110 transition-transform duration-500">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h2 className="font-serif text-3xl font-medium mb-2">Comprar sin cuenta</h2>
                <p className="text-background/60 leading-relaxed mb-6">
                  Explora nuestro catálogo completo y realiza tu pedido de forma rápida.
                </p>
                <div className="flex items-center gap-2 text-accent font-medium uppercase tracking-widest text-xs">
                  Entrar como invitado <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </button>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-8 text-center text-muted-foreground/40 text-[10px] uppercase tracking-[0.4em] font-bold">
        Demo Premium Experience • Touch to begin
      </footer>

      {/* Full screen click area to start (Standard Kiosk behavior) */}
      {!isKioskMode && (
         <div className="absolute inset-0 cursor-pointer" onClick={() => {}} />
      )}
    </div>
  );
}
