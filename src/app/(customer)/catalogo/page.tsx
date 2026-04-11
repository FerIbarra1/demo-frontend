'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Eye } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SkeletonCard } from '@/components/common/SkeletonGrid';
import { ErrorDisplay, useSafeData, normalizeProducto } from '@/components/common/ErrorBoundary';
import { useCatalogo } from '@/lib/hooks';
import { useAuthStore } from '@/lib/stores/auth';
import { Producto } from '@/lib/types';
import { ProductQuickView } from '@/components/product/ProductQuickView';

export default function CatalogoPage() {
  const router = useRouter();
  const { selectedTiendaId, user } = useAuthStore();
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Si no tiene tienda seleccionada, redirigir
  useEffect(() => {
    if (!selectedTiendaId) {
      router.push('/tienda');
    }
  }, [selectedTiendaId, router]);

  const { data: productosData, isLoading, error, refetch } = useCatalogo({
    tiendaId: selectedTiendaId || 0,
  });

  // Validar que los datos sean un array y normalizar productos
  const { items: rawProductos, isEmpty } = useSafeData<Producto>(productosData);
  const productos = rawProductos.map(normalizeProducto).filter(Boolean) as Producto[];

  const handleOpenProduct = (producto: Producto) => {
    setSelectedProduct(producto);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProduct(null), 200);
  };

  if (!selectedTiendaId) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <SkeletonCard />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="h-10 w-1/3 bg-muted rounded animate-pulse mb-2" />
          <div className="h-5 w-1/2 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorDisplay
          error={error as Error}
          message="No se pudieron cargar los productos. Por favor verifica tu conexión."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Catálogo de Productos</h1>
        <p className="text-muted-foreground">
          Explora nuestra colección de camisetas disponibles en tu tienda
          seleccionada.
        </p>
      </div>

      {isEmpty ? (
        <Card className="text-center py-12">
          <CardContent>
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              No hay productos disponibles en este momento.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productos.map((producto) => (
            <Card
              key={producto.id}
              className="overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => handleOpenProduct(producto)}
            >
              <div className="aspect-square bg-muted relative overflow-hidden">
                {producto.imagenPrincipal ? (
                  <img
                    src={producto.imagenPrincipal}
                    alt={producto.nombre}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}

                {/* Quick view overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Button variant="secondary" size="sm" className="gap-2">
                    <Eye className="w-4 h-4" />
                    Ver Detalle
                  </Button>
                </div>

                {/* Badges */}
                {producto.precioOferta && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    OFERTA
                  </div>
                )}
                {producto.variantes?.length > 0 && (
                  <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {producto.variantes.length} variantes
                  </div>
                )}
              </div>
              <CardHeader className="p-4">
                <CardTitle className="text-base line-clamp-1">{producto.nombre}</CardTitle>
                <CardDescription>
                  {producto.categoria} • {producto.subcategoria}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold">
                      ${Number(producto.precioBase).toFixed(2) || '0.00'}
                    </span>
                    {producto.precioOferta && (
                      <span className="text-sm text-muted-foreground line-through">
                        ${Number(producto.precioOferta).toFixed(2)}
                      </span>
                    )}
                  </div>
                  <Button size="sm" variant="outline" onClick={(e) => {
                    e.stopPropagation();
                    handleOpenProduct(producto);
                  }}>
                    Ver Detalle
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick View Modal */}
      <ProductQuickView
        producto={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
