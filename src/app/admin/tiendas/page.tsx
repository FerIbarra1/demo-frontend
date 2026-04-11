'use client';

import { useState } from 'react';
import { Store, Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useTiendas } from '@/lib/hooks';
import { SkeletonCard } from '@/components/common/SkeletonGrid';
import { ErrorDisplay } from '@/components/common/ErrorBoundary';

export default function AdminTiendasPage() {
  const { data: tiendas, isLoading, error, refetch } = useTiendas();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTiendas = tiendas?.filter((t) =>
    t.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.ciudad.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Gestión de Tiendas</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Gestión de Tiendas</h1>
        <ErrorDisplay
          error={error as Error}
          message="No se pudieron cargar las tiendas"
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestión de Tiendas</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Tienda
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tiendas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTiendas?.map((tienda) => (
          <Card key={tienda.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                {tienda.nombre}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{tienda.ciudad}</p>
              {tienda.direccion && (
                <p className="text-sm text-muted-foreground">{tienda.direccion}</p>
              )}
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
