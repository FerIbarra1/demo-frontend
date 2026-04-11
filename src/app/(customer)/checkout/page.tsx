'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, Banknote, Loader2, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCartStore } from '@/lib/stores/cart';
import { useCrearPedido } from '@/lib/hooks';
import { useAuthStore } from '@/lib/stores/auth';
import { TipoPago } from '@/lib/types';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { mutate: crearPedido, isPending } = useCrearPedido();
  const { isAuthenticated } = useAuthStore();

  const [tipoPago, setTipoPago] = useState<TipoPago>('EFECTIVO');
  const [notas, setNotas] = useState('');

  const total = getTotalPrice();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="text-center py-12">
          <CardContent>
            <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-4">Inicia sesión para continuar</h2>
            <p className="text-muted-foreground mb-6">
              Debes iniciar sesión o crear una cuenta para completar tu compra.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/login?redirect=/checkout">
                <Button variant="outline">Iniciar sesión</Button>
              </Link>
              <Link href="/registro?redirect=/checkout">
                <Button>Crear cuenta</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = () => {
    const pedidoData = {
      items: items.map((item) => ({
        precioCOId: item.precioCOId,
        cantidad: item.cantidad,
      })),
      tipoPago,
      notas: notas || undefined,
    };

    crearPedido(pedidoData, {
      onSuccess: () => {
        clearCart();
        router.push('/confirmacion');
      },
    });
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="text-center py-12">
          <CardContent>
            <h2 className="text-2xl font-semibold mb-4">Tu carrito está vacío</h2>
            <Link href="/catalogo">
              <Button>Ver Catálogo</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/carrito">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al Carrito
        </Button>
      </Link>

      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulario */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Método de Pago</CardTitle>
              <CardDescription>
                Selecciona cómo deseas realizar tu pago
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={tipoPago}
                onValueChange={(value) => setTipoPago(value as TipoPago)}
                className="space-y-4"
              >
                <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="EFECTIVO" id="efectivo" />
                  <Label htmlFor="efectivo" className="flex items-center gap-3 cursor-pointer flex-1">
                    <div className="p-2 bg-green-100 rounded-full">
                      <Banknote className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Pago en Tienda</p>
                      <p className="text-sm text-muted-foreground">
                        Paga en efectivo al recoger tu pedido
                      </p>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="TRANSFERENCIA" id="transferencia" />
                  <Label htmlFor="transferencia" className="flex items-center gap-3 cursor-pointer flex-1">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Transferencia Bancaria</p>
                      <p className="text-sm text-muted-foreground">
                        Realiza una transferencia y envía el comprobante
                      </p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notas Adicionales</CardTitle>
              <CardDescription>
                ¿Algo más que debamos saber sobre tu pedido?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Ej: Envolver para regalo, entregar después de las 3pm..."
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>
        </div>

        {/* Resumen */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.precioCOId} className="flex justify-between">
                  <div>
                    <p className="font-medium">{item.producto?.nombre}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.variante?.talla} • {item.variante?.color} x{' '}
                      {item.cantidad}
                    </p>
                  </div>
                  <p className="font-medium">
                    ${(Number(item.variante?.precio || 0) * item.cantidad).toFixed(2)}
                  </p>
                </div>
              ))}

              <Separator />

              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${Number(total).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío</span>
                <span className="text-green-600">Gratis</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${Number(total).toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                size="lg"
                onClick={handleSubmit}
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  'Confirmar Pedido'
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
