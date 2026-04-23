// User types
export type UserRole = 'CLIENTE' | 'BODEGA' | 'CAJERO' | 'MOSTRADOR' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  nombre: string;
  apellido?: string;
  rol: UserRole;
  tiendaId?: number;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
  tiendaId?: number;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  nombre: string;
  apellido?: string;
  telefono?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

// Tienda types
export interface Tienda {
  id: number;
  nombre: string;
  ciudad: string;
  direccion?: string;
  telefono?: string;
}

// Producto types
export interface ProductoVariante {
  id: number;
  talla: string;
  color: string;
  colorHex: string;
  imagenColor?: string;
  precio: number;
  stockDisponible: number;
}

export interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  imagenPrincipal: string;
  imagenes: string[];
  categoria: string;
  subcategoria: string;
  precioBase: number;
  precioOferta?: number;
  esNuevo?: boolean;
  destacado?: boolean;
  variantes: ProductoVariante[];
}

// Pedido types
export type EstadoPedido = 'PENDIENTE' | 'EN_BODEGA' | 'LISTO_PARA_ENTREGA' | 'ENTREGADO' | 'CANCELADO';
export type EstadoPago = 'PENDIENTE' | 'VERIFICADO' | 'RECHAZADO';
export type TipoPago = 'EFECTIVO' | 'TRANSFERENCIA';

export interface ItemPedido {
  id: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  productoNombre: string;
  productoCodigo: string;
  corridaNombre: string;
  tallaNombre: string;
  colorNombre: string;
}

export interface Pedido {
  id: number;
  numeroPedido: string;
  estado: EstadoPedido;
  estadoPago: EstadoPago;
  tipoPago: TipoPago;
  subtotal: number;
  descuento: number;
  impuestos: number;
  total: number;
  fechaPedido: string;
  fechaPago: string | null;
  fechaPreparacion: string | null;
  fechaListo: string | null;
  fechaEntrega: string | null;
  items: ItemPedido[];
  notas?: string;
}

// Carrito types
export interface CarritoItem {
  precioCOId: number;
  cantidad: number;
  producto?: Producto;
  variante?: ProductoVariante;
}

// API types
export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// Filtros catálogo
export interface CatalogoFiltros {
  tiendaId: number;
  categoria?: string;
  busqueda?: string;
  corridaId?: number;
  colorId?: number;
  soloDisponibles?: boolean;
  pagina?: number;
  limite?: number;
}

// Helper para convertir valores numéricos que vienen como string del backend
export function toNumber(value: string | number | undefined | null): number {
  if (value === undefined || value === null) return 0;
  if (typeof value === 'number') return value;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

// Helper para formatear precios de forma segura
export function formatPrecio(value: string | number | undefined | null): string {
  const num = toNumber(value);
  return num.toFixed(2);
}
