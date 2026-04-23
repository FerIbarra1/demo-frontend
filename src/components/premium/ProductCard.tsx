"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Eye, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Producto } from "@/lib/types";

interface ProductCardProps {
  producto: Producto;
  index?: number;
  onQuickView?: (producto: Producto) => void;
  variant?: "default" | "featured" | "compact";
}

export function ProductCard({
  producto,
  onQuickView,
  variant = "default",
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const hasDiscount =
    producto.precioOferta &&
    Number(producto.precioOferta) < Number(producto.precioBase);

  const discountPercentage = hasDiscount
    ? Math.round(
      (1 - Number(producto.precioOferta) / Number(producto.precioBase)) * 100
    )
    : 0;

  const price = producto.variantes?.[0]?.precio || producto.precioBase;

  // Determinar imágenes disponibles
  const imagenPrincipal = producto.imagenes?.[0];
  const imagenSecundaria = producto.imagenes?.[1]; // Segunda imagen del array

  return (
    <div
      className={cn(
        "group relative",
        variant === "featured" && "lg:col-span-2 lg:row-span-2"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/producto/${producto.id}`} className="block">
        {/* Image Container */}
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl bg-secondary",
            variant === "default" && "aspect-[3/4]",
            variant === "featured" && "aspect-[3/4] lg:aspect-auto lg:h-full",
            variant === "compact" && "aspect-square"
          )}
        >
          {/* Product Image - Principal */}
          {imagenPrincipal ? (
            <img
              src={imagenPrincipal}
              alt={producto.nombre}
              className={cn(
                "w-full h-full object-cover transition-all duration-500 ease-out",
                !imagenSecundaria && "group-hover:scale-105"
              )}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <ShoppingBag className="w-12 h-12 text-muted-foreground/30" />
            </div>
          )}

          {/* Product Image - Secundaria (hover) */}
          {imagenSecundaria && (
            <img
              src={imagenSecundaria}
              alt={`${producto.nombre} - vista alternativa`}
              className={cn(
                "absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-out",
                isHovered ? "opacity-100" : "opacity-0"
              )}
            />
          )}

          {/* Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {hasDiscount && (
              <Badge className="bg-accent text-accent-foreground font-medium">
                -{discountPercentage}%
              </Badge>
            )}
            {producto.esNuevo && (
              <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                Nuevo
              </Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsWishlisted(!isWishlisted);
            }}
            className={cn(
              "absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center",
              "bg-background/90 backdrop-blur-sm hover:bg-background shadow-sm",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
              isWishlisted && "text-red-500 opacity-100"
            )}
          >
            <Heart className={cn("w-4 h-4", isWishlisted && "fill-current")} />
          </button>

          {/* Quick Actions */}
          <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <Button
              size="sm"
              className="flex-1 rounded-full bg-background/90 backdrop-blur-sm hover:bg-background text-foreground shadow-lg"
              onClick={(e) => {
                e.preventDefault();
                onQuickView?.(producto);
              }}
            >
              <Eye className="w-4 h-4 mr-2" />
              Vista rápida
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <div className={cn("mt-4", variant === "compact" && "mt-3")}>
          {/* Category */}
          <p className="text-xs text-muted-foreground tracking-wider uppercase mb-1">
            {producto.categoria}
          </p>

          {/* Name */}
          <h3
            className={cn(
              "font-medium group-hover:text-muted-foreground transition-colors line-clamp-1",
              variant === "featured" && "text-lg lg:text-xl",
              variant === "default" && "text-sm",
              variant === "compact" && "text-sm"
            )}
          >
            {producto.nombre}
          </h3>

          {/* Price */}
          <div className="flex items-baseline gap-2 mt-1">
            <span
              className={cn(
                "font-semibold price",
                variant === "featured" && "text-lg",
                variant === "default" && "text-base",
                variant === "compact" && "text-sm"
              )}
            >
              ${Number(price).toFixed(2)}
            </span>
            {hasDiscount && producto.precioOferta && (
              <span className="text-sm text-muted-foreground line-through">
                ${Number(producto.precioBase).toFixed(2)}
              </span>
            )}
          </div>

          {/* Colors (if available) */}
          {producto.variantes && producto.variantes.length > 0 && (
            <div className="flex gap-1.5 mt-2">
              {Array.from(
                new Set(producto.variantes.map((v) => v.color))
              )
                .slice(0, 4)
                .map((color, i) => {
                  const variantWithColor = producto.variantes?.find(
                    (v) => v.color === color
                  );
                  return (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-full border border-border"
                      style={{
                        backgroundColor: variantWithColor?.colorHex || "#ccc",
                      }}
                      title={color}
                    />
                  );
                })}
              {new Set(producto.variantes.map((v) => v.color)).size > 4 && (
                <span className="text-xs text-muted-foreground ml-1">
                  +
                  {new Set(producto.variantes.map((v) => v.color)).size - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
