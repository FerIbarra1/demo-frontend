'use client';

import { useState } from 'react';
import { Loader2, Package, CheckCircle, Search, Printer } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePedidosListos, useBuscarPedidoMostrador, useEntregarPedido } from '@/lib/hooks';
import { Pedido } from '@/lib/types';
import { ShortDate } from '@/components/common/FormattedDate';

export default function MostradorPage() {
  const { data: pedidosListos, isLoading: isLoadingListos } = usePedidosListos();
  const { mutate: buscarPedido, isPending: isBuscando } = useBuscarPedidoMostrador();
  const { mutate: entregarPedido, isPending: isEntregando } = useEntregarPedido();

  const [searchQuery, setSearchQuery] = useState('');
  const [pedidoBuscado, setPedidoBuscado] = useState<Pedido | null>(null);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);
  const [showEntregarDialog, setShowEntregarDialog] = useState(false);

  const handleBuscar = () => {
    if (searchQuery.trim()) {
      buscarPedido(searchQuery.trim(), {
        onSuccess: (data) => {
          setPedidoBuscado(data);
        },
      });
    }
  };

  const handleEntregar = () => {
    if (pedidoSeleccionado) {
      entregarPedido(pedidoSeleccionado.id);
      setShowEntregarDialog(false);
      setPedidoSeleccionado(null);
    }
  };

  const openEntregarDialog = (pedido: Pedido) => {
    setPedidoSeleccionado(pedido);
    setShowEntregarDialog(true);
  };

  if (isLoadingListos) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Entrega de Pedidos</h1>
        <p className="text-muted-foreground">
          Gestiona la entrega de pedidos listos para recoger.
        </p>
      </div>

      {/* Buscador */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Pedido
          </CardTitle>
          <CardDescription>Busca un pedido por su número para verificar y entregar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Ej: PD-2024-000001"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
            />
            <Button onClick={handleBuscar} disabled={isBuscando}>
              {isBuscando ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Buscar'}
            </Button>
          </div>

          {pedidoBuscado && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{pedidoBuscado.numeroPedido}</p>
                  <p className="text-sm text-muted-foreground">Total: ${Number(pedidoBuscado.total).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={pedidoBuscado.estado === 'LISTO_PARA_ENTREGA' ? 'default' : 'secondary'}>
                    {pedidoBuscado.estado === 'LISTO_PARA_ENTREGA' ? 'Listo' : pedidoBuscado.estado}
                  </Badge>
                  {pedidoBuscado.estado === 'LISTO_PARA_ENTREGA' && (
                    <Button size="sm" onClick={() => openEntregarDialog(pedidoBuscado)}>
                      Entregar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {pedidoBuscado === null && searchQuery && !isBuscando && (
            <div className="mt-4 p-4 text-center text-muted-foreground">
              No se encontró el pedido
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pedidos Listos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Pedidos Listos para Entrega
          </CardTitle>
          <CardDescription>Pedidos que están preparados y pagados, listos para entregar al cliente</CardDescription>
        </CardHeader>
        <CardContent>
          {pedidosListos?.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p className="text-muted-foreground">No hay pedidos listos para entrega</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedidosListos?.map((pedido) => (
                  <TableRow key={pedido.id}>
                    <TableCell className="font-medium">{pedido.numeroPedido}</TableCell>
                    <TableCell>
                      <ShortDate date={pedido.fechaPedido} />
                    </TableCell>
                    <TableCell className="text-right font-medium">${Number(pedido.total).toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm">
                          <Printer className="mr-2 h-4 w-4" />
                          Ticket
                        </Button>
                        <Button size="sm" onClick={() => openEntregarDialog(pedido)}>
                          Entregar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Entrega */}
      <Dialog open={showEntregarDialog} onOpenChange={setShowEntregarDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Entrega</DialogTitle>
            <DialogDescription>
              Confirma que el cliente ha recibido su pedido correctamente.
            </DialogDescription>
          </DialogHeader>
          {pedidoSeleccionado && (
            <div className="py-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Pedido</p>
                <p className="font-medium text-lg">{pedidoSeleccionado.numeroPedido}</p>
                <p className="text-2xl font-bold">${Number(pedidoSeleccionado.total).toFixed(2)}</p>
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">Items:</p>
                  <ul className="text-sm">
                    {pedidoSeleccionado.items.map((item) => (
                      <li key={item.id}>
                        {item.cantidad}x {item.productoNombre} ({item.tallaNombre}, {item.colorNombre})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowEntregarDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEntregar} disabled={isEntregando}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Confirmar Entrega
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
