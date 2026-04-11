import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pedidosBodegaApi } from '@/lib/api/pedidos';
import { toast } from 'sonner';

export function usePedidosBodegaPendientes() {
  return useQuery({
    queryKey: ['pedidos-bodega-pendientes'],
    queryFn: () => pedidosBodegaApi.getPendientes(),
  });
}

export function usePedidoBodega(id: number) {
  return useQuery({
    queryKey: ['pedido-bodega', id],
    queryFn: () => pedidosBodegaApi.getPedido(id),
    enabled: !!id,
  });
}

export function useVerificarStockPedido(id: number) {
  return useQuery({
    queryKey: ['verificar-stock', id],
    queryFn: () => pedidosBodegaApi.verificarStock(id),
    enabled: !!id,
  });
}

export function useMarcarEnBodega() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => pedidosBodegaApi.marcarEnBodega(id),
    onSuccess: () => {
      toast.success('Pedido recibido en bodega');
      queryClient.invalidateQueries({ queryKey: ['pedidos-bodega-pendientes'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al recibir pedido');
    },
  });
}

export function useMarcarListo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => pedidosBodegaApi.marcarListo(id),
    onSuccess: () => {
      toast.success('Pedido marcado como listo');
      queryClient.invalidateQueries({ queryKey: ['pedidos-bodega-pendientes'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al marcar pedido');
    },
  });
}

export function useAgregarNotasBodega() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notas }: { id: number; notas: string }) =>
      pedidosBodegaApi.agregarNotas(id, notas),
    onSuccess: () => {
      toast.success('Notas agregadas');
      queryClient.invalidateQueries({ queryKey: ['pedidos-bodega-pendientes'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al agregar notas');
    },
  });
}
