"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Navbar,
  ProductQuickView,
  ProductCard,
  HeroSection,
  FeaturesSection,
  NewsletterSection,
  Footer,
} from "@/components/premium";
import { StoreLocationGuard } from "@/components/premium/StoreLocationModal";
import { SkeletonCard } from "@/components/common/SkeletonGrid";
import { ErrorDisplay, useSafeData } from "@/components/common/ErrorBoundary";
import { useAuth, useCatalogo, useKioskToken } from "@/lib/hooks";
import { useKioskStore } from "@/lib/stores/kioskStore";
import { Producto } from "@/lib/types";
import { useRouter } from "next/navigation";
import { Carousel } from "@/components/premium/Carousel";

export default function HomePage() {
  const router = useRouter();
  const { isKioskMode } = useKioskStore();
  const { user, isAuthenticated } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Kiosk Redirection
  useEffect(() => {
    if (isKioskMode && !isAuthenticated) {
      router.push('/kiosko/welcome');
    }
  }, [isKioskMode, isAuthenticated, router]);

  // Fetch products
  const {
    data: productosData,
    isLoading,
    error,
    refetch,
  } = useCatalogo({
    tiendaId: 1,
  });

  const { items: productos, isEmpty } = useSafeData<Producto>(productosData);

  // Handlers
  const handleOpenProduct = useCallback((producto: Producto) => {
    setSelectedProduct(producto);
    setIsProductModalOpen(true);
  }, []);

  const handleCloseProductModal = useCallback(() => {
    setIsProductModalOpen(false);
    setTimeout(() => setSelectedProduct(null), 300);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <StoreLocationGuard>
        {/* Navbar */}
        <Navbar />

        {/* Hero Section */}
        <HeroSection />

        {/* Featured Products Section */}
        <section className="section-padding" id="productos">
          <div className="container-wide">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
              <div>
                <span className="label block mb-2">Catálogo Destacado</span>
                <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl">
                  Productos Favoritos
                </h2>
              </div>

              <div>
                <Link
                  href="/catalogo"
                  className="group inline-flex items-center gap-2 text-sm font-medium hover:text-muted-foreground transition-colors"
                >
                  Ver todo el catálogo
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="py-20">
                <ErrorDisplay
                  error={error as Error}
                  message="No se pudieron cargar los productos."
                  onRetry={() => refetch()}
                />
              </div>
            ) : isEmpty ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-serif text-xl mb-2">
                  No hay productos disponibles
                </h3>
                <p className="text-muted-foreground mb-6">
                  Vuelve pronto para descubrir nuestras novedades.
                </p>
                <Button onClick={() => refetch()} variant="outline">
                  Intentar de nuevo
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {productos.slice(0, 8).map((producto, index) => (
                  <ProductCard
                    key={producto.id}
                    producto={producto}
                    index={index}
                    onQuickView={handleOpenProduct}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        {/* <FeaturesSection /> */}

        <Carousel />

        {/* Collection Banner */}
        <section className="section-padding-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-secondary/30" />
          <div className="container-wide relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Image */}
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-muted">
                <img src="/images/hero-3.jpg" alt="Verano2026" className="w-full h-full object-cover" />
                {/* <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Package className="w-24 h-24 text-muted-foreground/30" />
                </div> */}
              </div>

              {/* Content */}
              <div className="lg:pl-8">
                <span className="label block mb-4">Nuevo Catálogo</span>
                <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl mb-6">
                  Verano 2026
                </h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-md">
                  Descubre nuestro nuevo catálogo de camisetas diseñadas para
                  el verano. Colores vibrantes, materiales ligeros y diseños que
                  destacan.
                </p>
                <Link href="/catalogo">
                  <Button
                    size="lg"
                    className="rounded-full px-8 h-14 text-base font-medium btn-shine"
                  >
                    Explorar Catálogo
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <NewsletterSection />

        {/* Footer */}
        <Footer />

        {/* Product Quick View Modal */}
        <ProductQuickView
          producto={selectedProduct}
          isOpen={isProductModalOpen}
          onClose={handleCloseProductModal}
        />
      </StoreLocationGuard>
    </div>
  );
}
