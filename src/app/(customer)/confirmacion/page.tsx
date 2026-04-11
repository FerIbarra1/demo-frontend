'use client';

import Link from 'next/link';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function ConfirmacionPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-3xl mb-2">¡Pedido Confirmado!</CardTitle>
          <CardDescription className="text-lg">
            Tu pedido ha sido registrado exitosamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted rounded-lg p-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Package className="h-5 w-5" />
              <span className="font-medium">¿Qué sigue?</span>
            </div>
            <ul className="text-left space-y-2 text-muted-foreground">
              <li>1. Tu pedido será revisado por nuestro equipo de bodega</li>
              <li>2. Recibirás notificaciones sobre el estado de tu pedido</li>
              <li>3. Podrás recogerlo en la tienda seleccionada cuando esté listo</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pedidos">
              <Button variant="outline">
                Ver Mis Pedidos
              </Button>
            </Link>
            <Link href="/catalogo">
              <Button>
                Seguir Comprando
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
