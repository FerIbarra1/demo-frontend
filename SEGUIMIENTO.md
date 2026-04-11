# Demo - Seguimiento del Proyecto

**Última actualización**: 2026-04-01 (Fases 1-10 completadas + Registro y Ecommerce + Neue Montreal Font)
**Proyecto**: Tienda de Camisetas - Frontend

---

## 🆕 Cambios Recientes (Abril 2026)

### Corrección de Errores de Autenticación y Layout
- **Problema 1**: El admin mostraba 404 (página negra) cuando el usuario no estaba autenticado
  - **Causa**: El grupo de rutas `(admin)` no funcionaba correctamente con el layout que retornaba `null`
  - **Solución**: Mover el admin de `(admin)/` a `admin/` (sin paréntesis) siguiendo el mismo patrón que otros módulos
  - **Archivos**: 
    - `src/app/admin/layout.tsx` - Layout simple con sidebar
    - `src/app/admin/page.tsx` - Dashboard
    - `src/app/admin/tiendas/page.tsx` - Gestión de tiendas
    - `src/app/admin/productos/page.tsx` - Gestión de productos
    - `src/app/admin/usuarios/page.tsx` - Gestión de usuarios
    - `src/app/admin/reportes/page.tsx` - Reportes

- **Problema 2**: Error 401 (Unauthorized) en `/pedidos/cliente/mis-pedidos`
  - **Causa 1**: El store de auth no persistía los tokens (solo el usuario)
  - **Causa 2**: La API devolvía `{ data: [], meta: {} }` pero el frontend esperaba un array directo
  - **Solución 1**: Agregar `accessToken`, `refreshToken` e `isAuthenticated` al `partialize` del store
  - **Solución 2**: Extraer `data.data` de la respuesta de la API
  - **Archivos**: 
    - `src/lib/stores/auth.ts` - Persistir tokens
    - `src/lib/api/pedidos.ts` - Extraer `data.data` de la respuesta
    - `src/app/(customer)/pedidos/page.tsx` - Descomentar y corregir el total

- **Problema 3**: Tabla de bodega no mostraba la columna Total
  - **Solución**: Descomentar la celda de Total en la fila de la tabla
  - **Archivo**: `src/app/(warehouse)/bodega/page.tsx`

### Corrección de Precios (toFixed errors) - COMPLETO
- **Problema**: El backend envía precios como `string` (Decimal de Prisma) y el frontend intentaba usar `.toFixed()` directamente
- **Solución**: Convertir a número con `Number()` antes de usar `toFixed()`
- **Archivos corregidos**:
  - `src/app/page.tsx` - `getTotalPrice()`, `producto.precioBase`
  - `src/app/(customer)/carrito/page.tsx` - `item.variante?.precio`, `item.variante!.precio * item.cantidad`, `total`
  - `src/app/(customer)/catalogo/page.tsx` - `producto.precioBase`, `producto.precioOferta`
  - `src/app/(customer)/checkout/page.tsx` - `item.variante!.precio`, `total`
  - `src/app/(cashier)/cajero/page.tsx` - `pedido.total`, `pedidoSeleccionado.total`
  - `src/app/(warehouse)/bodega/page.tsx` - `pedido.total` (comentado)
  - `src/app/(warehouse)/pedidos/[id]/page.tsx` - `item.precioUnitario`, `item.subtotal`, `pedido.subtotal`, `pedido.descuento`, `pedido.impuestos`, `pedido.total`
  - `src/app/(counter)/mostrador/page.tsx` - `pedidoBuscado.total`, `pedido.total`, `pedidoSeleccionado.total`
  - `src/app/(admin)/page.tsx` - `pedido.total`
  - `src/app/(admin)/productos/page.tsx` - `producto.precio`
  - `src/app/(admin)/reportes/page.tsx` - `promedioDiario`, `producto.total`
  - `src/components/product/ProductQuickView.tsx` - `displayPrice`, `productoPrecioOferta`, `displayPrice * quantity`

### Modal de Selección de Variantes - Estilo Ecommerce Profesional
- **Componente**: `ProductQuickView` - Modal estilo Shopify/Nike
- **Features**:
  - Vista previa del producto con imagen grande
  - Swatches de color circulares con indicador de selección
  - Selector de tallas tipo grid con disponibilidad cruzada
  - Indicadores de stock dinámicos ("¡Solo quedan X!")
  - Cantidad seleccionable con validación de stock
  - Precio actualizado según variante seleccionada
  - Badges de "OFERTA" y "Agotado"
  - Animaciones suaves y transiciones profesionales
  - Integración directa con el carrito (toast notifications)
- **Corrección**: Cambiado `useMemo` por `useEffect` para el reset de estado
- **Archivos creados**:
  - `src/components/product/ProductQuickView.tsx` - Componente principal
- **Archivos modificados**:
  - `src/app/(customer)/catalogo/page.tsx` - Integración del modal
  - `src/app/page.tsx` - Integración del modal (página principal)

### Tipografía - Neue Montreal
- **Fuente principal**: Cambiada de Geist a Neue Montreal
- **Cargada vía**: CDN (fonts.cdnfonts.com)
- **Aplicada en**: Todo el sitio (layout, headings, body text)
- **Archivos modificados**:
  - `src/app/layout.tsx` - Removido Geist, agregado CDN de Neue Montreal
  - `src/app/globals.css` - Definida fuente sans-serif como Neue Montreal

### Componentes UI - Tamaños Aumentados
- **Font base**: Aumentado de 16px a 18px (`html { font-size: 18px }`)
- **Button**: `h-12` (antes h-8), padding aumentado, texto `text-base`
- **Input**: `h-12` (antes h-8), padding `px-4 py-3`, texto `text-lg`
- **Select**: `h-12` (antes h-8), padding aumentado, items `text-base`
- **Headings**: Mejorados con tracking y line-height optimizado
- **Parágrafos**: Line-height aumentado a 1.7 para mejor legibilidad

### Nueva Página Principal (Ecommerce)
- **URL**: `/` ahora muestra una tienda ecommerce funcional
- **Features**:
  - Grid de productos con imágenes y precios
  - Modal de selección de talla/color/cantidad
  - Carrito integrado en sidebar (Sheet)
  - Búsqueda de productos
  - Diseño responsive tipo tienda online

### Registro de Usuarios
- **URL**: `/registro` - Página de creación de cuenta
- Campos: Nombre, Email, Contraseña, Confirmar contraseña
- Validación con Zod
- Redirección automática post-registro

### Flujo de Autenticación Mejorado
- Checkout ahora requiere login (redirige a `/login?redirect=/checkout`)
- Login y registro mantienen el redirect para volver al checkout
- Carrito persistente en localStorage

### Correcciones Backend-Frontend
- Conversión de precios string (Decimal de Prisma) a número
- Normalización de datos de API
- Helpers: `toNumber()`, `normalizeProducto()`, `normalizePedido()`

---

## Resumen de Fases

| Fase | Estado | Descripción |
|------|--------|-------------|
| Fase 1 | ✅ COMPLETADA | Setup y Configuración Inicial |
| Fase 2 | ✅ COMPLETADA | Configuraci��n de API y Estado Global |
| Fase 3 | ✅ COMPLETADA | Autenticación y Selección de Tienda |
| Fase 4 | ✅ COMPLETADA | Módulo Cliente - Catálogo |
| Fase 5 | ✅ COMPLETADA | Módulo Cliente - Carrito y Pedidos |
| Fase 6 | ✅ COMPLETADA | Módulo Bodega |
| Fase 7 | ✅ COMPLETADA | Módulo Cajero |
| Fase 8 | ✅ COMPLETADA | Módulo Mostrador |
| Fase 9 | ✅ COMPLETADA | Módulo Administrador |
| Fase 10 | ✅ COMPLETADA | UI/UX Polish y Optimizaciones (parcial) |
| Fase 11 | ⏳ PENDIENTE | Testing y Documentación |
| Fase 12 | ⏳ PENDIENTE | Build y Deploy |

---

## Fase 1: Setup y Configuración Inicial ✅

### Completado
- [x] Crear proyecto Next.js 16.2.2 con TypeScript
- [x] Configurar Tailwind CSS v4 (versión estable)
- [x] Instalar shadcn/ui con 16 componentes
- [x] Configurar estructura de carpetas Clean Architecture
- [x] Instalar dependencias principales:
  - TanStack Query (React Query)
  - Zustand
  - React Hook Form + Zod
  - Axios
  - Lucide React
- [x] Configurar TypeScript paths (`@/*`)
- [x] Crear layout base con providers
- [x] Configurar variables de entorno (.env.local)

### Archivos Creados
```
.env.local
src/app/layout.tsx (actualizado)
src/app/page.tsx (página de inicio)
src/components/layout/providers.tsx
src/components/ui/* (16 componentes shadcn)
```

---

## Fase 2: Configuración de API y Estado Global ✅

### Completado
- [x] Configurar Axios con interceptores (JWT, refresh token, headers)
- [x] Implementar store de autenticación (Zustand + persist)
- [x] Implementar store de carrito (Zustand + persist)
- [x] Crear tipos TypeScript base (User, Producto, Pedido, etc.)
- [x] Crear hooks de autenticación (useLogin, useRegister, useLogout, useMe)
- [x] Crear hooks de protección de rutas por rol
- [x] Crear servicios de API:
  - authApi (login, register, logout, me, refresh)
  - catalogoApi (tiendas, productos, filtros, stock)
  - pedidosApi (cliente, bodega, cajero, mostrador, admin)
- [x] Crear hooks de React Query para cada módulo

### Archivos Creados
```
src/lib/
├── api/
│   ├── axios.ts (config base + interceptores)
│   ├── auth.ts
│   ├── catalogo.ts
│   ├── pedidos.ts
│   └── index.ts (exports)
├── hooks/
│   ├── useAuth.ts
│   ├── useTiendas.ts
│   ├── useProtectedRoute.ts
│   ├── useCatalogo.ts
│   ├── usePedidosCliente.ts
│   ├── usePedidosBodega.ts
│   ├── usePedidosCajero.ts
│   ├── usePedidosMostrador.ts
│   └── index.ts (exports)
├── stores/
│   ├── auth.ts (AuthStore con roles)
│   └── cart.ts (CartStore para items)
└── types/
    └── index.ts (todos los tipos TypeScript)
```

### Hooks de Protección de Rutas
```typescript
useProtectedRoute({ allowedRoles: ['CLIENTE'] })
useClienteRoute()      // Solo CLIENTE
useBodegaRoute()       // Solo BODEGA
useCajeroRoute()       // Solo CAJERO
useMostradorRoute()    // Solo MOSTRADOR
useAdminRoute()        // Solo ADMIN
useEmployeeRoute()     // BODEGA, CAJERO, MOSTRADOR, ADMIN
```

### Stores Configurados
- **useAuthStore**: Autenticación, tokens, usuario, tienda seleccionada
- **useCartStore**: Items del carrito, totales, persistencia

### API Services
Cada módulo tiene sus métodos completos con tipado TypeScript.

---

## Fase 3: Autenticación y Selección de Tienda ✅

### Completado
- [x] Crear página de Login (`/login`)
  - Formulario con email/password validado con Zod
  - Toggle de visibilidad de contraseña
  - Manejo de errores con Alert
  - Suspense boundary para useSearchParams
  - Credenciales de prueba mostradas en UI
- [x] Crear página de Selección de Tienda (`/tienda`)
  - Listado de tiendas desde API con React Query
  - Guardar selección en estado (Zustand + localStorage)
  - Redirección automática al catálogo
  - Diseño de cards para cada tienda
- [x] Crear layout de autenticación (`(auth)/layout.tsx`)
  - Header con logo
  - Footer consistente
  - Centrado responsive del formulario
- [x] Crear página de Unauthorized (`/unauthorized`)
  - Mensaje de acceso denegado
  - Botones para volver al inicio o login
- [x] Crear layout del Customer (`(customer)/layout.tsx`)
  - Header con navegación (Catálogo, Pedidos, Carrito)
  - Badge de cantidad en carrito
  - Footer consistente
  - Protección de rutas integrada

### Archivos Creados
```
src/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx       # Layout de autenticación
│   │   └── login/
│   │       └── page.tsx     # Página de login con Suspense
│   ├── (customer)/
│   │   ├── layout.tsx       # Layout del cliente con nav
│   │   ├── tienda/
│   │   │   └── page.tsx     # Selección de tienda
│   │   ├── catalogo/
│   │   │   └── page.tsx     # Catálogo de productos (base)
│   │   ├── pedidos/
│   │   │   └── page.tsx     # Mis pedidos (base)
│   │   ├── carrito/
│   │   │   └── page.tsx     # Carrito de compras
│   │   ├── checkout/
│   │   │   └── page.tsx     # Checkout con pago
│   │   └── confirmacion/
│   │       └── page.tsx     # Confirmación de pedido
│   └── unauthorized/
│       └── page.tsx         # Página de acceso denegado
├── lib/
│   └── schemas/
│       └── auth.ts          # Schemas Zod para auth
└── components/ui/
    ├── alert.tsx            # Componente Alert
    ├── separator.tsx        # Componente Separator
    ├── textarea.tsx         # Componente Textarea
    └── radio-group.tsx      # Componente RadioGroup
```

### Rutas Disponibles
```
/                → Tienda ecommerce (página principal)
/login           → Página de login con credenciales de prueba
/registro        → Crear cuenta de usuario
/tienda          → Selección de tienda (CLIENTE)
/catalogo        → Catálogo de productos
/carrito         → Carrito de compras
/checkout        → Proceso de checkout (requiere login)
/confirmacion    → Confirmación de pedido
/pedidos         → Mis pedidos
/unauthorized    → Página de acceso denegado
```

### Features Implementadas
- **Login completo** con validación Zod y React Hook Form
- **Protección de rutas** por rol integrada en layouts
- **Selección de tienda** con persistencia
- **Navegación del cliente** con header sticky
- **Carrito funcional** con modificación de cantidades
- **Checkout completo** con selector de método de pago
- **Página de confirmación** post-compra

---

## Fase 4: Módulo Cliente - Catálogo ✅

### Completado
- [x] Layout del kiosko creado en Fase 3
- [x] Página base de Catálogo (`/catalogo`)
  - Grid de productos responsive
  - Carga desde API con React Query
  - Estado vacío con mensaje
  - Redirección si no hay tienda seleccionada
- [x] Modal de selección de variantes (`ProductQuickView`)
  - Selector de color con swatches circulares
  - Selector de talla tipo grid
  - Disponibilidad cruzada (colores/tallas)
  - Stock dinámico con alertas
  - Integración con carrito

### Nota
- El catálogo ahora incluye un modal profesional estilo Shopify/Nike
- Al hacer clic en cualquier producto se abre el selector de variantes
- Las variantes se conectan directamente al backend (stock real)

### Rutas Disponibles
```
/catalogo              → Listado de productos (funcional)
```

---

## Fase 5: Módulo Cliente - Carrito y Pedidos ✅

### Completado
- [x] Crear página de Carrito (`/carrito`)
  - Lista de items con imágenes
  - Modificar cantidades (+/-)
  - Eliminar items
  - Vaciar carrito
  - Resumen de totales
  - Vista vacía cuando no hay items
- [x] Implementar Checkout (`/checkout`)
  - Selector de tipo de pago (RadioGroup)
  - Campo de notas adicionales
  - Botón de confirmar pedido
  - Integración con API
- [x] Crear página de "Mis Pedidos" (`/pedidos`)
  - Listado de pedidos del cliente
  - Estados de pedido con badges
  - Estados de pago
  - Fecha formateada
  - Vista vacía
- [x] Crear página de Confirmación (`/confirmacion`)
  - Mensaje de éxito
  - Próximos pasos
  - Botones de navegación

### Componentes Creados
- Carrito completo con gestión de items
- Checkout form con validación
- OrderCard para listado de pedidos

### Rutas Disponibles
```
/carrito              → Carrito de compras (completo)
/checkout             → Proceso de compra (completo)
/pedidos              → Mis pedidos (completo)
/confirmacion         → Confirmación post-compra (completo)
/pedidos/[id]         → Detalle de pedido (pendiente)
```

---

## Fase 6: Módulo Bodega ✅

### Completado
- [x] Crear layout de bodega (`(warehouse)/layout.tsx`)
  - Header con navegación
  - Protección de rutas por rol (BODEGA/ADMIN)
  - Logout integrado
- [x] Implementar Dashboard de Bodega (`/bodega`)
  - Cards de estadísticas (Pendientes, En Bodega, Listos)
  - Tabla de pedidos con acciones
  - Botones: Recibir, Marcar Listo
- [x] Crear página de Detalle de Pedido (`/pedidos/[id]`)
  - Información completa del pedido
  - Lista de productos
  - Verificación de Stock (tabla con disponibilidad)
  - Botón "Recibir en Bodega"
  - Botón "Marcar como Listo"
  - Dialog para agregar notas
  - Resumen con totales

### Rutas Disponibles
```
/bodega                → Dashboard de bodega
/pedidos/[id]          → Detalle y acciones del pedido
```

---

## Fase 7: Módulo Cajero ✅

### Completado
- [x] Crear layout de cajero (`(cashier)/layout.tsx`)
  - Header con navegación
  - Protección de rutas por rol (CAJERO/ADMIN)
- [x] Implementar Dashboard del Cajero (`/cajero`)
  - Cards de estadísticas (Transferencias, Efectivo)
  - Tabla de Transferencias Bancarias pendientes
  - Tabla de Pagos en Efectivo pendientes
- [x] Implementar modal de Verificación de Pago
  - Diálogo para verificar transferencias
  - Opciones: Confirmar o Rechazar
  - Campo de observación
  - Botón para confirmar pago en efectivo

### Rutas Disponibles
```
/cajero                → Dashboard de cajero
```

---

## Fase 8: Módulo Mostrador ✅

### Completado
- [x] Crear layout de mostrador (`(counter)/layout.tsx`)
  - Header con navegación
  - Protección de rutas por rol (MOSTRADOR/ADMIN)
- [x] Implementar Dashboard del Mostrador (`/mostrador`)
  - Buscador de pedidos por número
  - Tabla de Pedidos Listos para Entrega
  - Botón para imprimir ticket
  - Botón para entregar pedido
- [x] Implementar vista de Entrega
  - Dialog de confirmación de entrega
  - Resumen del pedido con items
  - Botón de confirmar entrega

### Rutas Disponibles
```
/mostrador             → Dashboard de mostrador
```

---

## Fase 9: Módulo Administrador ✅

### Completado
- [x] Crear layout de administrador (`(admin)/layout.tsx`)
  - Sidebar responsive (desktop y mobile con Sheet)
  - Navegación entre secciones
  - Protección de rutas por rol (ADMIN)
- [x] Implementar Dashboard Admin (`/admin`)
  - Cards de estadísticas (Ventas, Pedidos, Clientes, Tiendas)
  - Pedidos recientes
  - Alertas de inventario
- [x] Crear sección de Gestión de Tiendas (`/admin/tiendas`)
  - Tabla de tiendas con búsqueda
  - Modal para crear nueva tienda
  - Badges de estado (Activa/Inactiva)
- [x] Crear sección de Gestión de Productos (`/admin/productos`)
  - Tabla de productos con filtros
  - Filtro por categoría
  - Indicadores de stock bajo
  - Modal para crear producto
- [x] Crear sección de Gestión de Usuarios (`/admin/usuarios`)
  - Tabla de usuarios con roles
  - Badges coloridos por rol
  - Modal para crear usuario
- [x] Crear sección de Reportes (`/admin/reportes`)
  - Tabs: Ventas, Productos, Clientes
  - Gráfico de ventas por día
  - Productos más vendidos
  - Estadísticas de clientes
  - Botón para exportar reportes

### Rutas Disponibles
```
/admin                 → Dashboard con métricas
/admin/tiendas         → Gestión de tiendas
/admin/productos       → Gestión de productos
/admin/usuarios        → Gestión de usuarios
/admin/reportes        → Reportes y estadísticas
```

---

## Fase 10: UI/UX Polish y Optimizaciones ✅ (Parcial)

### Completado
- [x] Agregar skeleton loaders en todas las vistas
  - Componente `SkeletonCard` reutilizable
  - Componente `SkeletonGrid` para grids de productos
  - Implementado en catálogo, pedidos, tiendas, bodega
- [x] Implementar manejo de errores global
  - Componente `ErrorDisplay` con retry
  - Helper `useSafeData` para validar arrays de API
  - Helper `validateArray` para tipado seguro
- [x] Corregir errores de hidratación
  - `suppressHydrationWarning` en layout
  - `typeof window !== 'undefined'` checks en stores
  - Componente `FormattedDate` para fechas

### Pendiente (Opcional para futuro)
- [ ] Optimizar imágenes con Next.js Image
- [ ] Agregar animaciones de transición (Framer Motion)
- [ ] Implementar modo oscuro/claro
- [ ] Agregar página 404 personalizada
- [ ] Implementar PWA básico

### Componentes Creados
```
src/components/common/
├── SkeletonGrid.tsx       # Skeletons para carga
├── ErrorBoundary.tsx      # Manejo de errores + safe data
└── FormattedDate.tsx      # Fechas sin errores de hidratación
```

### Correciones Importantes
- **Problema**: `productos?.map is not a function`
- **Solución**: Helper `useSafeData` que valida que la API retorne un array
- **Cambios**: Todas las páginas ahora usan `useSafeData<T>(data)` para mapear

---

## Fase 11: Testing y Documentación ⏳

### Pendiente
- [ ] Configurar Vitest para testing
- [ ] Crear tests unitarios para utils/hooks/stores
- [ ] Crear tests de integración para flujos críticos
- [ ] Documentar componentes (Storybook opcional)
- [ ] Verificar accesibilidad (a11y)

---

## Fase 12: Build y Deploy ⏳

### Pendiente
- [ ] Configurar build de producción
- [ ] Optimizar bundle size
- [ ] Verificar variables de entorno producción
- [ ] Configurar Dockerfile opcional
- [ ] Crear script de despliegue
- [ ] Configurar CI/CD (GitHub Actions)
- [ ] Desplegar en producción

---

## Usuarios de Prueba (Backend)

| Rol | Email | Password | Tienda |
|-----|-------|----------|--------|
| Cliente | `cliente@demo.com` | password123 | - |
| Bodega | `bodega@tienda.com` | password123 | 1 |
| Cajero | `cajero@tienda.com` | password123 | 1 |
| Mostrador | `mostrador@tienda.com` | password123 | 1 |
| Admin | `admin@tienda.com` | password123 | - |

---

## Variables de Entorno Requeridas

```env
# API Backend
NEXT_PUBLIC_API_URL=http://localhost:3001

# App
NEXT_PUBLIC_APP_NAME=Demo
NEXT_PUBLIC_APP_VERSION=1.0.0
```

---

## Comandos Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo

# Build
npm run build            # Construye para producción
npm run start            # Inicia servidor de producción

# Calidad de código
npm run lint             # Ejecuta ESLint

# Agregar componentes shadcn
npx shadcn add <nombre>  # Agrega componente de shadcn/ui
```

---

## Estructura del Proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Grupo: Login/Register
│   ├── (customer)/        # Grupo: Cliente (kiosko)
│   ├── (warehouse)/       # Grupo: Bodega
│   ├── (cashier)/         # Grupo: Cajero
│   ├── (counter)/         # Grupo: Mostrador
│   ├── (admin)/           # Grupo: Admin
│   ├── api/               # API Routes (proxy)
│   ├── page.tsx           # Página de inicio
│   ├── layout.tsx         # Layout root
│   └── globals.css        # Estilos globales
├── components/
│   ├── ui/                # shadcn components (16)
│   ├── common/            # Componentes compartidos
│   ├── forms/             # Formularios reutilizables
│   └── layout/            # Layouts y providers
├── lib/
│   ├── api/               # APIs (axios, auth, catalogo, pedidos)
│   ├── hooks/             # Custom hooks (auth, catalogo, pedidos, protected)
│   ├── stores/            # Zustand stores (auth, cart)
│   ├── types/             # TypeScript types
│   └── utils/             # Utilidades (cn, etc)
└── public/                # Assets estáticos
```

---

## Dependencias Instaladas

### Producción
- next: ^16.2.2
- react: ^19.0.0
- react-dom: ^19.0.0
- @tanstack/react-query: ^5.x
- @tanstack/react-query-devtools: ^5.x
- zustand: ^5.x
- react-hook-form: ^7.x
- @hookform/resolvers: ^3.x
- zod: ^3.x
- axios: ^1.x
- lucide-react: ^0.x
- tailwindcss: ^4.x
- @tailwindcss/postcss: ^4.x

### Desarrollo
- typescript: ^5.x
- @types/node: ^20.x
- @types/react: ^19.x
- @types/react-dom: ^19.x
- eslint: ^9.x
- eslint-config-next: ^16.x

---

## Notas Técnicas

### Estado de Autenticación
- JWT almacenado en localStorage
- Refresh token automático configurado
- Persistencia de usuario y tienda seleccionada

### Estado del Carrito
- Persistencia en localStorage
- Cálculo de totales en tiempo real
- Validación de stock antes de checkout

### API Configuration
- Base URL configurable via env
- Interceptores para auth headers
- Auto-refresh de token en 401
- Manejo de errores estandarizado

### Correcciones de Hidratación (Hydration)
Para evitar errores de hidratación entre SSR y cliente:

1. **LocalStorage**: Usar `typeof window !== 'undefined'` checks antes de acceder a localStorage en stores
2. **Fechas**: Componentes `FormattedDate` y `ShortDate` en `components/common/FormattedDate.tsx` para formatear fechas solo en cliente
3. **Body**: Atributo `suppressHydrationWarning` en el body del layout root
4. **Extensiones**: El atributo `cz-shortcut-listen` es de extensiones del navegador (ignorado con suppressHydrationWarning)

### Correcciones de Tipos de Datos (Backend)
Problema: `producto.precioBase?.toFixed is not a function`
- **Causa**: El backend envía precios como string (Decimal de Prisma) en lugar de number
- **Solución**: Helpers `toNumber()` y `normalizeProducto()` para convertir strings a números
- **Cambios**:
  - `src/lib/api/catalogo.ts` - Conversión de precios en la API
  - `src/lib/types/index.ts` - Helper `toNumber()` y `formatPrecio()`
  - `src/components/common/ErrorBoundary.tsx` - `normalizeProducto()` y `normalizePedido()`

### Archivos Modificados para Hidratación
```
src/app/layout.tsx                    # suppressHydrationWarning en body
src/lib/stores/auth.ts                # typeof window checks
src/components/common/FormattedDate.tsx  # Componentes cliente para fechas
src/app/(customer)/pedidos/page.tsx   # Usa FormattedDate
src/app/(warehouse)/bodega/page.tsx   # Usa ShortDate
src/app/(counter)/mostrador/page.tsx  # Usa ShortDate
```

---

## Próximos Pasos

1. **Fase 10**: UI/UX Polish y Optimizaciones (skeletons, animaciones, modo oscuro)
2. **Fase 12**: Build y Deploy (optimización, CI/CD, producción)

---

**Documento creado para seguimiento en caso de interrupción de conexión**
**Última actualización**: Fase 2 completada, listo para iniciar Fase 3
