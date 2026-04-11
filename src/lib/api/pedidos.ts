import { api } from './axios';
import { Pedido, TipoPago, ItemPedido } from '@/lib/types';

// Cliente
export const pedidosClienteApi = {
  crearPedido: async (pedidoData: {
    items: { precioCOId: number; cantidad: number }[];
    tipoPago: TipoPago;
    notas?: string;
  }): Promise<{ id: number; numeroPedido: string; estado: string; total: number; mensaje: string }> => {
    const { data } = await api.post('/pedidos/cliente', pedidoData);
    return data;
  },

  getMisPedidos: async (): Promise<Pedido[]> => {
    const { data } = await api.get<{ data: Pedido[]; meta: any }>('/pedidos/cliente/mis-pedidos');
    return data.data;
  },

  getMiPedido: async (id: number): Promise<Pedido> => {
    const { data } = await api.get<Pedido>(`/pedidos/cliente/${id}`);
    return data;
  },

  cancelarPedido: async (id: number): Promise<void> => {
    await api.post(`/pedidos/cliente/${id}/cancelar`);
  },
};

// Bodega
export const pedidosBodegaApi = {
  getPendientes: async (): Promise<Pedido[]> => {
    const { data } = await api.get<Pedido[]>('/pedidos/bodega/pendientes');
    return data;
  },

  getPedido: async (id: number): Promise<Pedido> => {
    const { data } = await api.get<Pedido>(`/pedidos/bodega/${id}`);
    return data;
  },

  verificarStock: async (id: number): Promise<{
    items: {
      productoNombre: string;
      talla: string;
      color: string;
      cantidadSolicitada: number;
      stockDisponible: number;
      disponible: boolean;
    }[];
  }> => {
    const { data } = await api.get(`/pedidos/bodega/${id}/verificar-stock`);
    return data;
  },

  marcarEnBodega: async (id: number): Promise<void> => {
    await api.post(`/pedidos/bodega/${id}/en-bodega`);
  },

  marcarListo: async (id: number): Promise<void> => {
    await api.post(`/pedidos/bodega/${id}/listo`);
  },

  agregarNotas: async (id: number, notas: string): Promise<void> => {
    await api.post(`/pedidos/bodega/${id}/notas`, { notas });
  },
};

// Cajero
export const pedidosCajeroApi = {
  getPendientesPago: async (): Promise<Pedido[]> => {
    const { data } = await api.get<Pedido[]>('/pedidos/cajero/pendientes-pago');
    return data;
  },

  verificarPago: async (id: number, datos: {
    aprobado: boolean;
    observacion?: string;
  }): Promise<void> => {
    await api.post(`/pedidos/cajero/${id}/verificar-pago`, datos);
  },

  marcarPagado: async (id: number): Promise<void> => {
    await api.post(`/pedidos/cajero/${id}/marcar-pagado`);
  },
};

// Mostrador
export const pedidosMostradorApi = {
  getListos: async (): Promise<Pedido[]> => {
    const { data } = await api.get<Pedido[]>('/pedidos/mostrador/listos');
    return data;
  },

  buscarPedido: async (numero: string): Promise<Pedido | null> => {
    const { data } = await api.get(`/pedidos/mostrador/buscar?numero=${numero}`);
    return data;
  },

  entregarPedido: async (id: number): Promise<void> => {
    await api.post(`/pedidos/mostrador/${id}/entregar`);
  },
};

// Admin
export const pedidosAdminApi = {
  getPedidos: async (params?: {
    fechaInicio?: string;
    fechaFin?: string;
    estado?: string;
  }): Promise<Pedido[]> => {
    const queryParams = new URLSearchParams();
    if (params?.fechaInicio) queryParams.append('fechaInicio', params.fechaInicio);
    if (params?.fechaFin) queryParams.append('fechaFin', params.fechaFin);
    if (params?.estado) queryParams.append('estado', params.estado);

    const { data } = await api.get<Pedido[]>(`/pedidos/admin?${queryParams}`);
    return data;
  },

  getPedido: async (id: number): Promise<Pedido> => {
    const { data } = await api.get<Pedido>(`/pedidos/admin/${id}`);
    return data;
  },

  getHistorial: async (id: number): Promise<{
    fecha: string;
    estado: string;
    usuario: string;
    comentario?: string;
  }[]> => {
    const { data } = await api.get(`/pedidos/admin/${id}/historial`);
    return data;
  },
};
