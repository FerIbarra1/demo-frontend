'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Store,
  CreditCard,
  ChevronRight,
  Search,
  ShoppingBag,
  Calendar,
  MapPin,
  ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';
import { useMisPedidos, useCancelarPedido } from '@/lib/hooks';
import { FormattedDate } from '@/components/common/FormattedDate';
import { SkeletonCard } from '@/components/common/SkeletonGrid';
import { ErrorDisplay, useSafeData } from '@/components/common/ErrorBoundary';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { EstadoPedido, EstadoPago, Pedido, ItemPedido } from '@/lib/types';

// ============================================
// CONFIGURACIÓN DE ESTADOS
// ============================================

const estadoPedidoConfig: Record<
  EstadoPedido,
  {
    label: string;
    shortLabel: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
    icon: typeof Package;
    description: string;
  }
> = {
  PENDIENTE: {
    label: 'Pendiente',
    shortLabel: 'Pendiente',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    icon: Clock,
    description: 'Tu pedido está siendo procesado',
  },
  EN_BODEGA: {
    label: 'En Preparación',
    shortLabel: 'Preparando',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    icon: Package,
    description: 'Estamos preparando tu pedido',
  },
  LISTO_PARA_ENTREGA: {
    label: 'Listo para Entregar',
    shortLabel: 'Listo',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    icon: Store,
    description: 'Tu pedido está listo para recoger',
  },
  ENTREGADO: {
    label: 'Entregado',
    shortLabel: 'Entregado',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    icon: CheckCircle,
    description: 'Pedido entregado exitosamente',
  },
  CANCELADO: {
    label: 'Cancelado',
    shortLabel: 'Cancelado',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
    icon: XCircle,
    description: 'El pedido fue cancelado',
  },
};

const estadoPagoConfig: Record<
  EstadoPago,
  {
    label: string;
    bgColor: string;
    textColor: string;
  }
> = {
  PENDIENTE: {
    label: 'Pago Pendiente',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
  },
  VERIFICADO: {
    label: 'Pagado',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
  },
  RECHAZADO: {
    label: 'Pago Rechazado',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
  },
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function MisPedidosPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEstado, setFilterEstado] = useState<EstadoPedido | 'TODOS'>('TODOS');
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [pedidoToCancel, setPedidoToCancel] = useState<Pedido | null>(null);

  const { data: pedidosData, isLoading, error, refetch } = useMisPedidos();
  const cancelarMutation = useCancelarPedido();

  const { items: pedidos } = useSafeData<Pedido>(pedidosData);

  // Filtrar pedidos
  const pedidosFiltrados = pedidos.filter((pedido) => {
    const matchesSearch =
      pedido.numeroPedido.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pedido.items.some((item) =>
        item.productoNombre.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesEstado =
      filterEstado === 'TODOS' || pedido.estado === filterEstado;
    return matchesSearch && matchesEstado;
  });

  // Estadísticas
  const stats = {
    total: pedidos.length,
    enProceso: pedidos.filter(
      (p) => p.estado === 'PENDIENTE' || p.estado === 'EN_BODEGA'
    ).length,
    listos: pedidos.filter((p) => p.estado === 'LISTO_PARA_ENTREGA').length,
    entregados: pedidos.filter((p) => p.estado === 'ENTREGADO').length,
  };

  const handleCancelPedido = async () => {
    if (!pedidoToCancel) return;
    await cancelarMutation.mutateAsync(pedidoToCancel.id);
    setPedidoToCancel(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <div className="h-8 w-48 bg-muted rounded animate-pulse mb-2" />
            <div className="h-4 w-64 bg-muted rounded animate-pulse" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <ErrorDisplay
            error={error as Error}
            message="No se pudieron cargar tus pedidos. Por favor intenta de nuevo."
            onRetry={() => refetch()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-2">
            Mis Pedidos
          </h1>
          <p className="text-muted-foreground">
            Historial de tus compras y seguimiento de pedidos
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
        >
          <StatCard
            label="Total Pedidos"
            value={stats.total}
            icon={Package}
            color="bg-stone-100"
          />
          <StatCard
            label="En Proceso"
            value={stats.enProceso}
            icon={Clock}
            color="bg-amber-50"
            textColor="text-amber-700"
          />
          <StatCard
            label="Listos"
            value={stats.listos}
            icon={Store}
            color="bg-purple-50"
            textColor="text-purple-700"
          />
          <StatCard
            label="Entregados"
            value={stats.entregados}
            icon={CheckCircle}
            color="bg-emerald-50"
            textColor="text-emerald-700"
          />
        </motion.div>

        {pedidos.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Filtros */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 mb-8"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por número de pedido o producto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-stone-200 rounded-full"
                />
              </div>
              <Select
                value={filterEstado}
                onValueChange={(v) => setFilterEstado(v as EstadoPedido | 'TODOS')}
              >
                <SelectTrigger className="w-full sm:w-48 bg-white border-stone-200 rounded-full">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos los estados</SelectItem>
                  {Object.entries(estadoPedidoConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>

            {/* Lista de Pedidos */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <AnimatePresence mode="popLayout">
                {pedidosFiltrados.map((pedido, index) => (
                  <PedidoCard
                    key={pedido.id}
                    pedido={pedido}
                    index={index}
                    onClick={() => {
                      setSelectedPedido(pedido);
                      setIsDetailOpen(true);
                    }}
                    onCancel={() => setPedidoToCancel(pedido)}
                  />
                ))}
              </AnimatePresence>

              {pedidosFiltrados.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <p className="text-muted-foreground">
                    No se encontraron pedidos que coincidan con tu búsqueda.
                  </p>
                </motion.div>
              )}
            </motion.div>
          </>
        )}

        {/* Modal de Detalle */}
        <PedidoDetailModal
          pedido={selectedPedido}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
        />

        {/* Modal de Confirmación de Cancelación */}
        <Dialog
          open={!!pedidoToCancel}
          onOpenChange={() => setPedidoToCancel(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">
                Cancelar Pedido
              </DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas cancelar el pedido{' '}
                <span className="font-medium">{pedidoToCancel?.numeroPedido}</span>?
                Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setPedidoToCancel(null)}
              >
                No, mantener
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancelPedido}
                disabled={cancelarMutation.isPending}
              >
                {cancelarMutation.isPending ? 'Cancelando...' : 'Sí, cancelar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// ============================================
// SUBCOMPONENTES
// ============================================

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  textColor = 'text-foreground',
}: {
  label: string;
  value: number;
  icon: typeof Package;
  color: string;
  textColor?: string;
}) {
  return (
    <div className={cn('p-4 rounded-2xl border border-stone-200', color)}>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-white/50">
          <Icon className={cn('h-5 w-5', textColor)} />
        </div>
        <div>
          <p className="text-2xl font-semibold leading-none">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{label}</p>
        </div>
      </div>
    </div>
  );
}

function PedidoCard({
  pedido,
  index,
  onClick,
  onCancel,
}: {
  pedido: Pedido;
  index: number;
  onClick: () => void;
  onCancel: () => void;
}) {
  const config = estadoPedidoConfig[pedido.estado];
  const EstadoIcon = config.icon;
  const pagoConfig = estadoPagoConfig[pedido.estadoPago];

  const canCancel =
    pedido.estado === 'PENDIENTE' || pedido.estado === 'EN_BODEGA';

  // Obtener la primera imagen del primer producto (si existe en el futuro)
  const firstItem = pedido.items[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      layout
    >
      <div
        onClick={onClick}
        className={cn(
          'group bg-white rounded-2xl border-2 p-5 cursor-pointer',
          'transition-all duration-300',
          'hover:shadow-lg hover:shadow-stone-200/50',
          'hover:border-stone-300',
          'border-stone-100'
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center',
                config.bgColor
              )}
            >
              <EstadoIcon className={cn('h-6 w-6', config.textColor)} />
            </div>
            <div>
              <h3 className="font-medium text-foreground">
                Pedido {pedido.numeroPedido}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <FormattedDate date={pedido.fechaPedido} />
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">
              ${Number(pedido.total).toFixed(2)}
            </p>
            <Badge
              variant="secondary"
              className={cn(
                'text-xs font-normal mt-1',
                pagoConfig.bgColor,
                pagoConfig.textColor,
                'border-0'
              )}
            >
              {pagoConfig.label}
            </Badge>
          </div>
        </div>

        {/* Productos Preview */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">
              {pedido.items.length} {pedido.items.length === 1 ? 'artículo' : 'artículos'}
            </p>
            <div className="flex flex-wrap gap-1">
              {pedido.items.slice(0, 3).map((item, i) => (
                <span
                  key={i}
                  className="text-xs bg-stone-100 text-stone-700 px-2 py-1 rounded-full"
                >
                  {item.cantidad}x {item.productoNombre}
                </span>
              ))}
              {pedido.items.length > 3 && (
                <span className="text-xs text-muted-foreground px-1">
                  +{pedido.items.length - 3} más
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between">
          <div
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium',
              config.bgColor,
              config.textColor
            )}
          >
            <EstadoIcon className="h-4 w-4" />
            {config.shortLabel}
          </div>

          <div className="flex items-center gap-2">
            {canCancel && (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel();
                }}
              >
                Cancelar
              </Button>
            )}
            <div
              className={cn(
                'flex items-center gap-1 text-sm font-medium',
                'text-muted-foreground group-hover:text-foreground',
                'transition-colors'
              )}
            >
              Ver detalle
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Progress Timeline */}
        <div className="mt-4 pt-4 border-t border-stone-100">
          <PedidoTimeline estado={pedido.estado} />
        </div>
      </div>
    </motion.div>
  );
}

function PedidoTimeline({ estado }: { estado: EstadoPedido }) {
  const steps = [
    { key: 'PENDIENTE', label: 'Pedido' },
    { key: 'EN_BODEGA', label: 'Preparando' },
    { key: 'LISTO_PARA_ENTREGA', label: 'Listo' },
    { key: 'ENTREGADO', label: 'Entregado' },
  ];

  const currentIndex = steps.findIndex((s) => s.key === estado);
  const isCancelled = estado === 'CANCELADO';

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2 text-red-600">
        <XCircle className="h-4 w-4" />
        <span className="text-sm">Pedido cancelado</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-2.5 h-2.5 rounded-full transition-colors',
                  isCompleted ? 'bg-foreground' : 'bg-stone-200',
                  isCurrent && 'ring-4 ring-stone-100'
                )}
              />
              <span
                className={cn(
                  'text-[10px] mt-1.5 transition-colors',
                  isCompleted ? 'text-foreground font-medium' : 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'w-8 sm:w-12 h-0.5 mx-1 mb-4',
                  index < currentIndex ? 'bg-foreground' : 'bg-stone-200'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function PedidoDetailModal({
  pedido,
  isOpen,
  onClose,
}: {
  pedido: Pedido | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!pedido) return null;

  const config = estadoPedidoConfig[pedido.estado];
  const EstadoIcon = config.icon;
  const pagoConfig = estadoPagoConfig[pedido.estadoPago];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="font-serif text-2xl">
                Pedido {pedido.numeroPedido}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-1">
                <Calendar className="h-3.5 w-3.5" />
                <FormattedDate date={pedido.fechaPedido} />
              </DialogDescription>
            </div>
            <div
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5',
                config.bgColor,
                config.textColor
              )}
            >
              <EstadoIcon className="h-4 w-4" />
              {config.label}
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="px-6 pb-6 space-y-6">
            {/* Estado de Pago */}
            <div
              className={cn(
                'p-4 rounded-xl flex items-center justify-between',
                pagoConfig.bgColor
              )}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-white/50">
                  <CreditCard className={cn('h-5 w-5', pagoConfig.textColor)} />
                </div>
                <div>
                  <p className={cn('font-medium', pagoConfig.textColor)}>
                    {pagoConfig.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Método: {pedido.tipoPago === 'EFECTIVO' ? 'Efectivo' : 'Transferencia'}
                  </p>
                </div>
              </div>
            </div>

            {/* Items */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Productos ({pedido.items.length})
              </h4>
              <div className="space-y-3">
                {pedido.items.map((item) => (
                  <ItemRow key={item.id} item={item} />
                ))}
              </div>
            </div>

            <Separator />

            {/* Totales */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${Number(pedido.subtotal).toFixed(2)}</span>
              </div>
              {pedido.descuento > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Descuento</span>
                  <span className="text-green-600">
                    -${Number(pedido.descuento).toFixed(2)}
                  </span>
                </div>
              )}
              {pedido.impuestos > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Impuestos</span>
                  <span>${Number(pedido.impuestos).toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between">
                <span className="font-medium">Total</span>
                <span className="text-xl font-semibold">
                  ${Number(pedido.total).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Fechas */}
            {(pedido.fechaPago || pedido.fechaPreparacion || pedido.fechaListo) && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Historial</h4>
                  {pedido.fechaPago && (
                    <DateRow label="Pago confirmado" date={pedido.fechaPago} />
                  )}
                  {pedido.fechaPreparacion && (
                    <DateRow label="Inicio de preparación" date={pedido.fechaPreparacion} />
                  )}
                  {pedido.fechaListo && (
                    <DateRow label="Listo para entrega" date={pedido.fechaListo} />
                  )}
                  {pedido.fechaEntrega && (
                    <DateRow label="Entregado" date={pedido.fechaEntrega} />
                  )}
                </div>
              </>
            )}

            {/* Notas */}
            {pedido.notas && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium text-sm mb-2">Notas</h4>
                  <p className="text-sm text-muted-foreground bg-stone-50 p-3 rounded-lg">
                    {pedido.notas}
                  </p>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <div className="p-6 pt-4 border-t border-stone-100">
          <Button onClick={onClose} className="w-full rounded-full">
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ItemRow({ item }: { item: ItemPedido }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-stone-50 rounded-xl">
      <div className="w-14 h-14 rounded-lg bg-white border border-stone-100 flex items-center justify-center flex-shrink-0">
        <ShoppingBag className="h-5 w-5 text-stone-300" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{item.productoNombre}</p>
        <p className="text-xs text-muted-foreground">
          {item.productoCodigo} · {item.corridaNombre} · Talla {item.tallaNombre} ·{' '}
          {item.colorNombre}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">
            {item.cantidad}x ${Number(item.precioUnitario).toFixed(2)}
          </span>
          <span className="font-medium text-sm">
            ${Number(item.subtotal).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}

function DateRow({ label, date }: { label: string; date: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">
        <FormattedDate date={date} />
      </span>
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-16"
    >
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-stone-100 flex items-center justify-center">
        <ShoppingBag className="h-10 w-10 text-stone-300" />
      </div>
      <h3 className="font-serif text-xl mb-2">No tienes pedidos aún</h3>
      <p className="text-muted-foreground max-w-sm mx-auto mb-6">
        Explora nuestro catálogo de camisetas premium y realiza tu primera compra.
      </p>
      <Link href="/catalogo">
        <Button className="rounded-full px-6">
          <ShoppingBag className="h-4 w-4 mr-2" />
          Explorar catálogo
        </Button>
      </Link>
    </motion.div>
  );
}
