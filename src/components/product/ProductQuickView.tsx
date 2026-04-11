'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Check, Minus, Plus, ShoppingBag, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Producto, ProductoVariante } from '@/lib/types';
import { useCartStore } from '@/lib/stores/cart';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProductQuickViewProps {
  producto: Producto | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductQuickView({ producto, isOpen, onClose }: ProductQuickViewProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedTalla, setSelectedTalla] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  // Reset state when modal opens with new product
  const resetState = useCallback(() => {
    setSelectedColor(null);
    setSelectedTalla(null);
    setQuantity(1);
  }, []);

  // Reset when product changes
  useEffect(() => {
    if (isOpen && producto) {
      resetState();
    }
  }, [isOpen, producto, resetState]);

  // Agrupar variantes por color y talla - siempre ejecutar hooks
  const variantes = producto?.variantes || [];

  const { colores, tallas, variantesMap } = useMemo(() => {
    const coloresMap = new Map<string, { nombre: string; hex: string }>();
    const tallasSet = new Set<string>();
    const vMap = new Map<string, ProductoVariante>();

    variantes.forEach((v) => {
      coloresMap.set(v.color, { nombre: v.color, hex: v.colorHex });
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

  // Obtener variante seleccionada
  const selectedVariant = useMemo(() => {
    if (!selectedColor || !selectedTalla) return null;
    return variantesMap.get(`${selectedColor}-${selectedTalla}`) || null;
  }, [selectedColor, selectedTalla, variantesMap]);

  // Verificar disponibilidad cruzada
  const isTallaAvailable = useCallback(
    (talla: string) => {
      if (!selectedColor) return true;
      const variante = variantesMap.get(`${selectedColor}-${talla}`);
      return variante && variante.stockDisponible > 0;
    },
    [selectedColor, variantesMap]
  );

  const isColorAvailable = useCallback(
    (color: string) => {
      if (!selectedTalla) return true;
      const variante = variantesMap.get(`${color}-${selectedTalla}`);
      return variante && variante.stockDisponible > 0;
    },
    [selectedTalla, variantesMap]
  );

  // Handlers
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);

    if (selectedTalla && producto) {
      const variante = variantesMap.get(`${color}-${selectedTalla}`);
      if (!variante || variante.stockDisponible <= 0) {
        const primeraTalla = variantes
          .filter((v) => v.color === color && v.stockDisponible > 0)
          .sort((a, b) => a.talla.localeCompare(b.talla))[0];
        if (primeraTalla) {
          setSelectedTalla(primeraTalla.talla);
        } else {
          setSelectedTalla(null);
        }
      }
    }
  };

  const handleTallaSelect = (talla: string) => {
    setSelectedTalla(talla);

    if (!selectedColor && producto) {
      const primerColor = variantes
        .filter((v) => v.talla === talla && v.stockDisponible > 0)
        .map((v) => v.color)[0];
      if (primerColor) {
        setSelectedColor(primerColor);
      }
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant || !producto) return;

    setIsAdding(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    addItem(producto, selectedVariant, quantity);
    toast.success(`${producto.nombre} agregado al carrito`, {
      description: `${quantity} x ${selectedVariant.talla} - ${selectedVariant.color}`,
    });
    setIsAdding(false);
    onClose();
  };

  // Render null after all hooks if no product or not open
  if (!producto || !isOpen) return null;

  const stockDisponible = selectedVariant?.stockDisponible || 0;
  const canAdd = selectedVariant && stockDisponible > 0 && quantity > 0;
  const maxQuantity = Math.min(stockDisponible, 10);

  // Convertir precios a número (pueden venir como string del backend)
  const variantePrecio = Number(selectedVariant?.precio) || 0;
  const productoPrecioBase = Number(producto.precioBase) || 0;
  const productoPrecioOferta = producto.precioOferta ? Number(producto.precioOferta) : null;

  const displayPrice = variantePrecio || productoPrecioBase;
  const hasDiscount = productoPrecioOferta && productoPrecioOferta < displayPrice;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl! w-[95vw]! max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>{producto.nombre}</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 h-full">
          {/* Left: Image */}
          <div className="relative bg-muted aspect-square md:aspect-auto">
            {producto.imagenPrincipal ? (
              <img
                src={producto.imagenPrincipal}
                alt={producto.nombre}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingBag className="h-24 w-24 text-muted-foreground/50" />
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {producto.precioOferta && (
                <Badge className="bg-red-500 hover:bg-red-600 text-white">
                  Oferta
                </Badge>
              )}
              {selectedVariant && stockDisponible <= 3 && stockDisponible > 0 && (
                <Badge variant="secondary" className="bg-amber-500 text-white">
                  ¡Quedan {stockDisponible}!
                </Badge>
              )}
            </div>
          </div>

          {/* Right: Details */}
          <div className="flex flex-col h-full max-h-[50vh] md:max-h-[90vh]">
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Header */}
              <div className="mb-6">
                <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">
                  {producto.categoria} / {producto.subcategoria}
                </p>
                <h2 className="text-2xl font-bold mb-2">{producto.nombre}</h2>

                {/* Price */}
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold">
                    ${Number(displayPrice).toFixed(2)}
                  </span>
                  {hasDiscount && productoPrecioOferta && (
                    <span className="text-lg text-muted-foreground line-through">
                      ${Number(productoPrecioOferta).toFixed(2)}
                    </span>
                  )}
                </div>

                {/* SKU */}
                <p className="text-xs text-muted-foreground mt-1">
                  SKU: {producto.codigo}
                </p>
              </div>

              {/* Description */}
              <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                {producto.descripcion}
              </p>

              {/* Color Selector */}
              {colores.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">
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
                              ? "border-primary ring-2 ring-primary/30 ring-offset-2"
                              : "border-transparent hover:scale-110",
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
                                  "w-5 h-5 drop-shadow-lg",
                                  isLightColor(color.hex) ? "text-black" : "text-white"
                                )}
                              />
                            </div>
                          )}

                          {/* Sold out indicator */}
                          {!disponible && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-8 h-0.5 bg-destructive rotate-45 rounded-full" />
                            </div>
                          )}

                          {/* Hover ring */}
                          <div className="absolute inset-0 rounded-full ring-2 ring-black/10 group-hover:ring-black/20" />
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
                    <h3 className="font-semibold">
                      Talla
                      {selectedTalla && (
                        <span className="text-muted-foreground font-normal ml-2">
                          — {selectedTalla}
                        </span>
                      )}
                    </h3>
                    <button className="text-sm text-primary hover:underline underline-offset-4">
                      Guía de tallas
                    </button>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {tallas.map((talla) => {
                      const isSelected = selectedTalla === talla;
                      const disponible = isTallaAvailable(talla);

                      return (
                        <button
                          key={talla}
                          onClick={() => disponible && handleTallaSelect(talla)}
                          disabled={!disponible}
                          className={cn(
                            "relative h-12 rounded-lg border-2 font-medium text-sm transition-all duration-200",
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground shadow-md"
                              : "border-input bg-background hover:border-primary/50 hover:bg-accent",
                            !disponible &&
                              "opacity-50 cursor-not-allowed border-muted bg-muted/50 hover:bg-muted"
                          )}
                        >
                          <span>{talla}</span>

                          {/* Sold out line */}
                          {!disponible && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-full h-0.5 bg-destructive/60 rotate-12" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Low stock indicator */}
                  {selectedVariant && stockDisponible <= 3 && stockDisponible > 0 && (
                    <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Solo quedan {stockDisponible} unidades en esta talla
                    </p>
                  )}
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Cantidad</h3>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-11 w-11 rounded-lg"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>

                  <div className="w-16 h-11 flex items-center justify-center border rounded-lg font-semibold text-lg bg-background">
                    {quantity}
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-11 w-11 rounded-lg"
                    onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                    disabled={!selectedVariant || quantity >= maxQuantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>

                  {selectedVariant && (
                    <span className="text-sm text-muted-foreground ml-2">
                      {stockDisponible} disponibles
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Footer - Fixed */}
            <div className="border-t bg-background p-6 space-y-4">
              {/* Stock Status */}
              {!selectedVariant ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Selecciona color y talla para continuar</span>
                </div>
              ) : stockDisponible === 0 ? (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Agotado en esta combinación</span>
                </div>
              ) : null}

              {/* Add to Cart Button */}
              <Button
                size="lg"
                className="w-full h-14 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
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
                      ? `Agregar al carrito — $${(Number(displayPrice) * quantity).toFixed(2)}`
                      : 'Selecciona opciones'}
                  </span>
                )}
              </Button>

              {/* Shipping info */}
              <p className="text-xs text-center text-muted-foreground">
                Envío gratis en pedidos superiores a $50. Entrega en tienda disponible.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper para determinar si un color es claro (para el check icon)
function isLightColor(hexColor: string): boolean {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
}
