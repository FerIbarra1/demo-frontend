import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/axios';
import { Tienda } from '@/lib/types';

export function useTiendas() {
  return useQuery({
    queryKey: ['tiendas'],
    queryFn: async () => {
      const { data } = await api.get<Tienda[]>('/tiendas');
      return data;
    },
  });
}

export function useTienda(tiendaId: number) {
  return useQuery({
    queryKey: ['tiendas', tiendaId],
    queryFn: async () => {
      const { data } = await api.get<Tienda>(`/tiendas/${tiendaId}`);
      return data;
    },
    enabled: !!tiendaId,
  });
}
