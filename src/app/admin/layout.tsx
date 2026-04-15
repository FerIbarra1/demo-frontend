'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Store, Package, Users, BarChart3, LogOut } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useLogout } from '@/lib/hooks';
import { useAuthStore } from '@/lib/stores/auth';

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/tiendas', label: 'Tiendas', icon: Store },
  { href: '/admin/productos', label: 'Productos', icon: Package },
  { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
  { href: '/admin/reportes', label: 'Reportes', icon: BarChart3 },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();
  const logout = useLogout();

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.rol !== 'ADMIN') {
      router.push('/unauthorized');
      return;
    }
  }, [isAuthenticated, user, router, _hasHydrated]);

  if (!_hasHydrated || !isAuthenticated || user?.rol !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 bg-white border-r lg:h-screen lg:sticky lg:top-0 flex-shrink-0">
        <div className="p-6">
          <Link href="/admin" className="flex items-center gap-2">
            <LayoutDashboard className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Demo Admin</span>
          </Link>
        </div>

        <nav className="px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t mt-auto">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground"
            onClick={() => logout.mutate()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 bg-muted/30 p-4 lg:p-8">
          {children}
        </main>

        <footer className="bg-white border-t py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Demo - Panel de Administración
          </div>
        </footer>
      </div>
    </div>
  );
}
