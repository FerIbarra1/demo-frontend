'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/premium';
import { useAuthStore } from '@/lib/stores/auth';

export default function CashierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.rol !== 'CAJERO' && user?.rol !== 'ADMIN') {
      router.push('/unauthorized');
      return;
    }
  }, [isAuthenticated, user, router, _hasHydrated]);

  if (!_hasHydrated || !isAuthenticated || (user?.rol !== 'CAJERO' && user?.rol !== 'ADMIN')) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar principal unificado */}
      <Navbar />

      {/* Main Content - con padding-top para el navbar fixed */}
      <main className="flex-1 bg-muted/30 pt-20">
        {children}
      </main>

      {/* Footer simple */}
      <footer className="bg-white border-t py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Demo - Sistema de Cajas
        </div>
      </footer>
    </div>
  );
}
