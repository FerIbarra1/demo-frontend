# Plan de Desarrollo - Demo Tienda de Camisetas

## FASE 1: Setup y Configuración Inicial
**Objetivo**: Preparar el proyecto base con todas las dependencias y configuraciones

### Tareas:
1. Crear proyecto Next.js 15 con TypeScript
2. Configurar Tailwind CSS v4 (versión estable)
3. Instalar y configurar shadcn/ui
4. Configurar estructura de carpetas (Clean Architecture)
5. Configurar variables de entorno (`.env.local`)
6. Instalar dependencias principales:
   - TanStack Query (React Query)
   - Zustand
   - React Hook Form + Zod
   - Axios
   - Lucide React
7. Configurar TypeScript paths (`@/*`)
8. Crear archivos base (layout, globals, etc.)

### Entregable:
- Proyecto base ejecutándose en `http://localhost:3000`
- Estructura de carpetas limpia
- Configuración de estilos funcionando

---

## FASE 2: Configuración de API y Estado Global
**Objetivo**: Configurar la conexión con el backend y estado global

### Tareas:
1. Crear configuración base de Axios con interceptores
2. Implementar store de autenticación (Zustand)
3. Crear hooks de autenticación (`useAuth`, `useLogin`, `useRegister`)
4. Configurar TanStack Query (QueryClient, providers)
5. Crear tipos TypeScript base (User, ApiResponse, etc.)
6. Implementar middleware de protección de rutas
7. Crear sistema de manejo de errores API
8. Configurar refresh token automático

### Entregable:
- Login funcional conectado al backend
- Sistema de protección de rutas por rol
- Manejo de tokens JWT

---

## FASE 3: Autenticación y Selección de Tienda
**Objetivo**: Implementar flujo de login y selección inicial

### Tareas:
1. Crear página de Login (`/login`)
   - Formulario con email/password
   - Validación Zod
   - Manejo de errores
2. Crear página de selección de Tienda (`/tienda`)
   - Listado de tiendas desde API
   - Guardar selección en estado
3. Implementar layout de autenticación
4. Crear componentes reutilizables:
   - `AuthCard`
   - `StoreSelector`
   - `ProtectedRoute`
5. Configurar redirecciones post-login según rol

### Entregable:
- Flujo completo: Login → Selección Tienda → Dashboard según rol
- Diseño responsivo y atractivo

---

## FASE 4: Módulo Cliente (Kiosko) - Parte 1: Catálogo
**Objetivo**: Vista de catálogo de productos para clientes

### Tareas:
1. Crear layout del kiosko (customer)
2. Implementar página de Catálogo (`/catalogo`)
   - Grid de productos
   - Filtros por talla y color
   - Skeleton loaders
3. Crear componentes:
   - `ProductCard`
   - `ProductGrid`
   - `FilterBar`
   - `ColorSelector`
   - `SizeSelector`
4. Implementar página de Detalle de Producto (`/catalogo/[id]`)
   - Galería de imágenes
   - Selector de variantes
   - Verificación de stock
   - Botón "Agregar al Carrito"
5. Crear hook `useCatalogo` con TanStack Query
6. Implementar carrito en estado global (Zustand)

### Entregable:
- Catálogo funcional con navegación
- Detalle de producto con selección de variantes
- Carrito persistente

---

## FASE 5: Módulo Cliente (Kiosko) - Parte 2: Carrito y Pedidos
**Objetivo**: Flujo completo de compra para clientes

### Tareas:
1. Crear página de Carrito (`/carrito`)
   - Lista de items
   - Modificar cantidades
   - Eliminar items
   - Resumen de totales
2. Implementar Checkout (`/checkout`)
   - Selector de tipo de pago (Efectivo/Transferencia)
   - Notas adicionales
   - Confirmación de pedido
3. Crear página de "Mis Pedidos" (`/pedidos`)
   - Listado de pedidos del cliente
   - Estados de pedido
   - Detalle de pedido
4. Crear componentes:
   - `CartItem`
   - `CartSummary`
   - `CheckoutForm`
   - `OrderCard`
   - `OrderDetail`
   - `TicketPreview`
5. Implementar servicios de pedidos
6. Crear vista de confirmación post-compra

### Entregable:
- Flujo completo: Carrito → Checkout → Confirmación → Mis Pedidos
- Generación de tickets visuales

---

## FASE 6: Módulo Bodega
**Objetivo**: Gestión de pedidos para el personal de bodega

### Tareas:
1. Crear layout de bodega
2. Implementar Dashboard de Bodega (`/bodega`)
   - Contadores de pedidos por estado
   - Lista de pedidos pendientes
3. Crear página de Pedidos (`/bodega/pedidos`)
   - Tabla de pedidos con filtros
   - Estados: PENDIENTE, EN_BODEGA
   - Acciones por pedido
4. Implementar vista de Verificación de Stock (`/bodega/pedidos/[id]/stock`)
   - Lista de productos solicitados
   - Stock disponible
   - Indicadores visuales (✅/❌)
5. Crear componentes:
   - `WarehouseOrderTable`
   - `StockVerification`
   - `OrderActionButtons`
   - `OrderNotes`
6. Implementar acciones:
   - "Recibir en Bodega"
   - "Marcar como Listo"
   - Agregar notas

### Entregable:
- Flujo completo de bodega funcional
- Cambio de estados con notificaciones

---

## FASE 7: Módulo Cajero
**Objetivo**: Verificación de pagos para cajeros

### Tareas:
1. Crear layout de cajero
2. Implementar Dashboard del Cajero (`/cajero`)
   - Pedidos pendientes de pago
   - Separación por tipo de pago
3. Crear página de Pedidos Pendientes (`/cajero/pendientes`)
   - Tabla de pagos por verificar
   - Filtros por tipo de pago
4. Implementar modal de Verificación de Pago
   - Verificación de transferencias
   - Rechazo con observaciones
   - Marcado de efectivo como pagado
5. Crear componentes:
   - `PaymentVerificationTable`
   - `PaymentVerificationModal`
   - `PaymentStatusBadge`
6. Implementar acciones:
   - Verificar pago transferencia
   - Rechazar pago
   - Marcar pagado en tienda

### Entregable:
- Sistema de verificación de pagos funcional
- Historial de verificaciones

---

## FASE 8: Módulo Mostrador
**Objetivo**: Entrega de pedidos para el personal de mostrador

### Tareas:
1. Crear layout de mostrador
2. Implementar Dashboard del Mostrador (`/mostrador`)
   - Pedidos listos para entrega
   - Buscador de pedidos
3. Crear página de Pedidos Listos (`/mostrador/listos`)
   - Tabla de pedidos listos
   - Búsqueda por número de pedido
4. Implementar vista de Entrega (`/mostrador/pedidos/[id]`)
   - Detalle del pedido
   - Confirmación de entrega
   - Firma o identificación del receptor
5. Crear componentes:
   - `CounterOrderTable`
   - `OrderSearch`
   - `DeliveryConfirmation`
   - `DeliveryTicket`
6. Implementar acciones:
   - Buscar pedido
   - Entregar pedido
   - Generar comprobante

### Entregable:
- Sistema de entregas funcional
- Impresión de tickets de entrega

---

## FASE 9: Módulo Administrador
**Objetivo**: Panel de administración completo

### Tareas:
1. Crear layout de administrador
2. Implementar Dashboard Admin (`/admin`)
   - Métricas del día
   - Gráficos de ventas
   - Pedidos recientes
3. Crear sección de Gestión de Tiendas
   - CRUD de tiendas
   - Configuración
4. Crear sección de Gestión de Productos
   - CRUD de productos
   - Gestión de inventario
   - Asignación de precios por tienda
5. Crear sección de Gestión de Usuarios
   - CRUD de usuarios
   - Asignación de roles
6. Crear sección de Reportes
   - Ventas por período
   - Productos más vendidos
   - Pedidos por estado
7. Crear componentes:
   - `AdminSidebar`
   - `StatCard`
   - `DataTable`
   - `ReportChart`
   - `CRUDModal`

### Entregable:
- Panel de administración completo
- Reportes exportables

---

## FASE 10: UI/UX Polish y Optimizaciones
**Objetivo**: Refinar la experiencia de usuario

### Tareas:
1. Implementar sistema de notificaciones (toast)
2. Agregar skeleton loaders en todas las vistas
3. Implementar manejo de errores global
4. Optimizar imágenes (Next.js Image)
5. Agregar animaciones de transición (Framer Motion)
6. Implementar modo oscuro/claro
7. Agregar página 404 personalizada
8. Crear página de error global
9. Implementar loading states
10. Optimizar para móviles (responsive)
11. Agregar metadatos SEO
12. Implementar PWA básico

### Entregable:
- Aplicación pulida y profesional
- Experiencia de usuario optimizada

---

## FASE 11: Testing y Documentación
**Objetivo**: Asegurar calidad y documentar

### Tareas:
1. Configurar Vitest para testing
2. Crear tests unitarios para:
   - Utils
   - Hooks
   - Stores
3. Crear tests de integración para:
   - Flujos críticos
   - Autenticación
4. Agregar scripts de testing
5. Documentar componentes (Storybook opcional)
6. Crear documentación de despliegue
7. Verificar accesibilidad (a11y)
8. Validar contraste y colores

### Entregable:
- Tests funcionando
- Documentación completa

---

## FASE 12: Build y Deploy
**Objetivo**: Preparar para producción

### Tareas:
1. Configurar build de producción
2. Optimizar bundle size
3. Configurar análisis de bundle
4. Verificar variables de entorno producción
5. Configurar Dockerfile (opcional)
6. Crear script de despliegue
7. Configurar CI/CD básico (GitHub Actions)
8. Verificar Lighthouse scores
9. Realizar pruebas end-to-end manuales
10. Desplegar en Vercel/Railway/similar

### Entregable:
- Aplicación desplegada y funcionando
- Pipeline de CI/CD configurado

---

## Timeline Estimado

| Fase | Duración Estimada |
|------|-------------------|
| Fase 1 | 1-2 horas |
| Fase 2 | 2-3 horas |
| Fase 3 | 2-3 horas |
| Fase 4 | 3-4 horas |
| Fase 5 | 3-4 horas |
| Fase 6 | 2-3 horas |
| Fase 7 | 2-3 horas |
| Fase 8 | 2-3 horas |
| Fase 9 | 4-5 horas |
| Fase 10 | 2-3 horas |
| Fase 11 | 2-3 horas |
| Fase 12 | 1-2 horas |

**Total Estimado**: 26-38 horas

---

## Notas Importantes

1. **Prioridad**: Seguir el orden de las fases
2. **Roles**: Cada fase construye sobre la anterior
3. **Testing**: Probar cada rol con los usuarios de prueba del backend
4. **UI**: Usar componentes shadcn/ui para mantener consistencia
5. **Estado**: Usar Zustand para estado global, React Query para server state
6. **Rutas**: Implementar protección de rutas desde Fase 2
