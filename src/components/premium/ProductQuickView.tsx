"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Minus,
  Plus,
  ShoppingBag,
  AlertCircle,
  X,
  Truck,
  Shield,
  Heart,
  Share2,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Producto, ProductoVariante } from "@/lib/types";
import { useCartStore } from "@/lib/stores/cart";
import { toast } from "sonner";

/* ============================================
   TYPES
   ============================================ */
interface ProductQuickViewProps {
  producto: Producto | null;
  isOpen: boolean;
  onClose: () => void;
}

/* ============================================
   ANIMATION VARIANTS
   ============================================ */
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const contentVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2 },
  },
};

const slideInRight = {
  hidden: { x: 20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
  },
};

/* ============================================
   MAIN COMPONENT
   ============================================ */
export function ProductQuickView({
  producto,
  isOpen,
  onClose,
}: ProductQuickViewProps) {
  // Local state
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedTalla, setSelectedTalla] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Store
  const addItem = useCartStore((state) => state.addItem);
  const mountedRef = useRef(true);
  const addTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (addTimeoutRef.current) {
        clearTimeout(addTimeoutRef.current);
        addTimeoutRef.current = null;
      }
    };
  }, []);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen && producto) {
      setSelectedColor(null);
      setSelectedTalla(null);
      setQuantity(1);
      setActiveImageIndex(0);
      setIsAdding(false);
    }
  }, [isOpen, producto]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Derived data
  const variantes = producto?.variantes || [];

  // Usar todas las imágenes del array del backend
  const imagenes = useMemo(() => {
    if (producto?.imagenes && producto.imagenes.length > 0) {
      return producto.imagenes;
    }
    if (producto?.imagenPrincipal) {
      return [producto.imagenPrincipal];
    }
    return [null];
  }, [producto]);

  // Group variants
  const { colores, tallas, variantesMap } = useMemo(() => {
    const coloresMap = new Map<
      string,
      { nombre: string; hex: string; imagen?: string }
    >();
    const tallasSet = new Set<string>();
    const vMap = new Map<string, ProductoVariante>();

    variantes.forEach((v) => {
      coloresMap.set(v.color, {
        nombre: v.color,
        hex: v.colorHex || "#ccc",
        imagen: v.imagenColor,
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

  // Availability helpers
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

  // Buscar índice de imagen que corresponde a un color
  const findImageIndexForColor = useCallback((color: string): number => {
    if (!imagenes.length) return 0;
    const colorNormalized = color.toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');
    const idx = imagenes.findIndex(img =>
      img && img.toLowerCase().includes(colorNormalized)
    );
    return idx >= 0 ? idx : 0;
  }, [imagenes]);

  // Handlers
  const handleColorSelect = (color: string) => {
    setDirection(color === selectedColor ? 0 : 1);
    setSelectedColor(color);

    // Cambiar imagen al color seleccionado
    const imgIndex = findImageIndexForColor(color);
    if (imgIndex !== activeImageIndex) {
      setDirection(imgIndex > activeImageIndex ? 1 : -1);
      setActiveImageIndex(imgIndex);
    }

    // Auto-select first available size if none selected
    if (!selectedTalla) {
      const firstTalla = variantes
        .filter((v) => v.color === color && v.stockDisponible > 0)
        .sort((a, b) => a.talla.localeCompare(b.talla))[0];
      if (firstTalla) setSelectedTalla(firstTalla.talla);
    } else {
      // Check if current size is available with this color
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

    // Auto-select first available color if none selected
    if (!selectedColor) {
      const firstColor = variantes
        .filter((v) => v.talla === talla && v.stockDisponible > 0)[0];
      if (firstColor) {
        setSelectedColor(firstColor.color);
        // Cambiar imagen al primer color disponible
        const imgIndex = findImageIndexForColor(firstColor.color);
        if (imgIndex !== activeImageIndex) {
          setDirection(imgIndex > activeImageIndex ? 1 : -1);
          setActiveImageIndex(imgIndex);
        }
      }
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant || !producto) return;

    setIsAdding(true);

    // Simulate API delay for better UX - cleanup with ref
    await new Promise<void>((resolve) => {
      addTimeoutRef.current = setTimeout(() => {
        addTimeoutRef.current = null;
        resolve();
      }, 600);
    });

    if (!mountedRef.current) return;

    addItem(producto, selectedVariant, quantity);

    if (mountedRef.current) {
      toast.success("Agregado al carrito", {
        description: `${producto.nombre} — ${quantity} × ${selectedVariant.talla} · ${selectedVariant.color}`,
        action: {
          label: "Ver carrito",
          onClick: () => {
            // Could open cart drawer
          },
        },
      });

      setIsAdding(false);
      onClose();
    }
  };

  // Calculated values
  const stockDisponible = selectedVariant?.stockDisponible || 0;
  const maxQuantity = Math.min(stockDisponible, 10);
  const canAdd = selectedVariant && stockDisponible > 0 && quantity > 0;

  const displayPrice = selectedVariant?.precio || producto?.precioBase || 0;
  const hasDiscount =
    producto?.precioOferta &&
    Number(producto.precioOferta) < Number(displayPrice);

  if (!producto) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="!max-w-none sm:!max-w-none w-full sm:w-[95vw] lg:max-w-5xl p-0 overflow-hidden bg-background border-0 shadow-2xl rounded-none sm:rounded-xl">
        <DialogTitle className="sr-only">{producto.nombre}</DialogTitle>

        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[auto] lg:min-h-[600px]">
          {/* Left: Image Gallery */}
          <div className="relative bg-secondary/50 lg:bg-muted overflow-hidden">
            {/* Main Image with Animation */}
            <div className="relative aspect-square lg:aspect-auto lg:h-full min-h-[300px] sm:min-h-[400px]">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={activeImageIndex}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="absolute inset-0"
                >
                  {imagenes[activeImageIndex] ? (
                    <img
                      src={imagenes[activeImageIndex]!}
                      alt={producto.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="h-24 w-24 text-muted-foreground/30" />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {hasDiscount && (
                  <Badge className="bg-accent text-accent-foreground font-medium px-3 py-1">
                    -{Math.round((1 - Number(producto.precioOferta) / Number(displayPrice)) * 100)}%
                  </Badge>
                )}
                {selectedVariant && stockDisponible <= 3 && stockDisponible > 0 && (
                  <Badge
                    variant="secondary"
                    className="bg-amber-500 text-white font-medium"
                  >
                    ¡Últimas {stockDisponible}!
                  </Badge>
                )}
              </div>

              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                    "bg-background/80 backdrop-blur-sm hover:bg-background shadow-sm",
                    isWishlisted && "text-red-500"
                  )}
                  aria-label={isWishlisted ? "Quitar de favoritos" : "Añadir a favoritos"}
                >
                  <Heart
                    className={cn(
                      "w-5 h-5 transition-all duration-300",
                      isWishlisted && "fill-current scale-110"
                    )}
                  />
                </button>
                <button
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-background/80 backdrop-blur-sm hover:bg-background shadow-sm transition-colors"
                  aria-label="Compartir"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Thumbnail Navigation */}
            {imagenes.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {imagenes.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setDirection(idx > activeImageIndex ? 1 : -1);
                      setActiveImageIndex(idx);
                    }}
                    className={cn(
                      "w-14 h-14 rounded-lg overflow-hidden border-2 transition-all duration-200",
                      activeImageIndex === idx
                        ? "border-foreground scale-105"
                        : "border-transparent opacity-70 hover:opacity-100"
                    )}
                  >
                    {img ? (
                      <img
                        src={img}
                        alt={`${producto.nombre} ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={contentVariants}
            className="flex flex-col h-auto lg:h-full lg:max-h-[90vh] bg-background"
          >
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-8 scrollbar-hide">
              {/* Header */}
              <div className="mb-6">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                  <span>{producto.categoria}</span>
                  <ChevronRight className="w-4 h-4" />
                  <span>{producto.subcategoria}</span>
                </nav>

                {/* Title */}
                <h1 className="font-serif text-2xl lg:text-3xl font-medium mb-3 leading-tight">
                  {producto.nombre}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={cn(
                          "w-4 h-4",
                          i < 4 ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
                        )}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">(4.8) · 128 reseñas</span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl lg:text-4xl font-semibold price">
                    ${Number(displayPrice).toFixed(2)}
                  </span>
                  {hasDiscount && producto.precioOferta && (
                    <span className="text-lg text-muted-foreground line-through">
                      ${Number(producto.precioOferta).toFixed(2)}
                    </span>
                  )}
                </div>

                {/* SKU */}
                <p className="text-xs text-muted-foreground mt-2">
                  SKU: {producto.codigo || "N/A"}
                </p>
              </div>

              <Separator className="my-6" />

              {/* Description */}
              <div className="mb-6">
                <p className="text-foreground-secondary leading-relaxed text-sm lg:text-base">
                  {producto.descripcion ||
                    "Camiseta de alta calidad con diseño exclusivo. Perfecta para cualquier ocasión, combina estilo y confort en una sola prenda."}
                </p>
              </div>

              {/* Color Selector */}
              {colores.length > 0 && (
                <motion.div variants={slideInRight} className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium">
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
                            "group relative w-10 h-10 lg:w-12 lg:h-12 rounded-full transition-all duration-300",
                            isSelected
                              ? "ring-2 ring-offset-2 ring-foreground scale-110"
                              : "hover:scale-105",
                            !disponible && "opacity-40 cursor-not-allowed grayscale"
                          )}
                          style={{ backgroundColor: color.hex }}
                          title={color.nombre}
                        >
                          {/* Selection indicator */}
                          {isSelected && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Check
                                className={cn(
                                  "w-5 h-5 drop-shadow-md",
                                  isLightColor(color.hex) ? "text-black" : "text-white"
                                )}
                              />
                            </div>
                          )}

                          {/* Sold out indicator */}
                          {!disponible && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-6 h-0.5 bg-destructive rotate-45 rounded-full" />
                            </div>
                          )}

                          {/* Tooltip */}
                          <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            {color.nombre}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Size Selector */}
              {tallas.length > 0 && (
                <motion.div variants={slideInRight} className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium">
                      Talla
                      {selectedTalla && (
                        <span className="text-muted-foreground font-normal ml-2">
                          — {selectedTalla}
                        </span>
                      )}
                    </h3>
                    <button className="text-sm text-foreground underline-offset-4 hover:underline transition-all">
                      Guía de tallas
                    </button>
                  </div>

                  <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-5 gap-2">
                    {tallas.map((talla) => {
                      const isSelected = selectedTalla === talla;
                      const disponible = isTallaAvailable(talla);

                      return (
                        <button
                          key={talla}
                          onClick={() => disponible && handleTallaSelect(talla)}
                          disabled={!disponible}
                          className={cn(
                            "relative h-11 lg:h-12 rounded-lg border font-medium text-sm transition-all duration-300",
                            isSelected
                              ? "border-foreground bg-foreground text-background shadow-lg"
                              : "border-border bg-background hover:border-foreground/50 hover:bg-secondary/50",
                            !disponible &&
                              "opacity-40 cursor-not-allowed border-muted bg-muted hover:bg-muted"
                          )}
                        >
                          <span>{talla}</span>

                          {/* Sold out line */}
                          {!disponible && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-full h-px bg-destructive/60 rotate-12" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Low stock warning */}
                  <AnimatePresence>
                    {selectedVariant && stockDisponible <= 3 && stockDisponible > 0 && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-xs text-amber-600 mt-2 flex items-center gap-1.5"
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        Solo quedan {stockDisponible} unidades en esta talla
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* Quantity Selector */}
              <motion.div variants={slideInRight} className="mb-6">
                <h3 className="text-sm font-medium mb-3">Cantidad</h3>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-input rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="w-12 h-12 flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-50"
                      aria-label="Disminuir cantidad"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <span className="w-14 text-center font-semibold text-lg">
                      {quantity}
                    </span>

                    <button
                      onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                      disabled={!selectedVariant || quantity >= maxQuantity}
                      className="w-12 h-12 flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-50"
                      aria-label="Aumentar cantidad"
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
              </motion.div>

              {/* Trust Badges */}
              {/* <motion.div
                variants={slideInRight}
                className="flex flex-wrap gap-4 py-4 border-t border-border/50"
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Truck className="w-4 h-4" />
                  <span>Envío gratis +$50</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  <span>Garantía 30 días</span>
                </div>
              </motion.div> */}
            </div>

            {/* Fixed Footer */}
            <div className="border-t border-border bg-background p-4 lg:p-6 space-y-4">
              {/* Stock Status */}
              <AnimatePresence mode="wait">
                {!selectedVariant ? (
                  <motion.div
                    key="select"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-xl"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Selecciona color y talla para continuar</span>
                  </motion.div>
                ) : stockDisponible === 0 ? (
                  <motion.div
                    key="out-of-stock"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-xl"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Agotado en esta combinación</span>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {/* Add to Cart Button */}
              <Button
                size="lg"
                className={cn(
                  "w-full h-14 text-base font-semibold rounded-xl transition-all duration-300",
                  "shadow-lg hover:shadow-xl hover:-translate-y-0.5",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0",
                  canAdd && "btn-shine"
                )}
                disabled={!canAdd || isAdding}
                onClick={handleAddToCart}
              >
                {isAdding ? (
                  <span className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Agregando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" />
                    {selectedVariant
                      ? `Agregar — $${(Number(displayPrice) * quantity).toFixed(2)}`
                      : "Selecciona opciones"}
                  </span>
                )}
              </Button>

              {/* Additional Info */}
              {/* <p className="text-xs text-center text-muted-foreground">
                Envío en 24-48h · Devoluciones gratuitas en 30 días
              </p> */}
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ============================================
   UTILITY FUNCTIONS
   ============================================ */
function isLightColor(hexColor: string): boolean {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
}
