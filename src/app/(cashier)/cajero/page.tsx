'use client';

import { useState } from 'react';
import { Loader2, CreditCard, CheckCircle, XCircle, Banknote, Eye } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { usePedidosPendientesPago, useVerificarPagoTransferencia, useMarcarPagadoEfectivo } from '@/lib/hooks';
import { Pedido, TipoPago } from '@/lib/types';

export default function CajeroPage() {
  const { data: pedidos, isLoading } = usePedidosPendientesPago();
  const { mutate: verificarPago, isPending: isVerificando } = useVerificarPagoTransferencia();
  const { mutate: marcarPagado, isPending: isMarcando } = useMarcarPagadoEfectivo();
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);
  const [observacion, setObservacion] = useState('');
  const [showVerificarDialog, setShowVerificarDialog] = useState(false);

  const handleVerificarTransferencia = (aprobado: boolean) => {
    if (pedidoSeleccionado) {
      verificarPago({
        id: pedidoSeleccionado.id,
        aprobado,
        observacion: observacion || undefined,
      });
      setShowVerificarDialog(false);
      setObservacion('');
      setPedidoSeleccionado(null);
    }
  };

  const handleMarcarPagado = (pedidoId: number) => {
    marcarPagado(pedidoId);
  };

  const openVerificarDialog = (pedido: Pedido) => {
    setPedidoSeleccionado(pedido);
    setShowVerificarDialog(true);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const transferencias = pedidos?.filter((p) => p.tipoPago === 'TRANSFERENCIA') || [];
  const efectivo = pedidos?.filter((p) => p.tipoPago === 'EFECTIVO') || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Verificación de Pagos</h1>
        <p className="text-muted-foreground">
          Confirma los pagos de transferencia y marca los pagos en tienda.
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Transferencias por Verificar</p>
                <p className="text-3xl font-bold">{transferencias.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pagos en Efectivo Pendientes</p>
                <p className="text-3xl font-bold">{efectivo.length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Banknote className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transferencias */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Transferencias Bancarias
          </CardTitle>
          <CardDescription>Pagos que requieren verificación de comprobante</CardDescription>
        </CardHeader>
        <CardContent>
          {transferencias.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p className="text-muted-foreground">No hay transferencias pendientes de verificación</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transferencias.map((pedido) => (
                  <TableRow key={pedido.id}>
                    <TableCell className="font-medium">{pedido.numeroPedido}</TableCell>
                    <TableCell>Pedido #{pedido.numeroPedido}</TableCell>
                    <TableCell className="text-right font-medium">${Number(pedido.total).toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="outline" onClick={() => openVerificarDialog(pedido)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Verificar
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

      {/* Pagos en Efectivo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            Pagos en Efectivo
          </CardTitle>
          <CardDescription>Pagos en tienda pendientes de confirmar</CardDescription>
        </CardHeader>
        <CardContent>
          {efectivo.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p className="text-muted-foreground">No hay pagos en efectivo pendientes</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {efectivo.map((pedido) => (
                  <TableRow key={pedido.id}>
                    <TableCell className="font-medium">{pedido.numeroPedido}</TableCell>
                    <TableCell>Pedido #{pedido.numeroPedido}</TableCell>
                    <TableCell className="text-right font-medium">${Number(pedido.total).toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" onClick={() => handleMarcarPagado(pedido.id)} disabled={isMarcando}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Confirmar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Verificación */}
      <Dialog open={showVerificarDialog} onOpenChange={setShowVerificarDialog}>
        <DialogContent className="max-w-lg sm:max-w-xl">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl">Verificar Transferencia</DialogTitle>
            <DialogDescription className="text-base">
              Revisa el comprobante de transferencia y confirma o rechaza el pago.
            </DialogDescription>
          </DialogHeader>
          {pedidoSeleccionado && (
            <div className="py-6 space-y-4">
              <div className="bg-muted p-5 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Pedido</p>
                <p className="font-semibold text-lg">{pedidoSeleccionado.numeroPedido}</p>
                <div className="mt-3 pt-3 border-t border-border/50">
                  <p className="text-sm text-muted-foreground mb-1">Monto</p>
                  <p className="text-3xl font-bold">${Number(pedidoSeleccionado.total).toFixed(2)}</p>
                </div>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="observacion" className="text-base">Observación (opcional)</Label>
                <Textarea
                  id="observacion"
                  placeholder="Ej: Transferencia confirmada en BBVA..."
                  value={observacion}
                  onChange={(e) => setObservacion(e.target.value)}
                  rows={4}
                  className="text-base"
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              variant="ghost"
              onClick={() => setShowVerificarDialog(false)}
              className="w-full sm:w-auto h-11"
            >
              Cancelar
            </Button>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <Button
                variant="destructive"
                onClick={() => handleVerificarTransferencia(false)}
                disabled={isVerificando}
                className="w-full sm:w-auto h-11"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Rechazar
              </Button>
              <Button
                onClick={() => handleVerificarTransferencia(true)}
                disabled={isVerificando}
                className="w-full sm:w-auto h-11"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirmar Pago
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
