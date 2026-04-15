'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Bell,
  CreditCard,
  ShoppingBag,
  ChevronRight,
  Camera,
  Loader2,
  Check,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useAuth, useUpdateProfile, useChangePassword } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ============================================
// CONFIGURATION PAGE
// ============================================

export default function ConfiguracionPage() {
  const router = useRouter();
  const { user, isLoading, isClient } = useAuth();
  const [activeSection, setActiveSection] = useState<'perfil' | 'seguridad' | 'notificaciones'>('perfil');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Inicia sesión para ver tu configuración</p>
          <Link href="/login">
            <Button>Iniciar sesión</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            className="mb-2 -ml-4 text-muted-foreground hover:text-foreground"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <h1 className="font-serif text-3xl font-medium">Configuración</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tu cuenta y preferencias
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <nav className="space-y-1">
              <NavButton
                active={activeSection === 'perfil'}
                onClick={() => setActiveSection('perfil')}
                icon={User}
                label="Perfil"
              />
              <NavButton
                active={activeSection === 'seguridad'}
                onClick={() => setActiveSection('seguridad')}
                icon={Lock}
                label="Privacidad"
              />
              <NavButton
                active={activeSection === 'notificaciones'}
                onClick={() => setActiveSection('notificaciones')}
                icon={Bell}
                label="Notificaciones"
              />
            </nav>

            {isClient && (
              <div className="mt-8 p-4 bg-secondary/50 rounded-xl">
                <h3 className="font-medium mb-2">¿Necesitas ayuda?</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Contacta a nuestro equipo de soporte
                </p>
                <Link href="/contacto">
                  <Button variant="outline" className="w-full" size="sm">
                    Contactar soporte
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            {activeSection === 'perfil' && <PerfilSection user={user} />}
            {activeSection === 'seguridad' && <SeguridadSection />}
            {activeSection === 'notificaciones' && <NotificacionesSection />}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// NAVIGATION BUTTON
// ============================================

function NavButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
        active
          ? 'bg-foreground text-background shadow-lg'
          : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
      )}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );
}

// ============================================
// PERFIL SECTION
// ============================================

function PerfilSection({ user }: { user: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const updateProfile = useUpdateProfile();

  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    email: user?.email || '',
    telefono: user?.telefono || '',
  });

  const handleSave = async () => {
    updateProfile.mutate(
      {
        nombre: formData.nombre,
        apellido: formData.apellido,
        telefono: formData.telefono,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  };

  const isSaving = updateProfile.isPending;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-card rounded-2xl p-6 border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-foreground text-background flex items-center justify-center text-2xl font-medium shadow-inner">
              {(user?.nombre?.[0] || '') + (user?.apellido?.[0] || '')}
            </div>
            <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-secondary flex items-center justify-center border-2 border-background hover:bg-accent transition-colors shadow-sm">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div>
            <h2 className="font-serif text-xl">{user?.nombre} {user?.apellido}</h2>
            <p className="text-muted-foreground">{user?.email}</p>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-medium mt-2">
              {user?.rol}
            </span>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-card rounded-2xl p-6 border shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-medium text-lg">Información personal</h3>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              Editar Perfil
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} disabled={isSaving}>
                Cancelar
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Guardar Cambios
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nombre</label>
            <Input
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              disabled={!isEditing}
              className="bg-secondary/30 border-transparent focus:bg-background focus:ring-accent/20 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Apellido</label>
            <Input
              value={formData.apellido}
              onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
              disabled={!isEditing}
              className="bg-secondary/30 border-transparent focus:bg-background focus:ring-accent/20 transition-all"
            />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <label className="text-sm font-medium">Correo electrónico</label>
            <Input
              type="email"
              value={formData.email}
              disabled={true}
              className="bg-secondary/50 opacity-60 cursor-not-allowed border-dashed"
              title="El correo electrónico no puede ser modificado"
            />
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
              El correo electrónico es tu identidad y no puede ser modificado
            </p>
          </div>
          <div className="sm:col-span-2 space-y-2">
            <label className="text-sm font-medium">Teléfono</label>
            <Input
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              disabled={!isEditing}
              className="bg-secondary/30 border-transparent focus:bg-background focus:ring-accent/20 transition-all"
              placeholder="+1 234 567 890"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// SEGURIDAD SECTION
// ============================================

function SeguridadSection() {
  const changePassword = useChangePassword();
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const handleUpdatePassword = () => {
    if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    if (passwordData.new !== passwordData.confirm) {
      toast.error('La nueva contraseña y la confirmación no coinciden');
      return;
    }

    if (passwordData.new.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    changePassword.mutate(
      {
        oldPassword: passwordData.current,
        newPassword: passwordData.new,
      },
      {
        onSuccess: () => {
          setPasswordData({ current: '', new: '', confirm: '' });
        },
      }
    );
  };

  const isUpdating = changePassword.isPending;

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <div className="bg-card rounded-2xl p-6 border shadow-sm">
        <h3 className="font-medium text-lg mb-4">Actualizar Contraseña</h3>

        <div className="space-y-4 max-w-md">
          <div className="space-y-2">
            <label className="text-sm font-medium">Contraseña actual</label>
            <Input
              type="password"
              value={passwordData.current}
              onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
              className="bg-secondary/30 border-transparent focus:bg-background focus:ring-accent/20 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Nueva contraseña</label>
            <Input
              type="password"
              value={passwordData.new}
              onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
              className="bg-secondary/30 border-transparent focus:bg-background focus:ring-accent/20 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Confirmar nueva contraseña</label>
            <Input
              type="password"
              value={passwordData.confirm}
              onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
              className="bg-secondary/30 border-transparent focus:bg-background focus:ring-accent/20 transition-all"
            />
          </div>
          <Button
            className="w-full sm:w-auto px-8"
            onClick={handleUpdatePassword}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Actualizando...
              </>
            ) : 'Actualizar contraseña'}
          </Button>
        </div>
      </div>

      {/* Sessions */}
      <div className="bg-card rounded-2xl p-6 border shadow-sm">
        <h3 className="font-medium text-lg mb-4 font-serif">Seguridad de la Cuenta</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-xl border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              </div>
              <div>
                <p className="font-medium text-sm">Sesión actual activa</p>
                <p className="text-xs text-muted-foreground">Este navegador está protegido</p>
              </div>
            </div>
            <span className="text-[10px] bg-green-500/10 text-green-600 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
              En línea
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// NOTIFICACIONES SECTION
// ============================================

function NotificacionesSection() {
  const [preferences, setPreferences] = useState({
    email: true,
    pedidos: true,
    promociones: false,
    newsletter: true,
  });

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl p-6 border shadow-sm">
        <h3 className="font-medium text-lg mb-6 italic font-serif">Preferencias de comunicación</h3>

        <div className="space-y-4">
          <ToggleItem
            title="Notificaciones por email"
            description="Recibe actualizaciones importantes sobre tu cuenta"
            checked={preferences.email}
            onChange={() => togglePreference('email')}
          />
          <Separator className="opacity-50" />
          <ToggleItem
            title="Actualizaciones de pedidos"
            description="Notificaciones cuando tu pedido cambie de estado en tiempo real"
            checked={preferences.pedidos}
            onChange={() => togglePreference('pedidos')}
          />
          <Separator className="opacity-50" />
          <ToggleItem
            title="Promociones y ofertas"
            description="Descuentos especiales y lanzamientos de nuevas colecciones"
            checked={preferences.promociones}
            onChange={() => togglePreference('promociones')}
          />
          <Separator className="opacity-50" />
          <ToggleItem
            title="Newsletter"
            description="Novedades, tendencias y contenido exclusivo de Demo"
            checked={preferences.newsletter}
            onChange={() => togglePreference('newsletter')}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// TOGGLE ITEM
// ============================================

function ToggleItem({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="space-y-0.5">
        <h4 className="font-medium text-sm tracking-tight">{title}</h4>
        <p className="text-xs text-muted-foreground max-w-[280px]">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 shadow-inner',
          checked ? 'bg-accent' : 'bg-secondary'
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-background transition-transform duration-300 shadow-sm',
            checked ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
    </div>
  );
}
