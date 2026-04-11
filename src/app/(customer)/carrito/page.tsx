'use client';

import Link from 'next/link';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/lib/stores/cart';

export default function CarritoPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } =
    useCartStore();

  const total = getTotalPrice();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="text-center py-16">
          <CardContent>
            <ShoppingCart className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">Tu carrito está vacío</h2>
            <p className="text-muted-foreground mb-6">
              Explora nuestro catálogo y agrega productos a tu carrito.
            </p>
            <Link href="/catalogo">
              <Button size="lg">Ver Catálogo</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Tu Carrito</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.precioCOId}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Imagen */}
                  <div className="w-24 h-24 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                    {item.producto?.imagenPrincipal ? (
                      <img
                        src={item.producto.imagenPrincipal}
                        alt={item.producto.nombre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.producto?.nombre}</h3>
                    <p className="text-sm text-muted-foreground">
                      Talla: {item.variante?.talla} • Color:{' '}
                      {item.variante?.color}
                    </p>
                    <p className="font-medium mt-1">
                      ${Number(item.variante?.precio).toFixed(2)}
                    </p>

                    {/* Controles */}
                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(item.precioCOId, item.cantidad - 1)
                        }
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{item.cantidad}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(item.precioCOId, item.cantidad + 1)
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Precio y eliminar */}
                  <div className="text-right">
                    <p className="font-bold">
                      ${(Number(item.variante?.precio || 0) * item.cantidad).toFixed(2)}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="mt-2 text-destructive"
                      onClick={() => removeItem(item.precioCOId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Resumen */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
              <CardDescription>
                {items.length} {items.length === 1 ? 'artículo' : 'artículos'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío</span>
                <span className="text-green-600">Gratis</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Link href="/checkout" className="w-full">
                <Button className="w-full" size="lg">
                  Proceder al Pago
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="w-full"
                onClick={clearCart}
              >
                Vaciar Carrito
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
