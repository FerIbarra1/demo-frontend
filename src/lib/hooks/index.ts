export {
  useLogin,
  useRegister,
  useLogout,
  useMe,
  useRefreshToken,
} from './useAuth';

export {
  useTiendas,
  useTienda,
} from './useTiendas';

export {
  useProtectedRoute,
  useClienteRoute,
  useBodegaRoute,
  useCajeroRoute,
  useMostradorRoute,
  useAdminRoute,
  useEmployeeRoute,
} from './useProtectedRoute';

export {
  useCatalogo,
  useProducto,
  useFiltrosCatalogo,
  useVerificarStock,
  useProductosDestacados,
  useBuscarProductos,
} from './useCatalogo';

export {
  useMisPedidos,
  useMiPedido,
  useCrearPedido,
  useCancelarPedido,
} from './usePedidosCliente';

export {
  usePedidosBodegaPendientes,
  usePedidoBodega,
  useVerificarStockPedido,
  useMarcarEnBodega,
  useMarcarListo,
  useAgregarNotasBodega,
} from './usePedidosBodega';

export {
  usePedidosPendientesPago,
  useVerificarPagoTransferencia,
  useMarcarPagadoEfectivo,
} from './usePedidosCajero';

export {
  usePedidosListos,
  useBuscarPedidoMostrador,
  useEntregarPedido,
} from './usePedidosMostrador';
