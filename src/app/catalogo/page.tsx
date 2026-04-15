'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  X,
  SlidersHorizontal,
  Grid3X3,
  LayoutGrid,
  Heart,
  ShoppingBag,
  ChevronDown,
  Star,
  Sparkles,
  ArrowRight,
  Package
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { SkeletonCard } from '@/components/common/SkeletonGrid';
import { ErrorDisplay, useSafeData, normalizeProducto } from '@/components/common/ErrorBoundary';
import { useTiendas, useBuscarProductos, useCatalogo } from '@/lib/hooks';
import { useAuthStore } from '@/lib/stores/auth';
import { Producto } from '@/lib/types';
import { ProductQuickView } from '@/components/product/ProductQuickView';
import { StoreLocationModal, Navbar, Footer } from '@/components/premium';

// Categorías basadas en datos reales
const categorias = [
  { id: 'all', nombre: 'Todas', count: 156 },
  { id: 'camisetas', nombre: 'Camisetas', count: 68 },
  { id: 'polos', nombre: 'Polos', count: 34 },
  { id: 'camisas', nombre: 'Camisas', count: 28 },
  { id: 'deportivas', nombre: 'Deportivas', count: 26 }
];

const tallas = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// Componente que usa useSearchParams envuelto en Suspense
function CatalogoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryFromUrl = searchParams.get('q') || '';

  const { selectedTiendaId } = useAuthStore();
  const { data: tiendas, isLoading: isLoadingTiendas } = useTiendas();

  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(queryFromUrl);
  const [viewMode, setViewMode] = useState<'grid' | 'large'>('grid');
  const [selectedCategoria, setSelectedCategoria] = useState('all');
  const [selectedTallas, setSelectedTallas] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [sortBy, setSortBy] = useState('relevancia');
  const [favorites, setFavorites] = useState<number[]>([]);

  // Si hay query en URL, usarlo para buscar
  const tiendaId = selectedTiendaId || (tiendas?.[0]?.id ?? 0);
  const { data: productosData, isLoading, error, refetch } = useBuscarProductos(
    tiendaId,
    queryFromUrl
  );

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/catalogo?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/catalogo');
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedCategoria('all');
    setSelectedTallas([]);
    setPriceRange([0, 100]);
    router.push('/catalogo');
  };

  const toggleFavorite = (id: number) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const toggleTalla = (talla: string) => {
    setSelectedTallas(prev =>
      prev.includes(talla) ? prev.filter(t => t !== talla) : [...prev, talla]
    );
  };

  // Filtrar productos
  const productosFiltrados = productos.filter(producto => {
    const matchesCategoria = selectedCategoria === 'all' ||
      producto.categoria?.toLowerCase() === selectedCategoria.toLowerCase();

    // Para tallas, verificar en las variantes
    const matchesTalla = selectedTallas.length === 0 ||
      producto.variantes?.some(v => selectedTallas.includes(v.talla));

    // Para precio, usar el precio base o el de la primera variante
    const precio = producto.variantes?.[0]?.precio || producto.precioBase || 0;
    const matchesPrice = precio >= priceRange[0] && precio <= priceRange[1];

    return matchesCategoria && matchesTalla && matchesPrice;
  });

  // Ordenar productos
  const productosOrdenados = [...productosFiltrados].sort((a, b) => {
    switch (sortBy) {
      case 'precio-asc': {
        const priceA = a.variantes?.[0]?.precio || a.precioBase || 0;
        const priceB = b.variantes?.[0]?.precio || b.precioBase || 0;
        return priceA - priceB;
      }
      case 'precio-desc': {
        const priceA = a.variantes?.[0]?.precio || a.precioBase || 0;
        const priceB = b.variantes?.[0]?.precio || b.precioBase || 0;
        return priceB - priceA;
      }
      case 'nuevos':
        return (b.esNuevo ? 1 : 0) - (a.esNuevo ? 1 : 0);
      default:
        return 0;
    }
  });

  const tiendaActual = tiendas?.find(t => t.id === selectedTiendaId);

  if (isLoadingTiendas) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]">
        <Navbar />
        <main className="pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="animate-pulse space-y-8">
              <div className="h-12 w-1/3 bg-muted rounded-lg mx-auto" />
              <div className="h-6 w-1/2 bg-muted rounded-lg mx-auto" />
              <div className="h-14 w-full max-w-2xl bg-muted rounded-full mx-auto" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-12">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="rounded-2xl bg-muted aspect-[3/4]" />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navbar />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-[#FDFBF7]" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-stone-200/50 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-stone-300/30 rounded-full blur-3xl" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-100 text-sm mb-6">
                <Sparkles className="w-4 h-4" />
                <span>Nueva colección disponible</span>
              </div>

              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-6 text-balance text-foreground">
                Nuestra Colección
              </h1>
              <p className="text-lg text-muted-foreground mb-10 text-pretty max-w-2xl mx-auto">
                Explora nuestra selección de camisetas premium, diseñadas con materiales
                de la más alta calidad para tu comodidad diaria.
                {tiendaActual && ` Disponibles en ${tiendaActual.nombre}.`}
              </p>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar productos, categorías..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-14 pr-14 h-14 text-base bg-white border-stone-200 rounded-full shadow-sm focus:shadow-md transition-shadow"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-5 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-stone-100 transition-colors"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </form>

              {queryFromUrl && (
                <p className="mt-4 text-sm text-muted-foreground">
                  Mostrando resultados para: <span className="font-medium text-foreground">&quot;{queryFromUrl}&quot;</span>
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Store Selector Alert (if no store selected) */}
        {!selectedTiendaId && (
          <section className="border-y border-stone-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-full">
                    <ShoppingBag className="h-5 w-5 text-amber-700" />
                  </div>
                  <div>
                    <p className="font-medium text-amber-800">Selecciona una tienda</p>
                    <p className="text-sm text-amber-600">Para ver precios y disponibilidad específicos</p>
                  </div>
                </div>
                <Button
                  onClick={() => setIsStoreModalOpen(true)}
                  className="rounded-full bg-amber-700 hover:bg-amber-800"
                >
                  Seleccionar tienda
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Categories Pills */}
        <section className="border-y border-stone-200 bg-white/50 sticky top-16 z-30 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 py-4 overflow-x-auto scrollbar-hide">
              {categorias.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoria(cat.id)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                    selectedCategoria === cat.id
                      ? "bg-foreground text-background"
                      : "bg-stone-100 text-muted-foreground hover:bg-stone-200 hover:text-foreground"
                  )}
                >
                  {cat.nombre}
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    selectedCategoria === cat.id
                      ? "bg-background/20"
                      : "bg-white"
                  )}>
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Toolbar */}
        <section className="py-6 border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{productosOrdenados.length}</span> productos encontrados
              </p>

              <div className="flex items-center gap-3">
                {/* Filters Sheet - Mobile */}
                <Sheet>
                  <SheetTrigger className="lg:hidden inline-flex items-center gap-2 px-3 py-2 rounded-full border border-stone-200 bg-white text-sm font-medium hover:bg-stone-50 transition-colors">
                    <SlidersHorizontal className="w-4 h-4" />
                    Filtros
                  </SheetTrigger>
                  <SheetContent side="left" className="w-full sm:max-w-md">
                    <SheetHeader>
                      <SheetTitle className="font-serif text-xl">Filtros</SheetTitle>
                      <SheetDescription className="sr-only">
                        Filtra los productos por talla, precio y más
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-8 space-y-8">
                      {/* Tallas */}
                      <div>
                        <h4 className="font-medium mb-4">Tallas</h4>
                        <div className="flex flex-wrap gap-2">
                          {tallas.map((talla) => (
                            <button
                              key={talla}
                              onClick={() => toggleTalla(talla)}
                              className={cn(
                                "w-12 h-12 rounded-full text-sm font-medium transition-all",
                                selectedTallas.includes(talla)
                                  ? "bg-foreground text-background"
                                  : "bg-stone-100 hover:bg-stone-200"
                              )}
                            >
                              {talla}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Precio */}
                      <div>
                        <h4 className="font-medium mb-4">Rango de precio</h4>
                        <Slider
                          value={priceRange}
                          onValueChange={(value) => setPriceRange(value as number[])}
                          max={100}
                          step={5}
                          className="mb-4"
                        />
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>${priceRange[0]}</span>
                          <span>${priceRange[1]}</span>
                        </div>
                      </div>

                      {/* Otros filtros */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Checkbox id="ofertas" />
                          <Label htmlFor="ofertas" className="text-sm cursor-pointer">
                            Solo ofertas
                          </Label>
                        </div>
                        <div className="flex items-center gap-3">
                          <Checkbox id="nuevos" />
                          <Label htmlFor="nuevos" className="text-sm cursor-pointer">
                            Productos nuevos
                          </Label>
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Sort */}
                <Select value={sortBy} onValueChange={(value) => setSortBy(value || 'relevancia')}>
                  <SelectTrigger className="w-[180px] rounded-full text-sm bg-white border-stone-200">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevancia">Relevancia</SelectItem>
                    <SelectItem value="precio-asc">Precio: Menor a Mayor</SelectItem>
                    <SelectItem value="precio-desc">Precio: Mayor a Menor</SelectItem>
                    <SelectItem value="nuevos">Más Nuevos</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode */}
                <div className="hidden sm:flex items-center border border-stone-200 rounded-full p-1 bg-white">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      "p-2 rounded-full transition-colors",
                      viewMode === 'grid' ? "bg-foreground text-background" : "hover:bg-stone-100"
                    )}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('large')}
                    className={cn(
                      "p-2 rounded-full transition-colors",
                      viewMode === 'large' ? "bg-foreground text-background" : "hover:bg-stone-100"
                    )}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-8">
              {/* Sidebar Filters - Desktop */}
              <aside className="hidden lg:block w-64 flex-shrink-0">
                <div className="sticky top-40 space-y-8">
                  {/* Tallas */}
                  <div>
                    <h4 className="font-medium mb-4 flex items-center justify-between">
                      Tallas
                      <ChevronDown className="w-4 h-4" />
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {tallas.map((talla) => (
                        <button
                          key={talla}
                          onClick={() => toggleTalla(talla)}
                          className={cn(
                            "w-11 h-11 rounded-full text-sm font-medium transition-all",
                            selectedTallas.includes(talla)
                              ? "bg-foreground text-background"
                              : "bg-stone-100 hover:bg-stone-200"
                          )}
                        >
                          {talla}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Precio */}
                  <div>
                    <h4 className="font-medium mb-4 flex items-center justify-between">
                      Precio
                      <ChevronDown className="w-4 h-4" />
                    </h4>
                    <Slider
                      value={priceRange}
                      onValueChange={(value) => setPriceRange(value as number[])}
                      max={100}
                      step={5}
                      className="mb-4"
                    />
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>

                  {/* Otros */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Checkbox id="ofertas-desk" />
                      <Label htmlFor="ofertas-desk" className="text-sm cursor-pointer">
                        Solo ofertas
                      </Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <Checkbox id="nuevos-desk" />
                      <Label htmlFor="nuevos-desk" className="text-sm cursor-pointer">
                        Productos nuevos
                      </Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <Checkbox id="stock" />
                      <Label htmlFor="stock" className="text-sm cursor-pointer">
                        En stock
                      </Label>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full rounded-full"
                    onClick={() => {
                      setSelectedTallas([]);
                      setPriceRange([0, 100]);
                    }}
                  >
                    Limpiar filtros
                  </Button>
                </div>
              </aside>

              {/* Products */}
              <div className="flex-1">
                {isLoading ? (
                  <div className={cn(
                    "grid gap-6",
                    viewMode === 'grid'
                      ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                      : "grid-cols-1 sm:grid-cols-2"
                  )}>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <SkeletonCard key={i} />
                    ))}
                  </div>
                ) : error ? (
                  <ErrorDisplay
                    error={error as Error}
                    message="No se pudieron cargar los productos. Por favor verifica tu conexión."
                    onRetry={() => refetch()}
                  />
                ) : productosOrdenados.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-6">
                      <Search className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-serif text-2xl mb-2">No encontramos productos</h3>
                    <p className="text-muted-foreground mb-6">
                      Intenta con otros filtros o términos de búsqueda
                    </p>
                    <Button
                      variant="outline"
                      className="rounded-full"
                      onClick={clearSearch}
                    >
                      Limpiar todo
                    </Button>
                  </div>
                ) : (
                  <div className={cn(
                    "grid gap-6",
                    viewMode === 'grid'
                      ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                      : "grid-cols-1 sm:grid-cols-2"
                  )}>
                    {productosOrdenados.map((producto) => {
                      const price = producto.variantes?.[0]?.precio || producto.precioBase || 0;
                      const hasDiscount = producto.precioOferta && producto.precioOferta < price;
                      const discountPercentage = hasDiscount
                        ? Math.round((1 - producto.precioOferta! / price) * 100)
                        : 0;

                      return (
                        <article
                          key={producto.id}
                          className="group relative bg-white rounded-2xl overflow-hidden border border-stone-200 hover:border-stone-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
                          onClick={() => handleOpenProduct(producto)}
                        >
                          {/* Image */}
                          <div className={cn(
                            "relative overflow-hidden bg-stone-100",
                            viewMode === 'large' ? "aspect-[4/5]" : "aspect-square"
                          )}>
                            {producto.imagenPrincipal ? (
                              <img
                                src={producto.imagenPrincipal}
                                alt={producto.nombre}
                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-12 w-12 text-stone-300" />
                              </div>
                            )}

                            {/* Badges */}
                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                              {producto.esNuevo && (
                                <span className="px-3 py-1 bg-foreground text-background text-xs font-medium rounded-full">
                                  Nuevo
                                </span>
                              )}
                              {hasDiscount && (
                                <span className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                                  -{discountPercentage}%
                                </span>
                              )}
                            </div>

                            {/* Favorite Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(producto.id);
                              }}
                              className={cn(
                                "absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all",
                                favorites.includes(producto.id)
                                  ? "bg-red-500 text-white"
                                  : "bg-white/90 backdrop-blur-sm text-foreground hover:bg-white"
                              )}
                            >
                              <Heart className={cn(
                                "w-5 h-5",
                                favorites.includes(producto.id) && "fill-current"
                              )} />
                            </button>

                            {/* Quick Add */}
                            <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                              <Button className="w-full rounded-full gap-2 bg-foreground/95 backdrop-blur-sm hover:bg-foreground">
                                <ShoppingBag className="w-4 h-4" />
                                Ver detalles
                              </Button>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-5">
                            {/* Colors */}
                            <div className="flex items-center gap-1.5 mb-3">
                              {Array.from(new Set(producto.variantes?.map(v => v.color) || [])).slice(0, 4).map((color, i) => {
                                const variante = producto.variantes?.find(v => v.color === color);
                                return (
                                  <span
                                    key={i}
                                    className="w-4 h-4 rounded-full border border-stone-200"
                                    style={{ backgroundColor: variante?.colorHex || '#ccc' }}
                                    title={color}
                                  />
                                );
                              })}
                              {new Set(producto.variantes?.map(v => v.color)).size > 4 && (
                                <span className="text-xs text-muted-foreground ml-1">
                                  +{new Set(producto.variantes?.map(v => v.color)).size - 4}
                                </span>
                              )}
                            </div>

                            {/* Title */}
                            <h3 className="font-medium text-foreground hover:text-foreground/80 line-clamp-1 mb-1">
                              {producto.nombre}
                            </h3>

                            {/* Category */}
                            <p className="text-sm text-muted-foreground mb-3">
                              {producto.categoria} &middot; {producto.subcategoria}
                            </p>

                            {/* Rating */}
                            <div className="flex items-center gap-2 mb-3">
                              <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={cn(
                                      "w-3.5 h-3.5",
                                      i < 4
                                        ? "text-amber-400 fill-amber-400"
                                        : "text-stone-300"
                                    )}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                (48)
                              </span>
                            </div>

                            {/* Price */}
                            <div className="flex items-baseline gap-2">
                              <span className="text-lg font-semibold">
                                ${price.toFixed(2)}
                              </span>
                              {hasDiscount && producto.precioOferta && (
                                <span className="text-sm text-muted-foreground line-through">
                                  ${price.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}

                {/* Load More */}
                {productosOrdenados.length > 0 && !isLoading && (
                  <div className="text-center mt-12">
                    <Button variant="outline" size="lg" className="rounded-full gap-2 px-8">
                      Cargar más productos
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Quick View Modal */}
      <ProductQuickView
        producto={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Store Location Modal */}
      <StoreLocationModal
        isOpen={isStoreModalOpen}
        onComplete={() => setIsStoreModalOpen(false)}
      />

      <Footer />
    </div>
  );
}

// Main component with Suspense
export default function CatalogoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FDFBF7]">
        <Navbar />
        <main className="pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="animate-pulse space-y-8">
              <div className="h-12 w-1/3 bg-muted rounded-lg mx-auto" />
              <div className="h-6 w-1/2 bg-muted rounded-lg mx-auto" />
              <div className="h-14 w-full max-w-2xl bg-muted rounded-full mx-auto" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-12">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="rounded-2xl bg-muted aspect-[3/4]" />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    }>
      <CatalogoContent />
    </Suspense>
  );
}
