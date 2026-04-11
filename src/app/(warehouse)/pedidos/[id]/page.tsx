'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  ClipboardCheck,
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
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { usePedidoBodega, useVerificarStockPedido, useMarcarEnBodega, useMarcarListo, useAgregarNotasBodega } from '@/lib/hooks';
import { EstadoPedido, Pedido } from '@/lib/types';

const estadoConfig: Record<EstadoPedido, { label: string; color: string; icon: typeof Package }> = {
  PENDIENTE: { label: 'Pendiente', color: 'bg-yellow-500', icon: Clock },
  EN_BODEGA: { label: 'En Bodega', color: 'bg-blue-500', icon: Package },
  LISTO_PARA_ENTREGA: { label: 'Listo', color: 'bg-green-500', icon: CheckCircle },
  ENTREGADO: { label: 'Entregado', color: 'bg-gray-500', icon: CheckCircle },
  CANCELADO: { label: 'Cancelado', color: 'bg-red-500', icon: AlertCircle },
};

const estadoPagoConfig = {
  PENDIENTE: { label: 'Pendiente', variant: 'secondary' },
  VERIFICADO: { label: 'Verificado', variant: 'default' },
  RECHAZADO: { label: 'Rechazado', variant: 'destructive' },
};

export default function PedidoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const pedidoId = parseInt(id);
  const router = useRouter();
  const [notas, setNotas] = useState('');
  const [showNotasDialog, setShowNotasDialog] = useState(false);

  const { data: pedido, isLoading: isLoadingPedido } = usePedidoBodega(pedidoId);
  const { data: verificacionStock, isLoading: isLoadingStock } = useVerificarStockPedido(pedidoId);
  const { mutate: marcarEnBodega, isPending: isRecibiendo } = useMarcarEnBodega();
  const { mutate: marcarListo, isPending: isMarcandoListo } = useMarcarListo();
  const { mutate: agregarNotas, isPending: isGuardandoNotas } = useAgregarNotasBodega();

  if (isLoadingPedido) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Pedido no encontrado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const estado = estadoConfig[pedido.estado];
  const EstadoIcon = estado.icon;
  const estadoPago = estadoPagoConfig[pedido.estadoPago];

  const handleRecibir = () => {
    marcarEnBodega(pedidoId);
  };

  const handleListo = () => {
    marcarListo(pedidoId);
  };

  const handleGuardarNotas = () => {
    if (notas.trim()) {
      agregarNotas({ id: pedidoId, notas: notas.trim() });
      setShowNotasDialog(false);
      setNotas('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <Link href="/bodega">
            <Button variant="ghost" className="mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Pedido {pedido.numeroPedido}</h1>
        </div>
        <div className="flex gap-2">
          <Dialog open={showNotasDialog} onOpenChange={setShowNotasDialog}>
            <DialogTrigger>
              <Button variant="outline">Agregar Notas</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Notas</DialogTitle>
                <DialogDescription>Añade notas o comentarios sobre este pedido</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="notas">Notas</Label>
                  <Textarea
                    id="notas"
                    placeholder="Ej: Producto verificado, empaque especial..."
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setShowNotasDialog(false)}>Cancelar</Button>
                <Button onClick={handleGuardarNotas} disabled={isGuardandoNotas || !notas.trim()}>
                  Guardar Notas
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {pedido.estado === 'PENDIENTE' && (
            <Button onClick={handleRecibir} disabled={isRecibiendo}>
              <ClipboardCheck className="mr-2 h-4 w-4" />
              Recibir en Bodega
            </Button>
          )}

          {pedido.estado === 'EN_BODEGA' && (
            <Button onClick={handleListo} disabled={isMarcandoListo}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Marcar como Listo
            </Button>
          )}
        </div>
      </div>

      {/* Estado */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className={`p-3 rounded-full ${estado.color} bg-opacity-10`}>
              <EstadoIcon className={`h-6 w-6 ${estado.color.replace('bg-', 'text-')}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Estado del Pedido</p>
              <p className="text-xl font-bold">{estado.label}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Estado de Pago</p>
              <Badge variant={estadoPago.variant as any}>{estadoPago.label}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información del Pedido */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>Productos</CardTitle>
              <CardDescription>Items incluidos en este pedido</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Variante</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pedido.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.productoNombre}</TableCell>
                      <TableCell>
                        {item.tallaNombre} • {item.colorNombre}
                      </TableCell>
                      <TableCell className="text-right">{item.cantidad}</TableCell>
                      <TableCell className="text-right">${Number(item.precioUnitario).toFixed(2)}</TableCell>
                      <TableCell className="text-right">${Number(item.subtotal).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Verificación de Stock */}
          {verificacionStock && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5" />
                  Verificación de Stock
                </CardTitle>
                <CardDescription>Disponibilidad de productos en inventario</CardDescription>
              </CardHeader>
              <CardContent>
                {!verificacionStock.items || verificacionStock.items.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No hay información de stock disponible.</p>
                ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-right">Solicitado</TableHead>
                      <TableHead className="text-right">Disponible</TableHead>
                      <TableHead className="text-center">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {verificacionStock.items?.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <p className="font-medium">{item.productoNombre}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.talla} • {item.color}
                          </p>
                        </TableCell>
                        <TableCell className="text-right">{item.cantidadSolicitada}</TableCell>
                        <TableCell className="text-right">{item.stockDisponible}</TableCell>
                        <TableCell className="text-center">
                          {item.disponible ? (
                            <Badge variant="default" className="bg-green-500">✓ Disponible</Badge>
                          ) : (
                            <Badge variant="destructive">✗ Sin Stock</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Resumen */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${Number(pedido.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Descuento</span>
                <span>${Number(pedido.descuento).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Impuestos</span>
                <span>${Number(pedido.impuestos).toFixed(2)}</span>
              </div>
              <div className="border-t pt-4 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${Number(pedido.total).toFixed(2)}</span>
              </div>

              {pedido.notas && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-1">Notas del Cliente:</p>
                  <p className="text-sm">{pedido.notas}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
