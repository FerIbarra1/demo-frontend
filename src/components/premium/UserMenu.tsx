'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Settings,
  LogOut,
  ShoppingBag,
  MapPin,
  ChevronRight,
  Package,
  CreditCard,
  LayoutDashboard,
  Boxes,
  BarChart3,
  Users,
  ClipboardList,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/stores/auth';
import { useLogout } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { useTienda } from '@/lib/hooks';
import { UserRole } from '@/lib/types';

interface UserMenuProps {
  variant?: 'navbar' | 'sidebar';
}

/* ============================================
   ROLE-BASED MENU CONFIGURATION
   ============================================ */

interface MenuItem {
  label: string;
  href: string;
  icon: React.ElementType;
  description: string;
  roles?: UserRole[]; // If undefined, available to all
}

const MENU_ITEMS: MenuItem[] = [
  // CLIENTE: Perfil y Pedidos
  {
    label: 'Mi Perfil',
    href: '/perfil',
    icon: User,
    description: 'Ver mi QR e identidad digital',
    roles: ['CLIENTE'],
  },
  {
    label: 'Mis Pedidos',
    href: '/pedidos',
    icon: ShoppingBag,
    description: 'Historial de compras',
    roles: ['CLIENTE'],
  },
  // ADMIN: Dashboard, Usuarios, Reportes
  {
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    description: 'Panel administrativo',
    roles: ['ADMIN'],
  },
  {
    label: 'Usuarios',
    href: '/admin/usuarios',
    icon: Users,
    description: 'Gestionar usuarios',
    roles: ['ADMIN'],
  },
  {
    label: 'Reportes',
    href: '/admin/reportes',
    icon: BarChart3,
    description: 'Ver estadísticas',
    roles: ['ADMIN'],
  },
  // Todos los roles: Configuración
  {
    label: 'Configuración',
    href: '/configuracion',
    icon: Settings,
    description: 'Preferencias y seguridad',
  },
];

/* ============================================
   BASE USER MENU (keep for backwards compatibility)
   ============================================ */

export function UserMenu({ variant = 'navbar' }: UserMenuProps) {
  const { user, selectedTiendaId } = useAuthStore();
  const logout = useLogout();
  const [isOpen, setIsOpen] = useState(false);

  // Get store name
  const { data: tienda } = useTienda(selectedTiendaId || 0);

  if (!user) return null;

  const initials = `${user.nombre?.[0] || ''}${user.apellido?.[0] || ''}`.toUpperCase() ||
    user.nombre?.[0]?.toUpperCase() ||
    'U';

  const menuItems = [
    {
      label: 'Mi Perfil',
      href: '/configuracion',
      icon: User,
      description: 'Ver y editar información',
    },
    {
      label: 'Mis Pedidos',
      href: '/pedidos',
      icon: ShoppingBag,
      description: 'Historial de compras',
    },
    {
      label: 'Configuración',
      href: '/configuracion',
      icon: Settings,
      description: 'Preferencias y seguridad',
    },
  ];

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger
        className={cn(
          'flex items-center gap-2 px-2 py-2 rounded-lg',
          'hover:bg-secondary/80 transition-colors cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-ring',
          variant === 'navbar' ? 'h-10' : 'h-12 w-full justify-start'
        )}
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-medium">
          {initials}
        </div>

        {variant === 'sidebar' && (
          <div className="flex-1 text-left">
            <p className="font-medium text-sm truncate">{user.nombre}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        )}

        {variant === 'navbar' && (
          <span className="hidden sm:inline text-sm font-medium max-w-[120px] truncate">
            {user.nombre}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-72 p-0 bg-background border shadow-xl"
        sideOffset={8}
      >
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center font-medium">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user.nombre} {user.apellido}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>

          {/* Current Store */}
          {selectedTiendaId && tienda && (
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 px-2 py-1.5 rounded-lg">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate">{tienda.nombre}</span>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <div className="p-2">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
              <DropdownMenuItem className="flex items-start gap-3 p-3 cursor-pointer focus:bg-secondary rounded-lg">
                <div className="p-2 rounded-md bg-secondary">
                  <item.icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </DropdownMenuItem>
            </Link>
          ))}
        </div>

        <DropdownMenuSeparator />

        {/* Logout */}
        <div className="p-2">
          <DropdownMenuItem
            className="flex items-center gap-3 p-3 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 rounded-lg"
            onClick={() => {
              logout.mutate();
              setIsOpen(false);
            }}
          >
            <div className="p-2 rounded-md bg-destructive/10">
              <LogOut className="w-4 h-4" />
            </div>
            <span className="font-medium">Cerrar sesión</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ============================================
   ROLE-BASED USER MENU (new implementation)
   ============================================ */

export function RoleBasedUserMenu({ variant = 'navbar' }: UserMenuProps) {
  const { user, selectedTiendaId } = useAuthStore();
  const logout = useLogout();
  const [isOpen, setIsOpen] = useState(false);

  // Get store name
  const { data: tienda } = useTienda(selectedTiendaId || 0);

  if (!user) return null;

  const userRole = user.rol;
  const initials = `${user.nombre?.[0] || ''}${user.apellido?.[0] || ''}`.toUpperCase() ||
    user.nombre?.[0]?.toUpperCase() ||
    'U';

  // Filter menu items based on role
  const availableMenuItems = MENU_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  );

  // Get role display name
  const getRoleDisplayName = (role: UserRole) => {
    const roleNames: Record<UserRole, string> = {
      CLIENTE: 'Cliente',
      BODEGA: 'Bodega',
      CAJERO: 'Cajero',
      MOSTRADOR: 'Mostrador',
      ADMIN: 'Administrador',
    };
    return roleNames[role] || role;
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger
        className={cn(
          'flex items-center gap-2 px-2 py-2 rounded-lg',
          'hover:bg-secondary/80 transition-colors cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-ring',
          variant === 'navbar' ? 'h-10' : 'h-12 w-full justify-start'
        )}
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-medium">
          {initials}
        </div>

        {variant === 'sidebar' && (
          <div className="flex-1 text-left">
            <p className="font-medium text-sm truncate">{user.nombre}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        )}

        {variant === 'navbar' && (
          <span className="hidden sm:inline text-sm font-medium max-w-[120px] truncate">
            {user.nombre}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-72 p-0 bg-background border shadow-xl"
        sideOffset={8}
      >
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center font-medium">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user.nombre} {user.apellido}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>

          {/* Role Badge */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-accent/10 text-accent">
              {getRoleDisplayName(userRole)}
            </span>
          </div>

          {/* Current Store - Hide for ADMIN */}
          {selectedTiendaId && userRole !== 'ADMIN' && tienda && (
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 px-2 py-1.5 rounded-lg">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate">{tienda.nombre}</span>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <div className="p-2">
          {availableMenuItems.map((item) => (
            <Link key={`${item.href}-${item.label}`} href={item.href} onClick={() => setIsOpen(false)}>
              <DropdownMenuItem className="flex items-start gap-3 p-3 cursor-pointer focus:bg-secondary rounded-lg">
                <div className="p-2 rounded-md bg-secondary">
                  <item.icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </DropdownMenuItem>
            </Link>
          ))}
        </div>

        <DropdownMenuSeparator />

        {/* Logout */}
        <div className="p-2">
          <DropdownMenuItem
            className="flex items-center gap-3 p-3 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 rounded-lg"
            onClick={() => {
              logout.mutate();
              setIsOpen(false);
            }}
          >
            <div className="p-2 rounded-md bg-destructive/10">
              <LogOut className="w-4 h-4" />
            </div>
            <span className="font-medium">Cerrar sesión</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ============================================
   USER BUTTON - Simpler version for mobile
   ============================================ */

export function UserButton({ className }: { className?: string }) {
  const { user } = useAuthStore();
  const logout = useLogout();

  if (!user) return null;

  const initials = `${user.nombre?.[0] || ''}${user.apellido?.[0] || ''}`.toUpperCase() ||
    user.nombre?.[0]?.toUpperCase() ||
    'U';

  return (
    <Link href="/configuracion" className={cn('flex items-center gap-3', className)}>
      <div className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center font-medium">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium">{user.nombre}</p>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </div>
    </Link>
  );
}
