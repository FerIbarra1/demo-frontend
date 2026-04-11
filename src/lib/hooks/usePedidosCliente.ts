import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pedidosClienteApi } from '@/lib/api/pedidos';
import { TipoPago } from '@/lib/types';
import { toast } from 'sonner';

export function useMisPedidos() {
  return useQuery({
    queryKey: ['mis-pedidos'],
    queryFn: () => pedidosClienteApi.getMisPedidos(),
  });
}

export function useMiPedido(id: number) {
  return useQuery({
    queryKey: ['mi-pedido', id],
    queryFn: () => pedidosClienteApi.getMiPedido(id),
    enabled: !!id,
  });
}

export function useCrearPedido() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      items: { precioCOId: number; cantidad: number }[];
      tipoPago: TipoPago;
      notas?: string;
    }) => pedidosClienteApi.crearPedido(data),
    onSuccess: (data) => {
      toast.success(`Pedido ${data.numeroPedido} creado exitosamente`);
      queryClient.invalidateQueries({ queryKey: ['mis-pedidos'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear pedido');
    },
  });
}

export function useCancelarPedido() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => pedidosClienteApi.cancelarPedido(id),
    onSuccess: () => {
      toast.success('Pedido cancelado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['mis-pedidos'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al cancelar pedido');
    },
  });
}
