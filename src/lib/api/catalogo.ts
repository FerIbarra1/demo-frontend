import { api } from './axios';
import { Producto, Tienda, CatalogoFiltros } from '@/lib/types';

// Respuesta paginada del backend
interface CatalogoResponse {
  data: Producto[];
  meta: {
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
  };
}

export const catalogoApi = {
  getTiendas: async (): Promise<Tienda[]> => {
    const { data } = await api.get<Tienda[]>('/tiendas');
    return data;
  },

  getTienda: async (id: number): Promise<Tienda> => {
    const { data } = await api.get<Tienda>(`/tiendas/${id}`);
    return data;
  },

  getProductos: async (filters: CatalogoFiltros): Promise<Producto[]> => {
    const params = new URLSearchParams();
    params.append('tiendaId', filters.tiendaId.toString());
    if (filters.categoria) params.append('categoria', filters.categoria);
    if (filters.busqueda) params.append('busqueda', filters.busqueda);
    if (filters.corridaId) params.append('corridaId', filters.corridaId.toString());
    if (filters.colorId) params.append('colorId', filters.colorId.toString());
    if (filters.soloDisponibles !== undefined) params.append('soloDisponibles', filters.soloDisponibles.toString());
    if (filters.pagina) params.append('pagina', filters.pagina.toString());
    if (filters.limite) params.append('limite', filters.limite.toString());

    const { data } = await api.get<CatalogoResponse>(`/catalogo?${params}`);
    // El backend retorna { data: [...], meta: {...} }
    // Asegurar que precioBase sea número
    return data.data.map((p) => ({
      ...p,
      precioBase: typeof p.precioBase === 'string' ? parseFloat(p.precioBase) : p.precioBase,
      precioOferta: p.precioOferta ? (typeof p.precioOferta === 'string' ? parseFloat(p.precioOferta) : p.precioOferta) : undefined,
    }));
  },

  getProducto: async (tiendaId: number, productoId: number): Promise<Producto> => {
    const { data } = await api.get<Producto>(`/catalogo/tienda/${tiendaId}/producto/${productoId}`);
    // Asegurar que precios sean números
    return {
      ...data,
      precioBase: typeof data.precioBase === 'string' ? parseFloat(data.precioBase) : data.precioBase,
      precioOferta: data.precioOferta ? (typeof data.precioOferta === 'string' ? parseFloat(data.precioOferta) : data.precioOferta) : undefined,
    };
  },

  getFiltros: async (tiendaId: number): Promise<{
    tallas: string[];
    colores: { nombre: string; hex: string }[];
    categorias: string[];
  }> => {
    const { data } = await api.get(`/catalogo/filtros/${tiendaId}`);
    return data;
  },

  verificarStock: async (
    items: { precioCOId: number; cantidad: number }[]
  ): Promise<{
    disponible: boolean;
    items: {
      precioCOId: number;
      disponible: boolean;
      stockActual: number;
      cantidadSolicitada: number;
      producto: {
        nombre: string;
        talla: string;
        color: string;
      };
    }[];
  }> => {
    const { data } = await api.post('/catalogo/verificar-stock', items);
    return data;
  },
};
