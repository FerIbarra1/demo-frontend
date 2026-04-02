# Documentación para Frontend - Tienda de Camisetas API

## Índice
1. [Arquitectura General](#arquitectura-general)
2. [Autenticación y Roles](#autenticación-y-roles)
3. [Flujo de Pedidos](#flujo-de-pedidos)
4. [Vistas por Rol](#vistas-por-rol)
5. [Endpoints Detallados](#endpoints-detallados)
6. [Modelo de Datos](#modelo-de-datos)
7. [Ejemplos Prácticos](#ejemplos-prácticos)

---

## Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENTE                              │
│  (React - Kiosko de tienda)                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────��───────────────────────────────┐
│                    NESTJS BACKEND                            │
│  ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌─────────────────┐ │
│  │  Auth   │ │ Catálogo │ │ Pedidos │ │  Gestión (Admin)│ │
│  └─────────┘ └──────────┘ └─────────┘ └─────────────────┘ │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              POSTGRESQL + REDIS                            │
└─────────────────────────────────────────────────────────────┘
```

### Tecnologías
- **Backend**: NestJS 11 + TypeScript
- **Base de Datos**: PostgreSQL 18
- **Cache**: Redis 7
- **Autenticación**: JWT (Access + Refresh tokens)
- **Documentación**: Swagger UI

---

## Autenticación y Roles

### Roles del Sistema

| Rol | Descripción | Vistas Principales |
|-----|-------------|-------------------|
| **CLIENTE** | Usuario que compra en el kiosko | Catálogo, Mis Pedidos, Carrito |
| **BODEGA** | Recibe y prepara pedidos | Lista de Pedidos, Verificación Stock |
| **CAJERO** | Verifica pagos transferencia | Pedidos Pendientes de Pago |
| **MOSTRADOR** | Entrega pedidos en tienda | Pedidos Listos, Búsqueda |
| **ADMIN** | Gestión completa | Dashboard, Reportes, CRUD |

### Flujo de Login

```
POST /api/auth/login
Content-Type: application/json
X-Tienda-Id: 1  (Header requerido para CLIENTE)

{
  "email": "cliente@demo.com",
  "password": "password123",
  "tiendaId": 1  // Opcional, se puede enviar en body o header
}
```

**Respuesta Exitosa:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 3600,
  "user": {
    "id": 1,
    "email": "cliente@demo.com",
    "nombre": "Cliente Demo",
    "rol": "CLIENTE",
    "tiendaId": 1
  }
}
```

### Uso del Token

Todas las peticiones autenticadas deben incluir:
```
Authorization: Bearer <accessToken>
```

Para CLIENTES, además incluir:
```
X-Tienda-Id: 1
```

---

## Flujo de Pedidos

### Diagrama de Estados

```
┌──────────────────────────────────────────────────────────────────┐
│                         FLUJO DE PEDIDO                           │
└──────────────────────────────────────────────────────────────────┘

    CLIENTE          BODEGA           CAJERO          MOSTRADOR
       │                │                │                │
       ▼                │                │                │
   ┌─────────┐          │                │                │
   │PENDIENTE│◄─────────┤                │                │
   └────┬────┘          │                │                │
        │               │                │                │
        │    ┌───���──────┘                │                │
        │    ▼                            │                │
        │ ┌──────────┐   (Si pago         │                │
        │ │EN_BODEGA │    transferencia)  │                │
        │ └────┬─────┘                    │                │
        │      │                          ▼                │
        │      │                    ┌──────────┐         │
        │      │                    │VERIFICAR │         │
        │      │                    │  PAGO    │         │
        │      │                    └────┬─────┘         │
        │      │                         │              │
        │      └──────────┐              │              │
        │                 ▼              │              │
        │          ┌──────────────┐      │              │
        │          │LISTO_ENTREGA │◄─────┘              │
        │          └──────┬───────┘                     │
        │                 │                            │
        │                 └──────────────┐             │
        │                                ▼             │
        │                         ┌──────────┐         │
        │                         │ENTREGADO │◄──────┘
        │                         └──────────┘
        │
   (Cancelación)
        ▼
   ┌──────────┐
   │CANCELADO │
   └──────────┘
```

### Estados del Pedido

| Estado | Descripción | Quién puede cambiarlo |
|--------|-------------|----------------------|
| `PENDIENTE` | Pedido creado, esperando aprobación de bodega | BODEGA → EN_BODEGA, CLIENTE → CANCELADO |
| `EN_BODEGA` | Bodega está preparando el pedido | BODEGA → LISTO_PARA_ENTREGA |
| `LISTO_PARA_ENTREGA` | Pedido empacado y listo | MOSTRADOR → ENTREGADO |
| `ENTREGADO` | Cliente recibió el pedido | Estado final |
| `CANCELADO` | Pedido cancelado | Estado final |

### Estados de Pago

| Estado | Descripción |
|--------|-------------|
| `PENDIENTE` | Aún no se verifica el pago |
| `VERIFICADO` | Pago confirmado por cajero |
| `RECHAZADO` | Pago rechazado |

---

## Vistas por Rol

### 1. CLIENTE (Kiosko de Tienda)

#### Vista: Selección de Tienda
```
GET /api/tiendas
```
- Lista de tiendas disponibles
- Usuario selecciona su tienda antes de comprar
- Se guarda en localStorage/sessionStorage

#### Vista: Catálogo de Productos
```
GET /api/catalogo?tiendaId=1
```
**Diseño sugerido:**
```
┌─────────────────────────────────────────────┐
│  TIENDA: Sucursal Centro        [Ver Pedido]│
├─────────────────────────────────────────────┤
│  Filtros: [Todas] [XS] [S] [M] [L] [XL]    │
│           [Blanco] [Negro] [Azul] [Rojo]    │
├─────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐         │
│  │  [FOTO]     │  │  [FOTO]     │         │
│  │  Camiseta   │  │  Camiseta   │         │
│  │  Básica     │  │  Polo       │         │
│  │             │  │             │         │
│  │  $299.99    │  │  $399.99    │         │
│  │  [Ver]      │  │  [Ver]      │         │
│  └─────���───────┘  └─────────────┘         │
└─────────────────────────────────────────────┘
```

#### Vista: Detalle de Producto
```
GET /api/catalogo/tienda/1/producto/1
```
**Elementos:**
- Imagen grande del producto
- Selector de Color (con muestra de color)
- Selector de Talla (XS, S, M, L, XL, etc.)
- Stock disponible
- Precio
- Botón "Agregar al Carrito"

#### Vista: Carrito / Crear Pedido
```
POST /api/pedidos/cliente
```
**Request:**
```json
{
  "items": [
    {
      "precioCOId": 1,  // ID de la combinación producto/color/talla
      "cantidad": 2
    },
    {
      "precioCOId": 5,
      "cantidad": 1
    }
  ],
  "tipoPago": "EFECTIVO",  // o "TRANSFERENCIA"
  "notas": "Entregar envuelto para regalo"
}
```

**Respuesta:** Número de pedido generado (ej: `PD-2024-000001`)

#### Vista: Mis Pedidos
```
GET /api/pedidos/cliente/mis-pedidos
```
**Columnas:** Número, Fecha, Total, Estado, Estado Pago, Acciones

---

### 2. BODEGA

#### Vista: Pedidos Pendientes
```
GET /api/pedidos/bodega/pendientes
```
**Diseño sugerido:**
```
┌─────────────────────────────────────────────┐
│  BODEGA - Pedidos por Preparar              │
├─────────────────────────────────────────────┤
│  Filtro: [PENDIENTE ▼] [EN_BODEGA ▼]       │
├─────────────────────────────────────────────┤
│  #PEDIDO    CLIENTE      ESTADO      ACCIÓN │
│  ─────────────────────────────────────────  │
│  PD-2024-   Juan Pérez   PENDIENTE   [Ver] │
│  000001                                   │
│                                           │
│  PD-2024-   María García EN_BODEGA    [Ver] │
│  000002        (Preparando)               │
└─────────────────────────────────────────────┘
```

#### Vista: Verificar Stock
```
GET /api/pedidos/bodega/{id}/verificar-stock
```
**Muestra:**
- Producto solicitado
- Talla y Color
- Cantidad solicitada
- Stock disponible
- Indicador ✅ / ❌

#### Acciones Bodega:
- **"Recibir en Bodega"**: `POST /api/pedidos/bodega/{id}/en-bodega`
- **"Marcar Listo"**: `POST /api/pedidos/bodega/{id}/listo`
- **Agregar Notas**: `POST /api/pedidos/bodega/{id}/notas`

---

### 3. CAJERO

#### Vista: Pedidos Pendientes de Pago
```
GET /api/pedidos/cajero/pendientes-pago
```
**Diseño sugerido:**
```
┌─────────────────────────────────────────────┐
│  CAJERO - Verificación de Pagos              │
├─────────────────────────────────────────────┤
│  #PEDIDO    CLIENTE      MONTO    TIPO    │
│  ─────────────────────────────────────────  │
│  PD-2024-   Juan Pérez   $599.98   TRANSF  │
│  000001         [Verificar Pago]          │
│                                           │
│  PD-2024-   María García$399.99   EFECTIVO│
│  000002         [Marcar Pagado]           │
└─────────────────────────────────────────────┘
```

#### Acciones Cajero:
- **Verificar Pago Transferencia**:
  ```
  POST /api/pedidos/cajero/{id}/verificar-pago
  {
    "aprobado": true,
    "observacion": "Transferencia confirmada en BBVA"
  }
  ```

- **Marcar Pagado en Tienda**:
  ```
  POST /api/pedidos/cajero/{id}/marcar-pagado
  ```

---

### 4. MOSTRADOR

#### Vista: Pedidos Listos para Entrega
```
GET /api/pedidos/mostrador/listos
```
**Diseño sugerido:**
```
┌─────────────────────────────────────────────┐
│  MOSTRADOR - Entrega de Pedidos             │
├─────────────────────────────────────────────┤
│  Buscar: [________________] [🔍]           │
├─────────────────────────────────────────────┤
│  #PEDIDO    CLIENTE      ESTADO    ACCIÓN │
│  ─────────────────────────────────────────  │
│  PD-2024-   Juan Pérez   LISTO      [Entregar]│
│  000001        (Esperando)                │
│                                           │
│  PD-2024-   Mar��a García LISTO      [Entregar]│
│  000002        (Esperando)                │
└─────────────────────────────────────────────┘
```

#### Acciones Mostrador:
- **Entregar Pedido**:
  ```
  POST /api/pedidos/mostrador/{id}/entregar
  ```

---

### 5. ADMIN

#### Dashboard
```
GET /api/pedidos/admin
```
**Métricas sugeridas:**
- Total pedidos del día
- Pedidos por estado
- Ingresos del día
- Productos más vendidos

#### Gestión
- CRUD de Tiendas
- CRUD de Productos
- CRUD de Usuarios
- Reportes de ventas

---

## Endpoints Detallados

### Autenticación

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Registrar nuevo cliente | No |
| POST | `/auth/login` | Iniciar sesión | No |
| POST | `/auth/refresh` | Refrescar token | No |
| POST | `/auth/logout` | Cerrar sesión | Sí |
| GET | `/auth/me` | Perfil del usuario | Sí |

### Catálogo (Público)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/tiendas` | Lista de tiendas activas |
| GET | `/catalogo?tiendaId=1` | Productos de una tienda |
| GET | `/catalogo/tienda/1/producto/1` | Detalle de producto |
| GET | `/catalogo/filtros/1` | Opciones de filtro |
| POST | `/catalogo/verificar-stock` | Verificar disponibilidad |

### Pedidos - Cliente

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/pedidos/cliente` | Crear pedido |
| GET | `/pedidos/cliente/mis-pedidos` | Mis pedidos |
| GET | `/pedidos/cliente/{id}` | Ver mi pedido |
| POST | `/pedidos/cliente/{id}/cancelar` | Cancelar pedido |

### Pedidos - Bodega

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/pedidos/bodega/pendientes` | Pedidos por preparar |
| GET | `/pedidos/bodega/{id}/verificar-stock` | Verificar stock |
| POST | `/pedidos/bodega/{id}/en-bodega` | Marcar recibido |
| POST | `/pedidos/bodega/{id}/listo` | Marcar listo |
| POST | `/pedidos/bodega/{id}/notas` | Agregar notas |

### Pedidos - Cajero

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/pedidos/cajero/pendientes-pago` | Pedidos por verificar pago |
| POST | `/pedidos/cajero/{id}/verificar-pago` | Verificar transferencia |
| POST | `/pedidos/cajero/{id}/marcar-pagado` | Marcar como pagado |

### Pedidos - Mostrador

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/pedidos/mostrador/listos` | Pedidos listos para entrega |
| GET | `/pedidos/mostrador/buscar?numero=PD-2024-000001` | Buscar pedido |
| POST | `/pedidos/mostrador/{id}/entregar` | Entregar pedido |

### Pedidos - Admin

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/pedidos/admin` | Todos los pedidos (con filtros) |
| GET | `/pedidos/admin/{id}` | Pedido completo |
| GET | `/pedidos/admin/{id}/historial` | Historial de cambios |

---

## Modelo de Datos

### Entidades Principales

#### Producto
```typescript
{
  id: number;
  codigo: string;           // Ej: "CAM-001"
  nombre: string;           // Ej: "Camiseta Básica Algodón"
  descripcion: string;
  imagenPrincipal: string;  // URL de imagen
  imagenes: string[];       // Array de URLs
  categoria: string;        // Ej: "Camisetas"
  subcategoria: string;     // Ej: "Básicas"
}
```

#### PrecioCO (Combinación específica)
```typescript
{
  id: number;
  productoId: number;
  tiendaId: number;
  corridaId: number;   // Ej: Adulto, Infantil
  tallaId: number;     // Ej: S, M, L, XL
  colorId: number;    // Ej: Blanco, Negro
  precio: number;      // Precio específico
  sku: string;         // Código único SKU
  stock: {
    cantidad: number;
    cantidadReservada: number;
    cantidadDisponible: number;  // Calculado
  }
}
```

#### Pedido
```typescript
{
  id: number;
  numeroPedido: string;      // Ej: "PD-2024-000001"
  estado: EstadoPedido;      // PENDIENTE, EN_BODEGA, etc.
  estadoPago: EstadoPago;    // PENDIENTE, VERIFICADO
  tipoPago: TipoPago;        // EFECTIVO, TRANSFERENCIA
  
  // Totales
  subtotal: number;
  descuento: number;
  impuestos: number;
  total: number;
  
  // Fechas del flujo
  fechaPedido: Date;
  fechaPago: Date | null;
  fechaPreparacion: Date | null;
  fechaListo: Date | null;
  fechaEntrega: Date | null;
  
  // Relaciones
  items: ItemPedido[];
  historial: HistorialPedido[];
}
```

#### ItemPedido
```typescript
{
  id: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  
  // Snapshot (no cambia aunque el producto cambie)
  productoNombre: string;
  productoCodigo: string;
  corridaNombre: string;
  tallaNombre: string;
  colorNombre: string;
}
```

---

## Ejemplos Prácticos

### Flujo Completo: Cliente compra una camiseta

#### Paso 1: Seleccionar Tienda
```javascript
// GET /api/tiendas
const tiendas = [
  { id: 1, nombre: "Sucursal Centro", ciudad: "CDMX" },
  { id: 2, nombre: "Sucursal Norte", ciudad: "CDMX" }
];

// Guardar en localStorage
localStorage.setItem('tiendaId', 1);
```

#### Paso 2: Ver Catálogo
```javascript
// GET /api/catalogo?tiendaId=1
const response = await fetch('/api/catalogo?tiendaId=1');
const { data: productos } = await response.json();

// productos[0]:
{
  id: 1,
  nombre: "Camiseta Básica Algodón",
  precioBase: 299.99,
  variantes: [
    { id: 1, talla: "S", color: "Blanco", colorHex: "#FFFFFF", precio: 299.99, stockDisponible: 15 },
    { id: 2, talla: "M", color: "Blanco", colorHex: "#FFFFFF", precio: 299.99, stockDisponible: 8 },
    { id: 3, talla: "L", color: "Negro", colorHex: "#000000", precio: 299.99, stockDisponible: 0 }
  ]
}
```

#### Paso 3: Agregar al Carrito
```javascript
// El usuario selecciona:
// - Producto: Camiseta Básica
// - Color: Blanco
// - Talla: M
// - Cantidad: 2

const item = {
  precioCOId: 2,  // ID de la variante talla M / color Blanco
  cantidad: 2
};

// Guardar en carrito (localStorage o estado)
carrito.push(item);
```

#### Paso 4: Verificar Stock antes de comprar
```javascript
// POST /api/catalogo/verificar-stock
const response = await fetch('/api/catalogo/verificar-stock', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify([
    { precioCOId: 2, cantidad: 2 }
  ])
});

// Respuesta:
{
  disponible: true,
  items: [
    {
      precioCOId: 2,
      disponible: true,
      stockActual: 8,
      cantidadSolicitada: 2,
      producto: { nombre: "Camiseta Básica", talla: "M", color: "Blanco" }
    }
  ]
}
```

#### Paso 5: Crear Pedido
```javascript
// POST /api/pedidos/cliente
// Headers: Authorization: Bearer <token>, X-Tienda-Id: 1

const response = await fetch('/api/pedidos/cliente', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'X-Tienda-Id': 1
  },
  body: JSON.stringify({
    items: [
      { precioCOId: 2, cantidad: 2 }
    ],
    tipoPago: "EFECTIVO",  // o "TRANSFERENCIA"
    notas: "Entregar envuelto para regalo"
  })
});

// Respuesta:
{
  id: 1,
  numeroPedido: "PD-2024-000001",
  estado: "PENDIENTE",
  total: 599.98,
  mensaje: "Pedido creado exitosamente"
}
```

#### Paso 6: Mostrar Ticket al Cliente
```
=====================================
         TIENDA DE CAMISETAS
       Sucursal Centro
=====================================
Pedido: PD-2024-000001
Fecha: 2024-01-15 14:30
Cliente: Juan Pérez

Producto              Cant   Precio
-------------------------------------
Camiseta Básica        2    $299.99
  Talla: M, Color: Blanco

Subtotal:                    $599.98
Total:                       $599.98
-------------------------------------
Estado: PENDIENTE
Pago: EFECTIVO

Por favor pase a caja a 
realizar su pago.
=====================================
```

---

## Flujo Bodega - Preparar Pedido

### Paso 1: Ver pedidos pendientes
```javascript
// GET /api/pedidos/bodega/pendientes
const pedidos = await response.json();
// Muestra lista con botón "Recibir"
```

### Paso 2: Verificar stock
```javascript
// GET /api/pedidos/bodega/1/verificar-stock
const verificacion = await response.json();
// Muestra tabla con stock disponible
```

### Paso 3: Marcar como "En Bodega"
```javascript
// POST /api/pedidos/bodega/1/en-bodega
// Cambia estado a EN_BODEGA
```

### Paso 4: Preparar y marcar "Listo"
```javascript
// POST /api/pedidos/bodega/1/listo
// Cambia estado a LISTO_PARA_ENTREGA
```

---

## Notas Importantes para Frontend

### 1. Manejo de Errores
El backend retorna errores con esta estructura:
```json
{
  "statusCode": 400,
  "message": "Stock insuficiente para Camiseta Básica - Blanco - Talla M. Disponible: 5",
  "error": "Bad Request"
}
```

### 2. Websocket (Futuro)
Para actualizaciones en tiempo real de pedidos, se implementará WebSocket para notificar a bodega cuando llega un pedido nuevo.

### 3. Caché de Catálogo
El catálogo no cambia frecuentemente. Se recomienda cachear por 5 minutos.

### 4. Offline Support
Para el kiosko, considerar almacenar en IndexedDB el catálogo y sincronizar pedidos si pierde conexión.

### 5. Impresión de Tickets
El mostrador necesitará imprimir tickets de entrega. Considerar integración con impresoras térmicas.

---

## Usuarios de Prueba

| Rol | Email | Password | Tienda |
|-----|-------|----------|--------|
| Cliente | `cliente@demo.com` | password123 | - |
| Bodega | `bodega@tienda.com` | password123 | 1 |
| Cajero | `cajero@tienda.com` | password123 | 1 |
| Mostrador | `mostrador@tienda.com` | password123 | 1 |
| Admin | `admin@tienda.com` | password123 | - |

---

## Soporte

- **Documentación API**: http://localhost:3000/api/docs
- **Swagger UI**: Interfaz interactiva para probar endpoints

---

**Última actualización**: Abril 2024
**Versión**: 1.0.0
