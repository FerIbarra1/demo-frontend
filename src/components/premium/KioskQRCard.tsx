'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Timer, Smartphone, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useKioskToken } from '@/lib/hooks';

export function KioskQRCard() {
  const { data, isLoading, isError, refetch, isFetching } = useKioskToken();
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!data?.expiresAt) return;

    const timer = setInterval(() => {
      const expires = new Date(data.expiresAt).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((expires - now) / 1000));

      setTimeLeft(diff);

      if (diff === 0) {
        refetch();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [data, refetch]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-card rounded-3xl p-6 border shadow-sm overflow-hidden relative">
      <div className="flex flex-col items-center text-center space-y-6">
        {/* Icon & Label */}
        <div className="flex items-center gap-2 text-accent bg-accent/10 px-4 py-2 rounded-full">
          <Smartphone className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Acceso Kiosko</span>
        </div>

        <div className="space-y-2">
          <h3 className="font-serif text-2xl">Tu Identidad Digital</h3>
          <p className="text-muted-foreground text-sm max-w-[240px]">
            Acerca este código al escáner del kiosko para iniciar sesión
          </p>
        </div>

        {/* QR Code Container */}
        <div className="relative p-6 bg-white rounded-2xl shadow-inner border-4 border-secondary">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-[200px] h-[200px] flex items-center justify-center bg-secondary/20 rounded-lg"
              >
                <RefreshCw className="w-10 h-10 animate-spin text-accent/50" />
              </motion.div>
            ) : isError ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-[200px] h-[200px] flex flex-col items-center justify-center gap-4 text-destructive"
              >
                <p className="text-xs font-medium">Error al generar QR</p>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Reintentar
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="qr"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative"
              >
                <QRCodeSVG
                  value={data?.kioskToken || ''}
                  size={200}
                  level="H"
                  includeMargin={false}
                  imageSettings={{
                    src: "/favicon.ico", // Opcional: logo en el centro
                    x: undefined,
                    y: undefined,
                    height: 40,
                    width: 40,
                    excavate: true,
                  }}
                />
                {isFetching && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-lg backdrop-blur-[1px]">
                    <RefreshCw className="w-8 h-8 animate-spin text-accent" />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Info */}
        <div className="w-full pt-2 flex flex-col items-center gap-4">
          <div className="flex items-center gap-4 text-sm font-medium">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Timer className="w-4 h-4" />
              <span>Expira en:</span>
            </div>
            <span className={timeLeft < 30 ? 'text-destructive animate-pulse' : 'text-foreground'}>
              {formatTime(timeLeft)}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-accent hover:text-accent hover:bg-accent/5 gap-2"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            Actualizar código
          </Button>
        </div>
      </div>

      {/* Decorative background element */}
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-accent/5 rounded-full blur-3xl -z-10" />
      <div className="absolute -top-10 -left-10 w-32 h-32 bg-accent/5 rounded-full blur-3xl -z-10" />
    </div>
  );
}
