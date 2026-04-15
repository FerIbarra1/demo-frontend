'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, X, Loader2, Camera, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { useKioskLogin } from '@/lib/hooks';
import { useKioskStore } from '@/lib/stores/kioskStore';
import { toast } from 'sonner';

export default function KioskScanPage() {
  const router = useRouter();
  const { isKioskMode } = useKioskStore();
  const { mutate: login, isPending, isSuccess } = useKioskLogin();

  const [error, setError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const mountedRef = useRef(true);

  // Redirigir si no está en modo kiosko
  useEffect(() => {
    mountedRef.current = true;
    if (!isKioskMode) {
      router.push('/');
    }
    return () => {
      mountedRef.current = false;
    };
  }, [isKioskMode, router]);

  useEffect(() => {
    // Inicializar scanner
    const startScanner = async () => {
      try {
        // Asegurarnos de que el elemento existe
        const element = document.getElementById("reader");
        if (!element) return;

        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;

        const config = { fps: 15, qrbox: { width: 280, height: 280 } };

        await html5QrCode.start(
          { facingMode: { ideal: "environment" } },
          config,
          (decodedText) => {
            if (mountedRef.current) {
              handleScanSuccess(decodedText);
            }
          },
          () => {}
        );

        if (mountedRef.current) {
          setCameraActive(true);
        }
      } catch (err) {
        console.error("Error al iniciar cámara:", err);
        if (mountedRef.current) {
          setError("No se pudo acceder a la cámara. Por favor verifica los permisos.");
        }
      }
    };

    if (isKioskMode && !isPending && !isSuccess) {
      // Pequeño delay para asegurar que el DOM esté listo
      const timer = setTimeout(startScanner, 500);
      return () => clearTimeout(timer);
    }

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [isKioskMode, isPending, isSuccess]);

  const handleScanSuccess = async (token: string) => {
    // Si ya estamos procesando, ignorar
    if (isPending || isSuccess) return;

    // Detener la cámara inmediatamente para evitar errores de DOM al cambiar de vista
    if (scannerRef.current?.isScanning) {
      try {
        await scannerRef.current.stop();
        setCameraActive(false);
      } catch (e) {
        console.error("Error stopping scanner:", e);
      }
    }

    // Sonido de feedback
    try {
      const audio = new Audio('/scan-success.mp3');
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Ignorar errores de reproducción (usualmente por políticas de auto-play o unmount)
        });
      }
    } catch (e) {}

    login(token);
  };

  const handleClose = () => {
    if (scannerRef.current?.isScanning) {
      scannerRef.current.stop().then(() => {
        router.push('/kiosko/welcome');
      });
    } else {
      router.push('/kiosko/welcome');
    }
  };

  if (!isKioskMode) return null;

  return (
    <div className="min-h-screen bg-foreground flex flex-col relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />

      {/* Header */}
      <header className="p-8 flex justify-between items-center relative z-10">
        <Button
          variant="ghost"
          className="text-white hover:bg-white/10 gap-2"
          onClick={handleClose}
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </Button>
        <span className="font-serif text-2xl text-white">Identidad Digital</span>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 -mt-10">
        <div className="w-full max-w-2xl text-center space-y-12">

          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-500/20">
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-4xl font-serif text-white">¡Sesión Iniciada!</h1>
                  <p className="text-white/60 text-lg italic font-light">Preparando tu catálogo personalizado...</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-5xl font-serif text-white tracking-tight">
                    Acerca tu <span className="text-accent text-glow">teléfono</span>
                  </h1>
                  <p className="text-white/60 text-lg max-w-md mx-auto font-light">
                    Muestra el código QR de tu perfil frente a la cámara.
                  </p>
                </div>

                {/* Scanner Container */}
                <div className="relative group mx-auto w-[320px] h-[320px]">
                  {/* Decorative Frame */}
                  <div className="absolute -inset-4 border-2 border-white/10 rounded-[48px] pointer-events-none transition-all group-hover:border-accent/30" />
                  <div className="absolute -inset-1 border border-accent/50 rounded-[40px] pointer-events-none" />

                  {/* Corner Accents */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-accent rounded-tl-2xl" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-accent rounded-tr-2xl" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-accent rounded-bl-2xl" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-accent rounded-br-2xl" />

                  {/* The Reader Wrapper - Key to avoid React DOM conflicts */}
                  <div className="w-full h-full overflow-hidden rounded-[36px] bg-black shadow-2xl relative">
                    <div id="reader" className="w-full h-full" />

                    {!cameraActive && !error && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white/40 bg-black">
                        <Camera className="w-12 h-12 animate-pulse" />
                        <span className="text-xs uppercase tracking-widest font-bold">Activando cámara...</span>
                      </div>
                    )}
                    {error && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center gap-4 bg-destructive/10 text-destructive">
                        <AlertCircle className="w-12 h-12" />
                        <p className="text-sm font-medium">{error}</p>
                      </div>
                    )}
                    {isPending && (
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-accent" />
                        <span className="text-white text-sm font-medium">Validando identidad...</span>
                      </div>
                    )}
                  </div>

                  {/* Scanning Animation Line */}
                  {!isPending && !error && cameraActive && (
                    <motion.div
                      animate={{ top: ['10%', '90%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute left-4 right-4 h-[2px] bg-accent/80 z-10 shadow-[0_0_15px_rgba(196,167,125,0.8)]"
                    />
                  )}
                </div>

                {/* Manual entry option (Optional) */}
                <button
                  className="text-white/40 hover:text-white text-sm transition-colors uppercase tracking-[0.2em] font-bold"
                  onClick={() => router.push('/login')}
                >
                  O usa tu contraseña
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>

      <style jsx global>{`
        #reader video {
          object-fit: cover !important;
          width: 100% !important;
          height: 100% !important;
        }
        #reader__dashboard {
          display: none !important;
        }
        .text-glow {
          text-shadow: 0 0 20px rgba(196,167,125,0.4);
        }
      `}</style>
    </div>
  );
}
