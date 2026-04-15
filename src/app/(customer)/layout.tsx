'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shirt, ShoppingCart, Package, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useLogout } from '@/lib/hooks';
import { useAuthStore } from '@/lib/stores/auth';
import { useCartStore } from '@/lib/stores/cart';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, user, selectedTiendaId, _hasHydrated } = useAuthStore();
  const logout = useLogout();
  const totalItems = useCartStore((state) => state.getTotalItems());

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.rol === 'CLIENTE' && !selectedTiendaId) {
      router.push('/tienda');
      return;
    }
  }, [isAuthenticated, user, selectedTiendaId, router, _hasHydrated]);

  if (!_hasHydrated || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/catalogo" className="flex items-center gap-2">
              <Shirt className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Demo</span>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-4">
              <Link href="/catalogo">
                <Button variant="ghost" size="sm">
                  Catálogo
                </Button>
              </Link>

              <Link href="/pedidos">
                <Button variant="ghost" size="sm" className="hidden sm:flex">
                  <Package className="mr-2 h-4 w-4" />
                  Mis Pedidos
                </Button>
              </Link>

              <Link href="/carrito">
                <Button variant="ghost" size="sm" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout.mutate()}
                className="text-muted-foreground"
              >
                <User className="mr-2 h-4 w-4" />
                Salir
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-muted/30">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Demo - Tienda de Camisetas
        </div>
      </footer>
    </div>
  );
}
