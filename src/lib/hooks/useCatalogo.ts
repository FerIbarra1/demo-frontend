import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogoApi } from '@/lib/api/catalogo';
import { CatalogoFiltros, Producto } from '@/lib/types';
import { toast } from 'sonner';

export function useCatalogo(filtros: CatalogoFiltros) {
  return useQuery({
    queryKey: ['catalogo', filtros],
    queryFn: () => catalogoApi.getProductos(filtros),
    enabled: !!filtros.tiendaId,
  });
}

export function useProducto(tiendaId: number, productoId: number) {
  return useQuery({
    queryKey: ['producto', tiendaId, productoId],
    queryFn: () => catalogoApi.getProducto(tiendaId, productoId),
    enabled: !!tiendaId && !!productoId,
  });
}

export function useFiltrosCatalogo(tiendaId: number) {
  return useQuery({
    queryKey: ['filtros', tiendaId],
    queryFn: () => catalogoApi.getFiltros(tiendaId),
    enabled: !!tiendaId,
  });
}

export function useVerificarStock() {
  return useMutation({
    mutationFn: (items: { precioCOId: number; cantidad: number }[]) =>
      catalogoApi.verificarStock(items),
    onError: (error: any) => {
      toast.error(error.message || 'Error al verificar stock');
    },
  });
}

export function useProductosDestacados(tiendaId: number) {
  return useQuery({
    queryKey: ['catalogo-destacados', tiendaId],
    queryFn: async () => {
      const productos = await catalogoApi.getProductos({ tiendaId });
      return productos.slice(0, 6);
    },
    enabled: !!tiendaId,
  });
}

export function useBuscarProductos(tiendaId: number, query: string) {
  return useQuery({
    queryKey: ['buscar-productos', tiendaId, query],
    queryFn: async () => {
      const productos = await catalogoApi.getProductos({ tiendaId });
      if (!query) return productos;
      return productos.filter(
        (p) =>
          p.nombre.toLowerCase().includes(query.toLowerCase()) ||
          p.codigo.toLowerCase().includes(query.toLowerCase())
      );
    },
    enabled: !!tiendaId,
  });
}
