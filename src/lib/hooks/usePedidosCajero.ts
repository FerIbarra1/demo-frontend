import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pedidosCajeroApi } from '@/lib/api/pedidos';
import { toast } from 'sonner';

export function usePedidosPendientesPago() {
  return useQuery({
    queryKey: ['pedidos-pendientes-pago'],
    queryFn: () => pedidosCajeroApi.getPendientesPago(),
  });
}

export function useVerificarPagoTransferencia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      aprobado,
      observacion,
    }: {
      id: number;
      aprobado: boolean;
      observacion?: string;
    }) => pedidosCajeroApi.verificarPago(id, { aprobado, observacion }),
    onSuccess: (_, variables) => {
      if (variables.aprobado) {
        toast.success('Pago verificado exitosamente');
      } else {
        toast.info('Pago rechazado');
      }
      queryClient.invalidateQueries({ queryKey: ['pedidos-pendientes-pago'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al verificar pago');
    },
  });
}

export function useMarcarPagadoEfectivo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => pedidosCajeroApi.marcarPagado(id),
    onSuccess: () => {
      toast.success('Pago en tienda confirmado');
      queryClient.invalidateQueries({ queryKey: ['pedidos-pendientes-pago'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al confirmar pago');
    },
  });
}
