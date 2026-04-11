'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Store } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SkeletonCard } from '@/components/common/SkeletonGrid';
import { ErrorDisplay, useSafeData } from '@/components/common/ErrorBoundary';
import { useTiendas } from '@/lib/hooks';
import { useAuthStore } from '@/lib/stores/auth';
import { toast } from 'sonner';
import { Tienda } from '@/lib/types';

export default function SeleccionarTiendaPage() {
  const router = useRouter();
  const { data: tiendasData, isLoading, error, refetch } = useTiendas();
  const { user, setSelectedTienda, selectedTiendaId } = useAuthStore();

  // Validar que los datos sean un array
  const { items: tiendas, isEmpty } = useSafeData<Tienda>(tiendasData);

  // Si ya tiene tienda seleccionada y es cliente, ir al catálogo
  useEffect(() => {
    if (selectedTiendaId && user?.rol === 'CLIENTE') {
      router.push('/catalogo');
    }
  }, [selectedTiendaId, user, router]);

  const handleSelectTienda = (tiendaId: number) => {
    setSelectedTienda(tiendaId);
    toast.success('Tienda seleccionada correctamente');
    router.push('/catalogo');
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="h-16 w-16 bg-muted rounded-full mx-auto mb-4 animate-pulse" />
          <div className="h-10 w-1/3 bg-muted rounded mx-auto mb-4 animate-pulse" />
          <div className="h-5 w-1/2 bg-muted rounded mx-auto animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md mx-auto">
          <ErrorDisplay
            error={error as Error}
            message="No se pudieron cargar las tiendas. Por favor intenta de nuevo."
            onRetry={() => refetch()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <Store className="h-16 w-16 mx-auto mb-4 text-primary" />
        <h1 className="text-3xl font-bold mb-4">Selecciona tu Tienda</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Elige la sucursal donde deseas realizar tu compra. Podrás recoger tus
          pedidos en esta ubicación.
        </p>
      </div>

      {isEmpty ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No hay tiendas disponibles.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tiendas.map((tienda) => (
            <Card key={tienda.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{tienda.nombre}</CardTitle>
                    <CardDescription className="flex items-center mt-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      {tienda.ciudad}
                    </CardDescription>
                  </div>
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Store className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {tienda.direccion && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {tienda.direccion}
                  </p>
                )}
                <Button
                  className="w-full"
                  onClick={() => handleSelectTienda(tienda.id)}
                >
                  Seleccionar Tienda
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
