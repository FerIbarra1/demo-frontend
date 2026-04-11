import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pedidosMostradorApi } from '@/lib/api/pedidos';
import { toast } from 'sonner';

export function usePedidosListos() {
  return useQuery({
    queryKey: ['pedidos-listos'],
    queryFn: () => pedidosMostradorApi.getListos(),
  });
}

export function useBuscarPedidoMostrador() {
  return useMutation({
    mutationFn: (numero: string) => pedidosMostradorApi.buscarPedido(numero),
  });
}

export function useEntregarPedido() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => pedidosMostradorApi.entregarPedido(id),
    onSuccess: () => {
      toast.success('Pedido entregado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['pedidos-listos'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al entregar pedido');
    },
  });
}
