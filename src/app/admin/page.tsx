'use client';

import { LayoutDashboard, ShoppingCart, Users, Store, TrendingUp, DollarSign, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTiendas } from '@/lib/hooks';

// Mock data para el dashboard
const mockStats = {
  ventasHoy: 15420.50,
  pedidosHoy: 23,
  nuevosClientes: 5,
  productosBajoStock: 8,
  pedidosRecientes: [
    { id: 1, numero: 'PD-2024-000045', cliente: 'Juan Pérez', total: 599.99, estado: 'ENTREGADO' },
    { id: 2, numero: 'PD-2024-000044', cliente: 'María García', total: 899.50, estado: 'LISTO_PARA_ENTREGA' },
    { id: 3, numero: 'PD-2024-000043', cliente: 'Carlos López', total: 299.99, estado: 'EN_BODEGA' },
    { id: 4, numero: 'PD-2024-000042', cliente: 'Ana Martínez', total: 1299.00, estado: 'PENDIENTE' },
    { id: 5, numero: 'PD-2024-000041', cliente: 'Pedro Sánchez', total: 450.00, estado: 'ENTREGADO' },
  ],
};

function StatCard({ title, value, description, icon: Icon, trend, trendUp }: {
  title: string;
  value: string;
  description?: string;
  icon: typeof LayoutDashboard;
  trend?: string;
  trendUp?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-2">{value}</p>
            {trend && (
              <div className={`flex items-center mt-1 text-sm ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className={`h-4 w-4 mr-1 ${!trendUp && 'rotate-180'}`} />
                {trend}
              </div>
            )}
            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
          </div>
          <div className="p-3 bg-primary/10 rounded-lg">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const { data: tiendas, isLoading: isLoadingTiendas } = useTiendas();

  const stats = [
    {
      title: 'Ventas Hoy',
      value: `$${mockStats.ventasHoy.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      trend: '+12.5% vs ayer',
      trendUp: true,
    },
    {
      title: 'Pedidos Hoy',
      value: mockStats.pedidosHoy.toString(),
      icon: ShoppingCart,
      description: '8 pendientes de preparar',
    },
    {
      title: 'Nuevos Clientes',
      value: `+${mockStats.nuevosClientes}`,
      icon: Users,
      trend: '+2 vs ayer',
      trendUp: true,
    },
    {
      title: 'Tiendas Activas',
      value: isLoadingTiendas ? '...' : tiendas?.length.toString() || '0',
      icon: Store,
      description: 'Todas operando normalmente',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Resumen del sistema y métricas principales</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pedidos Recientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Pedidos Recientes
            </CardTitle>
            <CardDescription>Últimos 5 pedidos recibidos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockStats.pedidosRecientes.map((pedido) => (
                <div key={pedido.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{pedido.numero}</p>
                    <p className="text-sm text-muted-foreground">{pedido.cliente}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${Number(pedido.total).toFixed(2)}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      pedido.estado === 'ENTREGADO'
                        ? 'bg-green-100 text-green-700'
                        : pedido.estado === 'LISTO_PARA_ENTREGA'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {pedido.estado.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              Ver Todos los Pedidos
            </Button>
          </CardContent>
        </Card>

        {/* Alertas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Alertas de Inventario
            </CardTitle>
            <CardDescription>Productos que requieren atención</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="p-2 bg-yellow-100 rounded-full">
                  <Package className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Stock Bajo</p>
                  <p className="text-sm text-muted-foreground">
                    {mockStats.productosBajoStock} productos con menos de 10 unidades
                  </p>
                </div>
                <Button size="sm" variant="outline">Ver</Button>
              </div>

              <div className="flex items-center gap-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-full">
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Pedidos Pendientes</p>
                  <p className="text-sm text-muted-foreground">8 pedidos esperando preparación</p>
                </div>
                <Button size="sm" variant="outline">Ver</Button>
              </div>

              <div className="flex items-center gap-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="p-2 bg-green-100 rounded-full">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Pagos Verificados</p>
                  <p className="text-sm text-muted-foreground">15 pagos verificados hoy</p>
                </div>
                <Button size="sm" variant="outline">Ver</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
