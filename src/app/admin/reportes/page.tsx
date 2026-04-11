'use client';

import { useState } from 'react';
import { BarChart3, Download, TrendingUp, DollarSign, ShoppingCart, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data
const ventasPorDia = [
  { dia: 'Lun', ventas: 1200 },
  { dia: 'Mar', ventas: 1900 },
  { dia: 'Mié', ventas: 1500 },
  { dia: 'Jue', ventas: 2200 },
  { dia: 'Vie', ventas: 2800 },
  { dia: 'Sáb', ventas: 3500 },
  { dia: 'Dom', ventas: 4200 },
];

const productosTop = [
  { nombre: 'Camiseta Básica Blanca', vendidos: 145, total: 7250 },
  { nombre: 'Camiseta Negra Slim', vendidos: 132, total: 7920 },
  { nombre: 'Camiseta Gris Melange', vendidos: 98, total: 4900 },
  { nombre: 'Camiseta Roja Classic', vendidos: 87, total: 4350 },
  { nombre: 'Camiseta Azul Marino', vendidos: 76, total: 3800 },
];

export default function AdminReportesPage() {
  const totalVentas = ventasPorDia.reduce((sum, d) => sum + d.ventas, 0);
  const promedioDiario = Math.round(totalVentas / 7);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Reportes</h1>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>

      <Tabs defaultValue="ventas" className="space-y-6">
        <TabsList>
          <TabsTrigger value="ventas">Ventas</TabsTrigger>
          <TabsTrigger value="productos">Productos</TabsTrigger>
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
        </TabsList>

        <TabsContent value="ventas" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Ventas Totales (Semana)</p>
                    <p className="text-2xl font-bold">${totalVentas.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Promedio Diario</p>
                    <p className="text-2xl font-bold">${promedioDiario}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Pedidos</p>
                    <p className="text-2xl font-bold">156</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <ShoppingCart className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Ventas por Día</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2">
                {ventasPorDia.map((dia) => (
                  <div key={dia.dia} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-primary rounded-t"
                      style={{ height: `${(dia.ventas / 4200) * 200}px` }}
                    />
                    <span className="text-sm text-muted-foreground">{dia.dia}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="productos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Productos Más Vendidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {productosTop.map((producto, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-muted-foreground">#{index + 1}</span>
                      <div>
                        <p className="font-medium">{producto.nombre}</p>
                        <p className="text-sm text-muted-foreground">{producto.vendidos} unidades vendidas</p>
                      </div>
                    </div>
                    <p className="font-bold">${producto.total.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clientes" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Clientes Activos</p>
                    <p className="text-2xl font-bold">245</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Nuevos Clientes (Mes)</p>
                    <p className="text-2xl font-bold">+28</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
