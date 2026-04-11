"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Search,
  User,
  Package,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SkeletonCard } from "@/components/common/SkeletonGrid";
import { ErrorDisplay, useSafeData } from "@/components/common/ErrorBoundary";
import { useCatalogo } from "@/lib/hooks";
import { useAuthStore } from "@/lib/stores/auth";
import { useCartStore } from "@/lib/stores/cart";
import { Producto } from "@/lib/types";
import { ProductQuickView } from "@/components/product/ProductQuickView";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const {
    data: productosData,
    isLoading,
    error,
    refetch,
  } = useCatalogo({
    tiendaId: 1, // Tienda por defecto para landing
  });

  const { isAuthenticated, user } = useAuthStore();
  const {
    items: cartItems,
    getTotalItems,
    getTotalPrice,
    removeItem,
    updateQuantity,
  } = useCartStore();

  const { items: productos, isEmpty } = useSafeData<Producto>(productosData);

  const filteredProducts = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.categoria.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleOpenProduct = (producto: Producto) => {
    setSelectedProduct(producto);
    setIsProductModalOpen(true);
  };

  const handleCloseProductModal = () => {
    setIsProductModalOpen(false);
    setTimeout(() => setSelectedProduct(null), 200);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorDisplay
            error={error as Error}
            message="No se pudieron cargar los productos."
            onRetry={() => refetch()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Package className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Demo Shop</span>
            </Link>

            {/* Search - Desktop */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <Link href="/tienda">
                  <Button variant="ghost" size="sm">
                    <User className="mr-2 h-4 w-4" />
                    {user?.nombre || "Mi Cuenta"}
                  </Button>
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Iniciar sesión
                    </Button>
                  </Link>
                  <Link href="/registro" className="hidden sm:block">
                    <Button size="sm">Crear cuenta</Button>
                  </Link>
                </div>
              )}

              {/* Cart */}
              <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                <SheetTrigger>
                  <div className="inline-flex items-center justify-center h-12 px-4 rounded-md hover:bg-accent cursor-pointer relative">
                    <ShoppingCart className="h-5 w-5" />
                    {getTotalItems() > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
                        {getTotalItems()}
                      </Badge>
                    )}
                  </div>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Carrito de compras</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4">
                    {cartItems.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        Tu carrito está vacío
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {cartItems.map((item) => (
                          <div
                            key={item.precioCOId}
                            className="flex items-center gap-4 p-3 bg-muted rounded-lg"
                          >
                            <div className="flex-1">
                              <p className="font-medium">
                                {item.producto?.nombre}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {item.variante?.talla} • {item.variante?.color}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() =>
                                  updateQuantity(
                                    item.precioCOId,
                                    item.cantidad - 1,
                                  )
                                }
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center">
                                {item.cantidad}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() =>
                                  updateQuantity(
                                    item.precioCOId,
                                    item.cantidad + 1,
                                  )
                                }
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => removeItem(item.precioCOId)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <div className="border-t pt-4">
                          <div className="flex justify-between text-lg font-bold">
                            <span>Total</span>
                            <span>${Number(getTotalPrice()).toFixed(2)}</span>
                          </div>
                          <Link href="/checkout" className="block mt-4">
                            <Button
                              className="w-full"
                              onClick={() => setIsCartOpen(false)}
                            >
                              {isAuthenticated
                                ? "Proceder al pago"
                                : "Iniciar sesión para comprar"}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-secondary rounded-full blur-3xl opacity-60" />
          <div className="absolute bottom-1/4 -left-1/4 w-[400px] h-[400px] bg-muted rounded-full blur-3xl opacity-40" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Announcement Badge */}
          {/* <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/80 backdrop-blur-sm mb-8 animate-fadeIn">
            <span className="text-sm font-medium">Nueva Colección 2026</span>
            <ArrowRight className="w-4 h-4" />
          </div> */}

          {/* Main Headline */}
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium leading-[0.95] tracking-tight text-balance mb-6">
            Estilo que define
            <br />
            <span className="italic">tu esencia</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty">
            Descubre nuestra colección exclusiva de camisetas premium. Diseños
            únicos, calidad excepcional.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/tienda">
              <Button
                size="lg"
                className="rounded-full px-8 h-12 text-base font-medium"
              >
                Explorar Colección
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/nosotros">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-8 h-12 text-base font-medium"
              >
                Nuestra Historia
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-2 mt-12">
            <div className="flex -space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-200 text-accent" />
              ))}
            </div>
            <span className="text-sm text-muted-foreground ml-2">
              +2,500 clientes satisfechos
            </span>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* <div className="mb-8">
          <h2 className="text-2xl font-bold">Productos destacados</h2>
        </div> */}
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-sm font-medium tracking-widest uppercase text-muted-foreground">
              Colección Destacada
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-medium mt-2">
              Productos Favoritos
            </h2>
          </div>
          <Link
            href="/tienda"
            className="group inline-flex items-center gap-2 text-sm font-medium hover:text-muted-foreground transition-colors"
          >
            Ver todo el catálogo
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {isEmpty ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              No hay productos disponibles
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((producto) => (
              <Card
                key={producto.id}
                className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleOpenProduct(producto)}
              >
                <div className="aspect-square bg-muted relative overflow-hidden">
                  {producto.imagenPrincipal ? (
                    <img
                      src={producto.imagenPrincipal}
                      alt={producto.nombre}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Package className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
                <CardHeader className="p-4">
                  <CardTitle className="text-base">{producto.nombre}</CardTitle>
                  <CardDescription>{producto.categoria}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-primary">
                      ${Number(producto.precioBase).toFixed(2)}
                    </span>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenProduct(producto);
                      }}
                    >
                      Agregar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-muted py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Demo Shop. Todos los derechos reservados.
        </div>
      </footer>

      {/* Product Quick View Modal */}
      <ProductQuickView
        producto={selectedProduct}
        isOpen={isProductModalOpen}
        onClose={handleCloseProductModal}
      />
    </div>
  );
}
