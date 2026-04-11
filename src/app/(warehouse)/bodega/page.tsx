'use client';

import Link from 'next/link';
import {
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SkeletonCard } from '@/components/common/SkeletonGrid';
import { ErrorDisplay, useSafeData } from '@/components/common/ErrorBoundary';
import { ShortDate } from '@/components/common/FormattedDate';
import { usePedidosBodegaPendientes, useMarcarEnBodega, useMarcarListo } from '@/lib/hooks';
import { EstadoPedido, Pedido } from '@/lib/types';

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
    label: 'Listo',
    color: 'bg-green-500',
    icon: CheckCircle,
  },
  ENTREGADO: {
    label: 'Entregado',
    color: 'bg-gray-500',
    icon: CheckCircle,
  },
  CANCELADO: {
    label: 'Cancelado',
    color: 'bg-red-500',
    icon: AlertCircle,
  },
};

function PedidoRow({
  pedido,
  onRecibir,
  onListo,
}: {
  pedido: Pedido;
  onRecibir: (id: number) => void;
  onListo: (id: number) => void;
}) {
  const estado = estadoConfig[pedido.estado];
  const EstadoIcon = estado.icon;

  return (
    <TableRow>
      <TableCell className="font-medium">{pedido.numeroPedido}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-full ${estado.color} bg-opacity-10`}>
            <EstadoIcon className={`h-4 w-4 ${estado.color.replace('bg-', 'text-')}`} />
          </div>
          <span className="text-sm">{estado.label}</span>
        </div>
      </TableCell>
      <TableCell>
        <ShortDate date={pedido.fechaPedido} />
      </TableCell>
      <TableCell className="text-right font-medium">
        ${Number(pedido.total).toFixed(2) || '0.00'}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2 justify-end">
          <Link href={`/pedidos/${pedido.id}`}>
            <Button variant="ghost" size="icon">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>

          {pedido.estado === 'PENDIENTE' && (
            <Button size="sm" onClick={() => onRecibir(pedido.id)}>
              Recibir
            </Button>
          )}

          {pedido.estado === 'EN_BODEGA' && (
            <Button size="sm" variant="outline" onClick={() => onListo(pedido.id)}>
              Marcar Listo
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function BodegaPage() {
  const { data: pedidosData, isLoading, error, refetch } = usePedidosBodegaPendientes();
  const { mutate: marcarEnBodega } = useMarcarEnBodega();
  const { mutate: marcarListo } = useMarcarListo();

  // Validar que los datos sean un array
  const { items: pedidos, isEmpty, count } = useSafeData<Pedido>(pedidosData);

  const handleRecibir = (id: number) => {
    marcarEnBodega(id);
  };

  const handleListo = (id: number) => {
    marcarListo(id);
  };

  // Estadísticas
  const pendientes = pedidos.filter((p) => p.estado === 'PENDIENTE').length;
  const enBodega = pedidos.filter((p) => p.estado === 'EN_BODEGA').length;
  const listos = pedidos.filter((p) => p.estado === 'LISTO_PARA_ENTREGA').length;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="h-10 w-1/3 bg-muted rounded animate-pulse mb-2" />
          <div className="h-5 w-1/2 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <SkeletonCard />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorDisplay
          error={error as Error}
          message="No se pudieron cargar los pedidos. Por favor intenta de nuevo."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Panel de Bodega</h1>
        <p className="text-muted-foreground">
          Gestiona los pedidos pendientes y su preparación.
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
                <p className="text-3xl font-bold">{pendientes}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En Bodega</p>
                <p className="text-3xl font-bold">{enBodega}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Listos</p>
                <p className="text-3xl font-bold">{listos}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Pedidos */}
      <Card>
        <CardHeader>
          <CardTitle>Pedidos</CardTitle>
          <CardDescription>
            Lista de pedidos que requieren atención
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isEmpty ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No hay pedidos pendientes</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedidos.map((pedido) => (
                  <PedidoRow
                    key={pedido.id}
                    pedido={pedido}
                    onRecibir={handleRecibir}
                    onListo={handleListo}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
