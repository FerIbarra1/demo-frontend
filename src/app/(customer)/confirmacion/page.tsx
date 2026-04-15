'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle, Package, ArrowRight, LogOut, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useKioskStore } from '@/lib/stores/kioskStore';
import { useAuthStore } from '@/lib/stores/auth';

export default function ConfirmacionPage() {
  const router = useRouter();
  const { isKioskMode } = useKioskStore();
  const { logout, user } = useAuthStore();
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    if (!isKioskMode) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isKioskMode]);

  const handleLogout = () => {
    logout(false);
    router.push('/kiosko/welcome');
  };

  const handleNewOrder = () => {
    router.push('/catalogo');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="text-center border-2 shadow-2xl overflow-hidden rounded-[40px]">
          {isKioskMode && (
             <div className="bg-accent h-2 transition-all duration-1000" style={{ width: `${(countdown / 30) * 100}%` }} />
          )}

          <CardHeader className="pt-12">
            <div className="mx-auto w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-8 border-4 border-green-500/20">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="font-serif text-4xl md:text-5xl mb-4">
              ¡Gracias {isKioskMode ? user?.nombre : ''}!
            </CardTitle>
            <CardDescription className="text-xl md:text-2xl text-foreground font-light">
              Tu pedido ha sido registrado con éxito.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-12 space-y-8">
            <div className="bg-secondary/30 rounded-3xl p-8 border border-border/50">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Package className="h-6 w-6 text-accent" />
                </div>
                <span className="font-serif text-2xl">¿Qué sigue?</span>
              </div>
              <ul className="text-left space-y-4 text-lg">
                <li className="flex gap-4">
                  <span className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                  <p className="text-muted-foreground">Tu pedido será preparado en este momento por nuestro equipo.</p>
                </li>
                <li className="flex gap-4">
                  <span className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                  <p className="text-muted-foreground">Recibirás un ticket o alerta cuando esté listo para retirar en la barra.</p>
                </li>
                <li className="flex gap-4">
                  <span className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                  <p className="text-muted-foreground">¡Disfruta tu compra!</p>
                </li>
              </ul>
            </div>

            {isKioskMode ? (
              <div className="space-y-6">
                <div className="p-6 bg-secondary/20 rounded-2xl border border-dashed border-border">
                  <p className="text-muted-foreground mb-4">La sesión se cerrará automáticamente por seguridad.</p>
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      size="lg"
                      className="h-14 px-8 rounded-2xl text-lg gap-2"
                      onClick={handleNewOrder}
                    >
                      <RefreshCw className="w-5 h-5" />
                      Hacer otro pedido
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-14 px-8 rounded-2xl text-lg gap-2 border-destructive/20 text-destructive hover:bg-destructive/5"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-5 h-5" />
                      Finalizar ({countdown}s)
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/pedidos">
                  <Button variant="outline" size="lg" className="h-14 px-8 rounded-full text-base">
                    Ver Mis Pedidos
                  </Button>
                </Link>
                <Link href="/catalogo">
                  <Button size="lg" className="h-14 px-8 rounded-full text-base group">
                    Seguir Comprando
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

