export {
  useLogin,
  useRegister,
  useKioskToken,
  useKioskLogin,
  useUpdateProfile,
  useChangePassword,
  useLogout,
  useMe,
  useRefreshToken,
  useAuth,
  useRequireAuth,
  useAuthGuard,
} from './useAuth';

export { useKioskInactivity } from './useKioskInactivity';

export {
  useTiendas,
  useTienda,
  useEstados,
  useCiudades,
  useTiendasFiltradas,
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
