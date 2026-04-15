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

export function useTiendasFiltradas(estado?: string, ciudad?: string) {
  return useQuery({
    queryKey: ['tiendas', 'filtradas', estado, ciudad],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (estado) params.append('estado', estado);
      if (ciudad) params.append('ciudad', ciudad);
      const { data } = await api.get<Tienda[]>(`/tiendas?${params.toString()}`);
      return data;
    },
    enabled: !!estado || !!ciudad,
  });
}

export function useEstados() {
  return useQuery({
    queryKey: ['tiendas', 'estados'],
    queryFn: async () => {
      const { data } = await api.get<string[]>('/tiendas/estados');
      return data;
    },
  });
}

export function useCiudades(estado?: string) {
  return useQuery({
    queryKey: ['tiendas', 'ciudades', estado],
    queryFn: async () => {
      const { data } = await api.get<string[]>(`/tiendas/ciudades?estado=${encodeURIComponent(estado!)}`);
      return data;
    },
    enabled: !!estado,
  });
}

export function useTienda(tiendaId: number) {
  return useQuery({
    queryKey: ['tiendas', tiendaId],
    queryFn: async () => {
      const { data } = await api.get<Tienda>(`/tiendas/${tiendaId}`);
      return data;
    },
    enabled: !!tiendaId && tiendaId > 0,
    retry: (failureCount, error: any) => {
      // Don't retry on 404 - tienda doesn't exist
      if (error?.response?.status === 404) return false;
      return failureCount < 2;
    },
  });
}
