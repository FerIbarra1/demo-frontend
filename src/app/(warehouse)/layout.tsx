'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, List, LogOut } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useLogout } from '@/lib/hooks';
import { useAuthStore } from '@/lib/stores/auth';

export default function WarehouseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const logout = useLogout();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.rol !== 'BODEGA' && user?.rol !== 'ADMIN') {
      router.push('/unauthorized');
      return;
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || (user?.rol !== 'BODEGA' && user?.rol !== 'ADMIN')) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/bodega" className="flex items-center gap-2">
              <Package className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Demo - Bodega</span>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-4">
              <Link href="/bodega">
                <Button variant="ghost" size="sm">
                  <List className="mr-2 h-4 w-4" />
                  Pedidos
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-muted-foreground"
              >
                <LogOut className="mr-2 h-4 w-4" />
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
      <footer className="bg-white border-t py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Demo - Sistema de Bodega
        </div>
      </footer>
    </div>
  );
}
