# Demo - Tienda de Camisetas Frontend

## Información del Proyecto
- **Nombre**: demo
- **Tipo**: Tienda de Camisetas (Kiosko + Gestión Interna)
- **Stack**: Next.js 15 + React 19 + TypeScript 5 + Tailwind CSS 4 + shadcn/ui

## Arquitectura de Roles
| Rol | Descripción | Vistas Principales |
|-----|-------------|-------------------|
| CLIENTE | Usuario que compra en el kiosko | Catálogo, Mis Pedidos, Carrito |
| BODEGA | Recibe y prepara pedidos | Lista de Pedidos, Verificación Stock |
| CAJERO | Verifica pagos transferencia | Pedidos Pendientes de Pago |
| MOSTRADOR | Entrega pedidos en tienda | Pedidos Listos, Búsqueda |
| ADMIN | Gestión completa | Dashboard, Reportes, CRUD |

## Estructura de Carpetas (Clean Architecture)
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Grupo: Login/Register
│   ├── (customer)/        # Grupo: Cliente (kiosko)
│   ├── (warehouse)/       # Grupo: Bodega
│   ├── (cashier)/         # Grupo: Cajero
│   ├── (counter)/         # Grupo: Mostrador
│   ├── (admin)/           # Grupo: Admin
│   └── api/               # API Routes (proxy)
├── components/
│   ├── ui/                # shadcn components
│   ├── common/            # Componentes compartidos
│   ├── forms/             # Formularios reutilizables
│   └── layout/            # Layouts y navegación
├── lib/
│   ├── api/               # Configuración API
│   ├── hooks/             # Custom hooks
│   ├── stores/            # Zustand stores
│   ├── types/             # TypeScript types
│   └── utils/             # Utilidades
├── features/              # Módulos por dominio
│   ├── auth/
│   ├── catalog/
│   ├── orders/
│   ├── payments/
│   └── admin/
└── public/                # Assets estáticos
```

## API Backend (Documentación)
- **Base URL**: Configurable por variable de entorno
- **Autenticación**: JWT (Access + Refresh tokens)
- **Endpoints principales**:
  - Auth: `/auth/login`, `/auth/register`, `/auth/refresh`
  - Catálogo: `/catalogo`, `/tiendas`
  - Pedidos: `/pedidos/cliente`, `/pedidos/bodega/*`, `/pedidos/cajero/*`, `/pedidos/mostrador/*`

## Convenciones de Código
- **Estilos**: Tailwind CSS con clase `cn()` para merges
- **UI Components**: shadcn/ui (radix-based)
- **Estado**: Zustand para estado global
- **Fetch**: TanStack Query (React Query) para server state
- **Formularios**: React Hook Form + Zod
- **Iconos**: Lucide React

## Comandos Útiles
```bash
# Desarrollo
npm run dev

# Construcción
npm run build

# Lint
npm run lint

# Agregar componente shadcn
npx shadcn add <component>
```
