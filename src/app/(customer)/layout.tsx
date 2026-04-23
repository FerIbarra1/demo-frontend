'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Navbar, Footer } from '@/components/premium';
import { useAuthStore } from '@/lib/stores/auth';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, user, selectedTiendaId, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.rol === 'CLIENTE' && !selectedTiendaId) {
      router.push('/catalogo');
      return;
    }
  }, [isAuthenticated, user, selectedTiendaId, router, _hasHydrated]);

  if (!_hasHydrated || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
      <Navbar />
      <main className="flex-1 pt-20">
        {children}
      </main>
      <Footer />
    </div>
  );
}
