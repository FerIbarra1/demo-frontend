'use client';

import { Package, Clock, CheckCircle, XCircle } from 'lucide-react';

import { useMisPedidos } from '@/lib/hooks';
import { FormattedDate } from '@/components/common/FormattedDate';
import { SkeletonCard } from '@/components/common/SkeletonGrid';
import { ErrorDisplay, useSafeData } from '@/components/common/ErrorBoundary';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EstadoPedido, EstadoPago, Pedido } from '@/lib/types';

const estadoConfig: Record<
  EstadoPedido,
  { label: string; color: string; icon: typeof Package }
> = {
  PENDIENTE: {
    label: 'Pendiente',
    color: 'bg-yellow-500',
    icon: Clock,
  },
  EN_BODEGA: {
    label: 'En Bodega',
    color: 'bg-blue-500',
    icon: Package,
  },
  LISTO_PARA_ENTREGA: {
    label: 'Listo para Entrega',
    color: 'bg-purple-500',
    icon: CheckCircle,
  },
  ENTREGADO: {
    label: 'Entregado',
    color: 'bg-green-500',
    icon: CheckCircle,
  },
  CANCELADO: {
    label: 'Cancelado',
    color: 'bg-red-500',
    icon: XCircle,
  },
};

const estadoPagoConfig: Record<EstadoPago, { label: string; variant: string }> = {
  PENDIENTE: { label: 'Pago Pendiente', variant: 'secondary' },
  VERIFICADO: { label: 'Pagado', variant: 'default' },
  RECHAZADO: { label: 'Pago Rechazado', variant: 'destructive' },
};

export default function MisPedidosPage() {
  const { data: pedidosData, isLoading, error, refetch } = useMisPedidos();

  // Validar que los datos sean un array
  const { items: pedidos, isEmpty } = useSafeData<Pedido>(pedidosData);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="h-10 w-1/3 bg-muted rounded animate-pulse mb-2" />
          <div className="h-5 w-1/2 bg-muted rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorDisplay
          error={error as Error}
          message="No se pudieron cargar tus pedidos. Por favor intenta de nuevo."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mis Pedidos</h1>
        <p className="text-muted-foreground">
          Historial de tus compras y estado de tus pedidos.
        </p>
      </div>

      {isEmpty ? (
        <Card className="text-center py-12">
          <CardContent>
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              No tienes pedidos realizados.
            </p>
            <p className="text-sm text-muted-foreground">
              ¡Explora nuestro catálogo y realiza tu primera compra!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pedidos.map((pedido) => {
            const estado = estadoConfig[pedido.estado];
            const EstadoIcon = estado.icon;

            return (
              <Card key={pedido.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        Pedido {pedido.numeroPedido}
                      </CardTitle>
                      <CardDescription>
                        <FormattedDate date={pedido.fechaPedido} />
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={estadoPagoConfig[pedido.estadoPago].variant as any}>
                        {estadoPagoConfig[pedido.estadoPago].label}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${estado.color} bg-opacity-10`}>
                        <EstadoIcon className={`h-4 w-4 ${estado.color.replace('bg-', 'text-')}`} />
                      </div>
                      <span className="font-medium">{estado.label}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-xl font-bold">${Number(pedido.total).toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
