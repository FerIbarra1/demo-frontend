'use client';

import { useState } from 'react';
import { Package, Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCatalogo } from '@/lib/hooks';
import { SkeletonCard } from '@/components/common/SkeletonGrid';

export default function AdminProductosPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: productos, isLoading } = useCatalogo({ tiendaId: 1 });

  const productosArray = productos || [];

  const filteredProductos = productosArray.filter((p: any) =>
    p.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.categoria?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Gestión de Productos</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestión de Productos</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Producto
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProductos.map((producto: any) => (
          <Card key={producto.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {producto.nombre}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">{producto.categoria}</Badge>
              <p className="text-sm text-muted-foreground mt-2">
                ${Number(producto.precioBase).toFixed(2)}
              </p>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
                <Button variant="outline" size="sm" className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
