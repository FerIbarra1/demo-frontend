"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Check,
  Minus,
  Plus,
  ShoppingBag,
  AlertCircle,
  Truck,
  Shield,
  Heart,
  Share2,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Star,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Producto, ProductoVariante } from "@/lib/types";
import { useCartStore } from "@/lib/stores/cart";
import { useAuthStore } from "@/lib/stores/auth";
import { toast } from "sonner";
import {
  Navbar,
  Footer,
  ProductCard,
} from "@/components/premium";
import { ErrorDisplay, useSafeData } from "@/components/common/ErrorBoundary";
import { useProducto, useCatalogo } from "@/lib/hooks";

/* ============================================
   PRODUCT DETAIL PAGE
   ============================================ */

export default function ProductoDetallePage() {
  const params = useParams();
  const productoId = Number(params.id);
  const { selectedTiendaId } = useAuthStore();
  const tiendaId = selectedTiendaId || 1;

  // Fetch product
  const {
    data: producto,
    isLoading,
    error,
  } = useProducto(tiendaId, productoId);

  // Fetch related products
  const { data: catalogoData } = useCatalogo({ tiendaId });
  const { items: productosRelacionados } = useSafeData<Producto>(catalogoData);

  const productosFiltrados = productosRelacionados
    .filter((p) => p.id !== productoId)
    .slice(0, 4);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]">
        <Navbar />
        <main className="pt-20">
          <ProductoDetalleSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]">
        <Navbar />
        <main className="pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <ErrorDisplay
              error={error as Error}
              message="No se pudo cargar el producto."
            />
            <div className="mt-8 text-center">
              <Link href="/catalogo">
                <Button className="rounded-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver al catálogo
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navbar />
      <main className="pt-20">
        <ProductoDetalleContent
          producto={producto}
          productosRelacionados={productosFiltrados}
        />
      </main>
      <Footer />
    </div>
  );
}

/* ============================================
   PRODUCT DETAIL CONTENT
   ============================================ */

function ProductoDetalleContent({
  producto,
  productosRelacionados,
}: {
  producto: Producto;
  productosRelacionados: Producto[];
}) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedTalla, setSelectedTalla] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  // Reset when product changes
  useEffect(() => {
    setSelectedColor(null);
    setSelectedTalla(null);
    setQuantity(1);
    setActiveImageIndex(0);
  }, [producto.id]);

  const variantes = producto.variantes || [];

  // All images
  const imagenes = useMemo(() => {
    if (producto.imagenes && producto.imagenes.length > 0) {
      return producto.imagenes;
    }
    if (producto.imagenPrincipal) {
      return [producto.imagenPrincipal];
    }
    return [];
  }, [producto]);

  // Group variants
  const { colores, tallas, variantesMap } = useMemo(() => {
    const coloresMap = new Map<
      string,
      { nombre: string; hex: string }
    >();
    const tallasSet = new Set<string>();
    const vMap = new Map<string, ProductoVariante>();

    variantes.forEach((v) => {
      coloresMap.set(v.color, {
        nombre: v.color,
        hex: v.colorHex || "#ccc",
      });
      tallasSet.add(v.talla);
      vMap.set(`${v.color}-${v.talla}`, v);
    });

    return {
      colores: Array.from(coloresMap.values()),
      tallas: Array.from(tallasSet).sort((a, b) => {
        const numA = parseFloat(a);
        const numB = parseFloat(b);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        return a.localeCompare(b);
      }),
      variantesMap: vMap,
    };
  }, [variantes]);

  // Selected variant
  const selectedVariant = useMemo(() => {
    if (!selectedColor || !selectedTalla) return null;
    return variantesMap.get(`${selectedColor}-${selectedTalla}`) || null;
  }, [selectedColor, selectedTalla, variantesMap]);

  // Availability
  const isTallaAvailable = useCallback(
    (talla: string) => {
      if (!selectedColor) return true;
      const variante = variantesMap.get(`${selectedColor}-${talla}`);
      return variante ? variante.stockDisponible > 0 : false;
    },
    [selectedColor, variantesMap]
  );

  const isColorAvailable = useCallback(
    (color: string) => {
      if (!selectedTalla) return true;
      const variante = variantesMap.get(`${color}-${selectedTalla}`);
      return variante ? variante.stockDisponible > 0 : false;
    },
    [selectedTalla, variantesMap]
  );

  // Find image index for color
  const findImageIndexForColor = useCallback(
    (color: string): number => {
      if (!imagenes.length) return 0;
      const colorNormalized = color
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "");
      const idx = imagenes.findIndex(
        (img) => img && img.toLowerCase().includes(colorNormalized)
      );
      return idx >= 0 ? idx : 0;
    },
    [imagenes]
  );

  // Handlers
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    const imgIndex = findImageIndexForColor(color);
    setActiveImageIndex(imgIndex);

    if (!selectedTalla) {
      const firstTalla = variantes
        .filter((v) => v.color === color && v.stockDisponible > 0)
        .sort((a, b) => a.talla.localeCompare(b.talla))[0];
      if (firstTalla) setSelectedTalla(firstTalla.talla);
    } else {
      const variante = variantesMap.get(`${color}-${selectedTalla}`);
      if (!variante || variante.stockDisponible <= 0) {
        const availableTalla = variantes
          .filter((v) => v.color === color && v.stockDisponible > 0)
          .sort((a, b) => a.talla.localeCompare(b.talla))[0];
        setSelectedTalla(availableTalla?.talla || null);
      }
    }
  };

  const handleTallaSelect = (talla: string) => {
    setSelectedTalla(talla);
    if (!selectedColor) {
      const firstColor = variantes.filter(
        (v) => v.talla === talla && v.stockDisponible > 0
      )[0];
      if (firstColor) {
        setSelectedColor(firstColor.color);
        const imgIndex = findImageIndexForColor(firstColor.color);
        setActiveImageIndex(imgIndex);
      }
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    setIsAdding(true);
    await new Promise<void>((resolve) => setTimeout(resolve, 400));
    addItem(producto, selectedVariant, quantity);
    toast.success("Agregado al carrito", {
      description: `${producto.nombre} — ${quantity} × ${selectedVariant.talla} · ${selectedVariant.color}`,
    });
    setIsAdding(false);
  };

  // Calculated values
  const stockDisponible = selectedVariant?.stockDisponible || 0;
  const maxQuantity = Math.min(stockDisponible, 10);
  const canAdd = selectedVariant && stockDisponible > 0 && quantity > 0;
  const displayPrice = selectedVariant?.precio || producto.precioBase || 0;
  const hasDiscount =
    producto.precioOferta && Number(producto.precioOferta) < Number(displayPrice);
  const discountPercentage = hasDiscount
    ? Math.round(
        (1 - Number(producto.precioOferta) / Number(displayPrice)) * 100
      )
    : 0;

  const imagenActiva = imagenes[activeImageIndex] || producto.imagenPrincipal;

  return (
    <div className="bg-[#FDFBF7]">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Inicio
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/catalogo" className="hover:text-foreground transition-colors">
            Catálogo
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground truncate max-w-[200px]">
            {producto.nombre}
          </span>
        </nav>
      </div>

      {/* Product Detail */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="sticky top-24 space-y-4">
              {/* Main Image */}
              <div
                className="relative aspect-square rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 cursor-zoom-in"
                onClick={() => setIsZoomed(!isZoomed)}
              >
                {imagenActiva ? (
                  <img
                    src={imagenActiva}
                    alt={producto.nombre}
                    className={cn(
                      "w-full h-full object-cover transition-transform duration-500",
                      isZoomed ? "scale-150" : "scale-100"
                    )}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-24 w-24 text-stone-300" />
                  </div>
                )}

                {/* Navigation arrows */}
                {imagenes.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((i) =>
                          i === 0 ? imagenes.length - 1 : i - 1
                        );
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white shadow-sm transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((i) =>
                          i === imagenes.length - 1 ? 0 : i + 1
                        );
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white shadow-sm transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {hasDiscount && (
                    <Badge className="bg-red-500 text-white font-medium px-3 py-1">
                      -{discountPercentage}%
                    </Badge>
                  )}
                  {producto.esNuevo && (
                    <Badge className="bg-foreground text-background font-medium">
                      Nuevo
                    </Badge>
                  )}
                </div>

                {/* Image counter */}
                {imagenes.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium">
                    {activeImageIndex + 1} / {imagenes.length}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {imagenes.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {imagenes.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={cn(
                        "w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all",
                        activeImageIndex === idx
                          ? "border-foreground ring-2 ring-foreground/20"
                          : "border-stone-200 hover:border-stone-300 opacity-70 hover:opacity-100"
                      )}
                    >
                      {img ? (
                        <img
                          src={img}
                          alt={`${producto.nombre} ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-stone-100 flex items-center justify-center">
                          <Package className="w-5 h-5 text-stone-400" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Right: Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col"
          >
            {/* Category */}
            <div className="mb-2">
              <Link
                href={`/catalogo?categoria=${encodeURIComponent(producto.categoria || "")}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider"
              >
                {producto.categoria}
                {producto.subcategoria && ` / ${producto.subcategoria}`}
              </Link>
            </div>

            {/* Title */}
            <h1 className="font-serif text-3xl md:text-4xl font-medium mb-4 leading-tight">
              {producto.nombre}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-4 h-4",
                      i < 4
                        ? "text-amber-400 fill-amber-400"
                        : "text-stone-300"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                4.8 · 128 reseñas
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-3xl font-semibold">
                ${Number(displayPrice).toFixed(2)}
              </span>
              {hasDiscount && producto.precioOferta && (
                <span className="text-xl text-muted-foreground line-through">
                  ${Number(producto.precioOferta).toFixed(2)}
                </span>
              )}
            </div>

            {/* SKU */}
            <p className="text-xs text-muted-foreground mb-6">
              SKU: {producto.codigo}
            </p>

            <Separator className="my-6" />

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed mb-8">
              {producto.descripcion ||
                "Camiseta de alta calidad con diseño exclusivo. Perfecta para cualquier ocasión, combina estilo y confort en una sola prenda."}
            </p>

            {/* Color Selector */}
            {colores.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">
                    Color
                    {selectedColor && (
                      <span className="text-muted-foreground font-normal ml-2">
                        — {selectedColor}
                      </span>
                    )}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {colores.map((color) => {
                    const isSelected = selectedColor === color.nombre;
                    const disponible = isColorAvailable(color.nombre);

                    return (
                      <button
                        key={color.nombre}
                        onClick={() => disponible && handleColorSelect(color.nombre)}
                        disabled={!disponible}
                        className={cn(
                          "group relative w-12 h-12 rounded-full border-2 transition-all duration-200",
                          isSelected
                            ? "border-foreground ring-2 ring-offset-2 ring-stone-300"
                            : "border-transparent hover:scale-110",
                          !disponible && "opacity-40 cursor-not-allowed grayscale"
                        )}
                        style={{ backgroundColor: color.hex }}
                        title={color.nombre}
                      >
                        {isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Check
                              className={cn(
                                "w-5 h-5 drop-shadow-md",
                                isLightColor(color.hex)
                                  ? "text-black"
                                  : "text-white"
                              )}
                            />
                          </div>
                        )}
                        {!disponible && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-6 h-0.5 bg-destructive rotate-45 rounded-full" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {tallas.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">
                    Talla
                    {selectedTalla && (
                      <span className="text-muted-foreground font-normal ml-2">
                        — {selectedTalla}
                      </span>
                    )}
                  </h3>
                  <button className="text-sm text-foreground underline-offset-4 hover:underline">
                    Guía de tallas
                  </button>
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                  {tallas.map((talla) => {
                    const isSelected = selectedTalla === talla;
                    const disponible = isTallaAvailable(talla);

                    return (
                      <button
                        key={talla}
                        onClick={() => disponible && handleTallaSelect(talla)}
                        disabled={!disponible}
                        className={cn(
                          "relative h-12 rounded-xl border-2 font-medium text-sm transition-all duration-200",
                          isSelected
                            ? "border-foreground bg-foreground text-background shadow-lg"
                            : "border-stone-200 bg-white hover:border-stone-400 hover:bg-stone-50",
                          !disponible &&
                            "opacity-40 cursor-not-allowed border-stone-100 bg-stone-50"
                        )}
                      >
                        <span>{talla}</span>
                        {!disponible && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-full h-px bg-destructive/60 rotate-12" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                {selectedVariant && stockDisponible <= 3 && stockDisponible > 0 && (
                  <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Solo quedan {stockDisponible} unidades
                  </p>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className="mb-8">
              <h3 className="font-medium mb-3">Cantidad</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-12 h-12 flex items-center justify-center hover:bg-stone-50 transition-colors disabled:opacity-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-14 text-center font-semibold text-lg">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity((q) => Math.min(maxQuantity, q + 1))
                    }
                    disabled={!selectedVariant || quantity >= maxQuantity}
                    className="w-12 h-12 flex items-center justify-center hover:bg-stone-50 transition-colors disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {/* {selectedVariant && (
                  <span className="text-sm text-muted-foreground">
                    {stockDisponible} disponibles
                  </span>
                )} */}
              </div>
            </div>

            <Separator className="my-2" />

            {/* Stock Status */}
            {!selectedVariant ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-stone-100 p-4 rounded-xl mb-4">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Selecciona color y talla para continuar</span>
              </div>
            ) : stockDisponible === 0 ? (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-4 rounded-xl mb-4">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Agotado en esta combinación</span>
              </div>
            ) : null}

            {/* Action Buttons */}
            <div className="flex gap-3 mb-8">
              <Button
                size="lg"
                className={cn(
                  "flex-1 h-14 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all",
                  canAdd && "btn-shine"
                )}
                disabled={!canAdd || isAdding}
                onClick={handleAddToCart}
              >
                {isAdding ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Agregando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" />
                    {selectedVariant
                      ? `Agregar al carrito`
                      : "Selecciona opciones"}
                  </span>
                )}
              </Button>
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={cn(
                  "w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-all",
                  isWishlisted
                    ? "border-red-200 bg-red-50 text-red-500"
                    : "border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                )}
              >
                <Heart
                  className={cn(
                    "w-6 h-6 transition-all",
                    isWishlisted && "fill-current scale-110"
                  )}
                />
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Enlace copiado");
                }}
                className="w-14 h-14 rounded-xl border-2 border-stone-200 flex items-center justify-center hover:border-stone-300 hover:bg-stone-50 transition-all"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Price with quantity */}
            {selectedVariant && (
              <div className="flex items-center justify-between bg-stone-100 p-4 rounded-xl mb-8">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-xl font-semibold">
                  ${(Number(displayPrice) * quantity).toFixed(2)}
                </span>
              </div>
            )}

            {/* Trust badges */}
            {/* <div className="grid grid-cols-2 gap-3 mb-8">
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-stone-200">
                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-stone-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Envío gratis</p>
                  <p className="text-xs text-muted-foreground">
                    En pedidos +$50
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-stone-200">
                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-stone-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Garantía 30 días</p>
                  <p className="text-xs text-muted-foreground">
                    Devoluciones gratuitas
                  </p>
                </div>
              </div>
            </div> */}

            {/* Product Details */}
            {/* <div className="space-y-4">
              <h3 className="font-medium">Detalles del producto</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white p-3 rounded-xl border border-stone-200">
                  <p className="text-muted-foreground">Categoría</p>
                  <p className="font-medium">{producto.categoria}</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-stone-200">
                  <p className="text-muted-foreground">Subcategoría</p>
                  <p className="font-medium">{producto.subcategoria}</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-stone-200">
                  <p className="text-muted-foreground">Código</p>
                  <p className="font-medium">{producto.codigo}</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-stone-200">
                  <p className="text-muted-foreground">Colores</p>
                  <p className="font-medium">{colores.length} disponibles</p>
                </div>
              </div>
            </div> */}
          </motion.div>
        </div>
      </div>

      {/* Related Products */}
      {productosRelacionados.length > 0 && (
        <section className="border-t border-stone-200 bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-sm text-muted-foreground uppercase tracking-wider mb-2 block">
                  También te puede gustar
                </span>
                <h2 className="font-serif text-2xl md:text-3xl font-medium">
                  Productos relacionados
                </h2>
              </div>
              <Link
                href="/catalogo"
                className="group inline-flex items-center gap-2 text-sm font-medium hover:text-muted-foreground transition-colors"
              >
                Ver todo
                <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {productosRelacionados.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <ProductCard producto={p} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

/* ============================================
   SKELETON LOADER
   ============================================ */
function ProductoDetalleSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image skeleton */}
        <div className="space-y-4">
          <div className="aspect-square bg-stone-200 rounded-2xl animate-pulse" />
          <div className="flex gap-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="w-20 h-20 bg-stone-200 rounded-xl animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Info skeleton */}
        <div className="space-y-6">
          <div className="h-4 w-32 bg-stone-200 rounded animate-pulse" />
          <div className="h-10 w-3/4 bg-stone-200 rounded animate-pulse" />
          <div className="h-6 w-40 bg-stone-200 rounded animate-pulse" />
          <div className="h-4 w-full bg-stone-200 rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-stone-200 rounded animate-pulse" />
          <div className="h-4 w-4/6 bg-stone-200 rounded animate-pulse" />
          <div className="h-12 w-full bg-stone-200 rounded-xl animate-pulse mt-8" />
        </div>
      </div>
    </div>
  );
}

/* ============================================
   UTILITIES
   ============================================ */
function isLightColor(hexColor: string): boolean {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
}
