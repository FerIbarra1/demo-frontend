'use client';

import { motion } from 'framer-motion';
import {
  ShoppingBag,
  Star,
  MapPin,
  Clock,
  ChevronRight,
  User as UserIcon,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth, useMisPedidos, useTiendas } from '@/lib/hooks';
import { KioskQRCard } from '@/components/premium/KioskQRCard';
import { Navbar, Footer } from '@/components/premium';
import Link from 'next/link';

export default function PerfilPage() {
  const { user, logout } = useAuth();
  const { data: pedidos } = useMisPedidos();
  const { data: tiendas } = useTiendas();

  const totalGastado = pedidos?.reduce((acc, p) => acc + Number(p.total), 0) || 0;
  const pedidosCount = pedidos?.length || 0;
  const tiendaFavorita = tiendas?.[0]?.nombre || 'Sucursal Centro';

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 pt-28 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Header Section - Left Col */}
          <div className="lg:col-span-7 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-foreground text-background flex items-center justify-center text-2xl font-medium">
                  {user.nombre?.[0]}{user.apellido?.[0]}
                </div>
                <div>
                  <h1 className="font-serif text-3xl font-medium">Hola, {user.nombre}</h1>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-secondary text-xs font-medium">
                  Miembro Premium
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
                  {pedidosCount} Pedidos realizados
                </span>
              </div>
            </motion.div>

            {/* Statistics Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <StatCard
                icon={ShoppingBag}
                label="Total Gastado"
                value={`$${totalGastado.toFixed(2)}`}
              />
              <StatCard
                icon={MapPin}
                label="Tienda Favorita"
                value={tiendaFavorita}
              />
            </motion.div>

            {/* Recent Orders Link */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Link href="/pedidos">
                <div className="group bg-card border rounded-2xl p-4 flex items-center justify-between hover:border-accent transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">Historial de Pedidos</p>
                      <p className="text-xs text-muted-foreground">Ver todas tus compras anteriores</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            </motion.div>

            {/* Logout Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="pt-4"
            >
              <Button
                variant="ghost"
                className="text-destructive hover:text-destructive hover:bg-destructive/5 gap-2 px-0"
                onClick={() => logout()}
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión en este dispositivo
              </Button>
            </motion.div>
          </div>

          {/* QR Section - Right Col */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="sticky top-28"
            >
              <KioskQRCard />
            </motion.div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="bg-card border rounded-2xl p-5 space-y-3">
      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-foreground-muted">
        <Icon className="w-5 h-5" />
      </div>
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{label}</p>
        <p className="text-xl font-serif font-medium">{value}</p>
      </div>
    </div>
  );
}
